from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, ElectionSerializer, CandidateSerializer, VoteSubmisionSerializer, UserSerializer, VoteSerializer
from .models import User, Election, Candidate
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserTokenSerializer
import logging

logger = logging.getLogger(__name__)

def get_csrf_token(request):
    return JsonResponse({"csrfToken": get_token(request)})


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
                "candidates": candidate_data,
                
            })
        except Exception as e:
            logger.error("ElectionView error:", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class SubmitVoteView(APIView):
    authentication_classes = [JWTAuthentication]  
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = VoteSubmisionSerializer(data=request.data)
        
        if serializer.is_valid():
            votes = serializer.save()
            
            vote_serializer = VoteSerializer(votes, many=True)
            return Response({
                "message": "Vote submitted successfully",
                "votes": vote_serializer.data
            }, status=status.HTTP_201_CREATED)
        else:
            print("Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)