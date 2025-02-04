import React, { useState } from 'react';
import './inscription.css';

function Inscription() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmMotDePasse, setConfirmMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!email || !motDePasse || !confirmMotDePasse) {
      setErreur('Veuillez remplir tous les champs.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErreur('Veuillez entrer une adresse email valide.');
      return false;
    }
    if (motDePasse !== confirmMotDePasse) {
      setErreur('Les mots de passe ne correspondent pas.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErreur('');
    setSuccessMessage('');

    if (!validateInputs()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/inscription", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          mot_de_passe: motDePasse  // Correction ici
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      setSuccessMessage('Inscription réussie ! Redirection en cours...');
      setTimeout(() => {
        window.location.href = '/connexion';
      }, 2000);
    } catch (error) {
      setErreur(error.message || 'Une erreur s\'est produite. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inscription-container">
      <h2>Inscription</h2>
      {erreur && <p className="error-message">{erreur}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email :</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="motDePasse">Mot de passe :</label>
          <input
            type="password"
            id="motDePasse"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmMotDePasse">Confirmer le mot de passe :</label>
          <input
            type="password"
            id="confirmMotDePasse"
            value={confirmMotDePasse}
            onChange={(e) => setConfirmMotDePasse(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Inscription en cours...' : 'S\'inscrire'}
        </button>
      </form>
    </div>
  );
}

export default Inscription;
