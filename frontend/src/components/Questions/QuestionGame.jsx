import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, ProgressBar, Image, Alert, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/QuestionGame.css";
import CreateLoading from "../common/CreateLoading";
import DOMPurify from 'dompurify';
import { FiCheck, FiX, FiCheckCircle } from 'react-icons/fi';
import ConfidenceDecorator from "../../decorators/ConfidenceDecorator";
import ComboProgressBar from "../../decorators/ComboProgressBar";
import { useComboDecorator } from "../../decorators/useComboDecorator";
import MotivationalDecorator from "../../decorators/MotivationalDecorator";
import PowerUpDecorator from "../../decorators/PowerUpDecorator";
import "../../decorators/ConfidenceDecorator.css";
import "../../decorators/MotivationalDecorator.css";

const QuestionGame = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  onAnswerSelect,
  selectedAnswer: propSelectedAnswer,
  showResult,
  answerFeedback,
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
  
  // State cho ConfidenceDecorator
  const [multiplier, setMultiplier] = useState(1);

  // Combo hook
  const { combo, comboBonus, answer: comboAnswer } = useComboDecorator();
  
  // Animation states
  const [questionVisible, setQuestionVisible] = useState(false);
  const [answersVisible, setAnswersVisible] = useState(
    Array(questionData?.options?.length || 0).fill(false)
  );
  const [mediaVisible, setMediaVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // New states for 50:50 feature
  const [fiftyFiftyIndexes, setFiftyFiftyIndexes] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
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
      if (questionData.type === 'text') {
        setTextAnswer(defaultAnswer);
        setAnswered(true);
      } else {
        if (questionData.type === 'MULTIPLE_ANSWER' && Array.isArray(defaultAnswer)) {
          const defaultIndices = defaultAnswer.map(answer =>
            questionData.options?.findIndex(opt => opt.option === answer)
          ).filter(index => index !== -1);
          
          if (defaultIndices.length > 0) {
            setSelectedAnswer(defaultIndices);
            setAnswered(true);
          }
        } else if (questionData.type !== 'MULTIPLE_ANSWER') {
          const defaultIndex = questionData.options?.findIndex(
            opt => opt.option === defaultAnswer
          );
  
          if (defaultIndex !== -1) {
            setSelectedAnswer(defaultIndex);
            setAnswered(true);
            const isCorrect = questionData.options[defaultIndex].isCorrect;
            setFeedback({
              visible: true,
              correct: isCorrect
            });
          }
        }
      }
    } else {
      setSelectedAnswer(null);
      setAnswered(false);
      setTextAnswer('');
    }

    // Animation timers
    const questionTimer = setTimeout(() => setQuestionVisible(true), 400);

    if (questionData.options && questionData.options.length > 0) {
      questionData.options.forEach((_, index) => {
        setTimeout(() => {
          setAnswersVisible(prev => {
            const newArr = [...prev];
            newArr[index] = true;
            return newArr;
          });
        }, 900 + index * 250);
      });
    }

    const mediaTimer = setTimeout(() => setMediaVisible(true), 2200);

    if (questionData.type === 'text' && textInputRef.current) {
      setTimeout(() => {
        textInputRef.current.focus();
      }, 1500);
    }

    setFiftyFiftyIndexes([]);
    setTimeLeft(30);

    return () => {
      clearTimeout(questionTimer);
      clearTimeout(mediaTimer);
    };
  }, [questionData, defaultAnswer]);

  useEffect(() => {
    if (timeLeft <= 0 || answered) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, answered]);

  // Handle answer selection for multiple choice
  const handleAnswerClick = (index) => {
    if (answered || isLocked) return;
    
    const selectedOption = questionData?.options?.[index]?.option || '';
    
    if (questionData.type === 'MULTIPLE_ANSWER') {
      setSelectedAnswer(prev => {
        if (!prev || !Array.isArray(prev)) {
          const newSelection = [index];
          const newSelectedOptions = [selectedOption];
          onAnswerSelect(newSelectedOptions);
          return newSelection;
        }
        
        let newSelection;
        if (prev.includes(index)) {
          newSelection = prev.filter(i => i !== index);
        } else {
          newSelection = [...prev, index];
        }
        
        const newSelectedOptions = newSelection.map(i => questionData.options[i]?.option).filter(Boolean);
        onAnswerSelect(newSelectedOptions);
        
        return newSelection;
      });
    } else {
      setSelectedAnswer(index);
      onAnswerSelect(selectedOption);
    }
  };

  // Handle text answer submission
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (answered || !textAnswer.trim() || isLocked) return;
    
    onAnswerSelect(textAnswer);
  };

  // Sử dụng props từ parent để hiển thị kết quả
  useEffect(() => {
    if (showResult && answerFeedback) {
        setAnswered(true);
        setFeedback({
            visible: true,
            correct: answerFeedback.isCorrect
        });
        
        if (propSelectedAnswer && questionData.options) {
            if (questionData.type === 'MULTIPLE_ANSWER' && Array.isArray(propSelectedAnswer)) {
                const answerIndices = propSelectedAnswer.map(answer => 
                    questionData.options.findIndex(opt => opt.option === answer)
                ).filter(index => index !== -1);
                setSelectedAnswer(answerIndices);
            } else if (questionData.type !== 'MULTIPLE_ANSWER') {
                const answerIndex = questionData.options.findIndex(
                    opt => opt.option === propSelectedAnswer
                );
                if (answerIndex !== -1) {
                    setSelectedAnswer(answerIndex);
                }
            }
        }
    } else {
        if (!defaultAnswer) {
            setAnswered(false);
        }
        setFeedback({ visible: false, correct: false });
        
        if (propSelectedAnswer && questionData.options) {
            if (questionData.type === 'MULTIPLE_ANSWER' && Array.isArray(propSelectedAnswer)) {
                const answerIndices = propSelectedAnswer.map(answer => 
                    questionData.options.findIndex(opt => opt.option === answer)
                ).filter(index => index !== -1);
                setSelectedAnswer(answerIndices);
            } else if (questionData.type !== 'MULTIPLE_ANSWER') {
                const answerIndex = questionData.options.findIndex(
                    opt => opt.option === propSelectedAnswer
                );
                setSelectedAnswer(answerIndex !== -1 ? answerIndex : null);
            }
        }
    }
}, [showResult, answerFeedback, propSelectedAnswer, questionData.options, defaultAnswer, questionData.type]);

  // Animation variants
  const questionVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 1, 0.5, 1],
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
        delay: 0.4 + custom * 0.15,
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
        delay: 0.5,
        ease: [0.34, 1.56, 0.64, 1]
      }
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

  if (!questionData) {
    return <CreateLoading />;
  }

  // Function to render media
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
                e.target.src = 'https://placehold.co/400x300?text=Image+Unavailable';
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

  // Rich Text rendering
  const renderRichText = (htmlContent) => {
    const sanitizedHtml = DOMPurify.sanitize(htmlContent);
    return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
  };

  // Render answer button
  const renderAnswerButton = (option, index) => {
    const isSelected = questionData.type === 'MULTIPLE_ANSWER' 
        ? (Array.isArray(selectedAnswer) && selectedAnswer.includes(index))
        : selectedAnswer === index;
        
    const isCorrect = showResult && answerFeedback && option.isCorrect;
    const isWrong = showResult && answerFeedback && isSelected && !answerFeedback.isCorrect;
    
    let variant = "outline-primary";
    if (showResult && answerFeedback) {
        if (isCorrect) {
            variant = "success";
        } else if (isWrong) {
            variant = "danger";
        } else if (isSelected) {
            variant = "outline-primary";
        } else {
            variant = "outline-secondary";
        }
    } else if (isSelected) {
        variant = "primary";
    }

    return (
        <Button 
            variant={variant}
            className={`w-100 py-3 position-relative answer-button ${!answered && !isLocked ? 'answer-button-hover' : ''}`}
            onClick={() => !answered && !isLocked && handleAnswerClick(index)}
            disabled={answered || isLocked}
            style={{
                borderRadius: '12px',
                border: '2px solid',
                transition: 'all 0.3s ease',
                minHeight: '80px'
            }}
        >
            <div className="d-flex align-items-center justify-content-between">
                <span className="flex-grow-1 text-start">{option.option}</span>
                <div className="ms-2 d-flex align-items-center">
                    {questionData.type === 'MULTIPLE_ANSWER' && (
                        <div className={`me-2 ${isSelected ? 'text-white' : 'text-muted'}`}>
                            {isSelected ? '☑️' : '☐'}
                        </div>
                    )}
                    
                    {showResult && answerFeedback && (
                        <>
                            {isCorrect && <FiCheckCircle className="text-white" size={20} />}
                            {isWrong && <FiX className="text-white" size={20} />}
                        </>
                    )}
                </div>
            </div>
        </Button>
    );
  };

  return (
    <div className="question-game-container py-4">
      <Container>
        <Row className="align-items-start justify-content-between">
          {isMobile && questionData.media && mediaSection}

          <Col lg={questionData.media ? 7 : 12} className="question-content mb-4">
            <div>Thời gian còn lại: {timeLeft} giây</div>
            <ConfidenceDecorator baseScore={points} onMultiplierChange={setMultiplier} />
            <ComboProgressBar combo={combo} />
            
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

            {/* Multiple Choice Questions */}
            {questionData.type !== 'text' && questionData.options && questionData.options.map((option, index) => (
              !fiftyFiftyIndexes.includes(index) && (
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
                      {renderAnswerButton(option, index)}
                    </motion.div>
                  )}
                </AnimatePresence>
              )
            ))}

            {/* Text Input Question */}
            {(questionData.type === 'text' || questionData.type === 'number') && (
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

            {/* Feedback message */}
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
                  <MotivationalDecorator isCorrect={feedback.visible ? feedback.correct : undefined} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Bar */}
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
                <p className="fw-bold">{answered ? (feedback.correct ? `+${points * multiplier + comboBonus} points` : '+0 points') : ''}</p>
                <PowerUpDecorator onPowerUp={(type) => {
                  if (type === "5050" && questionData.options) {
                    const wrongIndexes = questionData.options
                      .map((opt, idx) => (!opt.isCorrect ? idx : null))
                      .filter(idx => idx !== null);
                    const toRemove = [];
                    while (toRemove.length < 2 && wrongIndexes.length > 0) {
                      const randIdx = Math.floor(Math.random() * wrongIndexes.length);
                      toRemove.push(wrongIndexes[randIdx]);
                      wrongIndexes.splice(randIdx, 1);
                    }
                    setFiftyFiftyIndexes(toRemove);
                  }
                  if (type === "extraTime") {
                    setTimeLeft(prev => prev + 15);
                  }
                }} />
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
