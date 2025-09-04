from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes, serialization
import base64
from rest_framework.exceptions import ValidationError
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import json

def decrypt_aes_key(election, aes_key_wrapped_b64):
    """Decrypt the wrapped AES key using election's private key"""
    
    try:
        # Get election's private key
        private_key_pem = election.get_private_key()  # You need this method
        
        # Decode wrapped AES key
        wrapped_key = base64.b64decode(aes_key_wrapped_b64)
        
        private_key = serialization.load_pem_private_key(
            private_key_pem.encode('utf-8'),
            password=None,
            backend=default_backend()
        )
        # Decrypt using RSA-OAEP (matching frontend)
        aes_key = private_key.decrypt(
            wrapped_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        print("\n\naes key decrypt success!!")
        return aes_key
        
    except Exception as e:
        raise ValidationError(f"AES key decryption failed: {str(e)}")
    
def decrypt_vote_data(candidate_ciphertext_b64, aes_key):
    """Decrypt vote data using AES-GCM"""
    
    try:
        # Decode ciphertext
        ciphertext = base64.b64decode(candidate_ciphertext_b64)
        
        # Extract components (IV + encrypted_data + auth_tag)
        iv = ciphertext[:12]           # First 12 bytes
        auth_tag = ciphertext[-16:]    # Last 16 bytes  
        encrypted_data = ciphertext[12:-16]  # Middle part
        
        # Create cipher and decrypt
        cipher = Cipher(
            algorithms.AES(aes_key), 
            modes.GCM(iv, auth_tag),
            backend=default_backend()
        )
        decryptor = cipher.decryptor()
        
        # Decrypt
        decrypted_bytes = decryptor.update(encrypted_data) + decryptor.finalize()
        
        # Parse JSON
        vote_data = json.loads(decrypted_bytes.decode('utf-8'))
        
        return vote_data
        
    except Exception as e:
        raise ValidationError(f"Vote decryption failed: {str(e)}")