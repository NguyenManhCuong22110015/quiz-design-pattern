import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, ProgressBar, Image, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/QuestionGame.css";
import CreateLoading from "../common/CreateLoading";

const QuestionGame = ({ question, questionNumber, totalQuestions, onScoreUpdate }) => {
  // Handle if question is an array with one item
  const questionData = Array.isArray(question) ? question[0] : question;
  
  console.log("Question Data:", questionData); // Debug - check what's being received
  console.log("Options:", questionData?.options); // Debug - check options specifically
  
  const [questionVisible, setQuestionVisible] = useState(false);
  const [answersVisible, setAnswersVisible] = useState(
    Array(questionData?.options?.length || 0).fill(false)
  );
  const [imageVisible, setImageVisible] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState({ visible: false, correct: false });
  const [points, setPoints] = useState(100);

  useEffect(() => {
    if (!questionData) return;
    
    console.log("Setting up animations for", questionData.options?.length, "options");
    
    // Reset states when question changes
    setQuestionVisible(false);
    setAnswersVisible(Array(questionData.options?.length || 0).fill(false));
    setImageVisible(false);
    setSelectedAnswer(null);
    setAnswered(false);
    setFeedback({ visible: false, correct: false });
    
    // Smoother sequential animations with varied timing
    const questionTimer = setTimeout(() => setQuestionVisible(true), 400);
    
    // Staggered answer appearance - FIXED to ensure it works
    if (questionData.options && questionData.options.length > 0) {
      questionData.options.forEach((_, index) => {
        const timer = setTimeout(() => {
          setAnswersVisible(prev => {
            const newArr = [...prev];
            newArr[index] = true;
            return newArr;
          });
          console.log(`Setting option ${index} visible`);
        }, 900 + index * 250);
        
        // Clean up this timer too
        return () => clearTimeout(timer);
      });
    }
    
    // Reveal image after answers
    const imageTimer = setTimeout(() => setImageVisible(true), 2200);
    
    // Cleanup timers on unmount
    return () => {
      clearTimeout(questionTimer);
      clearTimeout(imageTimer);
    };
  }, [questionData]);

  // Handle answer selection
  const handleAnswerClick = (index) => {
    if (answered) return; // Prevent selecting another answer after first selection
    
    setSelectedAnswer(index);
    setAnswered(true);
    
    // Check if answer is correct
    const isCorrect = questionData?.options?.[index]?.isCorrect || false;
    
    // Calculate points - you could make this more complex
    const earnedPoints = isCorrect ? points : 0;
    
    // Show feedback
    setFeedback({
      visible: true,
      correct: isCorrect
    });
    
    // Notify parent component about score update
    onScoreUpdate(earnedPoints);
  };

  // Animation variants for framer-motion
  const questionVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };
  
  const answerVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: (custom) => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5, 
        delay: 0.7 + custom * 0.2,
        ease: "easeOut" 
      }
    })
  };
  
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.8, 
        delay: 1.8,
        ease: [0.34, 1.56, 0.64, 1] // Spring-like effect
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

  // If no question data is provided, show a loading state
  if (!questionData) {
    return (
      <CreateLoading/>
    );
  }

  return (
    <>
      <Container className="d-flex vh-100 align-items-center justify-content-center">
        <Row className="w-100 align-items-center">
          {/* Left Side - Question and Answers */}
          <Col md={6} className="text-center text-md-start">
            <AnimatePresence>
              {questionVisible && (
                <motion.h1 
                  className="mb-4"
                  initial="hidden"
                  animate="visible"
                  variants={questionVariants}
                >
                  {questionData.text}
                </motion.h1>
              )}
            </AnimatePresence>
            
            {/* Answer Buttons with Framer Motion */}
            {questionData.options && questionData.options.map((option, index) => (
              <AnimatePresence key={index}>
                {answersVisible[index] && (
                  <motion.div 
                    initial="hidden"
                    animate="visible"
                    custom={index}
                    variants={answerVariants}
                    className="mb-3"
                  >
                    <Button 
                      variant={!answered 
                        ? "outline-primary" 
                        : (selectedAnswer === index 
                          ? (option.isCorrect ? "success" : "danger") 
                          : option.isCorrect && selectedAnswer !== null 
                            ? "success" : "outline-secondary")}
                      className="w-100 py-3 position-relative answer-button"
                      onClick={() => handleAnswerClick(index)}
                      disabled={answered}
                      style={{
                        boxShadow: selectedAnswer === index 
                          ? (option.isCorrect ? "0 0 0 3px rgba(40, 167, 69, 0.5)" : "0 0 0 3px rgba(220, 53, 69, 0.5)") 
                          : option.isCorrect && answered ? "0 0 0 3px rgba(40, 167, 69, 0.5)" : "0 5px 15px rgba(0,0,0,0.08)",
                        opacity: answered && selectedAnswer !== index && !option.isCorrect ? 0.7 : 1,
                        borderWidth: "2px",
                        borderRadius: "12px",
                        transition: "all 0.3s ease",
                        textAlign: "left",
                        paddingLeft: "60px",
                        fontWeight: "500",
                        fontSize: "1.1rem",
                        transform: answered && (selectedAnswer === index || option.isCorrect) 
                          ? "translateY(-3px)" 
                          : "translateY(0)",
                        marginBottom: "15px"
                      }}
                    >
                      {/* Answer Letter Label */}
                      <div 
                        className="position-absolute d-flex align-items-center justify-content-center"
                        style={{
                          left: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "40px",
                          height: "40px",
                          borderRadius: "8px",
                          background: !answered 
                            ? "#e9ecef" 
                            : (selectedAnswer === index 
                              ? (option.isCorrect ? "#28a745" : "#dc3545") 
                              : option.isCorrect ? "#28a745" : "#e9ecef"),
                          color: !answered || (!option.isCorrect && selectedAnswer !== index) 
                            ? "#495057" 
                            : "#ffffff",
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                          transition: "all 0.3s ease"
                        }}
                      >
                        {String.fromCharCode(65 + index)} {/* A, B, C, D, etc. */}
                      </div>

                      <span>{option.option}</span>
                      
                      {/* Correct/Incorrect Icons */}
                      {answered && option.isCorrect && (
                        <motion.div 
                          className="position-absolute d-flex align-items-center justify-content-center"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                          style={{
                            right: "15px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: "#28a745",
                            color: "#fff"
                          }}
                        >
                          ✓
                        </motion.div>
                      )}
                      
                      {answered && selectedAnswer === index && !option.isCorrect && (
                        <motion.div 
                          className="position-absolute d-flex align-items-center justify-content-center"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                          style={{
                            right: "15px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: "#dc3545",
                            color: "#fff"
                          }}
                        >
                          ✗
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
            
            {/* Feedback message */}
            <AnimatePresence>
              {feedback.visible && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={feedbackVariants}
                  className="mt-4"
                >
                  <Alert variant={feedback.correct ? "success" : "danger"}>
                    {feedback.correct 
                      ? "Correct! Well done!" 
                      : "Incorrect! The right answer has been highlighted."}
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

          {/* Right Side - Image */}
          <Col md={6} className="text-center">
            <AnimatePresence>
              {imageVisible && questionData.image && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={imageVariants}
                >
                  <Image 
                    src={questionData.image} 
                    fluid 
                    rounded
                    className="shadow" 
                    style={{ maxWidth: "90%" }}
                    alt="Question illustration"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default QuestionGame;
