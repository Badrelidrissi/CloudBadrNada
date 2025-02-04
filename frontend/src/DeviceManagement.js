import React, { useState, useEffect } from 'react';
import './DeviceManagement.css';

const DeviceManagement = () => {
    const [devices, setDevices] = useState([]);
    const [newDevice, setNewDevice] = useState({ name: '', type: '', status: '' });
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/devices');
            if (!response.ok) throw new Error('Erreur serveur');

            const data = await response.json();
            setDevices(data);
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des dispositifs:', error);
            setError('Impossible de récupérer les dispositifs.');
        }
    };

    const handleAddDevice = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:5000/api/devices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDevice),
            });

            if (!response.ok) throw new Error('Erreur lors de l\'ajout');

            setNewDevice({ name: '', type: '', status: '' });
            fetchDevices();
        } catch (error) {
            console.error('❌ Erreur lors de l\'ajout du dispositif:', error);
            setError('Impossible d\'ajouter le dispositif.');
        }
    };

    const handleDeviceClick = async (deviceId) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/devices/${deviceId}`);
            if (!response.ok) throw new Error('Dispositif introuvable');

            const data = await response.json();
            setSelectedDevice(data);
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des détails du dispositif:', error);
            setError('Impossible d\'afficher les détails.');
        }
    };

    const handleDeleteDevice = async (deviceId) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/devices/${deviceId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Erreur lors de la suppression');

            fetchDevices();
            setSelectedDevice(null);
        } catch (error) {
            console.error('❌ Erreur lors de la suppression du dispositif:', error);
            setError('Impossible de supprimer le dispositif.');
        }
    };

    const handleUpdateDevice = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/devices/${selectedDevice.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedDevice),
            });

            if (!response.ok) throw new Error('Erreur lors de la mise à jour');

            fetchDevices();
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour du dispositif:', error);
            setError('Impossible de mettre à jour le dispositif.');
        }
    };

    const filteredDevices = devices.filter((device) =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="device-management">
            <h1>Gestion des Dispositifs</h1>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleAddDevice} className="device-form">
                <h2>Ajouter un Dispositif</h2>
                <input
                    type="text"
                    placeholder="Nom du dispositif"
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Type de dispositif"
                    value={newDevice.type}
                    onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Statut du dispositif"
                    value={newDevice.status}
                    onChange={(e) => setNewDevice({ ...newDevice, status: e.target.value })}
                    required
                />
                <button type="submit">Ajouter</button>
            </form>

            <div className="device-list">
                <h2>Liste des Dispositifs</h2>
                <input
                    type="text"
                    placeholder="Rechercher un dispositif..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
                <ul>
                    {filteredDevices.map((device) => (
                        <li key={device.id} onClick={() => handleDeviceClick(device.id)}>
                            {device.name} - {device.type} ({device.status})
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteDevice(device.id);
                                }}
                                style={{ marginLeft: '10px', color: 'red' }}
                            >
                                Supprimer
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {selectedDevice && (
                <div className="device-details">
                    <h2>Détails du Dispositif</h2>
                    <form onSubmit={handleUpdateDevice}>
                        <label>
                            Nom:
                            <input
                                type="text"
                                value={selectedDevice.name}
                                onChange={(e) => setSelectedDevice({ ...selectedDevice, name: e.target.value })}
                            />
                        </label>
                        <label>
                            Type:
                            <input
                                type="text"
                                value={selectedDevice.type}
                                onChange={(e) => setSelectedDevice({ ...selectedDevice, type: e.target.value })}
                            />
                        </label>
                        <label>
                            Statut:
                            <input
                                type="text"
                                value={selectedDevice.status}
                                onChange={(e) => setSelectedDevice({ ...selectedDevice, status: e.target.value })}
                            />
                        </label>
                        <button type="submit">Mettre à jour</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default DeviceManagement;