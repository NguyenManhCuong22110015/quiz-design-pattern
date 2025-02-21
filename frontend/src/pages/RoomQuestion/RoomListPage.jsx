import React, { useState, useEffect } from 'react';
import { useNavigate ,useLocation} from 'react-router-dom';
import ChoiceName from '../../components/RoomQuestion/ChoiceName';
import { getActiveRoom } from '../../api/roomApi';
import Navbar from "../../layout/NavBar";
const RoomListPage = () => {
    const [rooms, setRooms] = useState([]);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await getActiveRoom();
           
            setRooms(response);
        } catch (err) {
            console.error('Error fetching rooms:', err);
        }
    };

    const handleJoinRoom = async (room) => {
        if (room.password) {
            setSelectedRoom(room);
            setShowJoinModal(true);
        } else {
            navigateToRoom(room._id);
        }
    };

    const navigateToRoom = (roomId) => {
        navigate(`/room/${roomId}`);
    };
    useEffect(() => {
        // Show password modal if redirected from protected room
        if (location.state?.roomId) {
            const room = rooms.find(r => r._id === location.state.roomId);
            if (room) {
                setSelectedRoom(room);
                setShowJoinModal(true);
            }
        }
    }, [location, rooms]);

    const handlePasswordSubmit = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/rooms/verify-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomId: selectedRoom._id,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
                // Store room access in session storage
                sessionStorage.setItem(`room_access_${selectedRoom._id}`, 'true');
                setShowJoinModal(false);
                setPassword('');
                setError('');
                navigate(`/room/${selectedRoom._id}`);
            } else {
                setError('Invalid password');
            }
        } catch (err) {
            setError('Failed to verify password');
        }
    };
    return (

        <div className="container mt-5">
             <Navbar/>
            <div className="row">
                <div className="col-md-8 mx-auto">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>Available Rooms</h2>
                        <button 
                            className="btn btn-primary"
                            onClick={() => navigate('/room/create')}
                        >
                            Create New Room
                        </button>
                    </div>

                    <div className="list-group">
                        {rooms.map(room => (
                            <div 
                                key={room._id} 
                                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    <h5 className="mb-1">{room.name}</h5>
                                    <small>Players: {room.currentPlayers}/{room.maxPlayers}</small>
                                </div>
                                <button 
                                    className="btn btn-success"
                                    onClick={() => handleJoinRoom(room)}
                                    disabled={room.currentPlayers >= room.maxPlayers}
                                >
                                    Join Room
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Join Room Modal */}
                    {showJoinModal && selectedRoom && (
                        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Join {selectedRoom.name}</h5>
                                    </div>
                                    <div className="modal-body">
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Enter room password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        {error && <div className="text-danger mt-2">{error}</div>}
                                    </div>
                                    <div className="modal-footer">
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setShowJoinModal(false);
                                                setSelectedRoom(null);
                                                setPassword('');
                                                setError('');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => navigateToRoom(selectedRoom._id)}
                                        >
                                            Join
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {showJoinModal && selectedRoom && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Join {selectedRoom.name}</h5>
                                <button 
                                    type="button" 
                                    className="btn-close"
                                    onClick={() => {
                                        setShowJoinModal(false);
                                        setSelectedRoom(null);
                                        setPassword('');
                                        setError('');
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Room Password</label>
                                    <input
                                        type="password"
                                        className={`form-control ${error ? 'is-invalid' : ''}`}
                                        placeholder="Enter room password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handlePasswordSubmit();
                                            }
                                        }}
                                    />
                                    {error && <div className="invalid-feedback">{error}</div>}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowJoinModal(false);
                                        setSelectedRoom(null);
                                        setPassword('');
                                        setError('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn btn-primary"
                                    onClick={handlePasswordSubmit}
                                    disabled={!password.trim()}
                                >
                                    Join Room
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
                </div>
            </div>
        </div>
    );
};

export default RoomListPage;