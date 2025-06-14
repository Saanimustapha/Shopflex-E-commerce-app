import pika
import json
from django.conf import settings


class RabbitMQ:
    def __init__(self):
        # Set up RabbitMQ connection using settings for username, password, host, and port
        credentials = pika.PlainCredentials(settings.RABBITMQ_USERNAME, settings.RABBITMQ_PASSWORD)
        connection_params = pika.ConnectionParameters(
            host=settings.RABBITMQ_HOST,
            port=settings.RABBITMQ_PORT,
            credentials=credentials
        )
        self.connection = pika.BlockingConnection(connection_params)
        self.channel = self.connection.channel()

    def declare_queue(self, queue_name):
        # Declare a queue
        self.channel.queue_declare(queue=queue_name, durable=True)

    def send_message(self, queue_name, message):
        # Publish a message to a queue
        self.channel.basic_publish(
            exchange='',
            routing_key=queue_name,
            body=json.dumps(message),
            properties=pika.BasicProperties(delivery_mode=2)  # Make the message persistent
        )

    def consume(self, queue_name, callback):
        # Consume messages from a queue
        self.channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=False)
