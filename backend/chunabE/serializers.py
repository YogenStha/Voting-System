import threading
from rest_framework.response import Response
from rest_framework import status
from rest_framework import serializers
from .models import User, Candidate, Election, Party, Position, Vote
from utils import verify_mail
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.core.validators import validate_email as django_validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from utils.send_mail import send_Voter_ID_mail
from utils.RSA_key import rsa_keys
import hashlib

class RegisterSerializer(serializers.ModelSerializer):
    confirmPassword = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ('username', 
                  'student_id', 
                  'address', 
                  'email', 
                  'year', 
                  'faculty', 
                  'contact_number',
                  'password',
                  'confirmPassword'
                  )
        extra_kwargs = {'password': {'write_only': True}}

    
    def validate_username(self, value):
        print(value)
        if not value:
            raise serializers.ValidationError("This field is required.")
        if any(char.isdigit() for char in value):
            raise serializers.ValidationError("Name cannot contain numbers.")
        if User.objects.only("username").filter(username=value).exists():
            raise serializers.ValidationError("This name is already taken.")
         
        return value
    
    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("This field is required.")
        
        try:
            django_validate_email(value)
        except DjangoValidationError:
            raise serializers.ValidationError("Invalid email format.")
        
        if User.objects.only("email").filter(email=value).exists():
            raise serializers.ValidationError("This email is already taken.")

        if not verify_mail(value):
            raise serializers.ValidationError("Email is not valid.")
        
        return value
    
    def validate_student_id(self, value):
        if not value:
            raise serializers.ValidationError("This field is required.")
        if not value.isdigit():
            raise serializers.ValidationError("Student ID must be a number.")
        if User.objects.only("student_id").filter(student_id=value).exists():
            raise serializers.ValidationError("This student ID is already taken.")

        return value
    
    def validate(self, data):
        password = data.get('password')
        confirm_password = data.get('confirmPassword')
        if password != confirm_password:
            raise serializers.ValidationError("Passwords do not match.")
        validate_password(password)
        return data

    def create(self, validated_data):
        validated_data.pop('confirmPassword') 
        # user_data = validated_data.copy()
        # temp_user = User(**user_data)
        user = User.objects.create_user(**validated_data)
        user.save()
        send_Voter_ID_mail(user.email, user.username, user.voter_id)
        return user

class UserTokenSerializer(TokenObtainPairSerializer):
    
    def validate(self, attrs):
        voter_id = attrs.get('username')
        password = attrs.get('password')
        
        try:
            user = User.objects.only("username").get(voter_id=voter_id)  
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid voter ID")
        
        user = authenticate(username=user.username, voter_id=voter_id, password=password)
        if user is None:
            raise serializers.ValidationError("Invalid credentials")
            
        attrs["username"] = user.username
        self.user = user
        
        private_key_pem, public_key_pem, fingerprint = rsa_keys()
        user.public_key = public_key_pem
        user.fingerprint = fingerprint
        user.save()
        
        data = super().validate(attrs)
        data.update({
            "user_id": user.id,
            "private_key": private_key_pem,
            "fingerprint": fingerprint
        })
        return data

class PartySerializer(serializers.ModelSerializer):
    class Meta:
        model = Party
        fields = ['party_name', 'party_symbol']

class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ['position_name']
        
class CandidateSerializer(serializers.ModelSerializer):
    party = PartySerializer()
    position = PositionSerializer()
    class Meta:
        model = Candidate
        fields = ['name', 'image', 'manifesto', 'party', 'position', 'is_verified', 'election', 'position']
        

class ElectionSerializer(serializers.ModelSerializer):
    candidates = CandidateSerializer(many=True)
    
    class Meta:
        model = Election
        fields = ['id', 'name', 'start_date', 'end_date', 'is_active', 'candidates']
    
    def validate(self, data):
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("Start date must be before end date.")
        if data['is_active'] == 0:
            raise serializers.ValidationError("Election must be active.")
        return data
    
class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['voter', 'candidate', 'election']
    
    def validate(self, data):
        if not data['voter'].is_authenticated:
            raise serializers.ValidationError("User must be authenticated to vote.")
        if not data['candidate'].is_verified:
            raise serializers.ValidationError("Candidate must be verified to receive votes.")
        return data
    
    def create(self, validated_data):
        voter = validated_data['voter']
        candidate = validated_data['candidate']
        election = validated_data['election']
        
        if Vote.objects.filter(voter=voter, election=election).exists():
            raise serializers.ValidationError("You have already voted in this election.")
        
        vote = Vote.objects.create(voter=voter, candidate=candidate, election=election)
        return vote