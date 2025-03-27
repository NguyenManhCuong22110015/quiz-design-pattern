import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Form, Row, Col, Modal } from 'react-bootstrap';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaExpandAlt, FaCompressAlt, FaSearch, FaTimes as FaClose } from 'react-icons/fa';
import { motion } from 'framer-motion';
import "../../styles/GenerateQuiz.css";

const QuestionPreviewCard = ({ question, index, onUpdate, isExpanded, onToggleExpand, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState({ ...question });
  
  // Thêm state cho modal hiển thị hình ảnh
  const [showImageModal, setShowImageModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Reset zoom khi đóng modal
  useEffect(() => {
    if (!showImageModal) {
      setZoomLevel(1);
    }
  }, [showImageModal]);
  
  // Cập nhật state khi prop question thay đổi
  useEffect(() => {
    setEditedQuestion({ ...question });
  }, [question]);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleSave = () => {
    onUpdate(editedQuestion);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedQuestion({ ...question });
    setIsEditing(false);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedQuestion({ ...editedQuestion, [name]: value });
  };
  
  const handleChoiceChange = (index, field, value) => {
    if (!editedQuestion.choices) return;
    
    const newChoices = [...editedQuestion.choices];
    newChoices[index] = { ...newChoices[index], [field]: value };
    
    setEditedQuestion({ ...editedQuestion, choices: newChoices });
  };
  
  const handleCorrectChoice = (index) => {
    if (!editedQuestion.choices) return;
    
    const newChoices = editedQuestion.choices.map((choice, i) => ({
      ...choice,
      isCorrect: i === index
    }));
    
    setEditedQuestion({ ...editedQuestion, choices: newChoices });
  };
  
  // Xử lý zoom hình ảnh trong modal
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3)); // Giới hạn zoom tối đa 3x
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5)); // Giới hạn zoom tối thiểu 0.5x
  };
  
  const handleImageClick = (e) => {
    e.stopPropagation();
    setShowImageModal(true);
  };
  
  const renderBadge = () => {
    const type = question.type?.toLowerCase() || '';
    
    if (type.includes('multiple') || type.includes('one answer')) {
      return <Badge bg="primary">Multiple Choice</Badge>;
    } else if (type.includes('true') || type.includes('false') || type.includes('đúng/sai')) {
      return <Badge bg="success">True/False</Badge>;
    } else if (type.includes('number')) {
      return <Badge bg="warning">Number Response</Badge>;
    } else if (type.includes('writing')) {
      return <Badge bg="info">Writing</Badge>;
    } else if (type.includes('fill') || type.includes('điền')) {
      return <Badge bg="secondary">Fill in blank</Badge>;
    }
    
    return <Badge bg="dark">Quiz</Badge>;
  };
  
  const renderCollapsedView = () => {
    return (
      <Card.Body className="d-flex flex-column h-100">
        <div className="d-flex justify-content-between mb-2">
          {renderBadge()}
          <Badge bg="secondary">Q{index + 1}</Badge>
        </div>
        
        {/* Hiển thị hình ảnh nếu có với khả năng click để xem đầy đủ */}
        {question.imageUrl && (
          <div className="card-image-container mb-3">
            <img 
              src={question.imageUrl} 
              alt="Question illustration" 
              className="card-image img-fluid rounded cursor-pointer"
              onClick={handleImageClick}
              style={{ cursor: 'pointer' }}
            />
            <div className="image-zoom-icon">
              <FaSearch />
            </div>
          </div>
        )}
        
        <Card.Title className="question-title">
          {question.question?.length > 70 
            ? question.question.substring(0, 70) + '...' 
            : question.question}
        </Card.Title>
        
        <Card.Text className="question-choices mt-auto">
          {question.choices && question.choices.length > 0 && (
            <div className="choices-preview">
              {question.choices.map((choice, idx) => (
                <div 
                  key={idx} 
                  className={`choice-preview ${choice.isCorrect ? 'correct-choice' : ''}`}
                >
                  {choice.text?.length > 25 
                    ? choice.text.substring(0, 25) + '...' 
                    : choice.text}
                </div>
              ))}
            </div>
          )}
        </Card.Text>
      </Card.Body>
    );
  };
  
  const renderExpandedView = () => {
    if (isEditing) {
      return (
        <Card.Body onClick={e => e.stopPropagation()}>
          <div className="d-flex justify-content-between mb-3">
            {renderBadge()}
            <div>
              <Button variant="outline-success" size="sm" onClick={handleSave} className="me-2">
                <FaCheck /> Save
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={handleCancel}>
                <FaTimes /> Cancel
              </Button>
            </div>
          </div>
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Question</Form.Label>
              <Form.Control
                as="textarea"
                name="question"
                value={editedQuestion.question || ''}
                onChange={handleChange}
                rows={3}
              />
            </Form.Group>
            
            {editedQuestion.choices && editedQuestion.choices.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label>Choices</Form.Label>
                {editedQuestion.choices.map((choice, idx) => (
                  <Row key={idx} className="mb-2 align-items-center">
                    <Col xs={10}>
                      <Form.Control
                        type="text"
                        value={choice.text || ''}
                        onChange={(e) => handleChoiceChange(idx, 'text', e.target.value)}
                      />
                    </Col>
                    <Col xs={2} className="d-flex justify-content-center">
                      <Form.Check
                        type="radio"
                        name="correctChoice"
                        checked={choice.isCorrect}
                        onChange={() => handleCorrectChoice(idx)}
                        label="Correct"
                      />
                    </Col>
                  </Row>
                ))}
              </Form.Group>
            )}
            
            {editedQuestion.answer && (
              <Form.Group className="mb-3">
                <Form.Label>Answer</Form.Label>
                <Form.Control
                  type="text"
                  name="answer"
                  value={editedQuestion.answer || ''}
                  onChange={handleChange}
                />
              </Form.Group>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Explanation</Form.Label>
              <Form.Control
                as="textarea"
                name="explanation"
                value={editedQuestion.explanation || ''}
                onChange={handleChange}
                rows={2}
              />
            </Form.Group>
          </Form>
        </Card.Body>
      );
    }
    
    return (
      <Card.Body onClick={e => e.stopPropagation()}>
        <div className="d-flex justify-content-between mb-3">
          {renderBadge()}
          <div>
            <Button variant="outline-primary" size="sm" onClick={handleEdit} className="me-2">
              <FaEdit /> Edit
            </Button>
            <Button variant="outline-danger" size="sm" onClick={() => onDelete()}>
              <FaTrash /> Delete
            </Button>
          </div>
        </div>
        
        {/* Hiển thị hình ảnh nếu có với khả năng click để xem đầy đủ */}
        {question.imageUrl && (
          <div className="card-image-container mb-4">
            <img 
              src={question.imageUrl} 
              alt="Question illustration" 
              className="card-image img-fluid rounded cursor-pointer"
              onClick={handleImageClick}
              style={{ cursor: 'pointer' }}
            />
            <div className="image-zoom-icon">
              <FaSearch />
            </div>
          </div>
        )}
        
        <h5 className="question-text mb-4">{question.question}</h5>
        
        {question.choices && question.choices.length > 0 && (
          <div className="choices-container mb-4">
            <h6>Choices:</h6>
            {question.choices.map((choice, idx) => (
              <div 
                key={idx} 
                className={`choice-item ${choice.isCorrect ? 'correct-choice' : ''}`}
              >
                <span className="choice-marker">{String.fromCharCode(65 + idx)}</span>
                <span className="choice-text">{choice.text}</span>
                {choice.isCorrect && <span className="correct-indicator"><FaCheck /></span>}
              </div>
            ))}
          </div>
        )}
        
        {question.answer && (
          <div className="answer-container mb-4">
            <h6>Answer:</h6>
            <div className="answer-text">{question.answer}</div>
          </div>
        )}
        
        {question.explanation && (
          <div className="explanation-container mt-3">
            <h6>Explanation:</h6>
            <div className="explanation-text">{question.explanation}</div>
          </div>
        )}
      </Card.Body>
    );
  };
  
  return (
    <>
      <motion.div 
        layout
        className="question-card-wrapper"
        whileHover={{ scale: isExpanded ? 1 : 1.03 }}
        transition={{ duration: 0.3 }}
      >
        <Card 
          className={`question-card ${isExpanded ? 'expanded' : ''}`}
          onClick={() => !isExpanded && onToggleExpand()}
        >
          <div className="expand-button" onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}>
            {isExpanded ? <FaCompressAlt /> : <FaExpandAlt />}
          </div>
          
          {isExpanded ? renderExpandedView() : renderCollapsedView()}
        </Card>
      </motion.div>
      
      {/* Modal Hiển thị hình ảnh đầy đủ */}
      <Modal 
        show={showImageModal} 
        onHide={() => setShowImageModal(false)}
        centered
        size="lg"
        className="image-viewer-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Question Image</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 image-modal-body">
          <div className="image-zoom-controls">
            <Button variant="light" onClick={handleZoomOut}>-</Button>
            <span>{Math.round(zoomLevel * 100)}%</span>
            <Button variant="light" onClick={handleZoomIn}>+</Button>
          </div>
          <div className="image-container">
            {question.imageUrl && (
              <img 
                src={question.imageUrl} 
                alt="Question full illustration" 
                style={{ 
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.3s ease'
                }}
              />
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default QuestionPreviewCard;