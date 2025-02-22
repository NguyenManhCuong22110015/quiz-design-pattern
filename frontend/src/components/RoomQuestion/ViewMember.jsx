import Modal from 'react-bootstrap/Modal';

const ViewMember = ({show, onClose,members}) => {
  return (
    <Modal show={show} onHide={onClose} size="l">
        <Modal.Header closeButton>
             <Modal.Title>In this room we have {members.length} members</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            
            {members.map((member, index) => (
                <div 
                key={index} 
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '10px 0',
                    padding: '5px'
                
                }}
            >
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            marginRight: '10px',
                            backgroundColor: '#ccc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            textTransform: 'uppercase'
                        }}
                    >
                        {member.username.charAt(0)}
                    </div>
                
                <div>
                    <h5 style={{ margin: 0 }}>{member.username}</h5>
                    <p style={{ margin: 0, color: '#777' }}>{member.score}</p>
                </div>
            </div>
            ))}
        </Modal.Body>
            
    </Modal>
  )
}

export default ViewMember