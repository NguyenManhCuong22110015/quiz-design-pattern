import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { sendAnswer } from '../../services/websocket';
import "../../styles/PlayGame.css";
import CreateLoading from '../common/CreateLoading';

const PlayGameModal = ({
    show, 
    onClose,
    currentQuestion,
    timer,
    showResults,
    allAnswers,
    gameEnded,
    finalResults,
    onAnswer
}) => {
    const { roomId } = useParams();
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [localTimer, setLocalTimer] = useState(timer);

    useEffect(() => {
        setLocalTimer(timer);
        if (timer > 0) {
            startTimer(timer);
        }
    }, [timer]);

    const startTimer = (time) => {
        const interval = setInterval(() => {
            setLocalTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    if (!selectedAnswer) {
                        handleAnswer(null);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleAnswer = (answer) => {
        if (!selectedAnswer) {
            setSelectedAnswer(answer);
            onAnswer(answer, localTimer);
        }
    };

    const renderContent = () => {
        if (gameEnded) {
            return (
                <div className="game-end">
                    <h2>Game Ended!</h2>
                    <div className="final-results">
                        {finalResults?.map((result, index) => (
                            <div key={index} className="result-item">
                                <span>{result.username}</span>
                                <span>{result.score} points</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (!currentQuestion) {
            return <div><CreateLoading/></div>;
        }

        return (
            <div className="question-container">
                <div className="timer">Time remaining: {timer}s</div>
                <h3>{currentQuestion.text}</h3>
                
                <div className="options">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            className={`option ${selectedAnswer === index ? 'selected' : ''} 
                                    ${showResults ? (index === currentQuestion.correctAnswer ? 'correct' : 'incorrect') : ''}`}
                            onClick={() => handleAnswer(index)}
                            disabled={selectedAnswer !== null || showResults}
                        >
                            {/* Access the option text correctly based on your data structure */}
                            {typeof option === 'object' ? option.option : option}
                        </button>
                    ))}
                </div>
                                
                {showResults && (
                    <div className="results">
                        <h4>Results:</h4>
                        {allAnswers.map((answer, index) => (
                            <div key={index} className="answer-item">
                                <span>{answer.username}</span>
                                <span>{answer.correct ? '✓' : '✗'}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };


    const endGame = () => {
        localStorage.removeItem(`gameInProgress_${roomId}`);
        onClose();
    };

    return (
        <Modal show={show} onHide={endGame} fullscreen>
            <Modal.Header closeButton>
                <Modal.Title>Quiz Game</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {renderContent()}
            </Modal.Body>
        </Modal>
    );
};

export default PlayGameModal;