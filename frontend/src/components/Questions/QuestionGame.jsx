import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, ProgressBar, Image, Alert, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/QuestionGame.css";
import CreateLoading from "../common/CreateLoading";
import DOMPurify from 'dompurify'; // For sanitizing HTML content
import { FiCheck, FiX } from 'react-icons/fi';

const QuestionGame = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  onAnswer, 
  defaultAnswer = null,
  isLocked
}) => {
  // Handle if question is an array with one item
  const questionData = Array.isArray(question) ? question[0] : question;
  
  // State for multiple choice questions
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState({ visible: false, correct: false });
  const [points, setPoints] = useState(100);
  
  // State for text questions
  const [textAnswer, setTextAnswer] = useState('');
  const textInputRef = useRef(null);
  
  // Animation states
  const [questionVisible, setQuestionVisible] = useState(false);
  const [answersVisible, setAnswersVisible] = useState(
    Array(questionData?.options?.length || 0).fill(false)
  );
  const [mediaVisible, setMediaVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check initially
    checkIsMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Initialize with default answer if provided
  useEffect(() => {
    if (!questionData) return;
    
    // Reset states when question changes
    setQuestionVisible(false);
    setAnswersVisible(Array(questionData.options?.length || 0).fill(false));
    setMediaVisible(false);
    setFeedback({ visible: false, correct: false });
    
    // Set default answer if provided
    if (defaultAnswer) {
      // For text questions
      if (questionData.type === 'text') {
        setTextAnswer(defaultAnswer);
        setAnswered(true);
      } else {
        // For multiple choice questions, find the index of matching option
        const defaultIndex = questionData.options?.findIndex(
          opt => opt.option === defaultAnswer
        );
        
        if (defaultIndex !== -1) {
          setSelectedAnswer(defaultIndex);
          setAnswered(true);
          
          // Check if answer is correct and update feedback
          const isCorrect = questionData.options[defaultIndex].isCorrect;
          setFeedback({
            visible: true,
            correct: isCorrect
          });
        } else {
          setSelectedAnswer(null);
          setAnswered(false);
        }
      }
    } else {
      // No default answer, reset states
      setSelectedAnswer(null);
      setAnswered(false);
      setTextAnswer('');
    }
    
    // Animation timers
    const questionTimer = setTimeout(() => setQuestionVisible(true), 400);
    
    // Staggered answer appearance
    if (questionData.options && questionData.options.length > 0) {
      questionData.options.forEach((_, index) => {
        const timer = setTimeout(() => {
          setAnswersVisible(prev => {
            const newArr = [...prev];
            newArr[index] = true;
            return newArr;
          });
        }, 900 + index * 250);
        
        // Clean up this timer too
        return () => clearTimeout(timer);
      });
    }
    
    // Reveal media after answers
    const mediaTimer = setTimeout(() => setMediaVisible(true), 2200);
    
    // Focus on text input if it's a text question type
    if (questionData.type === 'text' && textInputRef.current) {
      setTimeout(() => {
        textInputRef.current.focus();
      }, 1500);
    }
    
    // Cleanup timers on unmount
    return () => {
      clearTimeout(questionTimer);
      clearTimeout(mediaTimer);
    };
  }, [questionData, defaultAnswer]);

  // Handle answer selection for multiple choice
  const handleAnswerClick = (index) => {
    if (answered) return; // Prevent selecting another answer after first selection
    
    setSelectedAnswer(index);
    setAnswered(true);
    
    // Check if answer is correct
    const isCorrect = questionData?.options?.[index]?.isCorrect || false;
    const selectedOption = questionData?.options?.[index]?.option || '';
    
    // Calculate points - you could make this more complex
    const earnedPoints = isCorrect ? points : 0;
    
    // Show feedback
    setFeedback({
      visible: true,
      correct: isCorrect
    });
    
    // Notify parent component about answer and score
    onAnswer(selectedOption, isCorrect, earnedPoints);
  };

  // Handle text answer submission
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (answered || !textAnswer.trim()) return;
    
    setAnswered(true);
    
    // For text questions, we need to check if the answer matches any of the correct answers
    const normalizedAnswer = textAnswer.trim().toLowerCase();
    
    // Find correct answers from options
    const correctAnswers = questionData.options
      ? questionData.options
          .filter(opt => opt.isCorrect)
          .map(opt => opt.option.toLowerCase())
      : [];
    
    const isCorrect = correctAnswers.some(answer => 
      normalizedAnswer === answer || 
      answer.includes(normalizedAnswer) || normalizedAnswer.includes(answer)
    );
    
    // Calculate points
    const earnedPoints = isCorrect ? points : 0;
    
    // Show feedback
    setFeedback({
      visible: true,
      correct: isCorrect
    });
    
    // Notify parent component about answer and score
    onAnswer(textAnswer, isCorrect, earnedPoints);
  };

  // Animation variants for framer-motion - cải thiện để mượt và chuyên nghiệp hơn
const questionVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.7, 
      ease: [0.25, 1, 0.5, 1],  // Smooth easing
      when: "beforeChildren" 
    }
  }
};

const answerVariants = {
  hidden: { opacity: 0, x: -40, filter: "blur(4px)" },
  visible: (custom) => ({ 
    opacity: 1, 
    x: 0,
    filter: "blur(0px)",
    transition: { 
      duration: 0.6, 
      delay: 0.4 + custom * 0.15,  // Shorter delay between answers
      ease: [0.25, 1, 0.5, 1] 
    }
  })
};

const mediaVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0, 
    transition: { 
      duration: 0.8, 
      delay: 0.5,  // Appear earlier
      ease: [0.34, 1.56, 0.64, 1]  // Spring-like effect
    }
  }
};

  const feedbackVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const textInputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        delay: 1.2,
        ease: "easeOut" 
      }
    }
  };

  // If no question data is provided, show a loading state
  if (!questionData) {
    return (
      <CreateLoading/>
    );
  }

  // Function to render the appropriate media element based on type
  const renderMedia = () => {
    if (!questionData.media) return null;

    switch (questionData.mediaType) {
      case 'image':
        return (
          <div className="image-container">
            <Image 
              src={questionData.media} 
              fluid 
              rounded
              className="question-image shadow-lg" 
              style={{ 
                maxWidth: "100%", 
                maxHeight: "350px", 
                objectFit: "contain",
                borderRadius: "12px"
              }}
              alt="Question illustration"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                e.target.className = "error-image"; 
              }}
            />
          </div>
        );
      case 'audio':
        return (
          <div className="audio-player-container p-4 rounded-lg shadow" 
               style={{ 
                 background: "linear-gradient(145deg, #f8f9fa, #e9ecef)",
                 border: "1px solid #dee2e6", 
                 width: "100%",
                 borderRadius: "15px"
               }}>
            <div className="d-flex align-items-center justify-content-center mb-3">
              <div className="audio-icon-pulse me-2">
                <i className="bi bi-music-note-beamed fs-4 text-primary"></i>
              </div>
              <h6 className="mb-0 fw-bold text-primary">Audio Question</h6>
            </div>
            <audio 
              controls 
              className="w-100 custom-audio-player" 
              style={{ borderRadius: "8px" }}
            >
              <source src={questionData.media} />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case 'video':
        return (
          <div className="video-container shadow-lg rounded-lg overflow-hidden p-1"
               style={{ background: "#000", borderRadius: "15px" }}>
            <video 
              controls 
              className="w-100" 
              style={{ borderRadius: "12px", maxHeight: "350px" }}
              poster="https://via.placeholder.com/400x300?text=Video+Loading"
            >
              <source src={questionData.media} />
              Your browser does not support the video element.
            </video>
          </div>
        );
      default:
        return null;
    }
  };

  // Reordering the columns for mobile
  const mediaSection = (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={mediaVariants}
      className="media-wrapper p-2"
      style={{ width: "100%" }}
    >
      {mediaVisible && questionData.media && renderMedia()}
    </motion.div>
  );

  // Rich Text rendering with sanitization
  const renderRichText = (htmlContent) => {
    const sanitizedHtml = DOMPurify.sanitize(htmlContent);
    return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
  };

  return (
    <div className="question-game-container py-4">
      <Container>
        <Row className="align-items-start justify-content-between">
          {/* Media Section - hiển thị trên cùng trên mobile */}
          {isMobile && questionData.media && mediaSection}

          {/* Question and Answers Section */}
          <Col lg={questionData.media ? 7 : 12} className="question-content mb-4">
            <AnimatePresence>
              {questionVisible && (
                <motion.div 
                  className="question-text mb-4"
                  initial="hidden"
                  animate="visible"
                  variants={questionVariants}
                >
                  <h4 className="fw-bold mb-3" style={{ fontSize: "1.5rem", lineHeight: "1.4" }}>
                    {questionData.text.includes('<') && questionData.text.includes('>') 
                      ? renderRichText(questionData.text)
                      : questionData.text
                    }
                  </h4>
                  
                  {/* Show question description if available */}
                  {answered && questionData.description && (
                      <motion.div 
                        className="question-description text-muted mt-3 p-3"
                        initial={{ opacity: 0, y: 10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        style={{
                          background: "rgba(0, 0, 0, 0.03)",
                          borderRadius: "10px",
                          borderLeft: "3px solid #0d6efd"
                        }}
                      >
                        <h6 className="mb-2 fw-bold text-primary">Explanation:</h6>
                        {questionData.description.includes('<') && questionData.description.includes('>')
                          ? renderRichText(questionData.description)
                          : <p className="mb-0">{questionData.description}</p>
                        }
                      </motion.div>
                    )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Multiple Choice Questions - Nâng cấp giao diện */}
            {questionData.type !== 'text' && questionData.options && questionData.options.map((option, index) => (
              <AnimatePresence key={index}>
                {answersVisible[index] && (
                  <motion.div 
                    initial="hidden"
                    animate="visible"
                    custom={index}
                    variants={answerVariants}
                    className="mb-3"
                    whileHover={!answered ? { scale: 1.02, x: 5 } : {}}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Button 
                      variant={!answered 
                        ? "outline-primary" 
                        : (selectedAnswer === index 
                          ? (option.isCorrect ? "success" : "danger") 
                          : option.isCorrect && selectedAnswer !== null 
                            ? "success" : "outline-secondary")}
                      className={`w-100 py-3 position-relative answer-button ${!answered ? 'answer-button-hover' : ''}`}
                      onClick={() => !answered && handleAnswerClick(index)}
                      disabled={answered}
                      style={{
                        boxShadow: selectedAnswer === index 
                          ? (option.isCorrect ? "0 0 15px rgba(40, 167, 69, 0.4)" : "0 0 15px rgba(220, 53, 69, 0.4)") 
                          : option.isCorrect && answered ? "0 0 15px rgba(40, 167, 69, 0.4)" : "0 4px 12px rgba(0,0,0,0.08)",
                        opacity: answered && selectedAnswer !== index && !option.isCorrect ? 0.7 : 1,
                        borderWidth: "2px",
                        borderRadius: "12px",
                        transition: "all 0.3s ease",
                        textAlign: "left",
                        paddingLeft: "65px",
                        fontWeight: "500",
                        fontSize: "1.1rem",
                        transform: answered && (selectedAnswer === index || option.isCorrect) 
                          ? "translateY(-3px)" 
                          : "translateY(0)",
                        marginBottom: "15px",
                        background: !answered ? "white" : undefined,
                        minHeight: "60px",
                        color: "#0d6efd",
                      }}
                    >
                      {/* Answer Letter Label - Nâng cấp thiết kế */}
                      <div 
                        className="position-absolute d-flex align-items-center justify-content-center"
                        style={{
                          left: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "45px",
                          height: "45px",
                          borderRadius: "10px",
                          background: !answered 
                            ? "rgba(13, 110, 253, 0.1)" 
                            : (selectedAnswer === index 
                              ? (option.isCorrect ? "#28a745" : "#dc3545") 
                              : option.isCorrect ? "#28a745" : "rgba(13, 110, 253, 0.1)"),
                          color: !answered 
                            ? "#0d6efd" 
                            : (option.isCorrect || selectedAnswer === index) ? "#ffffff" : "#0d6efd",
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                          transition: "all 0.3s ease",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                        }}
                      >
                        {String.fromCharCode(65 + index)} {/* A, B, C, D, etc. */}
                      </div>

                      {/* Option text with rich text support */}
                      <div className="option-text" style={{ wordBreak: "break-word" }}>
                        {option.option.includes('<') && option.option.includes('>')
                          ? renderRichText(option.option)
                          : option.option
                        }
                      </div>
                      
                      {/* Correct/Incorrect Icons - Cải thiện animation */}
                      {answered && option.isCorrect && (
                        <motion.div 
                          className="correct-icon position-absolute d-flex align-items-center justify-content-center"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                          style={{
                            right: "15px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            background: "#28a745",
                            color: "#fff",
                            boxShadow: "0 3px 8px rgba(40, 167, 69, 0.4)"
                          }}
                        >
                          <FiCheck size={20} />
                        </motion.div>
                      )}
                      
                      {answered && selectedAnswer === index && !option.isCorrect && (
                        <motion.div 
                          className="incorrect-icon position-absolute d-flex align-items-center justify-content-center"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                          style={{
                            right: "15px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            background: "#dc3545",
                            color: "#fff",
                            boxShadow: "0 3px 8px rgba(220, 53, 69, 0.4)"
                          }}
                        >
                          <FiX size={20} />
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
            
            {/* Text Input Question - Cải thiện giao diện */}
            {questionData.type === 'text' && (
              <AnimatePresence>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={textInputVariants}
                  className="mb-4"
                >
                  <Form onSubmit={handleTextSubmit}>
                    <Form.Group className="mb-3">
                      <div className="position-relative">
                        <Form.Control
                          type="text"
                          placeholder="Type your answer here..."
                          value={textAnswer}
                          onChange={(e) => setTextAnswer(e.target.value)}
                          disabled={answered}
                          ref={textInputRef}
                          className="py-3 px-4"
                          style={{
                            borderRadius: "12px",
                            boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
                            fontSize: "1.1rem",
                            border: answered 
                              ? (feedback.correct ? "2px solid #28a745" : "2px solid #dc3545") 
                              : "2px solid #dee2e6",
                            transition: "all 0.3s ease",
                            paddingRight: textAnswer ? "50px" : "12px",
                            height: "60px"
                          }}
                        />
                        {textAnswer && !answered && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="position-absolute"
                            style={{
                              right: "15px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              cursor: "pointer"
                            }}
                            onClick={() => setTextAnswer("")}
                          >
                            <FiX color="#6c757d" size={20} />
                          </motion.div>
                        )}
                      </div>
                    </Form.Group>
                    <motion.div
                      whileHover={!answered ? { scale: 1.02 } : {}}
                      whileTap={!answered ? { scale: 0.98 } : {}}
                    >
                      <Button 
                        type="submit" 
                        variant={answered ? (feedback.correct ? "success" : "danger") : "primary"}
                        className="w-100 py-3 d-flex align-items-center justify-content-center"
                        disabled={answered || !textAnswer.trim()}
                        style={{
                          borderRadius: "12px",
                          fontWeight: "500",
                          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                          transition: "all 0.3s ease",
                          height: "60px"
                        }}
                      >
                        {answered ? (
                          <>
                            {feedback.correct ? (
                              <>
                                <FiCheck className="me-2" size={20} /> Correct Answer!
                              </>
                            ) : (
                              <>
                                <FiX className="me-2" size={20} /> Incorrect Answer
                              </>
                            )}
                          </>
                        ) : (
                          "Submit Answer"
                        )}
                      </Button>
                    </motion.div>
                    
                    {/* Show correct answers if wrong */}
                    {answered && !feedback.correct && questionData.options && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="mt-3 p-3 rounded-lg"
                        style={{ 
                          background: "rgba(40, 167, 69, 0.1)",
                          border: "1px solid rgba(40, 167, 69, 0.2)",
                          borderRadius: "12px",
                          boxShadow: "0 3px 10px rgba(40, 167, 69, 0.1)"
                        }}
                      >
                        <p className="mb-1 fw-bold">Correct answer(s):</p>
                        <ul className="mb-0 ps-3">
                          {questionData.options
                            .filter(opt => opt.isCorrect)
                            .map((opt, i) => (
                              <li key={i} className="mb-1">{opt.option}</li>
                            ))
                          }
                        </ul>
                      </motion.div>
                    )}
                  </Form>
                </motion.div>
              </AnimatePresence>
            )}
            
            {/* Text Input Question */}
            {questionData.type === 'text' || questionData.type === 'number'&& (
              <AnimatePresence>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={textInputVariants}
                  className="mb-4"
                >
                  <Form onSubmit={handleTextSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="text"
                        placeholder="Type your answer here..."
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                        disabled={answered}
                        ref={textInputRef}
                        className="py-3 px-4"
                        style={{
                          borderRadius: "12px",
                          boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
                          fontSize: "1.1rem",
                          border: answered 
                            ? (feedback.correct ? "2px solid #28a745" : "2px solid #dc3545") 
                            : "2px solid #dee2e6",
                          transition: "all 0.3s ease"
                        }}
                      />
                    </Form.Group>
                    <Button 
                      type="submit" 
                      variant={answered ? (feedback.correct ? "success" : "danger") : "primary"}
                      className="w-100 py-3"
                      disabled={answered || !textAnswer.trim()}
                      style={{
                        borderRadius: "12px",
                        fontWeight: "500",
                        boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
                        transition: "all 0.3s ease"
                      }}
                    >
                      {answered ? (feedback.correct ? "Correct! ✓" : "Incorrect ✗") : "Submit Answer"}
                    </Button>
                    
                    {/* Show correct answers if wrong */}
                    {answered && !feedback.correct && questionData.options && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="mt-3 p-3 rounded"
                        style={{ 
                          background: "rgba(40, 167, 69, 0.1)",
                          border: "1px solid rgba(40, 167, 69, 0.2)" 
                        }}
                      >
                        <p className="mb-1 fw-bold">Correct answer(s):</p>
                        <ul className="mb-0 ps-3">
                          {questionData.options
                            .filter(opt => opt.isCorrect)
                            .map((opt, i) => (
                              <li key={i}>{opt.option}</li>
                            ))
                          }
                        </ul>
                      </motion.div>
                    )}
                  </Form>
                </motion.div>
              </AnimatePresence>
            )}
            
            {/* Feedback message - cải thiện thiết kế và animation */}
            <AnimatePresence>
              {feedback.visible && questionData.type !== 'text' && (
                <motion.div
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 20, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-4"
                >
                  <Alert 
                    variant={feedback.correct ? "success" : "danger"}
                    className="d-flex align-items-center"
                    style={{
                      borderRadius: "12px",
                      boxShadow: feedback.correct 
                        ? "0 4px 15px rgba(40, 167, 69, 0.15)" 
                        : "0 4px 15px rgba(220, 53, 69, 0.15)"
                    }}
                  >
                    <div className={`alert-icon me-3 ${feedback.correct ? 'text-success' : 'text-danger'}`}>
                      {feedback.correct 
                        ? <FiCheck size={24} /> 
                        : <FiX size={24} />
                      }
                    </div>
                    <div>
                      <h6 className="mb-1 fw-bold">
                        {feedback.correct ? "Correct!" : "Incorrect!"}
                      </h6>
                      <p className="mb-0 small">
                        {feedback.correct 
                          ? "Great job! You selected the right answer." 
                          : "The correct answer has been highlighted in green."}
                      </p>
                    </div>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Progress Bar with animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4, duration: 0.6 }}
              className="mt-3"
            >
              <ProgressBar 
                animated 
                now={(questionNumber / totalQuestions) * 100} 
                variant="success" 
                className="mt-4" 
                style={{ height: "10px", borderRadius: "5px" }}
              />
              <div className="d-flex justify-content-between mt-2">
                <p className="small">Question {questionNumber}/{totalQuestions}</p>
                <p className="fw-bold">{answered ? (feedback.correct ? `+${points} points` : '+0 points') : ''}</p>
              </div>
            </motion.div>
          </Col>

          {/* Media Section - Desktop view (right side) */}
          {!isMobile && questionData.media && (
            <Col lg={5} className="media-content d-flex align-items-start justify-content-center">
              {mediaSection}
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default QuestionGame;
