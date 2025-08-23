import secrets
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
        

@receiver(post_save, sender=Election)
def populate_eligibility(sender, instance, created, **kwargs):
    if created:
        # Loop through users who should be eligible
        print(instance)
        users = User.objects.filter(college = instance.name)
        for user in users:
            Eligibility.objects.get_or_create(election = instance, user = user, issued = True)

@receiver(post_save, sender=User)
def populate_eligibility_for_elections(sender, instance, created, **kwargs):
    if created:
        for election in Election.objects.all():
            Eligibility.objects.get_or_create(election=election, user=instance, issued=True)