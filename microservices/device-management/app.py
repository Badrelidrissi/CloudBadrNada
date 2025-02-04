from flask import Flask, request, jsonify
import pika

app = Flask(__name__)

@app.route('/register-device', methods=['POST'])
def register_device():
    data = request.json
    device_id = data.get("device_id")
    
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.queue_declare(queue='device_queue')
    
    channel.basic_publish(exchange='', routing_key='device_queue', body=device_id)
    connection.close()
    
    return jsonify(message="Device registered successfully"), 201

if __name__ == '__main__':
    app.run(debug=True, port=5001)
