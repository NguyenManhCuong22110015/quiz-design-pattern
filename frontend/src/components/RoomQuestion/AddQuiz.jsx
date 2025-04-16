import Modal from 'react-bootstrap/Modal';
import { useEffect, useState } from 'react';
import { getQuizzesByUserId, getQuizzesInRooms, updateQuizzesInRoom, getAllQuizzes } from '../../api/quizzApi';
import QuizzeCard from './QuizzeCard';
import { Row, Col, Alert } from 'react-bootstrap';
import { useParams } from "react-router-dom";
import { IoSave } from "react-icons/io5";
import { showSuccess, showError } from "../common/Notification";
import CreateLoading from '../common/CreateLoading';

const AddQuiz = ({show, onClose}) => {
    const [quizzOfAuthor, setQuizzOfAuthor] = useState([]);
    const [selectedQuizzes, setSelectedQuizzes] = useState([]);
    const [allQuizzes, setAllQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { roomId } = useParams();
    
    const handleQuizSelect = (quizId, isSelected) => {
      if (isSelected) {
        setSelectedQuizzes(prev => [...prev, quizId]);
      } else {
        setSelectedQuizzes(prev => prev.filter(id => id !== quizId));
      }
    };
    
    useEffect(() => {
        const fetchQuizzOfAuthor = async () => {
            setLoading(true);
            setError(null);
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    throw new Error('User ID not found');
                }
                
                // Get quizzes already in room
                const responseQuizes = await getQuizzesInRooms(roomId);
                const quizzesInRooms = responseQuizes?.QuizzIds || [];
                
                // Get user's quizzes and format them
                const response = await getQuizzesByUserId(userId);
                const formattedQuizzes = Array.isArray(response) && response.length > 0
                    ? response.map(quiz => ({
                        id: quiz._id,
                        title: quiz.title,
                        description: quiz.description,
                        checked: quizzesInRooms.some(roomQuiz => roomQuiz === quiz._id)
                      }))
                    : [];
                
                // Get all available quizzes and format them
                const allQuizzesResponse = await getAllQuizzes(userId);
                const formattedAllQuizzes = Array.isArray(allQuizzesResponse) && allQuizzesResponse.length > 0
                    ? allQuizzesResponse.map(quiz => ({
                        id: quiz._id,
                        title: quiz.title,
                        description: quiz.description,
                        checked: quizzesInRooms.some(roomQuiz => roomQuiz === quiz._id)
                      }))
                    : [];
                
                // Pre-select quizzes that are already in room
                const preSelectedQuizzes = formattedQuizzes
                    .filter(quiz => quiz.checked)
                    .map(quiz => quiz.id);
                
                setQuizzOfAuthor(formattedQuizzes);
                setAllQuizzes(formattedAllQuizzes);
                setSelectedQuizzes(preSelectedQuizzes);
                setLoading(false);
            } catch (error) {
                console.error('Fetch quizzes error:', error);
                setError(error.message || 'Failed to load quizzes');
                setLoading(false);
            }
        };

        fetchQuizzOfAuthor();
    }, [roomId]);

    const handleUpdateQuizzesInRoom = async (e) => {
        e.preventDefault();
        try {
            const data = {
                roomId,
                quizIds: selectedQuizzes
            };
            
            const response = await updateQuizzesInRoom(data);
            showSuccess(response.message || 'Quizzes updated successfully');
            onClose();
        } catch (error) {
            console.error('Update quizzes error:', error);
            showError(error.message || 'Failed to update quizzes in room');
        }
    };

    const renderQuizList = (quizzes, title) => {
        return (
            <div className="mb-4">
                <h5 className="mb-3">{title}</h5>
                {loading ? (
                    <CreateLoading />
                ) : error ? (
                    <Alert variant="danger">
                        {error}
                    </Alert>
                ) : quizzes.length > 0 ? (
                    <Row className="g-3">
                        {quizzes.map(quiz => (
                            <Col key={quiz.id} xs={12} md={6}>
                                <QuizzeCard
                                    quiz={quiz}
                                    onSelect={handleQuizSelect}
                                />
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Alert variant="info">
                        Không có quiz nào được tìm thấy. Hãy tạo quiz mới để thêm vào phòng học.
                    </Alert>
                )}
            </div>
        );
    };

    return (
        <Modal show={show} onHide={onClose} fullscreen>
            <Modal.Header closeButton>
                <Modal.Title>Quiz</Modal.Title>
                <div className="d-flex justify-content-end w-100">
                    <a 
                        className="btn btn-secondary me-3" 
                        href="/admin/quizz" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        Add more quizzes
                    </a>
                    <button 
                        className="btn btn-outline-success me-3" 
                        onClick={handleUpdateQuizzesInRoom}
                        disabled={loading}
                    >
                        <IoSave className='mb-1 me-2' />
                        Save
                    </button>
                </div>
            </Modal.Header>
            <Modal.Body>
                {renderQuizList(quizzOfAuthor, "Danh sách quizzes của bạn")}
                {renderQuizList(allQuizzes, "Danh sách quizzes có sẵn")}
            </Modal.Body>
        </Modal>
    );
};

export default AddQuiz;