from django.urls import path
from django.views.generic import TemplateView
from .views import login


urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html')),
    path('<path:path>', TemplateView.as_view(template_name='index.html')),
]