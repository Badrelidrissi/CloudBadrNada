import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

function Connexion() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 

  const validateInputs = () => {
    if (!email || !motDePasse) {
      setErreur('Veuillez remplir tous les champs.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErreur('Veuillez entrer une adresse email valide.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErreur('');

    if (!validateInputs()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/connexion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          mot_de_passe: motDePasse,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la connexion');
      }

      const result = await response.json();
      console.log('Connexion réussie !', result);

      localStorage.setItem('token', result.token);

      navigate('/DeviceManagement'); 
    } catch (error) {
      setErreur(error.message || 'Une erreur s\'est produite. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Connexion</h2>
      {erreur && <p style={{ color: 'red' }}>{erreur}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email :</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="motDePasse">Mot de passe :</label>
          <input
            type="password"
            id="motDePasse"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

export default Connexion;