import React, { useState } from 'react';
import './inscription.css';

function Inscription() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Veuillez entrer une adresse email valide.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
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
        body: JSON.stringify({ email, password }), 
      });

      let result;
      try {
        result = await response.json();
      } catch (err) {
        throw new Error('Réponse invalide du serveur.');
      }

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de l\'inscription');
      }

      setSuccessMessage('Inscription réussie ! Redirection en cours...');
      console.log('Inscription réussie !', result);

      setTimeout(() => {
        window.location.href = '/connexion';
      }, 2000);
    } catch (error) {
      setError(error.message || 'Une erreur s\'est produite. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inscription-container">
      <h2>Inscription</h2>
      {error && <p className="error-message">{error}</p>}
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
          <label htmlFor="password">Mot de passe :</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmer le mot de passe :</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" role="status" aria-hidden="true"></span>
              Inscription en cours...
            </>
          ) : (
            "S'inscrire"
          )}
        </button>
      </form>
    </div>
  );
}

export default Inscription;
