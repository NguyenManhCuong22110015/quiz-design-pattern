import React, { useEffect, useState, useRef } from 'react'
import QuestionGame from '../components/Questions/QuestionGame'
import { getQuestionsByQuizzId } from '../api/questionApi'
import { Button, Container, ProgressBar, Modal } from 'react-bootstrap'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import NavBar from '../layout/NavBar'
import CreateLoading from '../components/common/CreateLoading'
import { useAuth } from '../contexts/AuthContext'
import { checkProcess, initialResult, addAnswerToResult, completeResult } from '../api/resuiltAPI'
import { showError } from '../components/common/Notification'

const PlayPage = () => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [quizComplete, setQuizComplete] = useState(false);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [showCountdown, setShowCountdown] = useState(true);
    
    const [result, setResult] = useState(null);  
    const [userAnswers, setUserAnswers] = useState([]); 
    const [pendingAnswers, setPendingAnswers] = useState([]); 
    const [isInitialized, setIsInitialized] = useState(false); 
    
    // Lấy ID từ đường dẫn và thông tin người dùng
    const { id } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    // Tham chiếu cho timer lưu kết quả tự động
    const autoSaveTimerRef = useRef(null);
    
    // 1. Kiểm tra người dùng đã đăng nhập chưa và load dữ liệu
    useEffect(() => {
        if (!currentUser) {
            showError("Bạn cần đăng nhập để làm bài quiz!");
            navigate('/login', { state: { from: `/play/${id}` } });
            return;
        }
        
        const initializeQuiz = async () => {
            try {
                setLoading(true);
                
                // Load câu hỏi
                const questionsData = await getQuestionsByQuizzId(id);
                setQuestions(questionsData);
                
                // Kiểm tra tiến trình
                const checkData = {
                    quizId: id,
                    userId: currentUser.id
                };
                
                console.log("Checking progress for:", checkData);
                const existingResult = await checkProcess(checkData);
                
                if (existingResult && !existingResult.completed) {
                    console.log("Found existing result:", existingResult);
                    
                    // Nếu có tiến trình cũ chưa hoàn thành
                    setResult(existingResult);
                    
                    // Khôi phục câu trả lời đã lưu
                    if (existingResult.answers && existingResult.answers.length > 0) {
                        setUserAnswers(existingResult.answers);
                        
                        // Tìm câu hỏi tiếp theo chưa làm thay vì lấy câu cuối cùng đã làm
                        const answeredQuestionIds = new Set(
                            existingResult.answers.map(answer => answer.questionId)
                        );
                        
                        // Tìm index câu hỏi đầu tiên chưa được trả lời
                        let nextUnansweredIndex = questionsData.findIndex(
                            question => !answeredQuestionIds.has(question._id)
                        );
                        
                        // Nếu tất cả câu hỏi đã được trả lời, đặt index vào cuối
                        if (nextUnansweredIndex === -1) {
                            nextUnansweredIndex = questionsData.length - 1;
                        }
                        
                        // Đặt vị trí câu hỏi hiện tại vào câu tiếp theo chưa làm
                        setCurrentQuestionIndex(nextUnansweredIndex);
                        
                        // Cập nhật điểm số từ câu trả lời đã lưu
                        const savedScore = existingResult.answers.reduce(
                            (total, answer) => total + (answer.isCorrect ? answer.points || 100 : 0),
                            0
                        );
                        setScore(savedScore);
                        
                        // Đánh dấu chưa trả lời cho câu hỏi hiện tại nếu là câu mới
                        const isCurrentQuestionAnswered = existingResult.answers.some(
                            answer => answer.questionId === questionsData[nextUnansweredIndex]?._id
                        );
                        setAnswered(isCurrentQuestionAnswered);
                    }
                } else {
                    // Tạo kết quả mới nếu chưa có hoặc đã hoàn thành
                    console.log("Creating new result");
                    const newResult = await initialResult({
                        quizId: id,
                        userId: currentUser.id
                    });
                    setResult(newResult);
                }
                
                setIsInitialized(true);
            } catch (error) {
                console.error("Error initializing quiz:", error);
                showError("Không thể tải bài quiz. Vui lòng thử lại sau!");
            } finally {
                setLoading(false);
            }
        };
        
        initializeQuiz();
        
        // Cleanup function
        return () => {
            if (autoSaveTimerRef.current) {
                clearInterval(autoSaveTimerRef.current);
            }
        };
    }, [id, currentUser, navigate]);
    
    // 2. Tự động lưu kết quả
    useEffect(() => {
        if (!isInitialized || !result) return;
        
        autoSaveTimerRef.current = setInterval(() => {
            saveAnswers();
        }, 10000); 
        
        return () => {
            if (autoSaveTimerRef.current) {
                clearInterval(autoSaveTimerRef.current);
            }
        };
    }, [isInitialized, result]);
    
    // 3. Hàm lưu câu trả lời
    const saveAnswers = async (forceComplete = false) => {
        console.log(result);
        if (!result || !result._id) {
            console.log("No result to save to");
            return;
        }
        
        try {
            // Kết hợp cả câu trả lời cũ và mới để gửi lên server
            const allAnswers = [...userAnswers, ...pendingAnswers];
            
            console.log("Saving all answers:", allAnswers);
            
            // Gọi API lưu tất cả câu trả lời
            await addAnswerToResult({
                resultId: result._id,
                answers: allAnswers,
                completed: forceComplete
            });
            
            // Cập nhật state sau khi lưu thành công
            setUserAnswers(allAnswers);
            setPendingAnswers([]);
            
            if (forceComplete) {
                // Đánh dấu hoàn thành bài quiz
                await completeResult({
                    resultId: result.id,
                    score: score,
                    accuracy: (score / (questions.length * 100)) * 100
                });
            }
        } catch (error) {
            console.error("Error saving answers:", error);
            // Không hiển thị lỗi cho người dùng để tránh làm gián đoạn quá trình làm bài
        }
    };
    
    // 4. Đếm ngược trước khi bắt đầu
    useEffect(() => {
        if (loading || quizComplete) return;
        
        if (countdown > 0 && showCountdown) {
            const timer = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 500);
            
            return () => clearTimeout(timer);
        } else if (countdown === 0 && showCountdown) {
            setTimeout(() => {
                setShowCountdown(false);
            }, 500); 
        }
    }, [countdown, showCountdown, loading, quizComplete]);
    
    // 5. Xử lý khi người dùng trả lời câu hỏi
    const handleAnswer = (answer, isCorrect, points = 100) => {
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) return;
        
        // Kiểm tra xem câu hỏi này đã có câu trả lời trong userAnswers chưa
        const existingAnswerIndex = userAnswers.findIndex(
            a => a.questionId === currentQuestion._id
        );
        
        // Tạo đối tượng câu trả lời
        const newAnswer = {
            questionId: currentQuestion._id,
            selectedOption: answer,
            isCorrect: isCorrect,
            points: points,
            timeTaken: 0 // Có thể thêm tính năng đo thời gian sau
        };
        
        // Xử lý câu trả lời cũ nếu có
        if (existingAnswerIndex !== -1) {
            // Nếu đã có trả lời cũ
            const oldAnswer = userAnswers[existingAnswerIndex];
            
            // Cập nhật điểm số
            if (oldAnswer.isCorrect && !isCorrect) {
                // Nếu trước đúng giờ sai, trừ điểm
                setScore(prev => prev - oldAnswer.points);
            } else if (!oldAnswer.isCorrect && isCorrect) {
                // Nếu trước sai giờ đúng, cộng điểm
                setScore(prev => prev + points);
            }
            
            // Cập nhật userAnswers
            const updatedAnswers = [...userAnswers];
            updatedAnswers[existingAnswerIndex] = newAnswer;
            setUserAnswers(updatedAnswers);
        } else {
            // Nếu là câu trả lời mới
            if (isCorrect) {
                setScore(prevScore => prevScore + points);
            }
            
            // Thêm vào userAnswers
            setUserAnswers(prev => [...prev, newAnswer]);
        }
        
        // Thêm vào pendingAnswers để lưu
        const pendingIndex = pendingAnswers.findIndex(
            a => a.questionId === currentQuestion._id
        );
        
        if (pendingIndex !== -1) {
            // Cập nhật pendingAnswers nếu đã có
            const updatedPending = [...pendingAnswers];
            updatedPending[pendingIndex] = newAnswer;
            setPendingAnswers(updatedPending);
        } else {
            // Thêm mới vào pendingAnswers
            setPendingAnswers(prev => [...prev, newAnswer]);
        }
        
        // Đánh dấu đã trả lời
        setAnswered(true);
    };
    
    // 6. Xử lý khi chuyển câu hỏi
    const handleNextQuestion = async () => {
        // Lưu câu trả lời khi chuyển câu hỏi
        await saveAnswers();
        
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setAnswered(false);
            
            // Kiểm tra xem câu tiếp theo đã được trả lời chưa
            const nextQuestion = questions[currentQuestionIndex + 1];
            if (nextQuestion) {
                const isNextAnswered = userAnswers.some(
                    answer => answer.questionId === nextQuestion._id
                );
                
                if (isNextAnswered) {
                    // Nếu câu tiếp theo đã được trả lời, tìm câu chưa trả lời
                    const answeredIds = new Set(userAnswers.map(a => a.questionId));
                    let foundUnanswered = false;
                    
                    // Tìm từ câu tiếp theo đến cuối
                    for (let i = currentQuestionIndex + 1; i < questions.length; i++) {
                        if (!answeredIds.has(questions[i]._id)) {
                            setCurrentQuestionIndex(i);
                            foundUnanswered = true;
                            break;
                        }
                    }
                    
                    // Nếu không tìm thấy, hiển thị câu tiếp theo bình thường
                    if (!foundUnanswered) {
                        setAnswered(isNextAnswered);
                    }
                }
            }
        } else {
            // Khi hoàn thành bài quiz
            await saveAnswers(true); // Lưu và đánh dấu hoàn thành
            setQuizComplete(true);
        }
    };
    
    // Hàm để chuyển đến câu chưa trả lời
    const goToUnansweredQuestion = () => {
        const answeredIds = new Set(userAnswers.map(a => a.questionId));
        
        // Tìm từ vị trí hiện tại đến cuối
        for (let i = currentQuestionIndex + 1; i < questions.length; i++) {
            if (!answeredIds.has(questions[i]._id)) {
                setCurrentQuestionIndex(i);
                setAnswered(false);
                return true;
            }
        }
        
        // Tìm từ đầu đến vị trí hiện tại
        for (let i = 0; i < currentQuestionIndex; i++) {
            if (!answeredIds.has(questions[i]._id)) {
                setCurrentQuestionIndex(i);
                setAnswered(false);
                return true;
            }
        }
        
        // Không tìm thấy câu nào chưa trả lời
        return false;
    };
    
    // 7. Xử lý hoàn thành quiz
    const handleFinishQuiz = async () => {
        try {
            await saveAnswers(true);
            setQuizComplete(true);
        } catch (error) {
            console.error("Error finishing quiz:", error);
            showError("Có lỗi khi hoàn thành bài quiz. Kết quả của bạn đã được lưu một phần.");
            setQuizComplete(true);
        }
    };
    
    // 8. Xử lý làm lại quiz
    const restartQuiz = async () => {
        try {
            setLoading(true);
            
            // Tạo bản ghi kết quả mới
            const newResult = await initialResult({
                quizId: id,
                userId: currentUser.id
            });
            
            // Reset tất cả state
            setResult(newResult);
            setUserAnswers([]);
            setPendingAnswers([]);
            setCurrentQuestionIndex(0);
            setScore(0);
            setQuizComplete(false);
            setAnswered(false);
            setCountdown(5);
            setShowCountdown(true);
        } catch (error) {
            console.error("Error restarting quiz:", error);
            showError("Không thể bắt đầu lại bài quiz. Vui lòng thử lại sau!");
        } finally {
            setLoading(false);
        }
    };
    
    // Component đếm ngược
    const CountdownOverlay = () => (
        <div 
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{ 
                background: 'rgba(0, 0, 0, 0.8)',
                zIndex: 1050
            }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={countdown}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    {countdown > 0 ? (
                        <div className="d-flex flex-column align-items-center">
                            <h1 className="display-1 text-white fw-bold">{countdown}</h1>
                            <p className="text-white fs-4 mt-3">Get Ready!</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column align-items-center">
                            <h1 className="display-1 text-success fw-bold">GO!</h1>
                            <p className="text-white fs-4 mt-3">Good luck!</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
    
    if (loading) {
        return <CreateLoading />;
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
                    <Button variant="primary" size="lg" onClick={restartQuiz} className="me-2">
                        Play Again
                    </Button>
                    <Button variant="outline-primary" size="lg" onClick={() => navigate(`/quiz-detail/${id}`)}>
                        Back to Quiz Details
                    </Button>
                </motion.div>
            </Container>
        );
    }

    return (
        <>
            {showCountdown && <CountdownOverlay />}
            
            <Container className="position-relative py-4">
                <NavBar/>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>Quiz Progress</h4>
                    <div className="d-flex align-items-center">
                        <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-3"
                            onClick={() => {
                                if (!goToUnansweredQuestion()) {
                                    showError("Tất cả câu hỏi đã được trả lời!");
                                }
                            }}
                        >
                            Câu chưa trả lời
                        </Button>
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
                        onAnswer={handleAnswer}
                        defaultAnswer={userAnswers.find(a => a.questionId === questions[currentQuestionIndex]?._id)?.selectedOption}
                    />
                }
                
                {/* Navigation button */}
                <div className="text-center mt-4 d-flex justify-content-between">
                    <div className="score-display">
                        <h5>Score: {score} points</h5>
                        {pendingAnswers.length > 0 && (
                            <small className="text-muted">
                                Answers will be saved automatically
                            </small>
                        )}
                    </div>
                    
                    <div>
                        {currentQuestionIndex < questions.length - 1 ? (
                            <Button 
                                variant="primary" 
                                size="lg" 
                                onClick={handleNextQuestion}
                                disabled={!answered && questions.length > 0}
                            >
                                Next Question
                            </Button>
                        ) : (
                            <Button 
                                variant="success" 
                                size="lg" 
                                onClick={handleFinishQuiz}
                                disabled={!answered && questions.length > 0}
                            >
                                Finish Quiz
                            </Button>
                        )}
                    </div>
                </div>
            </Container>
        </>
    );
}

export default PlayPage