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
                  'college', 
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
    
    # def validate_email(self, value):
    #     if not value:
    #         raise serializers.ValidationError("This field is required.")
        
    #     try:
    #         django_validate_email(value)
    #     except DjangoValidationError:
    #         raise serializers.ValidationError("Invalid email format.")
        
    #     if User.objects.only("email").filter(email=value).exists():
    #         raise serializers.ValidationError("This email is already taken.")

    #     if not verify_mail(value):
    #         raise serializers.ValidationError("Email is not valid.")
        
    #     return value
    
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
            # threading.Thread(target=send_Voter_ID_mail, args=(user.email, user.username, user.voter_id))
            
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
    
        data = super().validate(attrs)
        data.update({
            "user_id": user.id,
        })
        return data
    
class CandidateRegisterSerializer(serializers.ModelSerializer):
    
    party = serializers.SlugRelatedField(
        queryset=Party.objects.all(),
        slug_field='party_name'  # use the unique field
    )
    position = serializers.SlugRelatedField(
        queryset=Position.objects.all(),
        slug_field='position_name'
    )
    election = serializers.SlugRelatedField(
        queryset=Election.objects.all(),
        slug_field='name'
    )
    class Meta:
        model = Candidate
        fields = ['name', 'email', 'phone', 'position', 'party', 'document', 'election']
    
    def validate_phone(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Phone number must be 10 digits")
        return value
        

class PartySerializer(serializers.ModelSerializer):
    class Meta:
        model = Party
        fields = ['id', 'party_name', 'party_symbol']

class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ['id', 'position_name']
        

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
    
class ElectionMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Election
        fields = ['id', 'name', 'start_date', 'end_date', 'is_active']
        
class CandidateSerializer(serializers.ModelSerializer):
    party = PartySerializer()
    position = PositionSerializer()
    election = ElectionMiniSerializer()
    
    # image = serializers.SerializerMethodField()
    class Meta:
        model = Candidate
        fields = ['id', 'name', 'image', 'manifesto', 'party', 'is_verified', 'election', 'position']
    
    # def get_image(self, obj):
    #     if obj.image:
    #         import os
    #         request = self.context.get('request')
    #         url = request.build_absolute_uri(obj.image.url)
    #         print(f"Generated image URL: {url}")
    #         print(f"File exists: {os.path.exists(obj.image.path)}")
    #         return request.build_absolute_uri(obj.image.url)
    #     else:
    #         return None  
class VoterCredendentialSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = VoterCredential
        fields = ['serial_number_b64']
    
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
    signature = serializers.CharField()
    candidate_ciphertext = serializers.CharField()  # Base64 encoded
    aes_key_wrapped = serializers.CharField()       # Base64 encoded
    credential_sig = serializers.CharField()        # Base64 encoded
    serial_commitment = serializers.CharField()     # Base64 encoded
    timestamp = serializers.DateTimeField()

    def validate(self, data):
        # Validate election exists and is active
        try:
            print("before validation: \n" )
            print(f"election_id: {data['election_id']}\n")
            print(f"voter_credential_id: {data['voter_credential_id']}\n")
            print(f"signature: {data['signature']}\n")
            print(f"candidate_ciphertext: {data['candidate_ciphertext']}\n")
            print(f"aes_key_wrapped: {data['aes_key_wrapped']}\n")
            print(f"credential_sig: {data['credential_sig']}\n")
            print(f"serial_commitment: {data['serial_commitment']}\n")
            print(f"timestamp: {data['timestamp']}\n")
            
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
        print("Submited vote data:", validated_data)  # Debugging line
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
        # vote = Vote.objects.create(
        #     election=election,
        #     voter_credential = voter_credential,
        #     candidate_ciphertext=candidate_ciphertext,
        #     aes_key_wrapped=aes_key_wrapped,
        #     credential_sig=credential_sig,
        #     serial_commitment=serial_commitment,
        #     timestamp=validated_data['timestamp']
        #     # is_latest=True  # Add this if you add the field
        # )
        
        # return vote

class VoteHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VoteHistory
        fields = ['election', 'voted_at', 'vote_count']

class UserVoteHistorySerializer(serializers.Serializer):
    voted_elections = serializers.ListField(
        child=serializers.IntegerField(),
        read_only=True
    )