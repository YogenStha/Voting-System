from django.urls import path
from django.views.generic import TemplateView
from .views import RegisterView, UserLoginJWTView, ElectionView, SubmitVoteView, get_csrf_token
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html')),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', UserLoginJWTView.as_view(), name='user_login'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/elections/', ElectionView.as_view(), name='election_list'),
    path('csrf/', get_csrf_token),
    path('api/vote/', SubmitVoteView.as_view(), name='submit_vote'),
    path('<path:path>', TemplateView.as_view(template_name='index.html')),
    
]