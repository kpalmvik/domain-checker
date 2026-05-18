import {OTLPMetricExporter} from '@opentelemetry/exporter-metrics-otlp-http';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-http';
import {PeriodicExportingMetricReader} from '@opentelemetry/sdk-metrics';
import {NodeSDK} from '@opentelemetry/sdk-node';

// import {SimpleSpanProcessor} from '@opentelemetry/sdk-trace-base';
// import {ConsoleSpanExporter} from '@opentelemetry/sdk-trace-node';

let sdk: NodeSDK;
let sdkStarted = false;

const handleShutdown = async () => sdk.shutdown();

const initializeTracing = (): void => {
	if (sdkStarted) {
		return;
	}

	sdk = new NodeSDK({
		traceExporter: new OTLPTraceExporter(),
		metricReader: new PeriodicExportingMetricReader({
			exporter: new OTLPMetricExporter(),
			exportIntervalMillis: 60_000,
		}),
		// spanProcessor: new SimpleSpanProcessor(new ConsoleSpanExporter()),
	});

	sdk.start();
	sdkStarted = true;
};

export {handleShutdown, initializeTracing};
