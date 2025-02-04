from flask import Flask, request, jsonify
from flask_jwt_extended import create_access_token, JWTManager
import redis

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'super-secret'  # Changez cette clé en production
jwt = JWTManager(app)

redis_client = redis.Redis(host='localhost', port=6379, db=0)

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validation de la présence des champs nécessaires
    if not data or "username" not in data or "password" not in data:
        return jsonify(error="Données invalides"), 400
    
    username = data["username"]
    password = data["password"]

    # Vérification basique des identifiants (à remplacer par une vérification en base de données)
    if username == "admin" and password == "pass":
        try:
            token = create_access_token(identity=username)
            
            # Optionnel : stocker le token dans Redis avec expiration (ex: 1 heure)
            redis_client.set(token, username, ex=3600)
            
            return jsonify(access_token=token)
        except Exception as e:
            return jsonify(error="Erreur lors de la création du token"), 500

    return jsonify(error="Invalid credentials"), 401

if __name__ == '__main__':
    app.run(debug=True, port=5000)
