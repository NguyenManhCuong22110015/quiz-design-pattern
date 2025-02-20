import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../../services/websocket';

const CreateRoomPage = () => {
    const [roomName, setRoomName] = useState('');
    const [password, setPassword] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check for userId in localStorage
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            setError('Please set log in first');
            return;
        }
        try {
            // First, create room in database
            const response = await fetch('http://localhost:5000/api/rooms/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: roomName,
                    password,
                    maxPlayers,
                    createdAt: new Date(),
                    createdBy: userId  // Add creator's username
                })
            });
    
            const data = await response.json();
            
            if (response.ok) {
                // Then create WebSocket room
                createRoom(data.roomId, password);
                navigate(`/room/${data.roomId}`);
            } else {
                setError(data.message || 'Failed to create room');
            }
        } catch (err) {
            setError('Failed to create room');
            console.error('Error:', err);
        }
    };

    return (
        <div className="container mt-5">
            <div className="card p-4 mx-auto" style={{ maxWidth: '500px' }}>
                <h2 className="text-center mb-4">Create New Room</h2>
                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Room Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password (optional)</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Max Players</label>
                        <select
                            className="form-control"
                            value={maxPlayers}
                            onChange={(e) => setMaxPlayers(Number(e.target.value))}
                        >
                            <option value="2">2</option>
                            <option value="4">4</option>
                            <option value="6">6</option>
                            <option value="8">8</option>
                        </select>
                    </div>
                    <button 
                        type="submit" 
                        className="btn btn-primary w-100"
                        disabled={!roomName.trim()}
                    >
                        Create Room
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomPage;