import React, { useEffect, useState, useRef } from 'react'
import QuestionGame from '../components/Questions/QuestionGame'
import { getQuestionsByQuizzId } from '../api/questionApi'
import { Button, Container, ProgressBar, Badge, Row, Col, Card } from 'react-bootstrap'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import NavBar from '../layout/NavBar'
import CreateLoading from '../components/common/CreateLoading'
import { useAuth } from '../contexts/AuthContext'
import { checkProcess, initialResult, addAnswerToResult, completeResult, checkAnswer } from '../api/resuiltAPI'
import { showError, showSuccess } from '../components/common/Notification'
import { FiClock, FiAward, FiCheckCircle, FiHelpCircle, FiChevronRight, FiFlag } from 'react-icons/fi'
import { quizScoreSubject } from '../patterns/QuizObserver';
import { initializeWebSocket, notifyGlobalQuizComplete } from '../services/websocket'
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
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [answerFeedback, setAnswerFeedback] = useState(null);
    // Lấy ID từ đường dẫn và thông tin người dùng
    const { id } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Tham chiếu cho timer lưu kết quả tự động
    const autoSaveTimerRef = useRef(null);
    // Thêm ref để theo dõi việc đã khởi tạo chưa
    const isInitializedRef = useRef(false);
 useEffect(() => {
        initializeWebSocket().then(() => {
            console.log("✅ WebSocket initialized for PlayPage");
        }).catch(error => {
            console.error("❌ Failed to initialize WebSocket:", error);
        });
    }, []);
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

                if (existingResult && existingResult.status === "PENDING") {
                    console.log("Found existing result:", existingResult);
                    setResult(existingResult);

                    if (existingResult.UserAnswers && existingResult.UserAnswers.length > 0) {
                        setUserAnswers(existingResult.UserAnswers);

                        // Sửa lỗi mapping questionId
                        const answeredQuestionIds = new Set(
                            existingResult.UserAnswers.map(answer => answer.questionId || answer.question)
                        );

                        let nextUnansweredIndex = questionsData.findIndex(
                            question => !answeredQuestionIds.has(question._id)
                        );
                        
                        console.log("User answers:", existingResult.UserAnswers);
                        console.log("Answered question IDs:", Array.from(answeredQuestionIds));
                        console.log("Next unanswered question index:", nextUnansweredIndex);
                        
                        if (nextUnansweredIndex === -1) {
                            if (existingResult.UserAnswers.length >= questionsData.length) {
                                const savedScore = existingResult.UserAnswers.reduce(
                                    (total, answer) => total + (answer.isCorrect ? answer.points || 100 : 0),
                                    0
                                );
                                setScore(savedScore);
                                setQuizComplete(true);
                                return; // Thoát sớm nếu quiz đã hoàn thành
                            } else {
                                nextUnansweredIndex = 0; // Quay về câu đầu tiên thay vì câu cuối
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
                            answer => (answer.questionId || answer.question) === questionsData[nextUnansweredIndex]?._id
                        );

                        // Đánh dấu đã trả lời cho câu hỏi hiện tại nếu câu đã có câu trả lời
                        setAnswered(isCurrentQuestionAnswered);
                        setDisableAnswerChange(isCurrentQuestionAnswered);

                        // Nếu câu hỏi hiện tại đã được trả lời, hiển thị đáp án
                        if (isCurrentQuestionAnswered) {
                            const existingAnswer = existingResult.UserAnswers.find(
                                answer => (answer.questionId || answer.question) === questionsData[nextUnansweredIndex]?._id
                            );
                            setSelectedAnswer(existingAnswer?.selectedOption);
                            setShowResult(true);
                            setAnswerFeedback({
                                isCorrect: existingAnswer?.isCorrect,
                                points: existingAnswer?.points || 100
                            });
                        }
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

    
    const saveAnswers = async (forceComplete = false) => {
        if (!result || !result._id) {
            console.log("No result to save to");
            return false;
        }

        // Chỉ lưu khi có câu trả lời mới
        if (pendingAnswers.length === 0 && !forceComplete) {
            console.log("No pending answers to save");
            return true; // Return true vì không có lỗi
        }

        try {
            console.log("Saving pending answers:", pendingAnswers);

            // Chỉ gửi những câu trả lời mới lên server
            const saveResult = await addAnswerToResult({
                resultId: result._id,
                answers: pendingAnswers,
                completed: forceComplete
            });

            console.log("Save result:", saveResult);

            // Cập nhật state sau khi lưu thành công
            if (pendingAnswers.length > 0) {
                setUserAnswers(prev => {
                    const newUserAnswers = [...prev, ...pendingAnswers];
                    console.log("Updated userAnswers:", newUserAnswers);
                    return newUserAnswers;
                });
                
                // Clear pending answers sau khi lưu
                setPendingAnswers([]);
            }

            if (forceComplete) {
                // Đánh dấu hoàn thành bài quiz
                await completeResult({
                    resultId: result._id,
                    score: score,
                    accuracy: (score / (questions.length * 100)) * 100
                });
            }

            console.log("Save completed successfully");
            return true;
        } catch (error) {
            console.error("Error saving answers:", error);
            showError("Không thể lưu câu trả lời. Vui lòng thử lại!");
            return false;
        }
    };
    
const handleAnswerSelect = (answer) => {
    // Kiểm tra xem câu hỏi đã được trả lời chưa
    const isQuestionAnswered = userAnswers.some(
        a => a.questionId === questions[currentQuestionIndex]?._id
    );
    
    if (isQuestionAnswered && disableAnswerChange) {
        showError("Câu hỏi này đã được trả lời, không thể thay đổi!");
        return;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    console.log("Answer selected:", answer, "Question type:", currentQuestion.type);
    
    // Xử lý theo loại câu hỏi
    if (currentQuestion.type === 'MULTIPLE_ANSWER') {
        // Cho phép chọn nhiều đáp án - answer đã là array từ QuestionGame
        setSelectedAnswer(answer);
    } else {
        // Chỉ cho phép chọn một đáp án
        setSelectedAnswer(answer);
    }
    
    setShowResult(false);
    setAnswerFeedback(null);
    setAnswered(false);
};

    // Sửa lại hàm handleCheckAnswer để xử lý multiple answers
const handleCheckAnswer = async () => {
    if (!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)) {
        showError("Please select an answer first!");
        return;
    }

    const currentQuestion = questions[currentQuestionIndex];

    try {
       

        const checkResult = await checkAnswer({
            questionId: currentQuestion._id,
            answer: selectedAnswer,
        });

        console.log("Check result:", checkResult);

        setAnswerFeedback(checkResult);
        setShowResult(true);

        // Update score if correct
        if (checkResult.isCorrect) {
            setScore(prev => prev + (checkResult.score || 100));
        }

        // Add to pending answers
        const newAnswer = {
            questionId: currentQuestion._id,
            selectedOption: selectedAnswer,
            isCorrect: checkResult.isCorrect,
            points: checkResult.points || 100,
            timeTaken: 0
        };

        setPendingAnswers(prev => [...prev, newAnswer]);
        setAnswered(true);

    } catch (error) {
        console.error("Error checking answer:", error);
        showError("Error checking answer. Please try again.");
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
    

    // 6. Xử lý khi chuyển câu hỏi
    const handleNextQuestion = async () => {
        // Lưu câu trả lời hiện tại trước khi chuyển câu
        const saveSuccess = await saveAnswers();
        if (!saveSuccess) {
            showError("Không thể lưu câu trả lời. Vui lòng thử lại!");
            return;
        }

        // Reset UI state AFTER saving
        setSelectedAnswer(null);
        setShowResult(false);
        setAnswerFeedback(null);
        setAnswered(false);

        if (currentQuestionIndex < questions.length - 1) {
            // Sử dụng userAnswers đã được cập nhật (không cần pendingAnswers nữa vì đã save)
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
            setDisableAnswerChange(isNextQuestionAnswered);

            // Nếu câu hỏi đã được trả lời, hiển thị đáp án
            if (isNextQuestionAnswered) {
                const existingAnswer = userAnswers.find(
                    a => a.questionId === questions[nextIndex]._id
                );
                setSelectedAnswer(existingAnswer?.selectedOption);
                setShowResult(true);
                setAnswered(true);
                // Tạo answerFeedback giả để hiển thị kết quả
                setAnswerFeedback({
                    isCorrect: existingAnswer?.isCorrect,
                    points: existingAnswer?.points || 100
                });
            }

        } else {
            // Khi hoàn thành bài quiz
            const finalSaveSuccess = await saveAnswers(true);
            if (finalSaveSuccess) {
                setQuizComplete(true);
            } else {
                showError("Có lỗi khi hoàn thành bài quiz. Vui lòng thử lại!");
            }
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
            
            // Lưu thông tin quiz đã hoàn thành cho user hiện tại
            const completedQuizInfo = {
                quizId: id,
                userId: currentUser.id,
                userName: currentUser.name || 'Anonymous',
                score: score,
                timestamp: new Date().getTime(),
                viewed: false // Cờ để kiểm tra xem toast đã hiển thị chưa
            };
            
            // Lưu vào localStorage cho việc hiển thị khi reload
            localStorage.setItem(`completed_quiz_${id}_${currentUser.id}`, 
                JSON.stringify(completedQuizInfo));
            
            // Notify observers about the new score (Observer Pattern)
            quizScoreSubject.notify({
                quizId: id,
                userId: currentUser.id,
                userName: currentUser.name || 'Anonymous',
                userAvatar: currentUser.avatar,
                score: score,
                timestamp: new Date()
            });
            
            // Thêm cơ chế truyền thông tin qua localStorage để hoạt động giữa các tab
            localStorage.setItem('quiz_score_update', JSON.stringify({
                quizId: id,
                userId: currentUser.id,
                userName: currentUser.name || 'Anonymous',
                userAvatar: currentUser.avatar,
                score: score,
                timestamp: new Date().getTime() // Dùng timestamp để dễ parse
            }));
             try {

                await notifyGlobalQuizComplete(`${currentUser.name || 'Anonymous'} has completed the quiz with a score of ${score}.`);
                console.log("✅ Global notification sent successfully");
            } catch (error) {
                console.error("❌ Failed to send global notification:", error);
            }
            
        } catch (error) {
            console.error("Error finishing quiz:", error);
            showError("Có lỗi khi hoàn thành bài quiz. Kết quả của bạn đã được lưu một phần.");
            setQuizComplete(true);
        }
    };


    // const handleTest = async () => {
    //  try {
    //             await notifyGlobalQuizComplete(currentUser.name || 'Anonymous');
    //             console.log("✅ Global notification sent successfully");
    //         } catch (error) {
    //             console.error("❌ Failed to send global notification:", error);
    //         }
        
    // }

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

    // Modernized Countdown Overlay
    const CountdownOverlay = () => (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{
                background: 'rgba(0, 0, 0, 0.85)',
                zIndex: 1050,
                backdropFilter: 'blur(5px)'
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
                            <div className="position-relative">
                                <motion.div
                                    className="position-absolute top-50 start-50 translate-middle"
                                    style={{
                                        width: '150px',
                                        height: '150px',
                                        borderRadius: '50%',
                                        border: '4px solid rgba(255,255,255,0.2)'
                                    }}
                                    animate={{
                                        scale: [1, 1.2, 1],
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        repeatType: 'loop'
                                    }}
                                />
                                <h1 className="display-1 text-white fw-bold position-relative">{countdown}</h1>
                            </div>
                            <p className="text-white fs-4 mt-4 fw-light">Get Ready!</p>
                        </div>
                    ) : (
                        <motion.div
                            className="d-flex flex-column align-items-center"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="display-1 text-success fw-bold">GO!</h1>
                            <p className="text-white fs-4 mt-3 fw-light">Good luck!</p>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );

    // Enhanced Quiz Complete Screen
    if (quizComplete) {
        return (
            <>
                <NavBar />
                <Container className="py-5">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-5"
                    >
                        <div className="d-inline-block p-3 bg-success bg-opacity-10 rounded-circle mb-3">
                            <FiAward size={50} className="text-success" />
                        </div>
                        <h2 className="display-5 fw-bold mb-2">Quiz Complete!</h2>
                        <p className="text-muted fs-5">Great job! Here's how you did.</p>
                    </motion.div>

                    <Row className="justify-content-center">
                        <Col lg={8}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <Card className="border-0 shadow-sm mb-4">
                                    <Card.Body className="p-4">
                                        <Row className="text-center">
                                            <Col md={4} className="mb-3 mb-md-0">
                                                <h5 className="text-muted mb-2">Score</h5>
                                                <h3 className="display-6 fw-bold text-primary">{score}</h3>
                                                <p className="small text-muted">points</p>
                                            </Col>
                                            <Col md={4} className="mb-3 mb-md-0">
                                                <h5 className="text-muted mb-2">Accuracy</h5>
                                                <h3 className="display-6 fw-bold text-success">
                                                    {((userAnswers.filter(a => a.isCorrect).length / questions.length) * 100).toFixed()}%
                                                </h3>
                                                <p className="small text-muted">correct answers</p>
                                            </Col>
                                            <Col md={4}>
                                                <h5 className="text-muted mb-2">Completion</h5>
                                                <h3 className="display-6 fw-bold text-info">
                                                    {userAnswers.filter(a => a.isCorrect).length}/{questions.length}
                                                </h3>
                                                <p className="small text-muted">questions</p>
                                            </Col>
                                        </Row>

                                        <div className="mt-4">
                                            <h6 className="mb-2">Your Performance</h6>
                                            <ProgressBar
                                                now={(score / (questions.length * 100)) * 100}
                                                variant="success"
                                                className="mb-4"
                                                style={{ height: "12px", borderRadius: "6px" }}
                                            />
                                        </div>
                                    </Card.Body>
                                </Card>

                                <div className="d-flex flex-column flex-md-row justify-content-center gap-3 mt-4">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        onClick={restartQuiz}
                                        className="px-4 py-3 fw-medium"
                                    >
                                        <FiFlag className="me-2" />
                                        Play Again
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        size="lg"
                                        onClick={() => navigate(`/quiz-detail/${id}`)}
                                        className="px-4 py-3 fw-medium"
                                    >
                                        Back to Quiz Details
                                    </Button>
                                </div>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </>
        );
    }

    if (loading) {
        return <CreateLoading />;
    }

    // Main Quiz Interface
    return (
        <>
            {showCountdown && <CountdownOverlay />}

            <div className="min-vh-100" style={{
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
                backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
                backgroundAttachment: 'fixed'
            }}>
                <NavBar />
                <Container className="py-4">
                    {/* <button onClick={handleTest} >Test</button> */}
                    <Row className="justify-content-center">
                        <Col lg={10}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Quiz Header */}
                                <Card className="border-0 shadow-sm mb-4">
                                    <Card.Body className="p-4">
                                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
                                            <div>
                                                <h4 className="mb-1">Quiz Progress</h4>
                                                <p className="text-muted mb-md-0">
                                                    <span className="fw-medium">Question {currentQuestionIndex + 1}</span> of {questions.length}
                                                </p>
                                            </div>
                                            <div className="d-flex flex-column flex-md-row align-items-md-center gap-2">
                                                <Badge bg="success" className="py-2 px-3 d-flex align-items-center">
                                                    <FiCheckCircle className="me-1" />
                                                    <span>{userAnswers.length} / {questions.length} Answered</span>
                                                </Badge>
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    className="d-flex align-items-center justify-content-center"
                                                    onClick={() => {
                                                        if (!goToUnansweredQuestion()) {
                                                            showError("Tất cả câu hỏi đã được trả lời!");

                                                            if (userAnswers.length >= questions.length) {
                                                                handleFinishQuiz();
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <FiHelpCircle className="me-1" />
                                                    Unanswered Questions
                                                </Button>
                                            </div>
                                        </div>

                                        <ProgressBar
                                            now={((currentQuestionIndex + 1) / questions.length) * 100}
                                            variant="primary"
                                            className="mb-0"
                                            style={{ height: "8px", borderRadius: "4px" }}
                                        />
                                    </Card.Body>
                                </Card>

                                {/* Warning Card if question already answered */}
                                {userAnswers.some(a => a.questionId === questions[currentQuestionIndex]?._id) && disableAnswerChange && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-4"
                                    >
                                        <div className="alert alert-warning d-flex align-items-center">
                                            <i className="fas fa-lock me-2"></i>
                                            <div>
                                                <span>This question has already been answered and cannot be changed.</span>
                                                <Button
                                                    variant="link"
                                                    className="p-0 ms-2 fw-medium"
                                                    onClick={goToUnansweredQuestion}
                                                >
                                                    Go to unanswered questions
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Question Card */}
                                <Card className="border-0 shadow-lg mb-4 quiz-question-card">
                                    <Card.Body className="p-4 p-lg-5">
                                        {questions.length > 0 && (
                                            <>
                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                    <Badge bg="primary" className="py-2 px-3 rounded-pill fw-medium">
                                                        Question {currentQuestionIndex + 1} of {questions.length}
                                                    </Badge>
                                                    <Badge
                                                        bg={userAnswers.some(a => a.questionId === questions[currentQuestionIndex]?._id) ?
                                                            "success" : "warning"}
                                                        className="py-2 px-3 rounded-pill fw-medium"
                                                    >
                                                        {userAnswers.some(a => a.questionId === questions[currentQuestionIndex]?._id) ?
                                                            "Answered" : "Not answered"}
                                                    </Badge>
                                                </div>
                                                <QuestionGame
                                                    question={questions[currentQuestionIndex]}
                                                    questionNumber={currentQuestionIndex + 1}
                                                    totalQuestions={questions.length}
                                                    onAnswerSelect={handleAnswerSelect} // Thay đổi từ onAnswer thành onAnswerSelect
                                                    selectedAnswer={selectedAnswer}
                                                    showResult={showResult}
                                                    answerFeedback={answerFeedback}
                                                    defaultAnswer={userAnswers.find(a => a.questionId === questions[currentQuestionIndex]?._id)?.selectedOption}
                                                    isLocked={userAnswers.some(a => a.questionId === questions[currentQuestionIndex]?._id) && disableAnswerChange}
                                                />
                                            </>
                                        )}
                                    </Card.Body>
                                </Card>

                                {/* Quiz Navigation Footer */}
                                <Card className="border-0 shadow-lg" style={{ borderRadius: '12px' }}>
                                    <Card.Body className="p-4">
                                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                                            <div className="mb-3 mb-md-0">
                                                <h5 className="mb-2 d-flex align-items-center">
                                                    <motion.div
                                                        animate={{ rotate: [0, 15, 0, -15, 0] }}
                                                        transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
                                                    >
                                                        <FiAward className="me-2 text-warning" size={24} />
                                                    </motion.div>
                                                    Current Score: <span className="ms-2 text-primary fw-bold">{score}</span>
                                                </h5>
                                                <div className="d-flex align-items-center">
                                                    <div className="flex-grow-1 me-2 position-relative" style={{ height: '10px' }}>
                                                        <div className="position-absolute w-100 bg-light" style={{ height: '10px', borderRadius: '5px' }}></div>
                                                        <motion.div
                                                            className="position-absolute bg-success"
                                                            style={{
                                                                height: '10px',
                                                                borderRadius: '5px',
                                                                width: `${Math.round((score / (questions.length * 100)) * 100)}%`
                                                            }}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.round((score / (questions.length * 100)) * 100)}%` }}
                                                            transition={{ duration: 0.8 }}
                                                        ></motion.div>
                                                    </div>
                                                    <span className="text-muted fw-medium">
                                                        {Math.round((score / (questions.length * 100)) * 100)}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div>

                                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                                                    <div className="mb-3 mb-md-0">
                                                        {/* Score display remains the same */}
                                                    </div>
                                                    <div className="d-flex gap-2">
                                                        {!showResult && !answered && (
                                                            <Button
                                                                variant="warning"
                                                                size="lg"
                                                                onClick={handleCheckAnswer}
                                                                disabled={
                                                                    !selectedAnswer || 
                                                                    (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)
                                                                }
                                                                className="px-4"
                                                            >
                                                                <FiCheckCircle className="me-2" />
                                                                Check Answer
                                                            </Button>
                                                        )}

                                                        {(showResult || answered) && (
                                                            currentQuestionIndex < questions.length - 1 ? (
                                                                <Button
                                                                    variant="primary"
                                                                    size="lg"
                                                                    onClick={handleNextQuestion}
                                                                    className="px-4"
                                                                >
                                                                    Next Question
                                                                    <FiChevronRight className="ms-2" />
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="success"
                                                                    size="lg"
                                                                    onClick={handleFinishQuiz}
                                                                    className="px-4"
                                                                >
                                                                    Finish Quiz
                                                                    <FiFlag className="ms-2" />
                                                                </Button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
}

export default PlayPage;