# domain-checker

This project provides tools to monitor domain name registrations and SSL/TLS certificate validity. It helps ensure that your online services remain accessible and secure by alerting you to upcoming expirations.

Currently, the project offers the following features:

- **SSL/TLS Certificate Expiration Check:** Automated daily checks of SSL/TLS certificates for a configurable list of hostnames. This is integrated with a GitHub Actions workflow for continuous monitoring.

In the future, it might also offer:

- **Domain Registration Expiration Check:** Functionality to check the expiration dates of domain name registrations.

## SSL/TLS Certificate Expiration Check

[![Certificates check 🔐](https://github.com/kpalmvik/domain-checker/actions/workflows/certificates.yml/badge.svg)](https://github.com/kpalmvik/domain-checker/actions/workflows/certificates.yml)

As mentioned in the overview, this project automates the monitoring of SSL/TLS certificate expirations. The primary mechanism for this is a GitHub Actions workflow.

The GitHub Actions workflow [certificates.yml](./.github/workflows/certificates.yml) is scheduled to run daily and check the TLS (SSL) certificate expiration date for a number of hostnames.

The relevant workflow step looks like this:

```yml
- name: www.example.se
  run: npm run check-cert www.example.se 25
```

`name` specifies the name of the step, which will be used in the interface and in error logs
`run` invokes the `npm run check-cert` script with two parameters:

- `www.example` is the hostname to check the certificate for
- `25` is the acceptable minimum number of days until certificate expiration.

If the certificate is valid for less than the specified number of days, or not valid at all, the step will result in an error which means that the entire workflow will fail.
