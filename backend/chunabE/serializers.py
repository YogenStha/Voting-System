from rest_framework import serializers
from .models import User
from utils import verify_mail
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email as django_validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from utils.send_mail import send_Voter_ID_mail

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
        if value == "":
            raise serializers.ValidationError("This field is required.")
        if value.isdigit():
            raise serializers.ValidationError("This field cannot contain numbers.")
        if any(char.isdigit() for char in value):
            raise serializers.ValidationError("Nmae cannot contain numbers.")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This name is already taken.")
         
        return value
    
    def validate_email(self, value):
        if value == "":
            raise serializers.ValidationError("This field is required.")
        
        try:
            django_validate_email(value)
        except DjangoValidationError:
            raise serializers.ValidationError("Invalid email format.")
        
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already taken.")

        if not verify_mail(value):
            raise serializers.ValidationError("Email is not valid.")
        
        return value
    
    def validate_student_id(self, value):
        if value == "":
            raise serializers.ValidationError("This field is required.")
        if not value.isdigit():
            raise serializers.ValidationError("Student ID must be a number.")
        if User.objects.filter(student_id=value).exists():
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
        user = User.objects.create_user(**validated_data)
        user.save()
        
        send_Voter_ID_mail(user.email, user.username, user.voter_id)
        return user