import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

const ChoiceName = ({ show, onSubmit }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter a valid name');
            return;
        }
        setError('');
        onSubmit(name.trim());
    };

    return (
        <Modal 
            show={show} 
            backdrop="static" 
            keyboard={false} 
            centered
        >
            <Modal.Header>
                <h2 className="text-center w-100">Choose your name</h2>
            </Modal.Header>
            <Modal.Body>
                <div className="container py-4">
                    <form onSubmit={handleSubmit}>
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