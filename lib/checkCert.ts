import tls from 'tls';
import {metrics, SpanStatusCode, trace} from '@opentelemetry/api';

const millisecondsPerDay = 1000 * 60 * 60 * 24;
const connectionTimeoutMs = 3000;
const sslPort = 443;
const tracer = trace.getTracer('checkCert');

const meter = metrics.getMeter('domain-checker');
const certDaysRemainingHistogram = meter.createHistogram(
	'certificate.days_remaining',
	{
		description: 'Days remaining until certificate expiration',
		unit: 'd',
	},
);

const certCheckCountCounter = meter.createCounter('certificate.check.count', {
	description: 'Number of certificate checks grouped by status',
	unit: '1',
});

const recordCertMetric = (
	hostname: string,
	remainingDays: number,
	minRemainingDays: number | undefined,
	status: 'ok' | 'threshold_breach' | 'error',
) => {
	const attributes = {
		hostname,
		status,
		minRemainingDays: minRemainingDays ?? 0,
		monitoringFrequency: 'daily',
		monitoringIntervalSeconds: 86400,
	};

	certDaysRemainingHistogram.record(remainingDays, attributes);
	certCheckCountCounter.add(1, attributes);
};

const getCertificateValidTo = async (hostname: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		const socketStream = tls.connect({
			host: hostname,
			servername: hostname,
			port: sslPort,
			timeout: connectionTimeoutMs,
		});

		socketStream.once('secureConnect', () => {
			const {valid_to: validTo} = socketStream.getPeerCertificate(false);

			if (!validTo) {
				reject(
					new Error(`No valid_to date found in certificate for ${hostname}`),
				);
				return;
			}

			socketStream.destroy();

			resolve(validTo);
		});

		socketStream.on('error', error => {
			const enrichedError = new Error(
				`Failed to retrieve certificate for ${hostname}: ${error instanceof Error ? error.message : String(error)}`,
			);
			reject(enrichedError);
		});
	});
};

const daysUntil = (timestamp: number) =>
	Math.floor((timestamp - Date.now()) / millisecondsPerDay);

const checkCert = async (
	hostname: string,
	minRemainingDays?: number,
): Promise<string> => {
	const span = tracer.startSpan('checkCert', {
		attributes: {hostname, minRemainingDays: minRemainingDays ?? 0},
	});

	try {
		const certValidTo = await getCertificateValidTo(hostname);
		const certValidToTimestamp = Date.parse(certValidTo);

		const remainingDays = daysUntil(certValidToTimestamp);
		span.setAttribute('certValidTo', certValidTo);
		span.setAttribute('remainingDays', remainingDays);
		span.setAttribute('monitoring.frequency', 'daily');
		span.setAttribute('monitoring.interval_seconds', 86400);

		if (minRemainingDays && remainingDays <= minRemainingDays) {
			recordCertMetric(
				hostname,
				remainingDays,
				minRemainingDays,
				'threshold_breach',
			);
			const error = new Error(
				`Certificate for ${hostname}: Valid only for ${remainingDays.toString()} days, which is less than the required ${minRemainingDays.toString()} days`,
			);
			span.setStatus({code: SpanStatusCode.ERROR, message: error.message});
			span.recordException(error);
			throw error;
		}

		recordCertMetric(hostname, remainingDays, minRemainingDays, 'ok');
		span.setStatus({code: SpanStatusCode.OK});

		return `${hostname} is valid for ${remainingDays.toString()} days (until ${certValidTo}), which meets the requirement of ${(minRemainingDays ?? 0).toString()} days.`;
	} catch (error) {
		span.setAttribute('error.occurred', true);
		span.setAttribute('error.hostname', hostname);

		if (error instanceof Error) {
			span.recordException(error);
			span.setStatus({code: SpanStatusCode.ERROR, message: error.message});
		}

		const thresholdErrorPrefix = `Certificate for ${hostname}: Valid only for`;
		const isThresholdBreachError =
			error instanceof Error && error.message.startsWith(thresholdErrorPrefix);

		if (!isThresholdBreachError) {
			recordCertMetric(hostname, 0, minRemainingDays, 'error');
		}

		throw error;
	} finally {
		span.end();
	}
};

export {checkCert};
