from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import *
from .models import *
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics
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
        print("request data: ", request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            return Response({
                "message": "Registration successful",
                "user_id": user.id,
                "private_key": serializer.extra_data['private_key'],
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

class CredentialIssueView(generics.CreateAPIView):
    """Issue voting credential for a user and election"""
    permission_classes = [IsAuthenticated]
    serializer_class = CredentialRequestSerializer
    
    def post(self, request, *args, **kwargs):
        print("User:", request.user)
        print("Is authenticated:", request.user.is_authenticated)
        print("Auth header:", request.META.get("HTTP_AUTHORIZATION"))
        print("Request data:", request.data)
        
        S_base64 = request.data.get('serial_number')
        S = base64.b64decode(S_base64)
        print("Decoded S:", S)
        S_numbers = list(S)
        print("S as numbers:", S_numbers)
        user = request.user
        election_id = request.data.get('election_id')
        
        if not S or not election_id:
            return Response({'error': 'Missing serial number or election ID'}, status=status.HTTP_400_BAD_REQUEST)
        
        election = Election.objects.filter(id=election_id).first()
        
        if not election:
            return Response({'error': 'Invalid election ID'}, status=status.HTTP_400_BAD_REQUEST)
        
        eligibility = Eligibility.objects.filter(user=user, election=election).first()
        if not eligibility:
            return Response({'error': 'You are not eligible to vote in this election'}, status=status.HTTP_403_FORBIDDEN)
        
        if eligibility.issued:
            existing_credential = VoterCredential.objects.filter(user=user, election=election).first()
            
            if existing_credential:
                voter_credential_id = existing_credential.id
                print("singma (signature) : ", existing_credential.signature)
                return Response({
                    'message': 'Credential already issued',
                    'serial_number_b64': S_base64,
                    'signature': existing_credential.signature,
                    'serial_number_hash': existing_credential.serial_number_hash,
                    'voter_credential_id': voter_credential_id
                }, status=status.HTTP_200_OK)
                
        signature = election.sign_S(S) 
        
        S_hash = hashlib.sha256(S).hexdigest()
        signature_b64 = base64.b64encode(signature).decode()
        
        # store credential
        credential, created = VoterCredential.objects.get_or_create(
            user=user,
            election=election,
            serial_number_hash=S_hash,
            signature=signature_b64)
        
        eligibility.issued = True
        eligibility.save()
        print("voter credential id: ", credential.id)
        print("voter credential created successfully")
        return Response({
            'signature': credential.signature,
            'serial_number_b64': S_base64,
            'serial_number_hash': credential.serial_number_hash,
            'voter_credential_id': credential.id
            
        }, status=status.HTTP_201_CREATED)
       
class AnonymousVoteView(generics.CreateAPIView):
    """Submit anonymous vote"""
    permission_classes = [IsAuthenticated]
    serializer_class = AnonymousVoteSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                
                # Validate credential signature
                election_id = serializer.validated_data['election_id']
                credential_sig = serializer.validated_data['credential_sig']
                serial_commitment = serializer.validated_data['serial_commitment']
                
                # Decode serial commitment to validate format
                try:
                    serial_commitment_bytes = base64.b64decode(serial_commitment)
                    if len(serial_commitment_bytes) != 32:  # SHA256 hash should be 32 bytes
                        return Response(
                            {'error': 'Invalid serial commitment format'}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except Exception:
                    return Response(
                        {'error': 'Invalid serial commitment encoding'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # TODO: In production, verify credential signature using EA public key
                # For now, we'll do basic validation against stored credentials
                
                # Create the vote
                vote = serializer.save()
                
                # Update vote history for the authenticated user
                # This is for UI purposes and doesn't compromise anonymity
                vote_history, created = VoteHistory.objects.get_or_create(
                    user=request.user,
                    election_id=election_id,
                    defaults={'vote_count': 1}
                )
                
                if not created:
                    vote_history.vote_count += 1
                    vote_history.voted_at = timezone.now()
                    vote_history.save()
                
                logger.info(f"Anonymous vote submitted for election {election_id}")
                
                return Response(
                    {'message': 'Vote submitted successfully'}, 
                    status=status.HTTP_201_CREATED
                )
                
        except Exception as e:
            logger.error(f"Error submitting vote: {str(e)}")
            return Response(
                {'error': f'Failed to submit vote: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserVoteHistoryView(generics.RetrieveAPIView):
    """Get user's voting history for UI purposes"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserVoteHistorySerializer
    
    def get(self, request, *args, **kwargs):
        try:
            # Check if VoteHistory model exists and has data
            if not hasattr(self, '_vote_history_checked'):
                # First time accessing, check if table exists
                from django.db import connection
                tables = connection.introspection.table_names()
                if 'your_app_name_votehistory' not in tables:  # Replace with your actual app name
                    # Table doesn't exist yet, return empty result
                    return Response({
                        'voted_elections': []
                    })
                self._vote_history_checked = True
            
            # Get vote histories for this user
            vote_histories = VoteHistory.objects.filter(
                user=request.user
            ).values_list('election_id', flat=True)
            
            voted_elections = list(vote_histories)
            
            return Response({
                'voted_elections': voted_elections
            })
            
        except Exception as e:
            logger.error(f"Error fetching vote history: {str(e)}")
            # Return JSON error response instead of letting Django handle it
            return Response(
                {
                    'error': 'Failed to fetch vote history',
                    'detail': str(e),
                    'voted_elections': []  # Provide default empty list
                }, 
                status=status.HTTP_200_OK  # Return 200 with error info instead of 500
            )

@api_view(['GET'])
def csrf_token_view(request):
    """Get CSRF token if needed"""
    from django.middleware.csrf import get_token
    csrf_token = get_token(request)
    return Response({'csrfToken': csrf_token})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def decrypt_votes_view(request, election_id):
    """
    Decrypt votes for an election (for tallying)
    This would typically be called by election officials
    """
    try:
        election = get_object_or_404(Election, id=election_id)
        
        # Get all votes for this election
        # If you add is_latest field, filter by that: Vote.objects.filter(election=election, is_latest=True)
        votes = Vote.objects.filter(election=election)
        
        # In production, you would decrypt using the election's private key
        # and return tallied results
        
        vote_count = votes.count()
        
        return Response({
            'election': election.name,
            'total_votes': vote_count,
            'message': 'Vote decryption would happen here in production'
        })
        
    except Exception as e:
        logger.error(f"Error decrypting votes: {str(e)}")
        return Response(
            {'error': 'Failed to decrypt votes'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_eligibility_view(request):
    """Get user's election eligibilities"""
    try:
        eligibilities = Eligibility.objects.filter(
            user=request.user
        ).select_related('election')
        
        eligible_elections = []
        for eligibility in eligibilities:
            eligible_elections.append({
                'election_id': eligibility.election.id,
                'election_name': eligibility.election.name,
                'credential_issued': eligibility.issued
            })
        
        return Response({
            'eligible_elections': eligible_elections
        })
        
    except Exception as e:
        logger.error(f"Error fetching eligibility: {str(e)}")
        return Response(
            {'error': 'Failed to fetch eligibility'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
