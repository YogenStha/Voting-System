from django.contrib import admin
from .models import *
from django.contrib.admin import register
from django.utils.html import format_html
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
    
    

@register(Candidate)
class CandidateAdmin(ModelAdmin):
    list_display = ('name', 'party', 'position', 'manifesto', 'is_verified')
    search_fields = ('user__username', 'party__name', 'position__name')
    
    # list_filter = ('is_active')
    
    fieldsets = (
        (None, {
            "fields": (
                'name', 'party', 'position', 'image', 'manifesto', 'candidate_id', 'is_verified'
            ),
        }),
    )
    
    # def image_preview(self, obj):
    #     if obj.image and hasattr(obj.image, 'url'):
    #         return format_html(f'<img src="{obj.image.url}" width="150" height="150" style="object-fit:contain;" />' )
    #     return "No Image"

    # image_preview.short_description = "Image Preview"
    
@register(Party)
class PartyAdmin(ModelAdmin):
    list_display = ('party_name', 'party_symbol')
    search_fields = ('party_name',)
    
    fieldsets = (
        (None, {
            "fields": (
                'party_name', 'party_symbol'
            ),
        }),
    )

@register(Position)
class PositionAdmin(ModelAdmin):
    list_display = ('position_name',)
    search_fields = ('position_name',)
    
    fieldsets = (
        (None, {
            "fields": (
                'position_name',
            ),
        }),
    )
    
@register(Election)
class ElectionAdmin(ModelAdmin):
    list_display = ('name', 'start_date', 'end_date', 'is_active')
    search_fields = ('name',)
    
    fieldsets = (
        (None, {
            "fields": (
                'name', 'start_date', 'end_date', 'is_active'
            ),
        }),
    )
    
@register(ElectionResult)
class ElectionResultAdmin(ModelAdmin):
    list_display = ('election', 'candidate', 'votes')
    search_fields = ('election__name', 'candidate__name')
    
    fieldsets = (
        (None, {
            "fields": (
                'election', 'candidate', 'votes'
            ),
        }),
    )
    
# admin.site.register(User) 
# admin.site.register(Candidate)
# admin.site.register(Party)
# admin.site.register(Position)