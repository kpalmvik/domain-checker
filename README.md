# domain-checker

Check registration and certificate expiration of domains

## Domain registration

TODO

## Certificates check

[![Certificates check 🔐](https://github.com/kpalmvik/domain-checker/actions/workflows/certificates.yml/badge.svg)](https://github.com/kpalmvik/domain-checker/actions/workflows/certificates.yml)

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
