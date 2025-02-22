import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../../services/websocket';
import { createRoom as creRoom } from '../../api/roomApi';
const CreateRoomPage = () => {
    const [roomName, setRoomName] = useState('');
    const [password, setPassword] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();  
        try {
            const userId = localStorage.getItem('userId');
                const room = {
                    name: roomName,
                    password,
                    maxPlayers,
                    createdAt: new Date(),
                    createdBy: userId
             }
            
            const response = await creRoom(room);
            
            if (response.success) {
                createRoom(response.roomId, password);
                navigate(`/room/${response.roomId}`);
            } else {
                setError(response.message || 'Failed to create room');
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