# serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.core.files.base import ContentFile
import uuid

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'profile', 'created_at']  # Include role field

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)


class ProfileSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(required=False)  # Profile image is optional for both creation and update

    class Meta:
        model = User
        fields = ['username', 'email', 'role', 'profile', 'profile_image', 'shop_name', 'shop_description', 'shop_address']

    def update(self, instance, validated_data):
        if 'profile_image' in validated_data:
            profile_image = validated_data['profile_image']
            instance.profile_image = profile_image
        return super().update(instance, validated_data)

    def create(self, validated_data):
        if 'profile_image' in validated_data:
            profile_image = validated_data['profile_image']
            validated_data['profile_image'] = profile_image
        return super().create(validated_data)
