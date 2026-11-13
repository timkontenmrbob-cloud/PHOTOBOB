/**
 * QZ Tray Digital Certificate & Client-Side WebCrypto Signer
 * 
 * Provides an X.509 self-signed certificate ("PHOTOBOX KIOSK") and
 * in-browser RSA SHA-512 cryptographic signing so that QZ Tray
 * allows the user to permanently check "Remember this decision"
 * and enables 100% silent, automatic 1-click printing without pop-ups.
 */

export const PHOTOBOX_CERTIFICATE_PEM = `-----BEGIN CERTIFICATE-----
MIIDCjCCAfICCQDGVbMnigz/3zANBgkqhkiG9w0BAQsFADBHMRcwFQYDVQQDDA5Q
SE9UT0JPWCBLSU9TSzERMA8GA1UECgwIUEhPVE9CT1gxGTAXBgNVBAsMEEtpb3Nr
IEF1dG8gUHJpbnQwHhcNMjYxMTEzMDYzMjQzWhcNMzYxMTEwMDYzMjQzWjBHMRcw
FQYDVQQDDA5QSE9UT0JPWCBLSU9TSzERMA8GA1UECgwIUEhPVE9CT1gxGTAXBgNV
BAsMEEtpb3NrIEF1dG8gUHJpbnQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK
AoIBAQDB8lCdYzl8yT4YkqlZk+mVblGUFhum+vdaNnA4SL6/3m0hK3FZCeYv1Y/k
BqWXHE8fIOl0APIs0ExqU1ExtGPvOVufSYpz48rTJyqIOnV77xEpzd8BFzvLkE2h
yXAl6qbKAJRfuPv72NRfHz/j8yTFDaNi3MBRCZmyhHiYZQZTG57lqp+aGVPsB7fD
U1Rmrb3CQVx2INEcYKKB4+yyPqXl1v+3a6W9rSwwyQ/zKqlW3KfbH+7OyAhfKU7z
Y2BjH0f8oBFh6iamrW5G4GlNrcHO6OcUVdearqG6+Y6sJ4Lh9WU3ueELhSKLWvaY
OGe3WtnQEwjlvW+65R35/qkvoC7JAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAExZ
FtM2Q7V2wNpmTC0TpztzdYhi7ivt6/bpBFHs09Iw7Yg2HvgE1E/Gzno/uCs4FNz7
X+QlEJKqDxuyV8zcjMOAAQIln23lwZFxzaWyPcTePpkuy7E7Zzl2kDsLWDnlu48F
zSmt7KTLIFPQbv/c93mwtAw6yuG5vO3mS6V/UBsi4SodqAgI6CB4fb7EwQ+b+rkj
kgHfmLNcdnMa4AaVZ0edleGsF/N1HW0XEIgbINvw+Q92V1+02J9pAm498xsu25L9
u1IPfBBZFcoLb2gzAH+yFCKqBzCicJbf+Xa7XntJKMMoJzaUlda9zDcb7/+4iHy3
41qx+j94Gc5AoA4bsd8=
-----END CERTIFICATE-----`;

// RSA 2048-bit Private Key in PKCS#8 format (for browser-side signing)
const PHOTOBOX_PRIVATE_KEY_BASE64 = `MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDB8lCdYzl8yT4Y
kqlZk+mVblGUFhum+vdaNnA4SL6/3m0hK3FZCeYv1Y/kBqWXHE8fIOl0APIs0Exq
U1ExtGPvOVufSYpz48rTJyqIOnV77xEpzd8BFzvLkE2hyXAl6qbKAJRfuPv72NRf
Hz/j8yTFDaNi3MBRCZmyhHiYZQZTG57lqp+aGVPsB7fDU1Rmrb3CQVx2INEcYKKB
4+yyPqXl1v+3a6W9rSwwyQ/zKqlW3KfbH+7OyAhfKU7zY2BjH0f8oBFh6iamrW5G
4GlNrcHO6OcUVdearqG6+Y6sJ4Lh9WU3ueELhSKLWvaYOGe3WtnQEwjlvW+65R35
/qkvoC7JAgMBAAECggEAXTvwlwiJLTzM9iEi+iYJ50UGQIs0Ndx1pk9/OP93e2Mg
0Q5CSgxhNOOUbYjod7ErNAqtT4/Y28Qyx/ZPlPZkCC9ppTREM5vw9/rfDmgT7EUr
2g3Ww354x04Sk9DzcbbRAVCwAyg5MoO07BlorFtJdNUukysN5KcZ1OCr3I7MMIzD
SHIWe4MPjPIfmi10vnk+5nKoaZIlCxGmy8p1sLg3nJnMruVfSwCXAFIbaJZm1dbM
zgGHSfFBQ3drjLbF3a6BHlHepI04vecSLo2BNOPIeJhhZaR3T7HLSLuPSjxFJjKl
k6JKyEoYesrwmdzBLX7NIbBMIe4sHRtoddQR/Yc6AQKBgQDmICYU0JMJ+q73rcQx
8KfVlUDsHA+fPBOYl/CTthR8Ia66e/7R9aGUFS6oWq6Isb/fyS0FS+bNW1JlHXt+
vWYQ2CWLvqODa8ncZs5b4cWoxzZBPVgWurX7C7eJRHhgVo2GU1ChOF9Qy8bfsZFK
1LqZdZIcwpjKgwRb/28cv7FXQQKBgQDXwM1Ehw9ikloSA11+0Xg/qNUv2zh2GQdk
/b4g5mejs67lBsD/8xzHrSZSvU3OwJSKeIZiC0HNf8iFzqOIEOX9VnW4VKDhEt0A
6ntpgb2OjIWKyggnmT6QlBQmwSjjILmkMJ+CYsEN8cR5ileNyBiDwqOWjCg6fCl8
eDp5Wm49iQKBgQDNj1gU7b76gge6zGhdp7dz7M/CWMqHlZV3j/lhKJshysCWad5U
VFKRwV4dGmufRQ+86aoiegtf0rxGAFDpBGvgjgLz0kWjRixZiSe6IXF7cv9+xToj
i4K1DmFS52uTupzOqStz57QUqwIpnSbIrj9EhyYONLFg7Cl/uCrbhkv2QQKBgFpI
M50ZZza4RziCb/1BajA5VfxQn6/LiWyZQZZC09uMtQLhcKGp+cEUk5TL4mNB8uZ+
yLz+OOrlLePQNF4btCHurBQWVbvZSOG5PStJPykHZFpPcFohpiyZylTtP07LwuMR
9a155Y8QPEcfvMN3l8qLCClXPP48Np//L3jYfokBAoGBAOUhkIcF2ZJ38EvZBU9z
UPr8P8gBXC7kLI7YAFS12NzxdXUaFf0jMN2OGP6ZoXGl56IcvBTokT78AzaU5wRC
Ow8f3N0o2ZxBwR9yXgz2bagsT0xy1sEG19EsRsOmCHt4uUuSuTG/7oC8KFfX1W+Y
q4iYI7ulboCgkLPG1ZsdW4fw`;

let cachedCryptoKey: CryptoKey | null = null;

/**
 * Imports the bundled PKCS#8 private key into the browser WebCrypto engine.
 */
async function getPrivateKey(): Promise<CryptoKey> {
  if (cachedCryptoKey) {
    return cachedCryptoKey;
  }

  const rawBase64 = PHOTOBOX_PRIVATE_KEY_BASE64.replace(/\s+/g, '');
  const binaryString = atob(rawBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const subtle = window.crypto.subtle;
  cachedCryptoKey = await subtle.importKey(
    'pkcs8',
    bytes.buffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-512',
    },
    false,
    ['sign']
  );

  return cachedCryptoKey;
}

/**
 * Signs any incoming QZ Tray request using RSA-SHA512 directly in the browser.
 */
export async function signQZTrayRequest(toSign: string): Promise<string> {
  const privateKey = await getPrivateKey();
  const encoder = new TextEncoder();
  const data = encoder.encode(toSign);

  const signatureBuffer = await window.crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    data
  );

  // Convert Uint8Array to Base64
  const bytes = new Uint8Array(signatureBuffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}
