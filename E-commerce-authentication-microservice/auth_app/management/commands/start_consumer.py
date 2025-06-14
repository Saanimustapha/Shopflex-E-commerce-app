import json
from django.core.management.base import BaseCommand
from auth_app.models import User
from auth_app.utils.rabbitmq import RabbitMQ
from elasticsearch import Elasticsearch
from datetime import datetime
from datetime import timedelta

class Command(BaseCommand):
    help = "Starts RabbitMQ consumer for handling user detail requests and syncs data with Notifications Microservice"

    def handle(self, *args, **options):
        # Initialize RabbitMQ and Elasticsearch
        rabbitmq = RabbitMQ()
        rabbitmq.declare_queue("user_details_request")
        rabbitmq.declare_queue("user_details_response")
        rabbitmq.declare_queue("user_data_sync")
        es = Elasticsearch(hosts=["http://elastic:changethem@localhost:9200"])

        # Sync all user data initially with Notifications Microservice
        self.sync_all_users(rabbitmq)

        def callback(ch, method, properties, body):
            try:
                request = json.loads(body)
                user_id = request.get("userId")
                correlation_id = request.get("correlationId")

                if not user_id:
                    self.stderr.write("No `userId` provided in the request")
                    ch.basic_ack(delivery_tag=method.delivery_tag)
                    return

                user_details = self.get_user_from_cache(es, user_id)
                if not user_details:
                    user = User.objects.get(id=user_id)
                    user_details = {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                    }
                    self.cache_user_in_es(es, user_id, user_details)

                response_data = {
                    "correlationId": correlation_id,
                    "data": user_details,
                }
                rabbitmq.send_message("user_details_response", response_data)
                self.stdout.write(f"Sent response for user ID: {user_id}")

            except User.DoesNotExist:
                self.stderr.write(f"User with ID {user_id} does not exist")
            except json.JSONDecodeError as e:
                self.stderr.write(f"Invalid JSON in message: {str(e)}")
            except Exception as e:
                self.stderr.write(f"Unexpected error: {str(e)}")
            finally:
                ch.basic_ack(delivery_tag=method.delivery_tag)

        rabbitmq.channel.basic_qos(prefetch_count=1)
        rabbitmq.consume("user_details_request", callback)
        self.stdout.write("Listening for RabbitMQ requests...")
        rabbitmq.channel.start_consuming()

    def sync_all_users(self, rabbitmq):
        """Sync all user data to the Notifications Microservice."""
        users = User.objects.all().values("id", "username", "email")
        for user in users:
            rabbitmq.send_message("user_data_sync", user)
        self.stdout.write("Initial user data sync completed.")

    def get_user_from_cache(self, es, user_id):
        """Fetch user details from Elasticsearch cache."""
        try:
            doc = es.get(index="user_cache", id=user_id)
            user = doc["_source"]
            if datetime.strptime(user["cached_at"], "%Y-%m-%dT%H:%M:%S") + timedelta(hours=1) > datetime.utcnow():
                return user
            return None
        except Exception:
            return None

    def cache_user_in_es(self, es, user_id, user_details):
        """Store user details in Elasticsearch cache."""
        try:
            user_details["cached_at"] = datetime.utcnow().isoformat()
            es.index(index="user_cache", id=user_id, document=user_details)
        except Exception as e:
            self.stderr.write(f"Failed to cache user details in Elasticsearch: {e}")
