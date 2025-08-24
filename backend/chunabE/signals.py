import secrets
from django.conf import settings
from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Election, User, Eligibility
from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(pre_save, sender=Election)
def set_election_salt(sender, instance, **kwargs):
    if not instance.salt:
        # Generate a random salt for the election
        instance.salt = secrets.token_hex(32)
        
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def assign_election_based_on_college(sender, instance, created, **kwargs):
    if created:
        print("Signal fired for user:", instance.username)
        try:
            print("Looking for election with name:", instance.college)
            election = Election.objects.get(name=instance.college)
        except Election.DoesNotExist:
            print("No matching election for college:", instance.college)
            return   # no matching election for this college

        # check if user is already registered in another election
        if Eligibility.objects.filter(user=instance).exists():
            print("User already assigned to an election")
            return  # already assigned, skip

        # create eligibility
        Eligibility.objects.get_or_create(user=instance, election=election)
        print("Eligibility created for user:", instance.username)