import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { updateRoomName } from '../../api/roomApi';
import { showSuccess, showError } from '../common/Notification';

const ChangeRoomName = ({ show, onClose, room }) => {
  const [newRoomName, setNewRoomName] = useState(room?.name || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!newRoomName.trim()) {
        showError('Room name cannot be empty');
        return;
      }

      const data ={
        roomId: room._id,
        name: newRoomName
      }

      await updateRoomName(data);
      showSuccess('Room name updated successfully');
      onClose();
    } catch (error) {
      console.error('Update room name error:', error);
      showError('Failed to update room name');
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Change Room Name</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="roomName">Room Name</label>
            <input
              type="text"
              className="form-control"
              id="roomName"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter new room name"
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleSubmit}
          disabled={!newRoomName.trim()}
        >
          Save
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChangeRoomName;