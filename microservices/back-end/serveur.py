from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import bcrypt
import os
import jwt
import datetime
import json
import pika  # Assurez-vous d'avoir installé pika pour RabbitMQ

app = Flask(__name__)

# Configuration de la base de données PostgreSQL
db_user = os.getenv('DB_USER', 'postgres')
db_password = os.getenv('DB_PASSWORD', 'badr')  
db_host = os.getenv('DB_HOST', 'localhost')
db_port = os.getenv('DB_PORT', '5432')
db_name = os.getenv('DB_NAME', 'users')

app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'supersecretkey'
db = SQLAlchemy(app)
CORS(app)

# Configuration de RabbitMQ
RABBITMQ_CONFIG = {
    'host': 'localhost',
    'port': 5672,
    'username': 'guest',
    'password': 'guest'
}

# Modèle Utilisateur
class Utilisateur(db.Model):
    __tablename__ = 'utilisateurs'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    mot_de_passe = db.Column(db.String(255), nullable=False)

# Modèle Device
class Device(db.Model):
    __tablename__ = 'devices'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.TIMESTAMP, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# Créer les tables dans la base de données
with app.app_context():
    db.create_all()

# Fonction pour publier des événements vers RabbitMQ
def publish_device_event(device_id, event_type):
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_CONFIG['host']))
        channel = connection.channel()
        channel.queue_declare(queue='device_events')
        message = json.dumps({'device_id': device_id, 'event_type': event_type})
        channel.basic_publish(exchange='', routing_key='device_events', body=message)
        connection.close()
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi du message à RabbitMQ : {e}")

# 🔹 ROUTE D'INSCRIPTION
@app.route("/api/inscription", methods=["POST"])
def inscription():
    try:
        data = request.json

        if not data:
            return jsonify({"message": "Requête invalide, JSON attendu"}), 400

        email = data.get("email")
        mot_de_passe = data.get("mot_de_passe")

        if not email or not mot_de_passe:
            return jsonify({"message": "Tous les champs sont requis"}), 400

        if Utilisateur.query.filter_by(email=email).first():
            return jsonify({"message": "Cet email est déjà utilisé"}), 400

        # Hachage du mot de passe
        hashed_password = bcrypt.hashpw(mot_de_passe.encode('utf-8'), bcrypt.gensalt())

        # Création de l'utilisateur
        new_user = Utilisateur(email=email, mot_de_passe=hashed_password.decode('utf-8'))
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "Inscription réussie"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔹 ROUTE DE CONNEXION
@app.route("/api/connexion", methods=["POST"])
def connexion():
    try:
        data = request.json
        email = data.get("email")
        mot_de_passe = data.get("mot_de_passe")

        if not email or not mot_de_passe:
            return jsonify({"message": "Tous les champs sont requis"}), 400

        utilisateur = Utilisateur.query.filter_by(email=email).first()

        if not utilisateur or not bcrypt.checkpw(mot_de_passe.encode('utf-8'), utilisateur.mot_de_passe.encode('utf-8')):
            return jsonify({"message": "Email ou mot de passe incorrect"}), 401

        # Génération du token JWT
        token = jwt.encode(
            {"email": utilisateur.email, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)},
            app.config['SECRET_KEY'], algorithm="HS256"
        )

        return jsonify({"message": "Connexion réussie", "token": token}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔹 ROUTE POUR AJOUTER UN DISPOSITIF
@app.route("/api/devices", methods=["POST"])
def add_device():
    try:
        data = request.json
        name = data.get("name")
        type = data.get("type")
        status = data.get("status")

        if not name or not type or not status:
            return jsonify({"message": "Tous les champs sont requis"}), 400

        # Création du dispositif
        new_device = Device(name=name, type=type, status=status)
        db.session.add(new_device)
        db.session.commit()

        # Publier un événement de création de dispositif
        publish_device_event(new_device.id, 'device_created')

        return jsonify({"message": "Dispositif ajouté avec succès", "device_id": new_device.id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔹 ROUTE POUR RÉCUPÉRER TOUS LES DISPOSITIFS
@app.route("/api/devices", methods=["GET"])
def get_devices():
    try:
        devices = Device.query.all()
        devices_list = [{
            "id": d.id,
            "name": d.name,
            "type": d.type,
            "status": d.status,
            "created_at": d.created_at,
            "updated_at": d.updated_at
        } for d in devices]

        return jsonify(devices_list), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔹 ROUTE POUR RÉCUPÉRER LES DÉTAILS D'UN DISPOSITIF
@app.route("/api/devices/<int:device_id>", methods=["GET"])
def get_device(device_id):
    try:
        device = Device.query.get(device_id)

        if not device:
            return jsonify({"message": "Dispositif non trouvé"}), 404

        return jsonify({
            "id": device.id,
            "name": device.name,
            "type": device.type,
            "status": device.status,
            "created_at": device.created_at,
            "updated_at": device.updated_at
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔹 ROUTE POUR SUPPRIMER UN DISPOSITIF
@app.route("/api/devices/<int:device_id>", methods=["DELETE"])
def delete_device(device_id):
    try:
        device = Device.query.get(device_id)

        if not device:
            return jsonify({"message": "Dispositif non trouvé"}), 404

        # Supprimer le dispositif
        db.session.delete(device)
        db.session.commit()

        # Publier un événement de suppression de dispositif
        publish_device_event(device_id, 'device_deleted')

        return jsonify({"message": "Dispositif supprimé avec succès"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)