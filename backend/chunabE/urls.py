from django.urls import path
from django.views.generic import TemplateView
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html')),
    path('api/candidate-details/', CandidateDetailsView.as_view(), name='candidate-details'),
    path('api/register/', UserRegisterView.as_view(), name='register'),
    path('api/candidate-register/', CandidateRegisterView.as_view(), name='candidate_register'),
    path('api/login/', UserLoginJWTView.as_view(), name='user_login'),
    path('api/voter/credential/', VoterCredentialSendView.as_view(), name='voter_credential'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/elections/', ElectionView.as_view(), name='election_list'),
     path('api/elections/<int:election_id>/credential/', CredentialIssueView.as_view(), 
         name='issue-credential'),
    
    path('csrf/', csrf_token_view),
    path('api/user/vote-history/', UserVoteHistoryView.as_view(), name='vote-history'),
    path('api/vote/', AnonymousVoteView.as_view(), name='submit_vote'),
    path('api/user/eligibility/', user_eligibility_view, name='user-eligibility'),
    path('api/elections/<int:election_id>/decrypt/', decrypt_votes_view, name='decrypt-votes'),
    path('<path:path>', TemplateView.as_view(template_name='index.html')),
    
]

