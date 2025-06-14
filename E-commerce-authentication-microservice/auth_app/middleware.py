import jwt
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse

class JWTAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if not request.path.startswith('/auth/'):
            token = request.headers.get('Authorization', None)
            if token:
                try:
                    payload = jwt.decode(token.split(' ')[1], settings.JWT_SECRET, algorithms=['HS256'])
                    request.user = payload
                except jwt.ExpiredSignatureError:
                    return JsonResponse({'error': 'Token expired'}, status=401)
                except jwt.InvalidTokenError:
                    return JsonResponse({'error': 'Invalid token'}, status=401)
            else:
                return JsonResponse({'error': 'Authentication token required'}, status=401)
