import threading
from rest_framework.response import Response
from rest_framework import status
from rest_framework import serializers
from .models import User, Candidate, Election, Party, Position, Vote, VoteHistory, Eligibility, VoterCredential
from utils import verify_mail
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.core.validators import validate_email as django_validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from utils.send_mail import send_Voter_ID_mail
from utils.RSA_key import rsa_keys
import hashlib
import base64
from django.utils import timezone


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
        print("password valid")
        return data

    def create(self, validated_data):
        try:
            validated_data.pop('confirmPassword') 
            # user_data = validated_data.copy()
            # temp_user = User(**user_data)
            
            print("hi")
            user = User.objects.create_user(**validated_data)
            print("user created")
            private_key_pem, public_key_pem, fingerprint = rsa_keys()
            user.public_key = public_key_pem
            user.fingerprint = fingerprint
            user.save()
            print("keys saved")
            threading.Thread(target=send_Voter_ID_mail, args=(user.email, user.username, user.voter_id))
            
            self.extra_data = {
                "private_key": private_key_pem,
                "public_key": public_key_pem,
                "fingerprint": fingerprint,
                "user_id": user.id
            }
            
            return user
        except Exception:
            import traceback
            print("Error in user creation")
            traceback.print_exc()
            raise

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
        
        # private_key_pem, public_key_pem, fingerprint = rsa_keys()
        # user.public_key = public_key_pem
        # user.fingerprint = fingerprint
        
        
        data = super().validate(attrs)
        data.update({
            "user_id": user.id,
        })
        return data

class PartySerializer(serializers.ModelSerializer):
    class Meta:
        model = Party
        fields = ['id', 'party_name', 'party_symbol']

class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ['id', 'position_name']
        
class CandidateSerializer(serializers.ModelSerializer):
    party = PartySerializer()
    position = PositionSerializer()
    class Meta:
        model = Candidate
        fields = ['id', 'name', 'image', 'manifesto', 'party', 'position', 'is_verified', 'election', 'position']

class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['id', 'voter', 'candidate', 'election', 'signature', 'is_committed']
        
    def validate(self, data):
        voter = data.get('voter')
        candidate = data.get('candidate')
        election = data.get('election')
        
        if Vote.objects.filter(voter=voter, election=election).exists():
            raise serializers.ValidationError("You have already voted in this election.")
        
        return data
    
class ElectionSerializer(serializers.ModelSerializer):
    candidates = CandidateSerializer(many=True)
    
    class Meta:
        model = Election
        fields = ['id', 'name', 'start_date', 'end_date', 'is_active', 'candidates', 'public_key']
    
    def validate(self, data):
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("Start date must be before end date.")
        if data['is_active'] == 0:
            raise serializers.ValidationError("Election must be active.")
        return data
    
# class VoteSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['voter', 'candidate', 'election']
    
#     def validate(self, data):
#         if not data['voter'].is_authenticated:
#             raise serializers.ValidationError("User must be authenticated to vote.")
#         if not data['candidate'].is_verified:
#             raise serializers.ValidationError("Candidate must be verified to receive votes.")
#         return data
    
#     def create(self, validated_data):
#         voter = validated_data['voter']
#         candidate = validated_data['candidate']
#         election = validated_data['election']
        
#         if Vote.objects.filter(voter=voter, election=election).exists():
#             raise serializers.ValidationError("You have already voted in this election.")
        
#         vote = Vote.objects.create(voter=voter, candidate=candidate, election=election)
#         return vote

class singleVoteSerializer(serializers.ModelSerializer):
    position_id = serializers.IntegerField()
    candidate_id = serializers.CharField()
    signature = serializers.CharField()
    
    class Meta:
        model = Vote
        fields = ['position_id', 'candidate_id', 'signature']
        
    def validate(self, data):
        try:
            print(f"signature: {base64.b64decode(data["signature"]).hex()}")
            candidate = Candidate.objects.get(id=data['candidate_id'])
            if not candidate.is_verified:
                raise serializers.ValidationError("Candidate must be verified to receive votes.")
        except Candidate.DoesNotExist:
            raise serializers.ValidationError("Candidate does not exist.")
        
        if candidate.position.id != data['position_id']:
            raise serializers.ValidationError("Candidate does not belong to the given position")
        
        return data
    
class VoteSubmisionSerializer(serializers.Serializer):
    voter_id = serializers.CharField()
    election_id = serializers.IntegerField()
    votes = singleVoteSerializer(many=True)
    
    def validate(self, data):
        try:
            voter = User.objects.get(id=data['voter_id'])
        except User.DoesNotExist:
            raise serializers.ValidationError("Voter does not exist")

        # Validate election exists and is active
        try:
            election = Election.objects.get(id=data['election_id'])
        except Election.DoesNotExist:
            raise serializers.ValidationError("Election does not exist")

        if not election.is_active:
            raise serializers.ValidationError("Election is not active")
        
        if Vote.objects.filter(voter=voter, election=election).exists():
            raise serializers.ValidationError("You have already voted in this election.")

        # Attach voter and election to context for nested serializer validation if needed
        self.context['voter'] = voter
        self.context['election'] = election
        
        return data
    
    def create(self, validated_data):
        voter = self.context['voter']
        election = self.context['election']
        votes_data = validated_data['votes']
        
        vote_instances = []
        for vote_data in votes_data:
            candidate = Candidate.objects.get(id=vote_data['candidate_id'])
            vote = Vote.objects.create(
                voter=voter,
                candidate=candidate,
                election=election,
                signature=vote_data['signature'],
                is_committed=True
            )
            vote_instances.append(vote)

        
        return vote_instances

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'voter_id', 'public_key', 'fingerprint', 'contact_number', ]
    
    def validate(self, data):
        if not data.get('username'):
            raise serializers.ValidationError("Username is required.")
        if not data.get('email'):
            raise serializers.ValidationError("Email is required.")
        return data
    
class ElectionListSerializer(serializers.ModelSerializer):
    """Simplified election serializer for list view"""
    class Meta:
        model = Election
        fields = [
            'id', 'name', 'start_date', 'end_date', 
            'is_active', 'public_key'
        ]

class CredentialRequestSerializer(serializers.Serializer):
    serial_number = serializers.CharField()
    
    def validate_serial_number(self, value):
        try:
            # Decode base64 serial number
            serial_bytes = base64.b64decode(value)
            if len(serial_bytes) != 32:  # Should be 32 bytes
                raise serializers.ValidationError("Invalid serial number length")
            return value
        except Exception:
            raise serializers.ValidationError("Invalid serial number format")
        
    def validate(self, data):
        request = self.context['request']
        user = request.user
        election_id = self.context['election_id']  # provided by view

        # Check eligibility
        try:
            eligibility = Eligibility.objects.get(election_id=election_id, user=user)
        except Eligibility.DoesNotExist:
            raise serializers.ValidationError("You are not eligible for this election.")

        if eligibility.issued:
            raise serializers.ValidationError("Credential already issued for this election.")

        data['eligibility'] = eligibility
        return data


class CredentialResponseSerializer(serializers.Serializer):
    signature = serializers.CharField()

class AnonymousVoteSerializer(serializers.Serializer):
    election_id = serializers.IntegerField()
    voter_credential_id = serializers.IntegerField()
    candidate_ciphertext = serializers.CharField()  # Base64 encoded
    aes_key_wrapped = serializers.CharField()       # Base64 encoded
    credential_sig = serializers.CharField()        # Base64 encoded
    serial_commitment = serializers.CharField()     # Base64 encoded
    timestamp = serializers.DateTimeField()

    def validate(self, data):
        # Validate election exists and is active
        try:
            election = Election.objects.get(id=data['election_id'], is_active=True)
            current_time = timezone.now()
            
            if current_time < election.start_date:
                raise serializers.ValidationError("Election has not started yet")
            if current_time > election.end_date:
                raise serializers.ValidationError("Election has ended")
                
        except Election.DoesNotExist:
            raise serializers.ValidationError("Invalid election ID")

        # Validate base64 encoded fields
        for field in ['candidate_ciphertext', 'aes_key_wrapped', 'credential_sig', 'serial_commitment']:
            try:
                base64.b64decode(data[field])
            except Exception:
                raise serializers.ValidationError(f"Invalid base64 encoding for {field}")

        return data

    def create(self, validated_data):
        election_id = validated_data['election_id']
        election = Election.objects.get(id=election_id)
        voter_credential = VoterCredential.objects.get(id=validated_data['voter_credential_id'])
        # Convert base64 strings to binary for storage
        candidate_ciphertext = base64.b64decode(validated_data['candidate_ciphertext'])
        aes_key_wrapped = base64.b64decode(validated_data['aes_key_wrapped'])
        credential_sig = base64.b64decode(validated_data['credential_sig'])
        serial_commitment = validated_data['serial_commitment']
        
        # Handle revoting - mark previous votes as not latest (if you add is_latest field)
        # Vote.objects.filter(
        #     election=election,
        #     serial_commitment=serial_commitment
        # ).update(is_latest=False)
        
        # Create new vote
        vote = Vote.objects.create(
            election=election,
            voter_credential = voter_credential,
            candidate_ciphertext=candidate_ciphertext,
            aes_key_wrapped=aes_key_wrapped,
            credential_sig=credential_sig,
            serial_commitment=serial_commitment,
            timestamp=validated_data['timestamp']
            # is_latest=True  # Add this if you add the field
        )
        
        return vote

class VoteHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VoteHistory
        fields = ['election', 'voted_at', 'vote_count']

class UserVoteHistorySerializer(serializers.Serializer):
    voted_elections = serializers.ListField(
        child=serializers.IntegerField(),
        read_only=True
    )