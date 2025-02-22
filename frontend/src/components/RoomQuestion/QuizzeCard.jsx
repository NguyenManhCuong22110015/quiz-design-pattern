import React, { useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import '../../styles/QuizzeCard.css';

const QuizzeCard = ({ quiz, onSelect }) => {
  const [isChecked, setIsChecked] = useState(quiz.checked || false);

  const handleClick = () => {
    setIsChecked(!isChecked);
    if (onSelect) {
      onSelect(quiz.id, !isChecked);
    }
  };

  return (
    <div 
      className={`quiz-card ${isChecked ? 'selected' : ''}`}
      onClick={handleClick}
      tabIndex={0}
    >
      <div className="checkbox-container">
        <div className={`custom-checkbox ${isChecked ? 'checked' : ''}`}>
          {isChecked && <FaCheck className="check-icon" />}
        </div>
      </div>
      <div className="quiz-content">
        <div className="quiz-title">{quiz.title}</div>
        <div className="quiz-description">{quiz.description}</div>
        <div className="quiz-id">ID: {quiz.id}</div>
      </div>
    </div>
  );
};

export default QuizzeCard;