import React from 'react';
import { FaUsers, FaLock, FaLockOpen } from 'react-icons/fa';

const RoomCard = ({ room, onJoin }) => {
  const { name, currentPlayers, maxPlayers, password, description } = room;
  
  return (
    <div className="card mb-3 bg-dark text-white">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="d-flex align-items-center gap-2">
            <h5 className="card-title mb-0" title={name}>
              {name.length > 20 ? `${name.substring(0, 20)}...` : name}
            </h5>
              {password ? <FaLock className="text-warning" /> : <FaLockOpen className="text-success" />}
            </div>
            <p className="card-text text-muted mt-2">{description || "No description"}</p>
          </div>
          <div className="d-flex flex-column align-items-end">
            <div className="d-flex align-items-center gap-2 mb-2">
              <FaUsers className="text-info" />
              <span>{currentPlayers}/{maxPlayers}</span>
            </div>
            <button 
              className={`btn ${currentPlayers >= maxPlayers ? 'btn-secondary' : 'btn-success'}`}
              onClick={() => onJoin(room)}
              disabled={currentPlayers >= maxPlayers}
            >
              {currentPlayers >= maxPlayers ? "Full" : "Join"}
            </button>
          </div>
        </div>
        
        <div className="progress mt-3" style={{ height: '4px' }}>
          <div 
            className="progress-bar bg-info" 
            style={{ width: `${(currentPlayers/maxPlayers) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default RoomCard;