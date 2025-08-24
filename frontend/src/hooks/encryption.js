// Client-Side Cryptographic Operations for Voting System
// Assumes: All RSA keys (user + election) are generated and managed by backend
// This code handles: Hybrid encryption + Digital signatures using provided keys

// =============================================================================
// CORE CRYPTOGRAPHIC OPERATIONS
// =============================================================================

/**
 * Sign a message using voter's private key (from backend)
 */

import { loadPrivateKey, hasPrivateKey, getAllUserIds } from './secureDB';

export const signMessage = async (message, voterId) => {
  try {
    const privateKey = await loadPrivateKey(voterId); // Your existing backend function
    if (!privateKey) throw new Error("Private key not found");
    
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(message));
    
    // RSASSA-PSS with explicit salt length
    const signature = await crypto.subtle.sign(
      { 
        name: "RSASSA-PSS",
        saltLength: 32
      },
      privateKey,
      data
    );
    
    return new Uint8Array(signature);
  } catch (error) {
    throw new Error(`Message signing failed: ${error.message}`);
  }
};

/**
 * Verify signature using public key in PEM format
 */
export const verifySignature = async (message, signature, publicKeyPem) => {
  try {
    if (!message || !signature || !publicKeyPem) {
      return false;
    }

    // Parse PEM format
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = publicKeyPem
      .replace(pemHeader, "")
      .replace(pemFooter, "")
      .replace(/\s/g, "");
    
    const keyData = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
    
    // Import public key
    const publicKey = await crypto.subtle.importKey(
      "spki",
      keyData,
      { 
        name: "RSASSA-PSS", 
        hash: "SHA-256" 
      },
      false,
      ["verify"]
    );
    
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(message));
    
    // Verify with matching configuration
    return await crypto.subtle.verify(
      { 
        name: "RSASSA-PSS",
        saltLength: 32
      },
      publicKey,
      signature,
      data
    );
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};

/**
 * Encrypt data with AES-GCM
 */
export const encryptWithAES = async (key, plaintext) => {
  try {
    if (!key || key.length !== 32) {
      throw new Error("AES key must be exactly 32 bytes (256 bits)");
    }

    // Generate random 12-byte IV for GCM
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    // Encrypt with AES-GCM (authenticated encryption)
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      cryptoKey,
      plaintext
    );

    // Combine IV + ciphertext
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return combined;
  } catch (error) {
    throw new Error(`AES encryption failed: ${error.message}`);
  }
};

/**
 * Encrypt data with RSA-OAEP using election's public key
 */
export const encryptWithRSA = async (publicKeyPem, data) => {
  try {
    if (data.length > 446) {
      throw new Error("Data too large for RSA encryption (max ~446 bytes for 4096-bit key)");
    }

    // Parse PEM format
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = publicKeyPem
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s/g, '');
    
    const keyData = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

    // Import RSA public key
    const publicKey = await crypto.subtle.importKey(
      'spki',
      keyData,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      false,
      ['encrypt']
    );

    const encrypted = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      data
    );

    return new Uint8Array(encrypted);
  } catch (error) {
    throw new Error(`RSA encryption failed: ${error.message}`);
  }
};

/**
 * SHA-256 hash function
 */
export const sha256 = async (data) => {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data;
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return new Uint8Array(hashBuffer);
  } catch (error) {
    throw new Error(`SHA-256 hashing failed: ${error.message}`);
  }
};

/**
 * Generate secure random AES key (256-bit)
 */
export const generateAESKey = () => {
  return crypto.getRandomValues(new Uint8Array(32));
};

/**
 * Base64 encoding
 */
export const base64Encode = (uint8Array) => {
  return btoa(String.fromCharCode(...uint8Array));
};

/**
 * Base64 decoding
 */
export const base64Decode = (base64String) => {
  return Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
};

// =============================================================================
// HIGH-LEVEL VOTE PROCESSING FUNCTIONS
// =============================================================================

/**
 * Hybrid encrypt vote data: AES for data + RSA for key transport
 * Uses election's public key (from backend) to encrypt AES key
 */
export const encryptVoteHybrid = async (voteData, electionPublicKeyPem) => {
  try {
    // Generate fresh AES key for this vote
    const aesKey = generateAESKey();
    
    // Encrypt vote data with AES-GCM
    const voteJson = JSON.stringify(voteData);
    const voteBytes = new TextEncoder().encode(voteJson);
    const encryptedVote = await encryptWithAES(aesKey, voteBytes);
    
    // Encrypt AES key with election's public key
    const wrappedAesKey = await encryptWithRSA(electionPublicKeyPem, aesKey);
    
    return {
      candidate_ciphertext: base64Encode(encryptedVote),
      aes_key_wrapped: base64Encode(wrappedAesKey)
    };
  } catch (error) {
    throw new Error(`Hybrid vote encryption failed: ${error.message}`);
  }
};

/**
 * Sign vote payload with voter's private key
 */
export const signVotePayload = async (payload, voterId) => {
  try {
    // Create payload copy without signature field
    const payloadToSign = { ...payload };
    delete payloadToSign.signature;
    
    // Sign with voter's private key
    const signature = await signMessage(payloadToSign, voterId);
    
    return {
      ...payload,
      signature: base64Encode(signature)
    };
  } catch (error) {
    throw new Error(`Vote payload signing failed: ${error.message}`);
  }
};

// =============================================================================
// INTEGRATION FUNCTIONS FOR YOUR SUBMIT VOTE
// =============================================================================

/**
 * Process vote for submission - integrates with your existing submitVote logic
 * Call this instead of your manual AES key generation and RSA encryption
 */
export const processVoteForSubmission = async (candidateIds, election, voterCredentials, voterId) => {
  try {
    // 1. Prepare vote data
    const voteData = { candidate_ids: candidateIds };
    
    // 2. Hybrid encrypt using election's public key
    const encryptionResult = await encryptVoteHybrid(voteData, election.public_key);
    
    // 3. Create serial commitment
    const S = new Uint8Array(voterCredentials.S);
    const serialCommitment = await sha256(S);
    
    // 4. Build payload
    const payload = {
      election_id: election.id,
      voter_credential_id: voterCredentials.voter_credential_id,
      candidate_ciphertext: encryptionResult.candidate_ciphertext,
      aes_key_wrapped: encryptionResult.aes_key_wrapped,
      credential_sig: base64Encode(voterCredentials.sigma),
      serial_commitment: base64Encode(serialCommitment),
      timestamp: new Date().toISOString()
    };
    
    // 5. Sign the complete payload
    const signedPayload = await signVotePayload(payload, voterId);
    
    return signedPayload;
    
  } catch (error) {
    throw new Error(`Vote processing failed: ${error.message}`);
  }
};