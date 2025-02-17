import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

const ChoiceName = ({ show, onSubmit }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit
                setError('Image size should be less than 1MB');
                return;
            }
            setAvatar(file);
            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter a valid name');
            return;
        }
        setError('');
        
        // Convert image to base64 if exists
        if (avatar) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onSubmit({
                    name: name.trim(),
                    avatar: reader.result
                });
            };
            reader.readAsDataURL(avatar);
        } else {
            onSubmit({
                name: name.trim(),
                avatar: null
            });
        }
    };

    return (
        <Modal show={show} backdrop="static" keyboard={false} centered>
            <Modal.Header>
                <h2 className="text-center w-100">Choose your name</h2>
            </Modal.Header>
            <Modal.Body>
                <div className="container py-4">
                    <form onSubmit={handleSubmit}>
                        <div className="text-center mb-3">
                            <div 
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    margin: '0 auto',
                                    border: '2px dashed #ccc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    cursor: 'pointer'
                                }}
                                onClick={() => document.getElementById('avatar-input').click()}
                            >
                                {previewUrl ? (
                                    <img 
                                        src={previewUrl} 
                                        alt="Avatar preview" 
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                ) : (
                                    <span>Choose Avatar</span>
                                )}
                            </div>
                            <input
                                id="avatar-input"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Name</label>
                            <input 
                                type="text" 
                                className={`form-control ${error ? 'is-invalid' : ''}`}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                required
                            />
                            {error && <div className="invalid-feedback">{error}</div>}
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary w-100"
                            disabled={!name.trim()}
                        >
                            Start Chat
                        </button>
                    </form>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ChoiceName;