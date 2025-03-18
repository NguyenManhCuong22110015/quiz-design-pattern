import React, { useEffect, useState } from 'react'
import QuestionGame from '../components/Questions/QuestionGame'
import { getQuestionsByQuizzId } from '../api/questionApi'
import { Button, Container, ProgressBar } from 'react-bootstrap'
import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import NavBar from '../layout/NavBar'



const PlayPage = () => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [quizComplete, setQuizComplete] = useState(false);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(false);
    
    const id = useParams().id;
    
    useEffect(() => {
        const getData = async () => {
            try {
                setLoading(true);
                
                const response = await getQuestionsByQuizzId(id);
                setQuestions(response);
                setLoading(false);
            }
            catch (error) {
                console.error(error);
                setLoading(false);
            }
        }
        getData();
    }, [id]);
    
    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setAnswered(false);
        } else {
            setQuizComplete(true);
        }
    };
    
    const handleScoreUpdate = (points) => {
        setScore(prevScore => prevScore + points);
        setAnswered(true);
    };
    
    const restartQuiz = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setQuizComplete(false);
        setAnswered(false);
    };
    
    if (loading) {
        return <Container className="text-center py-5"><h3>Loading quiz...</h3></Container>;
    }
    
    if (quizComplete) {
        return (
            <Container className="text-center py-5">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="mb-4">Quiz Complete! 🎉</h2>
                    <h3 className="mb-3">Your Score: {score} points</h3>
                    <ProgressBar 
                        now={(score / (questions.length * 100)) * 100} 
                        variant="success" 
                        className="mb-4" 
                        style={{ height: "15px", borderRadius: "10px" }}
                    />
                    <Button variant="primary" size="lg" onClick={restartQuiz}>
                        Play Again
                    </Button>
                </motion.div>
            </Container>
        );
    }

    return (
        <Container className="position-relative py-4">
            <NavBar/>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Quiz Progress</h4>
                <div className="quiz-counter">
                    <span className="fw-bold">Question {currentQuestionIndex + 1}/{questions.length}</span>
                </div>
            </div>
            
            <ProgressBar 
                now={((currentQuestionIndex + 1) / questions.length) * 100} 
                variant="primary" 
                className="mb-4"
                style={{ height: "8px", borderRadius: "4px" }}
            />
            
            {/* Question content */}
            {questions.length > 0 && 
                <QuestionGame 
                    question={questions[currentQuestionIndex]} 
                    questionNumber={currentQuestionIndex + 1}
                    totalQuestions={questions.length}
                    onScoreUpdate={handleScoreUpdate}
                />
            }
            
            {/* Navigation button */}
            <div className="text-center mt-4 d-flex justify-content-between">
                <div className="score-display">
                    <h5>Score: {score} points</h5>
                </div>
                <Button 
                    variant="primary" 
                    size="lg" 
                    onClick={handleNextQuestion}
                    disabled={!answered && questions.length > 0}
                >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </Button>
            </div>
        </Container>
    );
}

export default PlayPage