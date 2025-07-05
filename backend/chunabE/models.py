from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    username = models.CharField(max_length=100, unique=True)
    address = models.CharField(max_length=200)
    email = models.EmailField(max_length=100, unique=True)
    contact_number = models.CharField(max_length=15, unique=True)
    student_id = models.CharField(max_length=20, unique=True)
    faculty = models.CharField(max_length=100)
    year = models.DateField()
    voter_id = models.CharField(max_length=20, unique=True)
    public_key = models.TextField()

class Candidate(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='candidates/')
    manifesto = models.TextField()
    candidate_id = models.CharField(max_length=10, unique=True)
    party = models.ForeignKey('Party', on_delete=models.CASCADE)
    position = models.ForeignKey('Position', on_delete=models.CASCADE)

class Party(models.Model):
    party_name = models.CharField(max_length = 100)
    party_symbol = models.ImageField(upload_to='party_symbols/')

class Position(models.Model):
    position_name = models.CharField(max_length=100)
    
class Vote(models.Model):
    voter_id = models.ForeignKey(User, on_delete=models.CASCADE)
    candidate_id = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_committed = models.BooleanField(default=False)
    Signature = models.TextField(blank=True, null=True)

class Block_Transaction(models.Model):
    candidate_id = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    voter_id = models.ForeignKey(User, on_delete=models.CASCADE)
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
    voter_id = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)