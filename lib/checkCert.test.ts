import {checkCert} from './checkCert';

describe('checkCert', () => {
	it('returns the number of days the SSL certificate is valid', async () => {
		const certStatus = await checkCert('www.google.com');
		expect(certStatus).toMatch(/www\.google\.com is valid for [0-9]{1,4} days/);
	});

	it('throws an error if the certificate expires in less than a given number of days', async () => {
		await expect(checkCert('www.google.com', 9999)).rejects.toThrow();
	});

	it('throws an error for a hostname with an expired certificate', async () => {
		await expect(checkCert('expired.badssl.com')).rejects.toThrow();
	});

	it('throws an error for a hostname with a certificate for another host', async () => {
		await expect(checkCert('wrong.host.badssl.com')).rejects.toThrow();
	});

	it('returns an error for an invalid hostname', async () => {
		await expect(checkCert('something.invalid')).rejects.toThrow();
	});
});
