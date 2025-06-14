from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView  
from .views import RegisterView, LoginView, favicon_view, CreateProfileView, EditProfileView

urlpatterns = [
    path('favicon.ico', favicon_view),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', CreateProfileView.as_view(), name='create_profile'),  # Create Profile
    path('profile/edit/', EditProfileView.as_view(), name='edit_profile'),  # Edit Profile
]

