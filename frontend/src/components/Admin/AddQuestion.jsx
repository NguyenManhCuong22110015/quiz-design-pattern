import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import QuestionTypeCard from './QuestionTypeCard';
import FormComponent from './FormComponent';
import { saveQuestion } from '../../api/questionApi';

const AddQuestion = ({ show, onClose, quizId }) => {
  // State for question configuration
  const [quantity, setQuantity] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  
  // Question type definitions
  const questionTypes = [
    {
      id: 'multiple_choice',
      title: 'Multiple choice',
      description: 'Student can select one or more correct answers.',
      imgSrc: 'https://res.cloudinary.com/dj9r2qksh/image/upload/v1739202004/test_wq7dde.png',
      formType: 'multiple',
      hasOptions: true,
      multipleCorrect: true
    },
    {
      id: 'true_false',
      title: 'True or false',
      description: 'Students can select true or false as a response.',
      imgSrc: 'https://res.cloudinary.com/dj9r2qksh/image/upload/v1739202094/choices_vilnyw.png',
      formType: 'boolean',
      hasOptions: true,
      multipleCorrect: false,
      fixedOptions: ['True', 'False']
    },
    {
      id: 'single_choice',
      title: 'Only one',
      description: 'Students can select only one answer as a response.',
      imgSrc: 'https://res.cloudinary.com/dj9r2qksh/image/upload/v1739202231/quality_itwgnh.png',
      formType: 'single',
      hasOptions: true,
      multipleCorrect: false
    },
    {
      id: 'number_response',
      title: 'Number response',
      description: 'Student can record a number response to a question.',
      imgSrc: 'https://res.cloudinary.com/dj9r2qksh/image/upload/v1739202328/number-blocks_ikjsfe.png',
      formType: 'number',
      hasOptions: false
    },
    {
      id: 'writing_response',
      title: 'Writing response',
      description: 'Student can write their response to a question.',
      imgSrc: 'https://res.cloudinary.com/dj9r2qksh/image/upload/v1739202375/notes_t2urhd.png',
      formType: 'text',
      hasOptions: false
    }
  ];

  // Handle quantity change with min limit of 1
  const handleQuantityChange = (value) => {
    setQuantity((prev) => Math.max(1, prev + value));
  };
  
  // Handle question type selection
  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
  };
  
  // Handle opening the form modal
  const handleOpenFormModal = () => {
    if (!selectedType) {
      alert("Please select a question type");
      return;
    }
    setShowFormModal(true);
  };
  
  // Handle closing the form modal
  const handleCloseFormModal = () => {
    setShowFormModal(false);
  };
  
  // Get the selected question type object
  const getSelectedTypeObject = () => {
    return questionTypes.find(type => type.id === selectedType);
  };

  const  saveQuestions = async (questions) =>{
    try {
        const data = await saveQuestion(questions);
        console.log("Question saved: " + data);
    }
    catch (error) {
      console.error(error);
    }
  }


  return (
    <Modal show={show} onHide={onClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title className="w-100">
          <h2 className="text-center">Adding questions</h2>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className="text-center mb-4">
          <p className="mb-0">Select a question type:</p>
          <span className="badge bg-primary me-2">1</span>
          <small className="text-muted">(Required)</small>
        </div>

        <div className="row mb-4">
          {questionTypes.map((type) => (
            <div className="col-md-4 mt-3" key={type.id}>
              <QuestionTypeCard
                title={type.title}
                description={type.description}
                imgSrc={type.imgSrc}
                onSelect={() => handleTypeSelect(type.id)}
                isSelected={selectedType === type.id}
              />
            </div>
          ))}
        </div>

        <div className="text-center mb-3">
          <span className="badge bg-primary me-2">2</span>
          <label htmlFor="quantity" className="me-2">Number of questions to add:</label>
          <small className="text-muted">(Required)</small>
        </div>

        <div className="d-flex justify-content-center mb-4">
          <InputGroup style={{ width: '150px' }}>
            <Button 
              className="d-flex align-items-center justify-content-center" 
              variant="outline-secondary" 
              onClick={() => handleQuantityChange(-1)}
            >
              <i className="fas fa-minus"></i>
            </Button>
            <Form.Control 
              type="number" 
              id="quantity" 
              name="quantity" 
              min="1" 
              value={quantity} 
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
              className="text-center"
            />
            <Button 
              className="d-flex align-items-center justify-content-center" 
              variant="outline-secondary" 
              onClick={() => handleQuantityChange(1)}
            >
              <i className="fas fa-plus"></i>
            </Button>
          </InputGroup>
        </div>

        <div className="text-center mb-4">
          <p className="text-muted">
            You will create <strong>{quantity}</strong> question{quantity > 1 ? 's' : ''} of type <strong>{selectedType ? getSelectedTypeObject()?.title : "___"}</strong>
          </p>
        </div>

        <div className="text-center">
          <Button 
            variant="primary" 
            onClick={handleOpenFormModal}
            disabled={!selectedType}
            className="px-4 py-2"
          >
            <i className="fas fa-arrow-right me-2"></i>
            Continue
          </Button>
        </div>
      </Modal.Body>
      
      {/* FormComponent Modal for creating questions */}
      {showFormModal && (
        <FormComponent 
          show={showFormModal} 
          onClose={handleCloseFormModal}
          questionType={getSelectedTypeObject()}
          quantity={quantity}
          quizId={quizId}
          onSave={(questions) => {
            saveQuestions(questions);
            console.log('Questions saved:', questions);
            setShowFormModal(false);
            onClose(); 
          }}
        />
      )}
    </Modal>
  );
};

export default AddQuestion;
