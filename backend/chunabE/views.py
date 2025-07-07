from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer
from .models import User
from django.contrib.auth import authenticate

# Create your views here.
class RegisterView(APIView):
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Registration successful!',
                             'private_key': serializer.private_key}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class LoginView(APIView):
    def post(self, request):
        voter_id = request.data.get('voter_id')
        password = request.data.get('password')
        
        try:
            user = User.objects.get(voter_id=voter_id)
        except User.DoesNotExist:
            return Response({'error': 'Invalid voter ID'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=user.username, voter_id=voter_id, password=password)
        if user is None:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'message': 'Login successful!'}, status=status.HTTP_200_OK)