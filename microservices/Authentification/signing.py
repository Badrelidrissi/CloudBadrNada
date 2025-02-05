from flask import Flask, request, jsonify
from flask_jwt_extended import create_access_token, JWTManager
import redis

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'super-secret'  
jwt = JWTManager(app)

redis_client = redis.Redis(host='localhost', port=6379, db=0)
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
        hashed_password = bcrypt.hashpw(mot_de_passe.encode('utf-8'), bcrypt.gensalt())
        new_user = Utilisateur(email=email, mot_de_passe=hashed_password.decode('utf-8'))
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "Inscription réussie"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


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

        token = jwt.encode(
            {"email": utilisateur.email, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)},
            app.config['SECRET_KEY'], algorithm="HS256"
        )

        return jsonify({"message": "Connexion réussie", "token": token}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
