from django.contrib.auth.hashers import check_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializers import UserSerializer
from django.http import HttpResponse
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import ProfileSerializer
from rest_framework.permissions import IsAuthenticated


def favicon_view(request):
    return HttpResponse(status=204) 

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User registered successfully!'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        try:
            user = User.objects.get(username=username)
            if check_password(password, user.password):
                refresh = RefreshToken.for_user(user)
                
                # Add profile details to the token
                refresh['role'] = user.profile.get('role', None)
                refresh['profile_image'] = user.profile_image.url if user.profile_image else None

                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'id': user.id,
                    'role': user.profile.get('role', None),
                    'profile_image': user.profile_image.url if user.profile_image else None,
                }, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)




class CreateProfileView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure user is authenticated

    def post(self, request):
        # Create profile only if it doesn't already exist
        if hasattr(request.user, 'userprofile'):
            return Response({'detail': 'Profile already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Profile created successfully!'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EditProfileView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure user is authenticated

    def put(self, request):
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Profile updated successfully!'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

