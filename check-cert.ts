import {checkCert} from './lib/checkCert';

if (process.argv.length === 2) {
	console.error('Usage: npm run check-cert some.example.com');
	process.exit(1);
}

const hostname = process.argv[2];

void checkCert(hostname)
	.then(result => {
		console.log(`${hostname}: ${result}`);
	})
	.catch((error: Error) => {
		console.error(`${hostname}: No valid certificate found (${error.message})`);
		process.exit(1);
	});
