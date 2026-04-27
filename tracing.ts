import {NodeSDK} from '@opentelemetry/sdk-node';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-http';
import {OTLPMetricExporter} from '@opentelemetry/exporter-metrics-otlp-http';
import {PeriodicExportingMetricReader} from '@opentelemetry/sdk-metrics';
// import {SimpleSpanProcessor} from '@opentelemetry/sdk-trace-base';
// import {ConsoleSpanExporter} from '@opentelemetry/sdk-trace-node';

let sdk: NodeSDK;

const handleShutdown = async () => sdk.shutdown();

const initializeTracing = () => {
	sdk = new NodeSDK({
		traceExporter: new OTLPTraceExporter(),
		metricReader: new PeriodicExportingMetricReader({
			exporter: new OTLPMetricExporter(),
			exportIntervalMillis: 60_000,
		}),
		// spanProcessor: new SimpleSpanProcessor(new ConsoleSpanExporter()),
	});

	sdk.start();
};

export {initializeTracing, handleShutdown};
