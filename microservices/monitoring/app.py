from flask import Flask, jsonify
import socketio

app = Flask(__name__)
sio = socketio.Server(cors_allowed_origins="*")
app.wsgi_app = socketio.WSGIApp(sio, app.wsgi_app)

@sio.event
def connect(sid, environ):
    print("Client connected:", sid)

@sio.event
def disconnect(sid):
    print("Client disconnected:", sid)

@app.route('/status', methods=['GET'])
def status():
    return jsonify(message="Monitoring Service Running"), 200

if __name__ == '__main__':
    app.run(debug=True, port=5002)
