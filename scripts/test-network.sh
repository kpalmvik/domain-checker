#!/bin/bash
# Network connectivity test script for domain-checker

echo "=== Network Connectivity Diagnostics ==="
echo ""

echo "1. Testing DNS Resolution..."
echo "   www.example.com:"
nslookup www.example.com 8.8.8.8 2>&1 | grep -E "Address:|can't find" | head -2
echo "   expired.badssl.com:"
nslookup expired.badssl.com 8.8.8.8 2>&1 | grep -E "Address:|can't find" | head -2
echo ""

echo "2. Testing Port 443 Connectivity..."
timeout 3 nc -zv www.example.com 443 2>&1 || echo "   www.example.com:443 - FAILED"
timeout 3 nc -zv expired.badssl.com 443 2>&1 || echo "   expired.badssl.com:443 - FAILED"
echo ""

echo "3. Testing TLS Connection with Node.js..."
node -e "
const tls = require('tls');
const hosts = ['www.example.com', 'expired.badssl.com'];
let tested = 0;

hosts.forEach(hostname => {
  const socket = tls.connect({
    host: hostname,
    port: 443,
    servername: hostname,
    timeout: 3000,
  }, () => {
    console.log('   ✓', hostname, '- TLS connection successful');
    socket.destroy();
    if (++tested === hosts.length) process.exit(0);
  });
  
  socket.on('error', (err) => {
    console.log('   ✗', hostname, '- TLS failed:', err.code || err.message);
    if (++tested === hosts.length) process.exit(1);
  });
  
  socket.on('timeout', () => {
    console.log('   ✗', hostname, '- TLS timeout');
    socket.destroy();
    if (++tested === hosts.length) process.exit(1);
  });
});

setTimeout(() => {
  console.log('   Test timed out');
  process.exit(1);
}, 10000);
" 2>&1
echo ""

echo "=== Summary ==="
echo "If all tests fail, network access is restricted."
echo "Tests require outbound access on ports 53 (DNS) and 443 (HTTPS)."
echo ""
