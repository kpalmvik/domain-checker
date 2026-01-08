import {NodeSDK} from '@opentelemetry/sdk-node';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-http';
// import {SimpleSpanProcessor} from '@opentelemetry/sdk-trace-base';
// import {ConsoleSpanExporter} from '@opentelemetry/sdk-trace-node';

let sdk: NodeSDK;

const handleShutdown = async () => sdk.shutdown();

const initializeTracing = () => {
	sdk = new NodeSDK({
		traceExporter: new OTLPTraceExporter(),
		// spanProcessor: new SimpleSpanProcessor(new ConsoleSpanExporter()),
	});

	sdk.start();
};

export {initializeTracing, handleShutdown};
