FROM python:3.9
WORKDIR /app  # Assure-toi que l'environnement de travail est bien défini
CMD ["python", "microservices/back-end/serveur.py"]
