from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes, serialization
from rest_framework.exceptions import ValidationError
from cryptography.hazmat.backends import default_backend
import base64
import hashlib
import json


def verify_credential_signature_sigma(election, voter_credential, credential_sig_b64):
    """Verify the voter credential signature"""
    
    # Get the original S value used to create this credential
    original_s_b64 = voter_credential.serial_number_b64  # This should be stored
    
    try:
        # Load election's public key
        public_key_pem = election.public_key
        public_key = serialization.load_pem_public_key(
            public_key_pem.encode('utf-8'),
            backend=default_backend()
        )
        
        # Decode the signature and message
        signature = base64.b64decode(credential_sig_b64)
        message = base64.b64decode(original_s_b64)
    
        # Verify signature
        public_key.verify(
            signature,
            message,
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        print("\n\nTrue")
        return True
        
    except Exception as e:
        raise ValidationError(f"Credential signature verification failed: {str(e)}")
    
def verify_vote_signature(vote_payload, signature_b64, voter_public_key):
    """Verify the overall vote signature"""
    
    try:
        public_key = serialization.load_pem_public_key(voter_public_key.encode(),
                                                      )
        # Create message to verify (exclude signature from payload)
        payload_copy = vote_payload.copy()
        del payload_copy['signature']
        
        # Create canonical message
        message = json.dumps(payload_copy, separators=(',', ':'), ensure_ascii=False).encode('utf-8')
        
        # Verify signature
        signature = base64.b64decode(signature_b64)
        public_key.verify(
            signature,
            message,
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        print("vote playload verification success: True")
        return True
        
    except Exception as e:
        print("Vote signature verification failed")
        raise ValidationError(f"Vote signature verification failed: {str(e)}")
    
    
def verify_serial_commitment(vote_data, serial_commitment_b64):
    """Verify that the serial commitment matches the vote data"""
   
    
    try:
        # Recreate commitment from vote data
        vote_json = json.dumps(vote_data, sort_keys=True, separators=(',', ':'))
        calculated_commitment = hashlib.sha256(vote_json.encode('utf-8')).digest()
        calculated_commitment_b64 = base64.b64encode(calculated_commitment).decode()
        
        # Compare with provided commitment
        if calculated_commitment_b64 != serial_commitment_b64:
            raise ValidationError("Serial commitment verification failed")
            
        return True
        
    except Exception as e:
        raise ValidationError(f"Serial commitment verification failed: {str(e)}")