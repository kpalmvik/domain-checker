# Network Access Requirements for domain-checker Tests

## Current Status: ❌ Network Access Restricted

The test suite requires network access to external domains but is currently unable to connect.

## Diagnostic Results

Run `./scripts/test-network.sh` to test connectivity:

```bash
$ ./scripts/test-network.sh

=== Network Connectivity Diagnostics ===

1. Testing DNS Resolution...
   www.example.com: ** server can't find www.example.com: REFUSED
   expired.badssl.com: ** server can't find expired.badssl.com: REFUSED

2. Testing Port 443 Connectivity...
   www.example.com:443 - FAILED
   expired.badssl.com:443 - FAILED

3. Testing TLS Connection with Node.js...
   ✗ www.example.com - TLS failed: ENOTFOUND
   ✗ expired.badssl.com - TLS failed: ENOTFOUND
```

## Required Network Access

The test suite needs:

### DNS Resolution (UDP Port 53)
- Outbound DNS queries to resolve hostnames
- Currently: **REFUSED** by DNS servers

### TLS Connections (TCP Port 443)
- Outbound HTTPS connections to test certificate validation
- Currently: **Connection timeout** or **ENOTFOUND**

### Required Domains
- `www.example.com` - Primary test domain for valid certificates
- `expired.badssl.com` - Test domain with expired certificate
- `wrong.host.badssl.com` - Test domain with wrong hostname in certificate

## Troubleshooting Steps

### If DNS is failing:
1. Verify outbound UDP port 53 is allowed
2. Check if DNS servers (8.8.8.8, 1.1.1.1) are reachable
3. Verify no DNS filtering/blocking is in place

### If TLS connections timeout:
1. Verify outbound TCP port 443 is allowed
2. Check if HTTPS traffic is permitted
3. Test with: `curl -v https://www.example.com`

### If specific domains are blocked:
1. Whitelist the test domains in firewall/proxy
2. Verify no content filtering is blocking example.com or badssl.com

## Alternative: Mock Testing

If network access cannot be provided, consider mocking TLS connections in tests:

```typescript
jest.mock('tls', () => ({
  connect: jest.fn().mockImplementation((options, callback) => {
    // Return mock certificate data
    callback();
    return {
      getPeerCertificate: () => ({ valid_to: 'Mar 1 12:00:00 2027 GMT' }),
      destroy: jest.fn(),
      once: jest.fn(),
      on: jest.fn(),
    };
  }),
}));
```

This would make tests:
- ✅ Fast (no network latency)
- ✅ Reliable (no external dependencies)
- ✅ Deterministic (consistent results)
- ✅ Work in restricted environments

## References

- Main troubleshooting doc: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Network test script: [scripts/test-network.sh](./scripts/test-network.sh)
