from django.db import models
from django.contrib.auth.models import AbstractUser
import random
import string

def generate_random_voter_id():
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"VTR-2025-{random_part}"

class User(AbstractUser):
    username = models.CharField(max_length=100, unique=True)
    address = models.CharField(max_length=200)
    email = models.EmailField(max_length=100, unique=True)
    contact_number = models.CharField(max_length=15, unique=True)
    student_id = models.CharField(max_length=20, unique=True)
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
    party = models.ForeignKey('Party', on_delete=models.CASCADE)
    position = models.ForeignKey('Position', on_delete=models.CASCADE)
    is_verified = models.BooleanField(default=False)
    
    
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
    voter = models.ForeignKey(User, on_delete=models.CASCADE)
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_committed = models.BooleanField(default=False)
    signature = models.TextField(blank=True, null=True)
    

class BlockTransaction(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    voter = models.ForeignKey(User, on_delete=models.CASCADE)
    signature = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    block = models.ForeignKey('Block', on_delete=models.CASCADE)

class Block(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    previous_hash = models.CharField(max_length=300, blank=True, null=True)
    nonce = models.IntegerField(default=0)
    current_hash = models.CharField(max_length=300, blank=True, null=True)
    
class Revote(models.Model):
    old_vote_id = models.CharField(max_length=20, unique=True)
    voter = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    
class Election(models.Model):
    name = models.CharField(max_length=100)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name

class ElectionResult(models.Model):
    election = models.ForeignKey(Election, on_delete=models.CASCADE)
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    votes = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.election.name} - {self.candidate.name} - {self.votes} votes"