import threading
from rest_framework.response import Response
from rest_framework import status
from rest_framework import serializers
from .models import User
from utils import verify_mail
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.core.validators import validate_email as django_validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from utils.send_mail import send_Voter_ID_mail
from utils.RSA_key import rsa_keys

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
        private_pem = public_pem = None
        user_data = validated_data.copy()
        temp_user = User(**user_data)

        def send_mail():
            send_Voter_ID_mail(temp_user.email, temp_user.username, temp_user.voter_id)
        
        def generate_key_pair():
            nonlocal private_pem, public_pem
            private_pem, public_pem = rsa_keys()
        
        thread_key = threading.Thread(target=generate_key_pair)
        thread_mail = threading.Thread(target=send_mail)
        
        thread_key.start()
        thread_mail.start()
        
        thread_key.join()
        
        user = User.objects.create_user(**validated_data, public_key=public_pem)
        user.save()
  
        self.private_key = private_pem
        return user, private_pem

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
        return super().validate(attrs)
        