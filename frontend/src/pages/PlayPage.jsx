import React, { useEffect, useState, useRef } from 'react'
import QuestionGame from '../components/Questions/QuestionGame'
import { getQuestionsByQuizzId } from '../api/questionApi'
import { Button, Container, ProgressBar, Badge } from 'react-bootstrap'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import NavBar from '../layout/NavBar'
import CreateLoading from '../components/common/CreateLoading'
import { useAuth } from '../contexts/AuthContext'
import { checkProcess, initialResult, addAnswerToResult, completeResult } from '../api/resuiltAPI'
import { showError, showSuccess } from '../components/common/Notification'

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
    const [disableAnswerChange, setDisableAnswerChange] = useState(false);
    
    // Lấy ID từ đường dẫn và thông tin người dùng
    const { id } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    // Tham chiếu cho timer lưu kết quả tự động
    const autoSaveTimerRef = useRef(null);
    // Thêm ref để theo dõi việc đã khởi tạo chưa
    const isInitializedRef = useRef(false);
    
    // 1. Kiểm tra người dùng đã đăng nhập chưa và load dữ liệu
    useEffect(() => {
        if (!currentUser) {
            showError("Bạn cần đăng nhập để làm bài quiz!");
            navigate('/login', { state: { from: `/play/${id}` } });
            return;
        }
        
        // Đặt ngay lập tức để ngăn chặn lần gọi thứ hai
        if (isInitializedRef.current) {
            return;
        }
        isInitializedRef.current = true;
        
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
                console.log("Existing result:", existingResult);
                
                if (existingResult && existingResult.status ==="PENDING") {
                    console.log("Found existing result:", existingResult);
                    
                    setResult(existingResult);
                    
                    if (existingResult.UserAnswers && existingResult.UserAnswers.length > 0) {
                        setUserAnswers(existingResult.UserAnswers);
                       
                        const answeredQuestionIds = new Set(
                            existingResult.UserAnswers.map(answer => answer.question)
                        );
                        
                        let nextUnansweredIndex = questionsData.findIndex(
                            question => !answeredQuestionIds.has(question._id)
                        );
                        console.log("User answers:", existingResult.UserAnswers);
                        console.log("Next unanswered question index:", nextUnansweredIndex);
                        if (nextUnansweredIndex === -1) {
                            if (existingResult.UserAnswers.length >= questionsData.length) {
                                const savedScore = existingResult.UserAnswers.reduce(
                                    (total, answer) => total + (answer.isCorrect ? answer.points || 100 : 0),
                                    0
                                );
                                setScore(savedScore);
                                setQuizComplete(true);
                            } else {
                                nextUnansweredIndex = questionsData.length - 1;
                            }
                        }
                        
                        setCurrentQuestionIndex(nextUnansweredIndex);
                        
                        const savedScore = existingResult.UserAnswers.reduce(
                            (total, answer) => total + (answer.isCorrect ? answer.points || 100 : 0),
                            0
                        );
                        console.log("Saved score:", savedScore);
                        setScore(savedScore);
                        
                        const isCurrentQuestionAnswered = existingResult.UserAnswers.some(
                            answer => answer.questionId === questionsData[nextUnansweredIndex]?._id
                        );
                        
                        // Đánh dấu đã trả lời cho câu hỏi hiện tại nếu câu đã có câu trả lời
                        setAnswered(isCurrentQuestionAnswered);
                        
                        // Đặt isLocked = true để không thể thay đổi câu trả lời đã có
                        setDisableAnswerChange(true);
                    }
                } else {
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
                // Reset flag nếu khởi tạo thất bại để cho phép thử lại
                isInitializedRef.current = false;
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
    
    // 3. Hàm lưu câu trả lời - Chỉnh sửa để chỉ lưu câu trả lời mới
    const saveAnswers = async (forceComplete = false) => {
        if (!result || !result._id) {
            console.log("No result to save to");
            return;
        }
        
        // Chỉ lưu khi có câu trả lời mới
        if (pendingAnswers.length === 0 && !forceComplete) {
            console.log("No pending answers to save");
            return;
        }
        
        try {
            console.log("Saving pending answers:", pendingAnswers);
            
            // Chỉ gửi những câu trả lời mới lên server
            await addAnswerToResult({
                resultId: result._id,
                answers: pendingAnswers,
                completed: forceComplete
            });
            
            // Cập nhật state sau khi lưu thành công
            setUserAnswers(prev => [...prev, ...pendingAnswers]);
            setPendingAnswers([]);
            
            if (forceComplete) {
                // Đánh dấu hoàn thành bài quiz
                await completeResult({
                    resultId: result._id,
                    score: score,
                    accuracy: (score / (questions.length * 100)) * 100
                });
            }
            
            return true;
        } catch (error) {
            console.error("Error saving answers:", error);
            return false;
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
        
        // Nếu câu hỏi đã được trả lời và đã được lưu, không cho phép thay đổi
        if (existingAnswerIndex !== -1 && disableAnswerChange) {
            showError("Câu hỏi này đã được trả lời, không thể thay đổi!");
            return;
        }
        
        // Tạo đối tượng câu trả lời
        const newAnswer = {
            questionId: currentQuestion._id,
            selectedOption: answer,
            isCorrect: isCorrect,
            points: points,
            timeTaken: 0 
        };
        
        // Cập nhật điểm số
        if (existingAnswerIndex !== -1) {
            // Câu hỏi đã có trong userAnswers nhưng chưa được lưu
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
            
            // Thêm vào pendingAnswers để lưu
            setPendingAnswers(prev => [...prev, newAnswer]);
        }
        
        // Đánh dấu đã trả lời
        setAnswered(true);
        
        // Lưu câu trả lời ngay lập tức để tránh mất dữ liệu
        saveAnswers().then(success => {
            if (success) {
                // Sau khi lưu thành công, tự động chuyển sang câu tiếp theo sau 1.5 giây
                setTimeout(() => {
                    // Nếu còn câu hỏi tiếp theo
                    if (currentQuestionIndex < questions.length - 1) {
                        handleNextQuestion();
                    } else {
                        // Nếu là câu cuối cùng
                        handleFinishQuiz();
                    }
                }, 1500);
            }
        });
    };
    
    // 6. Xử lý khi chuyển câu hỏi
    const handleNextQuestion = async () => {
        // Lưu câu trả lời khi chuyển câu hỏi
        await saveAnswers();
        
        if (currentQuestionIndex < questions.length - 1) {
            // Tạo danh sách các ID câu hỏi đã trả lời
            const answeredIds = new Set(userAnswers.map(a => a.questionId));
            let nextIndex = currentQuestionIndex + 1;
            let foundUnanswered = false;
            
            // Tìm câu tiếp theo chưa trả lời
            while (nextIndex < questions.length) {
                if (!answeredIds.has(questions[nextIndex]._id)) {
                    foundUnanswered = true;
                    break;
                }
                nextIndex++;
            }
            
            // Nếu không tìm thấy câu nào chưa trả lời từ vị trí hiện tại đến cuối
            // thì hiển thị câu tiếp theo như bình thường
            if (!foundUnanswered) {
                nextIndex = currentQuestionIndex + 1;
            }
            
            // Cập nhật vị trí câu hỏi
            setCurrentQuestionIndex(nextIndex);
            
            // Kiểm tra xem câu tiếp theo đã được trả lời chưa
            const isNextQuestionAnswered = userAnswers.some(
                answer => answer.questionId === questions[nextIndex]._id
            );
            
            // Cập nhật trạng thái
            setAnswered(isNextQuestionAnswered);
            setDisableAnswerChange(isNextQuestionAnswered);
            
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
                setDisableAnswerChange(false);
                return true;
            }
        }
        
        // Tìm từ đầu đến vị trí hiện tại
        for (let i = 0; i < currentQuestionIndex; i++) {
            if (!answeredIds.has(questions[i]._id)) {
                setCurrentQuestionIndex(i);
                setAnswered(false);
                setDisableAnswerChange(false);
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
            showSuccess("Bài quiz hoàn thành! Xem kết quả của bạn.");
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
            setDisableAnswerChange(false);
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
                    <div className="mb-4">
                        <p>Số câu trả lời đúng: {userAnswers.filter(a => a.isCorrect).length}/{questions.length}</p>
                        <p>Độ chính xác: {((userAnswers.filter(a => a.isCorrect).length / questions.length) * 100).toFixed(2)}%</p>
                    </div>
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
                                    
                                    // Nếu tất cả câu hỏi đã trả lời, hiển thị kết quả
                                    if (userAnswers.length >= questions.length) {
                                        handleFinishQuiz();
                                    }
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
                
                {/* Hiển thị thông báo nếu câu hỏi đã được trả lời và không thể thay đổi */}
                {userAnswers.some(a => a.questionId === questions[currentQuestionIndex]?._id) && disableAnswerChange && (
                    <div className="alert alert-warning mb-3">
                        <i className="fas fa-lock me-2"></i>
                        Câu hỏi này đã được trả lời và không thể thay đổi. 
                        <Button 
                            variant="link" 
                            className="p-0 ms-2" 
                            onClick={goToUnansweredQuestion}
                        >
                            Chuyển đến câu chưa trả lời
                        </Button>
                    </div>
                )}
                
                {/* Question content */}
                {questions.length > 0 && 
                    <QuestionGame 
                        question={questions[currentQuestionIndex]} 
                        questionNumber={currentQuestionIndex + 1}
                        totalQuestions={questions.length}
                        onAnswer={handleAnswer}
                        defaultAnswer={userAnswers.find(a => a.questionId === questions[currentQuestionIndex]?._id)?.selectedOption}
                        isLocked={userAnswers.some(a => a.questionId === questions[currentQuestionIndex]?._id) && disableAnswerChange}
                    />
                }
                
                {/* Navigation button */}
                <div className="text-center mt-4 d-flex justify-content-between">
                    <div className="score-display">
                        <h5>Score: {score} points</h5>
                        <div className="mt-2">
                            <Badge bg="info">
                                {userAnswers.length} / {questions.length} câu đã trả lời
                            </Badge>
                        </div>
                    </div>
                    
                    <div>
                        {currentQuestionIndex < questions.length - 1 ? (
                            <Button 
                                variant="primary" 
                                size="lg" 
                                onClick={handleNextQuestion}
                                disabled={!answered && !userAnswers.some(a => a.questionId === questions[currentQuestionIndex]?._id)}
                            >
                                Next Question
                            </Button>
                        ) : (
                            <Button 
                                variant="success" 
                                size="lg" 
                                onClick={handleFinishQuiz}
                                disabled={!answered && !userAnswers.some(a => a.questionId === questions[currentQuestionIndex]?._id)}
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