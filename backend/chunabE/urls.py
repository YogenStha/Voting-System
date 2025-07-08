from django.urls import path
from django.views.generic import TemplateView
from .views import RegisterView, UserLoginJWTView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html')),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', UserLoginJWTView.as_view(), name='user_login'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('<path:path>', TemplateView.as_view(template_name='index.html')),
    
]