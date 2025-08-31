from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import render
from django.core.cache import cache
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from .serializers import *
from .models import *
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserTokenSerializer
import logging
import datetime
import json

from utils.block_logic import calculate_merkle_root, mine_block
from utils.verification import verify_credential_signature_sigma, verify_vote_signature
from utils.decrypt import decrypt_aes_key, decrypt_vote_data

logger = logging.getLogger(__name__)

def get_csrf_token(request):
    return JsonResponse({"csrfToken": get_token(request)})


# Create your views here.
class UserRegisterView(APIView):
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            return Response({
                "message": "Registration successful",
                "user_id": user.id,
                "private_key": serializer.extra_data['private_key'],
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CandidateRegisterView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    def post(self, request):
        serializer = CandidateRegisterSerializer(data = request.data)
        
        if serializer.is_valid():
            candidate = serializer.save()
            
            return Response({"message": "Registration success"}, status=status.HTTP_200_OK)
        else:
            print(serializer.errors)
            return Response({"error": "Registration failed."}, status=status.HTTP_400_BAD_REQUEST)
        
class CandidateDetailsView(APIView):
    
    def get(self, request):
        candidate = Candidate.objects.all()
        serializer = CandidateSerializer(candidate, many=True  )
        
        return Response({"candidate_detail": serializer.data})
        
class UserLoginView(APIView):
    serializer_class = UserTokenSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context = {'request': request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    

class VerifyOTPView(APIView):
    
    def post(self, request, *args, **kwargs):
        entered_otp = request.data.get("enteredOTP")
        voter_id = request.data.get("voter_id")
        actual_otp = cache.get("otp")
        
        if actual_otp is None:
            return Response({"error": "OTP expired"}, status=400)

        if entered_otp == actual_otp:
            try:
                # Make sure voter_id actually maps to a user
                user = User.objects.get(voter_id=voter_id)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            tokens = get_tokens_for_user(user)
            user_details = {
                "id": user.id,
                "voter_id": user.voter_id,
            }
            return Response({
                "success": True,
                "access": str(tokens["access"]),
                "refresh": str(tokens["refresh"]),
                'user': user_details
            }, status=status.HTTP_200_OK)

        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)
    
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class VoterCredentialSendView(APIView):
    
    def get(self, request):
        if request.user.is_authenticated:
            
            credential = VoterCredential.objects.get(user = request.user.id)
            credential_data = VoterCredendentialSerializer(credential).data
            if credential_data:
                print("credential exist")
                return Response({
                    "voter_credential": credential_data
                    })
            else:
                return Response({
                    "error": "credential doesnot exist"
                })
                
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
        
        S_base64 = request.data.get('serial_number')
        S = base64.b64decode(S_base64)
        
        S_numbers = list(S)
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
                
                return Response({
                    'message': 'Credential already issued',
                    'serial_number_b64': S_base64,
                    'signature': existing_credential.signature,
                    'serial_number_hash': existing_credential.serial_number_b64,
                    'voter_credential_id': voter_credential_id
                }, status=status.HTTP_200_OK)
                
        signature = election.sign_S(S) 
        
        S_hash = hashlib.sha256(S).hexdigest()
        signature_b64 = base64.b64encode(signature).decode()
        
        # store credential
        credential, created = VoterCredential.objects.get_or_create(
            user=user,
            election=election,
            serial_number_b64=S_base64,
            serial_number_hash=S_hash,
            signature=signature_b64)
        
        eligibility.issued = True
        eligibility.save()
        
        return Response({
            'signature': credential.signature,
            'serial_number_b64': S_base64,
            'serial_number_hash': credential.serial_number_b64,
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
                voter_credential_id = serializer.validated_data['voter_credential_id']
                aes_key_wrapped_b64 = serializer.validated_data['aes_key_wrapped']
                candidate_ciphertext_b64 = serializer.validated_data['candidate_ciphertext']
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
                
                election = Election.objects.get(id = election_id);
                voter_credential = VoterCredential.objects.get(id = voter_credential_id)
                
                if not verify_credential_signature_sigma(election, voter_credential, credential_sig):
                    return Response({'error': 'Invalid credential signature'}, status=400)
                
                vote_payload = serializer.validated_data.copy()
                
                vote_payload_copy = vote_payload.copy()
                
                if isinstance(vote_payload_copy.get("timestamp"), datetime.datetime):
                    # Convert to ISO format but truncate to milliseconds like frontend
                    iso_string = vote_payload_copy["timestamp"].isoformat()
                    # Truncate microseconds to milliseconds (6 digits -> 3 digits)
                    if '.' in iso_string:
                        iso_parts = iso_string.split('.')
                        iso_string = iso_parts[0] + '.' + iso_parts[1][:3]
                    vote_payload_copy["timestamp"] = iso_string + 'Z'
                
                
                signature_b64 = vote_payload['signature']  # signature sent by voter
                
                
                user_credential_id = voter_credential.user_id
                user = User.objects.get(id = user_credential_id)
                
                
                if not verify_vote_signature(vote_payload_copy, signature_b64, user.public_key):
                    return Response({"error": "invalid user signature"}, status=400)
                
 
                
                # decrypt aes key using election's private key
                
                aes_key = decrypt_aes_key(election, aes_key_wrapped_b64)
                
                # decrypt vote using above aes key
                decrypted_vote_data = decrypt_vote_data(candidate_ciphertext_b64, aes_key)
                
                #validate the vote data
                for cid in decrypted_vote_data.get("candidate_ids", []):
                    try:
                        candidate = Candidate.objects.get(id = cid,
                                                        election=decrypted_vote_data['election_id'])
                    except Candidate.DoesNotExist:
                        return Response({"error": "Not valid candidate or election"}, status=400)
                    
                previous_votes = Vote.objects.filter(
                                election=election,
                                serial_commitment=serial_commitment,
                                is_latest=True  # add this field to mark the latest vote
                            )
            
                if previous_votes.exists():
                    for prev_vote in previous_votes:
                        try:
                            prev_vote_data = decrypt_vote_data(
                                base64.b64encode(prev_vote.candidate_ciphertext).decode('utf-8'),
                                decrypt_aes_key(election, base64.b64encode(prev_vote.aes_key_wrapped).decode('utf-8'))
                            )
                            
                            for prev_cid in prev_vote_data.get("candidate_ids", []):
                                try:
                                    prev_tally = Tally.objects.get(election=election, candidate_id=prev_cid)
                                    if prev_tally.vote_count > 0:
                                        prev_tally.vote_count -= 1
                                        prev_tally.save()
                                        
                                    else:
                                        print(f"Warning: Tally for candidate {prev_cid} already at 0, cannot subtract")
                                except Tally.DoesNotExist:
                                    print(f"Warning: No tally found for candidate {prev_cid} in election {election.id}")
                                except Exception as tally_error:
                                    logger.error(f"Error adjusting tally for candidate {prev_cid}: {str(tally_error)}")
                        except Exception as e:
                            logger.warning(f"Failed to adjust tally for previous vote: {str(e)}")
                 # Mark them as no longer latest
                previous_votes.update(is_latest=False)
                
                tx_hash = hashlib.sha256(
                    json.dumps(decrypted_vote_data, sort_keys=True).encode("utf-8")).hexdigest()
                
                vote = Vote.objects.create(
                    election=election,
                    candidate_ciphertext=base64.b64decode(candidate_ciphertext_b64),
                    aes_key_wrapped=base64.b64decode(aes_key_wrapped_b64),
                    credential_sig=base64.b64decode(credential_sig),
                    serial_commitment=serial_commitment,
                    tx_hash=tx_hash,
                    is_latest=True
                )
                print("vote creation success!!")
                
                 # Update tally
                for cid in decrypted_vote_data.get("candidate_ids", []):
                    tally, created = Tally.objects.get_or_create(
                        election=election,
                        candidate_id=cid,
                        defaults={"vote_count": 0}
                    )
                    tally.vote_count += 1
                    tally.save()

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
                
                open_block, created = Block.objects.get_or_create(
                    finalized=False,
                    defaults={
                        'index': (Block.objects.aggregate(max_index=models.Max('index'))['max_index'] or 0) + 1,
                        'previous_hash': Block.objects.filter(finalized=True).order_by('-index').first().current_hash
                                 if Block.objects.filter(finalized=True).exists() else None,
                        'timestamp': datetime.datetime.now()
                    }
                )
                
                BlockTransaction.objects.create(
                    block = open_block,
                    vote = vote,
                    tx_hash = tx_hash
                )
                
                # Check if block should be mined (e.g., 5 votes per block)
                block_transactions = BlockTransaction.objects.filter(block=open_block)
                if block_transactions.count() >= 5:
                    # compute merkle root
                    tx_hashes = list(block_transactions.values_list('tx_hash', flat=True))
                    open_block.merkle_root = calculate_merkle_root(tx_hashes)
                    open_block.difficulty = 4
                    open_block.nonce = 0
                    open_block.save()
                
                    mined_block = mine_block(open_block, difficulty=open_block.difficulty)
                    print(f"Block {mined_block.index} mined with hash: {mined_block.current_hash}")
                    
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

class UserUploadImg(APIView):
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        user_id = request.data.get("user_id")
        profile_img = request.FILES.get("profile_image")
        
        user = User.objects.get(id=user_id)
        user.image = profile_img
        user.save()
        
        return Response({
            "message": "received image",
            "User_Img":user.image.url
            })

class ElectionResultView(APIView):
    def get(self, request):
        election = Election.objects.all()
        serializer = ElectionResultSerializer(instance=election, many=True)
        
        return Response(serializer.data)

class UserDetailsView(APIView):
    
    def get(self, request):
        user = request.user.username
        user = User.objects.get(username = user)
        serializer = UserDetailSerializer(user)
        
        return Response({"user": serializer.data})

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
