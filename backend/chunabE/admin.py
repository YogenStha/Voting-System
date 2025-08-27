from django.contrib import admin
from .models import *
from django.contrib.admin import register
from django.utils.html import format_html
from django.utils.safestring import mark_safe
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
    
    list_display = ('username', 'email', 'contact_number', 'address', 'student_id', 'faculty', 'year', 'voter_id', 'public_key', 'fingerprint', 'college')
    search_fields = ('username', 'email', 'contact_number')
    list_filter = ('is_superuser', 'is_active')
    readonly_fields = ('voter_id', 'public_key', 'fingerprint')
    
    fieldsets = (
        ('Account Info', {
            'fields': ('username', 'email', 'contact_number', 'address', 'student_id', 'faculty', 'year', 'college'),
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
   
    list_display = (
        'name', 
        'party', 
        'position', 
        'display_image',  # Custom method to show image thumbnail
        'is_verified', 
        'election'
    )
    
    list_filter = (
        'is_verified', 
        'party', 
        'position', 
        'election'
    )
    
    search_fields = (
        'name',
        'candidate_id',
        'party__name', 
        'position__name'
    )
    
    readonly_fields = ('display_image_preview',)  # This makes the method available in forms
    
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'name', 
                'candidate_id',
                'is_verified'
            ),
        }),
        ('Election Details', {
            'fields': (
                'election',
                'party', 
                'position'
            ),
        }),
        ('Profile', {
            'fields': (
                'image',
                'display_image_preview',  # Show current image
                'manifesto'
            ),
        }),
    )
    
    def display_image(self, obj):
        """Display small thumbnail in list view"""
        if obj.image:
            try:
                return format_html(
                    '<img src="{}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;" onerror="this.src=\'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0yNSAyNWMzLjMgMCA2LTIuNyA2LTZzLTIuNy02LTYtNi02IDIuNy02IDZTMjEuNyAyNSAyNSAyNXptMCA0Yy00IDAtMTIgMi0xMiA2djJoMjR2LTJDMzcgMzEgMjkgMjkgMjUgMjl6IiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo=\'; this.title=\'Image not found\';" />',
                    obj.image.url
                )
            except:
                return "Image Error"
        return "No Image"
    display_image.short_description = "Photo"
    
    def display_image_preview(self, obj):
        """Display larger image in detail view"""
        if obj.image:
            try:
                return format_html(
                    '<div><img src="{}" style="max-width: 300px; max-height: 300px; border-radius: 10px;" onerror="this.style.display=\'none\'; this.nextSibling.style.display=\'block\';" /><div style="display:none; padding: 20px; border: 1px dashed #ccc; text-align: center;">Image not found: {}</div></div>',
                    obj.image.url,
                    obj.image.url
                )
            except Exception as e:
                return f"Image Error: {str(e)}"
        return "No image uploaded"
    display_image_preview.short_description = "Current Image"
    
    
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