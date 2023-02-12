import tls, {TLSSocket} from 'tls';

const millisecondsPerDay = 1000 * 60 * 60 * 24;

const getCertificateValidTo = async (hostname: string): Promise<string> =>
	new Promise((resolve, reject) => {
		const socketStream = tls.connect({
			host: hostname,
			servername: hostname,
			port: 443,
			timeout: 3000,
		});

		socketStream.once('secureConnect', () => {
			const {valid_to: validTo} = socketStream.getPeerCertificate(false);

			if (!validTo) {
				reject(new Error('No valid_to date found in certificate'));
			}

			socketStream.destroy();

			resolve(validTo);
		});

		socketStream.on('error', reject);
	});

const daysUntil = (timestamp: number) =>
	Math.floor((timestamp - Date.now()) / millisecondsPerDay);

const checkCert = async (hostname: string) => {
	const certValidTo = await getCertificateValidTo(hostname);
	const certValidToTimestamp = Date.parse(certValidTo);

	return `${hostname} is valid for ${daysUntil(certValidToTimestamp)} days`;
};

export {checkCert};
