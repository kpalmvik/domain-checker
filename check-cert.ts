import 'dotenv/config';
import {checkCert} from './lib/checkCert';
import {initializeTracing, handleShutdown} from './tracing';

initializeTracing();

if (process.argv.length === 2 || !process.argv[2]) {
	console.error('Usage: npm run check-cert some.example.com [minimum-days]');
	process.exit(1);
}

const hostname = process.argv[2];
const minRemainingDays = process.argv[3]
	? Number.parseInt(process.argv[3], 10)
	: undefined;

void checkCert(hostname, minRemainingDays)
	.then(async (result: string) => {
		console.log(result);
		await handleShutdown();
	})
	.catch(async (error: unknown) => {
		const message = error instanceof Error ? error.message : 'Unknown error';
		console.error(`No valid certificate found (${message})`);

		const isNetworkError =
			error instanceof Error &&
			/^(ETIMEDOUT|ECONNREFUSED|ENOTFOUND|EHOSTUNREACH|ENETUNREACH)/.test(
				(error as NodeJS.ErrnoException).code ?? '',
			);

		await handleShutdown();
		process.exit(isNetworkError ? 0 : 1);
	});
