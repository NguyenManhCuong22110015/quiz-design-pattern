import React, { useEffect, useState } from 'react';
import { Modal, Container, Row, Col, ProgressBar, Badge, Image } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { sendAnswer, sendNextQuestion } from '../../services/websocket';
import "../../styles/PlayGame.css";
import CreateLoading from '../common/CreateLoading';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { FaTrophy, FaMedal, FaAward } from 'react-icons/fa';
import { IoTimeOutline } from 'react-icons/io5';

const PlayGameModal = ({
    show,   
    onClose,
    currentQuestion,
    showResults,
    allAnswers,
    gameEnded,
    finalResults,
    onAnswer,
    currentQuestionNumber,
    totalQuestions,
    onRestart
}) => {
    const { roomId } = useParams();
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [imageError, setImageError] = useState(false);

    // Trigger confetti effect when game ends
    useEffect(() => {
        if (gameEnded) {
            const end = Date.now() + 3000;
            
            const runConfetti = () => {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    disableForReducedMotion: true
                });
                
                if (Date.now() < end) {
                    requestAnimationFrame(runConfetti);
                }
            };
            
            runConfetti();
        }
    }, [gameEnded]);

    const handleAnswer = (answer) => {
        if (selectedAnswer === null && !showResults) {
            setSelectedAnswer(answer);
            onAnswer(answer);
        }
    };

    useEffect(() => {
        setSelectedAnswer(null);
        setImageError(false);
    }, [currentQuestion]); 

    const handleNextQuestion = () => {
        setSelectedAnswer(null);
        sendNextQuestion(roomId);
    };

    const renderQuestion = () => (
        <Container className="py-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <Badge bg="primary" className="py-2 px-3 rounded-pill fs-6">
                                Question {currentQuestionNumber} of {totalQuestions}
                            </Badge>
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: "spring" }}
                            >
                                <Badge bg="secondary" className="py-2 px-3 rounded-pill">
                                    <IoTimeOutline className="me-1" /> Time Remaining
                                </Badge>
                            </motion.div>
                        </div>
                        <ProgressBar 
                            now={(currentQuestionNumber / totalQuestions) * 100} 
                            variant="info" 
                            style={{ height: "8px", borderRadius: "4px" }}
                            className="mb-4"
                        />
                    </Col>
                </Row>
                
                <Row className="mb-4 align-items-center">
                    <Col lg={currentQuestion.media && !imageError ? 7 : 12}>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h3 className="question-text mb-4">{currentQuestion.text}</h3>
                        </motion.div>
                        
                        <div className="options-grid">
                            {currentQuestion.options.map((option, index) => {
                                const isSelected = selectedAnswer === index;
                                const isCorrect = option.isCorrect;
                                const showIncorrect = showResults && isSelected && !isCorrect;
                                const showCorrect = showResults && isCorrect;

                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
                                        whileHover={!selectedAnswer && !showResults ? { scale: 1.02, x: 5 } : {}}
                                    >
                                        <button
                                            className={`option-card 
                                                ${isSelected ? 'selected' : ''} 
                                                ${showCorrect ? 'correct' : ''}
                                                ${showIncorrect ? 'incorrect' : ''}`
                                            }
                                            onClick={() => handleAnswer(index)}
                                            disabled={selectedAnswer !== null || showResults}
                                        >
                                            <div className="option-letter">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <div className="option-text">
                                                {option.text || option.option}
                                            </div>
                                            
                                            {showCorrect && (
                                                <motion.div 
                                                    className="option-icon correct-icon"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 500 }}
                                                >
                                                    ✓
                                                </motion.div>
                                            )}
                                            
                                            {showIncorrect && (
                                                <motion.div 
                                                    className="option-icon incorrect-icon"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 500 }}
                                                >
                                                    ✗
                                                </motion.div>
                                            )}
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </Col>
                    
                    {currentQuestion.media && !imageError && (
                        <Col lg={5}>
                            <motion.div 
                                className="media-container"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <Image 
                                    src={currentQuestion.media} 
                                    alt="Question media"
                                    fluid
                                    className="question-image"
                                    onError={() => setImageError(true)}
                                />
                            </motion.div>
                        </Col>
                    )}
                </Row>
                
                <AnimatePresence>
                    {showResults && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            transition={{ duration: 0.5 }}
                            className="results-container"
                        >
                            <h4 className="results-title">Results:</h4>
                            <Row className="answer-results">
                                {allAnswers.map((answer, index) => (
                                    <Col key={index} md={6} lg={4} xl={3}>
                                        <motion.div 
                                            className={`player-result-card ${answer.correct ? 'correct' : 'incorrect'}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <div className="player-avatar">
                                                {answer.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="player-info">
                                                <div className="player-name">{answer.username}</div>
                                                <div className="player-status">
                                                    {answer.correct ? 
                                                        <Badge bg="success">Correct</Badge> : 
                                                        <Badge bg="danger">Incorrect</Badge>
                                                    }
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Col>
                                ))}
                            </Row>
                            
                            {currentQuestionNumber <= totalQuestions && (
                                <motion.div 
                                    className="d-flex justify-content-center mt-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <motion.button 
                                        className="btn btn-primary btn-lg px-4 next-button"
                                        onClick={handleNextQuestion}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Next Question
                                    </motion.button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </Container>
    );
    
    const renderGameEnd = () => {
        const sortedResults = [...(allAnswers || [])].sort((a, b) => b.score - a.score);
        const topThree = sortedResults.slice(0, 3);
        const others = sortedResults.slice(3);
        
        return (
            <Container className="py-5">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="game-end-container text-center"
                >
                    <motion.h1 
                        className="display-4 fw-bold mb-3 game-end-title"
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                    >
                        Quiz Completed!
                    </motion.h1>
                    
                    <motion.p 
                        className="lead text-success mb-5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        Congratulations! You've completed all {totalQuestions} questions.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                    ></motion.div>
                        <h2 className="podium-title mb-5">Final Leaderboard</h2>

                        {topThree.length > 0 && (
                            <Row className="justify-content-center mb-5">
                                {/* Second Place */}
                                {topThree.length > 1 && (
                                    <Col md={4} lg={3} className="d-flex justify-content-center">
                                        <motion.div 
                                            className="podium-item second-place"
                                            initial={{ y: 100, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 1.1, type: "spring" }}
                                        >
                                            <div className="podium-avatar">
                                                {topThree[1].username.charAt(0).toUpperCase()}
                                                <div className="medal silver-medal">
                                                    <FaMedal size={24} />
                                                </div>
                                            </div>
                                            <div className="podium-name">{topThree[1].username}</div>
                                            <div className="podium-score">{topThree[1].score} pts</div>
                                            <div className="podium-base second"></div>
                                        </motion.div>
                                    </Col>
                                )}

                                {/* First Place */}
                                {topThree.length > 0 && (
                                    <Col md={4} lg={3} className="d-flex justify-content-center">
                                        <motion.div 
                                            className="podium-item first-place"
                                            initial={{ y: 100, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 1, type: "spring" }}
                                        >
                                            <motion.div 
                                                className="winner-crown"
                                                initial={{ y: -20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 1.8, type: "spring" }}
                                            >
                                                <FaTrophy color="gold" size={30} />
                                            </motion.div>
                                            <div className="podium-avatar">
                                                {topThree[0].username.charAt(0).toUpperCase()}
                                                <div className="medal gold-medal">
                                                    <FaMedal size={24} />
                                                </div>
                                            </div>
                                            <div className="podium-name">{topThree[0].username}</div>
                                            <div className="podium-score">{topThree[0].score} pts</div>
                                            <div className="podium-base first"></div>
                                        </motion.div>
                                    </Col>
                                )}

                                {/* Third Place */}
                                {topThree.length > 2 && (
                                    <Col md={4} lg={3} className="d-flex justify-content-center">
                                        <motion.div 
                                            className="podium-item third-place"
                                            initial={{ y: 100, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 1.2, type: "spring" }}
                                        >
                                            <div className="podium-avatar">
                                                {topThree[2].username.charAt(0).toUpperCase()}
                                                <div className="medal bronze-medal">
                                                    <FaMedal size={24} />
                                                </div>
                                            </div>
                                            <div className="podium-name">{topThree[2].username}</div>
                                            <div className="podium-score">{topThree[2].score} pts</div>
                                            <div className="podium-base third"></div>
                                        </motion.div>
                                    </Col>
                                )}
                            </Row>
                        )}

                        {/* Other Players */}
                        {others.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5 }}
                                className="other-players-container"
                            >
                                <h4 className="other-players-title mb-3">Other Players</h4>
                                <Row className="justify-content-center">
                                    {others.map((result, index) => (
                                        <Col key={index} md={6} lg={4} xl={3}>
                                            <motion.div 
                                                className="leaderboard-item"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 1.5 + (index * 0.1) }}
                                            >
                                                <div className="leaderboard-rank">
                                                    {index + 4}
                                                </div>
                                                <div className="leaderboard-avatar">
                                                    {result.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="leaderboard-info">
                                                    <div className="leaderboard-name">{result.username}</div>
                                                    <div className="leaderboard-score">{result.score} points</div>
                                                </div>
                                                <div className="leaderboard-award">
                                                    <FaAward size={16} color="#6c757d" />
                                                </div>
                                            </motion.div>
                                        </Col>
                                    ))}
                                </Row>
                            </motion.div>
                        )}
                   
                </motion.div>
            </Container>
        );
    };

    const renderContent = () => {
        if (currentQuestionNumber > totalQuestions || gameEnded) {
            return renderGameEnd();
        }
        if (!currentQuestion) {
            return (
                <div className="loading-container">
                    <CreateLoading />
                    <p className="loading-text">Loading next question...</p>
                </div>
            );
        }
        return renderQuestion();
    };

    const endGame = () => {
        localStorage.removeItem(`gameInProgress_${roomId}`);
        onClose();
    };

    return (
        <Modal show={show} onHide={endGame} fullscreen className="quiz-game-modal">
            <Modal.Header closeButton className="quiz-modal-header">
                <Modal.Title className="d-flex align-items-center">
                    <FaTrophy className="me-2 quiz-icon" />
                    Quiz Game 
                    {currentQuestion && (
                        <span className="ms-3 text-muted">
                            Question {currentQuestionNumber}/{totalQuestions}
                        </span>
                    )}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="quiz-modal-body">
                {renderContent()}
            </Modal.Body>
            {gameEnded && (
                <Modal.Footer className="quiz-modal-footer">
                    <motion.div className="w-100 d-flex justify-content-center gap-3">
                        <motion.button 
                            className="btn btn-secondary btn-lg px-4"
                            onClick={endGame}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Close Quiz
                        </motion.button>
                        <motion.button 
                            className="btn btn-primary btn-lg px-4"
                            onClick={onRestart}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Play Again
                        </motion.button>
                    </motion.div>
                </Modal.Footer>
            )}
        </Modal>
    );
};

export default PlayGameModal;