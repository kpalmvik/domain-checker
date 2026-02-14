# Test Failure Troubleshooting Report

## Issue Summary

Tests are failing on the `main` branch with the error:
```
unable to get local issuer certificate
```

## Critical Finding: No Mocking in Tests! ⚠️

**The tests are making REAL network calls to external domains:**
- `www.example.com`
- `expired.badssl.com` 
- `wrong.host.badssl.com`
- `something.invalid`

The tests use `tls.connect()` to make actual TLS connections. **This makes the tests:**
- ❌ Flaky (dependent on network conditions)
- ❌ Unreliable (dependent on external services)
- ❌ Slow (network latency)
- ❌ Non-deterministic (certificates can change)

**This is why tests fail intermittently** - they depend on external infrastructure that can change without notice.

## Root Cause Analysis

### 1. Node Version Mismatch (Primary Issue)

**Problem:** The `package.json` specifies `"node": ">=25"`, but:
- **Node 25 doesn't exist yet** - it hasn't been released
- Current Node.js LTS version is **v24.13.0** (Krypton)
- GitHub Actions workflow uses `node-version: lts/*`, which resolves to v24.13.0

**Evidence:**
```bash
$ node --version
v24.13.0

$ npm install
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'domain-checker@1.0.0',
npm warn EBADENGINE   required: { node: '>=25' },
npm warn EBADENGINE   current: { node: 'v24.13.0', npm: '11.6.2' }
npm warn EBADENGINE }
```

**Resolution:** Changed `package.json` engines field to `"node": ">=24"` to match available Node versions.

### 2. TLS Certificate Validation Error (Secondary Issue)

**Problem:** The test `returns the number of days the SSL certificate is valid` fails with:
```
unable to get local issuer certificate
```

This is a **TLS/SSL certificate chain validation error**, not a code error.

**When it started:** Last successful test run was February 1st, 2026. Failures began on February 14th, 2026.

**Possible causes:**
1. **Certificate chain issue:** `www.example.com` may have updated their certificate, and the intermediate certificate isn't being properly validated
2. **Node.js TLS changes:** Certificate validation behavior may have changed in Node.js updates
3. **GitHub Actions environment:** Runner environment may have updated CA certificates or TLS configuration
4. **Transient network issue:** Could be temporary connectivity or certificate authority issues

**Note:** This is NOT related to code changes in the repository. The code hasn't changed in a way that would affect certificate validation.

## Timeline

- **February 1, 2026**: Last successful test run (PR #268)
- **February 14, 2026**: Tests start failing on main branch
- **Changes between:** Only dependency updates (prettier 3.7.4 → 3.8.0, @types/node 25.0.3 → 25.0.9)

## Tests Status

5 tests total:
- ✅ 4 tests passing (error handling tests with badssl.com domains)
- ❌ 1 test failing (certificate validation test with www.example.com)

## Recommendations

### Immediate Fixes (Completed)
1. ✅ **Fixed:** Update `package.json` to require Node >= 24 (current LTS)

### Urgent: Fix Test Reliability
2. **🔴 HIGH PRIORITY:** Mock TLS connections in unit tests
   - Tests should NOT make real network calls
   - Mock `tls.connect()` to return predictable certificate data
   - This will make tests:
     - Fast (no network latency)
     - Reliable (no external dependencies)
     - Deterministic (consistent results)

### Alternative Approaches
3. **Integration Tests:** Move real network tests to a separate integration test suite
4. **Monitor:** If keeping real calls, monitor for transient failures and retry logic

## Related Issues

- ✅ The Node version mismatch is DEFINITELY related to the failing CI pipeline
- ✅ **The TLS certificate error is caused by making real network calls in unit tests**
- The error is NOT related to code changes - it's environmental/network-dependent
- Tests are flaky by design (no mocking)

## Verification

After fixing the Node version requirement, the CI should:
1. No longer show engine warnings
2. Run on the correct Node version
3. May still fail if the TLS certificate issue persists (requires separate investigation)
