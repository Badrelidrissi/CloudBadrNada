import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Connexion from './Connexion';
import Inscription from './inscription';
import DeviceManagement from './DeviceManagement';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/DeviceManagement" element={<DeviceManagement />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
