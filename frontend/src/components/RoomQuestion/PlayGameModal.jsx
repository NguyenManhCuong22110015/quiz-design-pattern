import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { sendAnswer, sendNextQuestion } from '../../services/websocket';
import "../../styles/PlayGame.css";
import CreateLoading from '../common/CreateLoading';

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

    const handleAnswer = (answer) => {
        if (selectedAnswer === null && !showResults) {
            setSelectedAnswer(answer);
            console.log("selectedAnswer", currentQuestion.options[answer]);
            onAnswer(answer);
        }
    };
    useEffect(() => {
        setSelectedAnswer(null);
    }, [currentQuestion]); 

    const handleNextQuestion = () => {
        setSelectedAnswer(null);
        sendNextQuestion(roomId);
    };

    const renderQuestion = () => (
        <div className="question-container">
            <div className="question-header">
                <div className="question-progress mb-3">
                    Question {currentQuestionNumber} of {totalQuestions}
                </div>
            </div>

            <h3 className="mb-4">{currentQuestion.text}</h3>
            
            <div className="options">
                {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = option.isCorrect;
                    const showIncorrect = showResults && isSelected && !isCorrect;
                    const showCorrect = showResults && isCorrect;

                    return (
                        <button
                            key={index}
                            className={`option 
                                ${isSelected ? 'selected' : ''} 
                                ${showCorrect ? 'correct' : ''}
                                ${showIncorrect ? 'incorrect' : ''}`
                            }
                            onClick={() => handleAnswer(index)}
                            disabled={selectedAnswer !== null || showResults}
                        >
                            {option.text || option.option}
                        </button>
                    );
                })}
            </div>
                            
            {showResults && (
                <>
                    <div className="results mt-4">
                        <h4>Results:</h4>
                        {allAnswers.map((answer, index) => (
                            <div key={index} className="answer-item">
                                <span>{answer.username}</span>
                                <span className={answer.correct ? 'text-success' : 'text-danger'}>
                                    {answer.correct ? '✓' : '✗'}
                                </span>
                            </div>
                        ))}
                    </div>
                    {currentQuestionNumber <= totalQuestions && (
                        <button 
                            className="btn btn-primary mt-4"
                            onClick={handleNextQuestion}
                        >
                            Next Question
                        </button>
                    )}
                </>
            )}
        </div>
    );
    
    const renderGameEnd = () => (
        <div className="game-end">
            <h2>Quiz Completed!</h2>
            <p className="text-success mb-4">
                You've completed all {totalQuestions} questions!
            </p>
            <div className="final-results">
                <h3>Final Scores:</h3>
                {allAnswers?.sort((a, b) => b.score - a.score).map((result, index) => (
                    <div key={index} className="result-item">
                        <span>{index + 1}. {result.username}</span>
                        <span>{result.score} points</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContent = () => {
        console.log("endGame"+gameEnded);
        if (currentQuestionNumber > totalQuestions || gameEnded) {
            return renderGameEnd();
        }
        if (!currentQuestion) {
            return <CreateLoading />;
        }
        return renderQuestion();
    };

    const endGame = () => {
        localStorage.removeItem(`gameInProgress_${roomId}`);
        onClose();
    };

    return (
        <Modal show={show} onHide={endGame} fullscreen>
            <Modal.Header closeButton>
                <Modal.Title>
                    Quiz Game 
                    {currentQuestion && (
                        <span className="ms-3 text-muted">
                            Question {currentQuestionNumber}/{totalQuestions}
                        </span>
                    )}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {renderContent()}
            </Modal.Body>
            {gameEnded && (
                <Modal.Footer>
                    <button 
                        className="btn btn-secondary me-2" 
                        onClick={endGame}
                    >
                        Close
                    </button>
                    <button 
                        className="btn btn-primary" 
                        onClick={onRestart}
                    >
                        Play Again
                    </button>
                </Modal.Footer>
            )}
        </Modal>
    );
};

export default PlayGameModal;