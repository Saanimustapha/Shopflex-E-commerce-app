from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from .utils.rabbitmq import RabbitMQ

class User(AbstractUser):
    USER = 'USER'
    SHOP_OWNER = 'SHOP_OWNER'

    ROLE_CHOICES = [
        (USER, 'User'),
        (SHOP_OWNER, 'Shop Owner'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=USER)
    profile_image = models.ImageField(upload_to='profile_pics/', null=True, blank=True)  # Add profile image field
    profile = models.JSONField(default=dict)
    shop_name = models.CharField(max_length=255, blank=True, null=True)  # Shop name for Shop Owners
    shop_description = models.TextField(blank=True, null=True)  # Shop description for Shop Owners
    shop_address = models.TextField(blank=True, null=True)  # Shop address for Shop Owners
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username


@receiver(post_save, sender=User)
def notify_user_change(sender, instance, **kwargs):
    rabbitmq = RabbitMQ()
    user_data = {
        "id": instance.id,
        "username": instance.username,
        "email": instance.email,
        "role": instance.role,
    }
    rabbitmq.send_message("user_data_sync", user_data)
