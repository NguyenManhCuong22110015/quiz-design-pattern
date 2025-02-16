import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import QuestionTypeCard from './QuestionTypeCard';
import FormComponent from './FormComponent';

const AddQuestion = ({ show, onClose }) => {
  const [quantity, setQuantity] = useState(1);
 const [showModal, setShowModal] = useState(false);
    const handleOpenModal = () => {
        setShowModal(true);
    };
  const handleQuantityChange = (value) => {
    setQuantity((prev) => Math.max(1, prev + value));
  };

  return (
    <Modal show={show} onHide={onClose} size="xl">
      <Modal.Header closeButton>
      <h2 className="text-center mb-4">Adding a question</h2>
      </Modal.Header>
      <Modal.Body>
        
        <div className="text-center mb-4">
          <p className="mb-0">Select a question type:</p>
          <span className="badge bg-success me-2">1</span>
          <small className="text-muted">(Required)</small>
        </div>

        <div className="row mb-4">
          <div className="col-md-4 mt-3">
            <QuestionTypeCard title="Multiple choice" description="Student can select one or more correct answers." imgSrc="https://res.cloudinary.com/dj9r2qksh/image/upload/v1739202004/test_wq7dde.png" onSelect={() => alert("Selected Multiple Choice")} />
          </div>
          <div className="col-md-4 mt-3">
            <QuestionTypeCard title="True or false" description="Students can select true or false as a response." imgSrc="https://res.cloudinary.com/dj9r2qksh/image/upload/v1739202094/choices_vilnyw.png" onSelect={() => alert("Selected True or False")} />
          </div>
          <div className="col-md-4 mt-3">
            <QuestionTypeCard title="Only one" description="Students can select only one answer as a response." imgSrc="https://res.cloudinary.com/dj9r2qksh/image/upload/v1739202231/quality_itwgnh.png" onSelect={() => alert("Selected One")} />
          </div>
          <div className="col-md-4 mt-3">
            <QuestionTypeCard title="Number response" description="Student can record a number response to a question." imgSrc="https://res.cloudinary.com/dj9r2qksh/image/upload/v1739202328/number-blocks_ikjsfe.png" onSelect={() => alert("Selected Number Response")} />
          </div>
          <div className="col-md-4 mt-3">
            <QuestionTypeCard title="Writing response" description="Student can write their response to a question." imgSrc="https://res.cloudinary.com/dj9r2qksh/image/upload/v1739202375/notes_t2urhd.png" onSelect={() => alert("Selected Writing Response")} />
          </div>
        </div>

        <div className="text-center mb-3">
          <span className="badge bg-success me-2">2</span>
          <label htmlFor="quantity" className="me-2">Quantity:</label>
          <small className="text-muted">(Required)</small>
        </div>

        <div className="d-flex justify-content-center mb-4">
          <InputGroup style={{ width: '120px' }}>
            <Button className='me-2' variant="outline-secondary" onClick={() => handleQuantityChange(-1)}>-</Button>
            <Form.Control type="number" id="quantity" name="quantity" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} disabled />
            <Button variant="outline-secondary" onClick={() => handleQuantityChange(1)}>+</Button>
          </InputGroup>
        </div>

        <p className="text-muted text-center">Enter the number of questions you want to add of this question type.</p>

        <div className="text-center">
          <Button variant="primary"  onClick={handleOpenModal}>
            <i className="fas fa-save me-2"></i>
            Save
          </Button>
        </div>
        {showModal && <FormComponent show={showModal} onClose={() => setShowModal(false)} />}
      </Modal.Body>
    </Modal>
  );
};

export default AddQuestion;
