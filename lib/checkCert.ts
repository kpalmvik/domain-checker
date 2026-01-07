import tls from 'tls';

const millisecondsPerDay = 1000 * 60 * 60 * 24;
const connectionTimeoutMs = 3000;
const sslPort = 443;

const getCertificateValidTo = async (hostname: string): Promise<string> =>
	new Promise((resolve, reject) => {
		const socketStream = tls.connect({
			host: hostname,
			servername: hostname,
			port: sslPort,
			timeout: connectionTimeoutMs,
		});

		socketStream.once('secureConnect', () => {
			const {valid_to: validTo} = socketStream.getPeerCertificate(false);

			if (!validTo) {
				reject(new Error('No valid_to date found in certificate'));
				return;
			}

			socketStream.destroy();

			resolve(validTo);
		});

		socketStream.on('error', reject);
	});

const daysUntil = (timestamp: number) =>
	Math.floor((timestamp - Date.now()) / millisecondsPerDay);

const checkCert = async (
	hostname: string,
	minRemainingDays?: number,
): Promise<string> => {
	const certValidTo = await getCertificateValidTo(hostname);
	const certValidToTimestamp = Date.parse(certValidTo);

	const remainingDays = daysUntil(certValidToTimestamp);

	if (minRemainingDays && remainingDays <= minRemainingDays) {
		throw new Error(
			`Valid only for ${remainingDays.toString()} days, which is less than the required ${minRemainingDays.toString()}`,
		);
	}

	return `${hostname} is valid for ${remainingDays.toString()} days (until ${certValidTo}), which meets the requirement of ${(minRemainingDays ?? 0).toString()} days.`;
};

export {checkCert};
