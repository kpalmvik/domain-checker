import {checkCert} from './lib/checkCert';

if (process.argv.length === 2) {
	console.error('Usage: npm run check-cert some.example.com [minimum-days]');
	process.exit(1);
}

const hostname = process.argv[2];
const minRemainingDays = Number.parseInt(process.argv[3], 10) || undefined;

void checkCert(hostname, minRemainingDays)
	.then((result: string) => {
		console.log(`${hostname}: ${result}`);
	})
	.catch((error: unknown) => {
		const message = error instanceof Error ? error.message : 'Unknown error';
		console.error(`${hostname}: No valid certificate found (${message})`);
		process.exit(1);
	});
