// crypto.js

// Convert string → ArrayBuffer
export function strToArrayBuffer(str) {
  return new TextEncoder().encode(str);
}

// Convert ArrayBuffer → Base64
export function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let b of bytes) {
    binary += String.fromCharCode(b);
  }
  return window.btoa(binary);
}

// Sign message with private key (PEM, PKCS#8)
export async function signMessage(privateKeyPem, message) {
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = privateKeyPem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");
  const binaryDer = window.atob(pemContents);
  const binaryDerBuffer = new Uint8Array(binaryDer.length);
  for (let i = 0; i < binaryDer.length; i++) {
    binaryDerBuffer[i] = binaryDer.charCodeAt(i);
  }

  const privateKey = await window.crypto.subtle.importKey(
    "pkcs8",
    binaryDerBuffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await window.crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    strToArrayBuffer(message)
  );

  return arrayBufferToBase64(signature);
}
