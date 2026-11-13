/**
 * QZ Tray Local Signing Server (ESM)
 * 
 * Provides RSA SHA-512 message signing and digital certificate serving
 * for 100% silent, dialog-free automatic printing with QZ Tray.
 * 
 * Usage:
 *   npm run signer
 *   # or: node scripts/qz-signer.js
 * 
 * Endpoints:
 *   GET  /cert  -> Returns the digital certificate PEM / public key
 *   POST /sign  -> Accepts JSON { "request": "..." }, signs with RSA-SHA512, returns { "signature": "..." }
 */

import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8190;
const CERTS_DIR = path.join(__dirname, '..', '.certs');

// Ensure certs directory exists
if (!fs.existsSync(CERTS_DIR)) {
  fs.mkdirSync(CERTS_DIR, { recursive: true });
}

const PRIVATE_KEY_FILE = path.join(CERTS_DIR, 'photobox-private-key.pem');
const CERT_FILE = path.join(CERTS_DIR, 'photobox-cert.pem');

let privateKeyPem;
let certificatePem;

// Generate or load RSA 2048-bit Key Pair
if (!fs.existsSync(PRIVATE_KEY_FILE) || !fs.existsSync(CERT_FILE)) {
  console.log('[QZ Signer] Membuat pasangan kunci RSA 2048-bit baru...');
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  privateKeyPem = privateKey;
  certificatePem = publicKey;

  fs.writeFileSync(PRIVATE_KEY_FILE, privateKeyPem, 'utf8');
  fs.writeFileSync(CERT_FILE, certificatePem, 'utf8');
  console.log('[QZ Signer] Kunci privat disimpan ke:', PRIVATE_KEY_FILE);
  console.log('[QZ Signer] Sertifikat publik disimpan ke:', CERT_FILE);
} else {
  privateKeyPem = fs.readFileSync(PRIVATE_KEY_FILE, 'utf8');
  certificatePem = fs.readFileSync(CERT_FILE, 'utf8');
  console.log('[QZ Signer] Memuat kunci yang sudah ada dari:', CERTS_DIR);
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 1. GET /cert - Serve digital certificate
  if (req.method === 'GET' && (req.url === '/cert' || req.url === '/')) {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(certificatePem);
    return;
  }

  // 2. POST /sign - Sign data with RSA SHA-512
  if (req.method === 'POST' && req.url === '/sign') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        let toSign = '';
        if (body.trim().startsWith('{')) {
          const parsed = JSON.parse(body);
          toSign = parsed.request || parsed.data || '';
        } else {
          toSign = body;
        }

        if (!toSign) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Field "request" tidak boleh kosong.' }));
          return;
        }

        // Sign using SHA-512
        const signer = crypto.createSign('SHA512');
        signer.update(toSign);
        signer.end();
        const signature = signer.sign(privateKeyPem, 'base64');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ signature }));
      } catch (err) {
        console.error('[QZ Signer] Kesalahan penandatanganan:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint tidak ditemukan.' }));
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 QZ Tray Local Signer aktif di http://localhost:${PORT}`);
  console.log(`• Sertifikat: http://localhost:${PORT}/cert`);
  console.log(`• Signature : http://localhost:${PORT}/sign`);
  console.log(`======================================================\n`);
});
