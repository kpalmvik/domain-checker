import {checkCert} from './checkCert';

describe('checkCert', () => {
	it('returns the number of days the SSL certificate is valid', async () => {
		const certStatus = await checkCert('www.example.com');
		expect(certStatus).toMatch(/www.example.com is valid for [0-9]{1,4} days/);
	});

	it('throws an error for a hostname with an expired certificate', async () => {
		void expect(checkCert('expired.badssl.com')).rejects.toThrow();
	});

	it('throws an error for a hostname with a certificate for another host', async () => {
		void expect(checkCert('wrong.host.badssl.com')).rejects.toThrow();
	});

	it('returns an error for an invalid hostname', async () => {
		void expect(checkCert('something.invalid')).rejects.toThrow();
	});
});
