import secrets
from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Election

@receiver(pre_save, sender=Election)
def set_election_salt(sender, instance, **kwargs):
    if not instance.salt:
        # Generate a random salt for the election
        instance.salt = secrets.token_hex(32)