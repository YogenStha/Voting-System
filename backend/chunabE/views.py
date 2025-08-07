from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, ElectionSerializer, CandidateSerializer
from .models import User, Election, Candidate
from django.contrib.auth import authenticate
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserTokenSerializer
import logging

logger = logging.getLogger(__name__)

# Create your views here.
class RegisterView(APIView):
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            return Response({
                "message": "Registration successful",
                "user_id": user.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class UserLoginJWTView(TokenObtainPairView):
    serializer_class = UserTokenSerializer
    
class ElectionView(APIView):
    
    def get(self, request):
        try:
            elections = Election.objects.filter(is_active=True)
            election_data = ElectionSerializer(elections, many=True).data
            candidates = Candidate.objects.filter(is_verified=True)
            candidate_data = CandidateSerializer(candidates, many=True).data
        
            return Response({
                "elections": election_data,
                "candidates": candidate_data
            })
        except Exception as e:
            logger.error("ElectionView error:", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)