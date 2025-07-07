from django.urls import path
from django.views.generic import TemplateView
from .views import RegisterView, LoginView

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html')),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('<path:path>', TemplateView.as_view(template_name='index.html')),
    
]