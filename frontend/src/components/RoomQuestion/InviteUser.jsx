import React from 'react'
import { Modal } from 'react-bootstrap'
import { showSuccess } from '../common/Notification'
import { QRCodeCanvas } from 'qrcode.react'

const InviteUser = ({ show, onClose, url }) => {
  return (
    <Modal show={show} onHide={onClose} size="l">
      <Modal.Header closeButton>
        <Modal.Title>Invite User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex flex-column align-items-center">
          <input 
            type="text"
            value={url}
            readOnly
            className="form-control mb-3 text-center"
          />
          <button
            className="btn btn-primary mb-3"
            onClick={() => {
              navigator.clipboard.writeText(url);
              showSuccess('Copied to clipboard');
            }}
          >
            Copy
          </button>
          <QRCodeCanvas value={url} size={250} />
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default InviteUser
