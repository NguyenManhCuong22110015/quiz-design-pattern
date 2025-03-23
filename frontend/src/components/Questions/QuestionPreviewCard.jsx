import React, { useState } from 'react';
import { Card, Form, Button, Badge, Row, Col, ListGroup } from 'react-bootstrap';
import "../../styles/GenerateQuiz.css";
import { motion } from 'framer-motion'; // Add for smooth animations

const QuestionPreviewCard = ({ question, index, onUpdate, isExpanded, onToggleExpand, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState({ ...question });
  
  const getQuestionTypeColor = (type) => {
    const typeMap = {
      'true / false': 'info',
      'đúng/sai': 'info',
      'multiple choices': 'primary',
      'trắc nghiệm': 'primary',
      'one answer': 'success',
      'number response': 'warning',
      'writing response': 'secondary',
      'tự luận': 'secondary',
      'điền vào chỗ trống': 'dark'
    };
    return typeMap[type.toLowerCase()] || 'primary';
  };

  const getDifficultyColor = (difficulty) => {
    const difficultyMap = {
      'dễ': 'success',
      'trung bình': 'warning',
      'khó': 'danger',
      'rất khó': 'dark'
    };
    return difficultyMap[difficulty.toLowerCase()] || 'secondary';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedQuestion({ ...editedQuestion, [name]: value });
  };

  const handleChoiceTextChange = (index, value) => {
    const updatedChoices = [...editedQuestion.choices];
    updatedChoices[index] = { ...updatedChoices[index], text: value };
    setEditedQuestion({ ...editedQuestion, choices: updatedChoices });
  };

  const handleChoiceCorrectChange = (index) => {
    const updatedChoices = [...editedQuestion.choices].map((choice, i) => ({
      ...choice,
      isCorrect: i === index
    }));
    setEditedQuestion({ ...editedQuestion, choices: updatedChoices });
  };

  const handleSaveEdit = () => {
    onUpdate(editedQuestion);
    setIsEditing(false);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    onToggleExpand();
  };

  const renderCompactView = () => {
    return (
      <>
        <Card.Title className="question-title">
          <span className="question-number">#{index + 1}</span> 
          <span className="question-text">
            {question.question.length > 70 
              ? `${question.question.substring(0, 70)}...` 
              : question.question}
          </span>
        </Card.Title>
        
        <div className="mb-3 mt-2">
          <Badge bg={getQuestionTypeColor(question.type)} className="me-2">
            {question.type}
          </Badge>
          <Badge bg={getDifficultyColor(question.difficulty)}>
            {question.difficulty}
          </Badge>
          {question.source && (
            <Badge bg="info" className="ms-2">
              PDF
            </Badge>
          )}
        </div>
        
        {(['multiple choices', 'true / false', 'one answer', 'trắc nghiệm', 'đúng/sai'].includes(question.type.toLowerCase()) && 
          question.choices && question.choices.length > 0) ? (
          <div className="choices-preview">
            <small className="text-muted">
              {question.choices.length} choice{question.choices.length !== 1 ? 's' : ''}
            </small>
          </div>
        ) : (
          question.answer && (
            <div className="answer-preview">
              <small>Answer: {question.answer.length > 20 ? `${question.answer.substring(0, 20)}...` : question.answer}</small>
            </div>
          )
        )}
      </>
    );
  };

  const renderExpandedView = () => {
    if (isEditing) {
      return (
        <Form onClick={e => e.stopPropagation()}>
          <Form.Group className="mb-3">
            <Form.Label>Question Text</Form.Label>
            <Form.Control
              as="textarea"
              name="question"
              value={editedQuestion.question}
              onChange={handleInputChange}
              rows={2}
            />
          </Form.Group>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Select
                  name="type"
                  value={editedQuestion.type}
                  onChange={handleInputChange}
                >
                  <option value="true / false">True / False</option>
                  <option value="multiple choices">Multiple Choice</option>
                  <option value="one answer">One Answer</option>
                  <option value="number response">Number Response</option>
                  <option value="writing response">Writing Response</option>
                  <option value="điền vào chỗ trống">Điền vào chỗ trống</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Difficulty</Form.Label>
                <Form.Select
                  name="difficulty"
                  value={editedQuestion.difficulty}
                  onChange={handleInputChange}
                >
                  <option value="dễ">Dễ</option>
                  <option value="trung bình">Trung bình</option>
                  <option value="khó">Khó</option>
                  <option value="rất khó">Rất khó</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          {/* Render choices based on question type */}
          {(['multiple choices', 'true / false', 'one answer', 'trắc nghiệm', 'đúng/sai'].includes(editedQuestion.type.toLowerCase()) && 
            editedQuestion.choices && editedQuestion.choices.length > 0) ? (
            <Form.Group className="mb-3">
              <Form.Label>Choices</Form.Label>
              {editedQuestion.choices.map((choice, i) => (
                <div key={i} className="d-flex mb-2 align-items-center">
                  <Form.Check
                    type="radio"
                    name="correctChoice"
                    checked={choice.isCorrect}
                    onChange={() => handleChoiceCorrectChange(i)}
                    className="me-2"
                  />
                  <Form.Control
                    value={choice.text}
                    onChange={(e) => handleChoiceTextChange(i, e.target.value)}
                  />
                </div>
              ))}
            </Form.Group>
          ) : (
            <Form.Group className="mb-3">
              <Form.Label>Answer</Form.Label>
              <Form.Control
                name="answer"
                value={editedQuestion.answer || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Explanation</Form.Label>
            <Form.Control
              as="textarea"
              name="explanation"
              value={editedQuestion.explanation || ''}
              onChange={handleInputChange}
              rows={2}
            />
          </Form.Group>
          
          <div className="d-flex justify-content-end">
            <Button 
              variant="secondary" 
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(false);
              }} 
              className="me-2"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={(e) => {
                e.stopPropagation();
                handleSaveEdit();
              }}
            >
              Save
            </Button>
          </div>
        </Form>
      );
    }
    
    // Render detailed view mode
    return (
      <div onClick={e => e.stopPropagation()}>
        <Card.Title className="d-flex justify-content-between align-items-center">
          <div>
            <span className="question-number">#{index + 1}</span> {question.question}
          </div>
          
          {/* Thêm nút Edit và Cancel vào header */}
          <div className="expanded-card-buttons">
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="me-2"
            >
              <i className="fas fa-edit me-1"></i>
              Edit
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete(index);
              }}
              className="me-2"
            >
              <i className="fas fa-trash-alt me-1"></i>
              Delete
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(); // Đóng card mở rộng
              }}
            >
              <i className="fas fa-times me-1"></i>
              Close
            </Button>
          </div>
        </Card.Title>
        
        <div className="mb-3 mt-2">
          <Badge bg={getQuestionTypeColor(question.type)} className="me-2">
            {question.type}
          </Badge>
          <Badge bg={getDifficultyColor(question.difficulty)}>
            {question.difficulty}
          </Badge>
        </div>
        
        {/* Render choices based on question type */}
        {(['multiple choices', 'true / false', 'one answer', 'trắc nghiệm', 'đúng/sai'].includes(question.type.toLowerCase()) && 
          question.choices && question.choices.length > 0) ? (
          <ListGroup variant="flush" className="mb-3 choices-list">
            {question.choices.map((choice, i) => (
              <ListGroup.Item 
                key={i}
                className={choice.isCorrect ? 'correct-answer' : ''}
              >
                {choice.isCorrect && <i className="fas fa-check-circle text-success me-2"></i>}
                {!choice.isCorrect && <i className="fas fa-circle text-muted me-2"></i>}
                {choice.text}
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          question.answer && (
            <div className="answer mb-3 p-3 bg-light rounded">
              <strong>Answer:</strong> {question.answer}
            </div>
          )
        )}
        
        {question.explanation && (
          <div className="explanation p-3 bg-light rounded">
            <strong>Explanation:</strong> {question.explanation}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card 
      className={`question-card ${isExpanded ? 'expanded' : ''}`}
      onClick={onToggleExpand}
    >
      <Card.Body>
        {isExpanded ? renderExpandedView() : renderCompactView()}
        
        {/* Chỉ hiển thị nút Edit cho chế độ compact (khi không phóng to) */}
        {!isExpanded && (
          <div className="card-buttons mt-3">
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={handleEditClick}
              className="edit-button me-2"
            >
              <i className="fas fa-edit me-1"></i>
              Edit
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete(index);
              }}
              className="delete-button"
            >
              <i className="fas fa-trash-alt me-1"></i>
              Delete
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default QuestionPreviewCard;