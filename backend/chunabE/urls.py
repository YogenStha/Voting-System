from django.urls import path
from django.views.generic import TemplateView
from .views import login
from .views import RegisterView

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html')),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('<path:path>', TemplateView.as_view(template_name='index.html')),
    
]