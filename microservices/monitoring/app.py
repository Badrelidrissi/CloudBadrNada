from flask import Flask, jsonify
import pika
import json
from pymongo import MongoClient
from datetime import datetime
from threading import Thread

MONGO_URI = "mongodb://localhost:27017"
MONGO_DB = "iot_monitoring"
MONGO_COLLECTION = "weather_data"

RABBITMQ_HOST = "localhost"
RABBITMQ_QUEUE = "weather_data"

client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db[MONGO_COLLECTION]

def connect_rabbitmq():
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
        channel = connection.channel()
        channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
        return connection, channel
    except Exception as e:
        print(f"Erreur de connexion à RabbitMQ: {e}")
        return None, None

def callback(ch, method, properties, body):
    """Traite les messages reçus de RabbitMQ et les enregistre dans MongoDB."""
    try:
        data = json.loads(body)
        data['received_at'] = datetime.now().isoformat()  
        collection.insert_one(data) 
        print(f"Données insérées: {data}")
        ch.basic_ack(delivery_tag=method.delivery_tag)  
    except Exception as e:
        print(f"⚠ Erreur lors du traitement du message: {e}")

app = Flask(__name__)

@app.route('/status', methods=['GET'])
def status():
    return jsonify({"status": "running"}), 200

def start_listener():
    rabbit_connection, rabbit_channel = connect_rabbitmq()
    if rabbit_channel:
        rabbit_channel.basic_consume(queue=RABBITMQ_QUEUE, on_message_callback=callback)
        print(f"En attente de messages RabbitMQ...")
        rabbit_channel.start_consuming()


def run_rabbitmq():
    thread = Thread(target=start_listener)
    thread.start()

if __name__ == "__main__":
    run_rabbitmq()
    app.run(debug=True, use_reloader=False, host='0.0.0.0', port=5000)
