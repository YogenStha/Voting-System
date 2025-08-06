from django.contrib import admin
from .models import *
from django.contrib.admin import register
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin

from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm
from unfold.admin import ModelAdmin

# Register your models here.

@register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    # Forms loaded from `unfold.forms`
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm
    
    list_display = ('username', 'email', 'contact_number', 'address', 'student_id', 'faculty', 'year', 'voter_id', 'public_key', 'fingerprint')
    search_fields = ('username', 'email', 'contact_number')
    list_filter = ('is_superuser', 'is_active')
    readonly_fields = ('voter_id', 'public_key', 'fingerprint')
    
    fieldsets = (
        ('Account Info', {
            'fields': ('username', 'email', 'contact_number', 'address', 'student_id', 'faculty', 'year'),
            'classes': ('tab-account',)
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('tab-permissions',)
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('tab-dates',)
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'contact_number', 'address', 'student_id', 'faculty', 'year', 'password1', 'password2'),
        }),
    )

    tabs = [
        ("Account", "tab-account"),
        ("Permissions", "tab-permissions"),
        ("Dates", "tab-dates"),
    ]
# admin.site.register(User) 
admin.site.register(Candidate)
admin.site.register(Party)
admin.site.register(Position)