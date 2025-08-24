from django.db import models
from django.contrib.auth.models import AbstractUser
import random
import string
from django.utils.html import mark_safe
import os
import environ
from pathlib import Path
from cryptography.fernet import Fernet

BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env(
    DEBUG=(bool, False)
)
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))
MASTER_KEY = env('MASTER_KEY').encode()
fernet = Fernet(MASTER_KEY)

def encrypt_private_key(private_key):
    return fernet.encrypt(private_key.encode()).decode()

def decrypt_private_key(encrypted_private_key):
    return fernet.decrypt(encrypted_private_key.encode()).decode()

def generate_random_voter_id():
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"VTR-2025-{random_part}"

class User(AbstractUser):
    username = models.CharField(max_length=100, unique=True)
    address = models.CharField(max_length=200)
    email = models.EmailField(max_length=100, unique=True)
    contact_number = models.CharField(max_length=15, unique=True)
    student_id = models.CharField(max_length=20, unique=True)
    college = models.CharField(max_length=100, null= True)
    faculty = models.CharField(max_length=100)
    year = models.CharField(max_length=20)
    voter_id = models.CharField(max_length=20, unique=True, editable=False)
    public_key = models.TextField()
    fingerprint = models.CharField(max_length= 65, unique=True, null=True)
    
    def save(self, *args, **kwargs):
        if not self.voter_id:
            # Generate a unique voter ID if it doesn't exist
            while True:
                voter_id = generate_random_voter_id()
                if not User.objects.filter(voter_id=voter_id).exists():
                    self.voter_id = voter_id
                    break
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.username} - {self.student_id}"

class Candidate(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='candidates/')
    manifesto = models.TextField()
    candidate_id = models.CharField(max_length=10, unique=True)
    party = models.ForeignKey('Party', related_name='party', on_delete=models.CASCADE)
    position = models.ForeignKey('Position', related_name='position', on_delete=models.CASCADE)
    is_verified = models.BooleanField(default=False)
    election = models.ForeignKey('Election', related_name='candidates', on_delete=models.CASCADE)
    
    # def image_privew(self):
    #     return mark_safe(f'<img src="{self.image.url}" alt = "" width = "300"/>')    
    # def admin_image_privew(self):
    #     return mark_safe(f'<img src="{self.image.url}" alt = "" width = "100" style="border: 1px solid #000;border-radius:50%;"/>')    
    # admin_image_privew.short_description = "Image"
    
    def __str__(self):
        return f"{self.name} - ({self.party.party_name})"

class Party(models.Model):
    party_name = models.CharField(max_length = 100)
    party_symbol = models.ImageField(upload_to='party_symbols/')
    
    def __str__(self):
        return self.party_name

class Position(models.Model):
    position_name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.position_name
    
class Vote(models.Model):
    election = models.ForeignKey('Election', on_delete=models.CASCADE, db_index=True)
    voter_credential = models.ForeignKey('VoterCredential', on_delete=models.CASCADE)
    candidate_ciphertext = models.BinaryField()       # AES-encrypted ballot
    aes_key_wrapped = models.BinaryField()            # AES key encrypted with election RSA
    credential_sig = models.BinaryField()             # EA signature over credential serial
    serial_commitment = models.CharField(max_length=128, db_index=True)  # H = SHA-256(S)
    timestamp = models.DateTimeField(auto_now_add=True)


class BlockTransaction(models.Model):
    block = models.ForeignKey('Block', on_delete=models.CASCADE)
    tx_hash = models.CharField(max_length=100, unique=True) # hash of tx content
    vote = models.OneToOneField(Vote, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if self.block and self.block.finalized:
            # Prevent modification of transactions in a finalized block
            raise ValueError("Cannot modify a transaction in a finalized block.")
        super().save(*args, **kwargs)
    

class Block(models.Model):
    index = models.IntegerField(default=0, unique=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    previous_hash = models.CharField(max_length=300, blank=True, null=True)
    nonce = models.IntegerField(default=0)
    difficulty = models.IntegerField(default=4)
    merkle_root = models.CharField(max_length=300)
    current_hash = models.CharField(max_length=300, blank=True, null=True)
    finalized = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['index']
    
    def save(self, *args, **kwargs):
        if self.pk:
            original = Block.objects.filter(pk=self.pk).first()
            
            if original and original.finalized and (original.current_hash != self.current_hash and original.previous_hash != self.previous_hash):
                raise ValueError("Cannot modify a finalized block.")
        
        super().save(*args, **kwargs)
        
    
class Revote(models.Model):
    old_vote_id = models.CharField(max_length=20, unique=True)
   
    timestamp = models.DateTimeField(auto_now_add=True)
    
class Election(models.Model):
    name = models.CharField(max_length=100)
    salt = models.CharField(max_length=128, blank=True, null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=False)
    public_key = models.TextField()
    private_key = models.TextField()
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.public_key or not self.private_key:
            from utils.RSA_key import rsa_keys
            private_key, public_key, fingerprint = rsa_keys()
            self.public_key = public_key
            self.private_key = encrypt_private_key(private_key)
            
        new_election = self.pk is None
        if new_election:
            users = User.objects.filter(college = self.name)
            for user in users:
                Eligibility.objects.get_or_create(election = self, user = user, issued = True)
        super().save(*args, **kwargs)
    
    def get_private_key(self):
        return decrypt_private_key(self.private_key)
    
    def sign_S(self, S):
        from cryptography.hazmat.primitives.asymmetric import padding
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.backends import default_backend 
        
        private_key_pem = self.get_private_key()
        
        private_key = serialization.load_pem_private_key(
            private_key_pem.encode('utf-8'),
            password=None,
            backend=default_backend())
        
        signature = private_key.sign(S, padding.PKCS1v15(), 
                            hashes.SHA256())
        return signature

class ElectionResult(models.Model):
    election = models.ForeignKey(Election, on_delete=models.CASCADE)
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    votes = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.election.name} - {self.candidate.name} - {self.votes} votes"
    
class Eligibility(models.Model):
    election = models.ForeignKey('Election', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, unique=True)
    issued = models.BooleanField(default=False)   # whether credential was issued


# Add this new model for credential management
class VoterCredential(models.Model):
    """Store issued credentials for voters"""
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    election = models.ForeignKey('Election', on_delete=models.CASCADE)
    serial_number_hash = models.CharField(max_length=100, null=True)  # SHA256 hash of serial number
    signature = models.TextField(null=True)  # EA signature over serial number
    issued_at = models.DateTimeField(auto_now_add=True)
   

    class Meta:
        unique_together = ['user', 'election']

# Add this model for tracking vote history (UI purposes)
class VoteHistory(models.Model):
    """Track voting history for UI purposes (non-anonymous)"""
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    election = models.ForeignKey('Election', on_delete=models.CASCADE)
    voted_at = models.DateTimeField(auto_now_add=True)
    vote_count = models.PositiveIntegerField(default=1)  # For revoting

    class Meta:
        unique_together = ['user', 'election']
