import Modal from 'react-bootstrap/Modal';
import { useEffect, useState } from 'react';
import { getQuizzesByUserId,getQuizzesInRooms,updateQuizzesInRoom,getAllQuizzes } from '../../api/quizzApi';
import QuizzeCard from './QuizzeCard';
import { Row, Col } from 'react-bootstrap';
import { useParams } from "react-router-dom";  // Import from react-router-dom
import { IoSave } from "react-icons/io5";
import {showSuccess,showError} from "../common/Notification";
import CreateLoading from '../common/CreateLoading';
const AddQuiz = ({show, onClose}) => {
    const [quizzOfAuthor, setQuizzOfAuthor] = useState([]);
    const [selectedQuizzes, setSelectedQuizzes] = useState([]);
    const { roomId } = useParams();
    const [allQuizzes, setAllQuizzes] = useState([]);
    const handleQuizSelect = (quizId, isSelected) => {
      if (isSelected) {
        setSelectedQuizzes(prev => [...prev, quizId]);
      } else {
        setSelectedQuizzes(prev => prev.filter(id => id !== quizId));
      }
    };
    useEffect(() => {
        const fetchQuizzOfAuthor = async () => {
            try {
                const userId = localStorage.getItem('userId');
                const response = await getQuizzesByUserId(userId);
                const responseQuizes = await getQuizzesInRooms(roomId);
                const quizzesInRooms = responseQuizes.QuizzIds;
                const allQuizzes = await getAllQuizzes(userId);
                // Map through response and check if quiz exists in room
                const formattedQuizzes = response.map(quiz => ({
                    id: quiz._id,
                    title: quiz.title,
                    description: quiz.description,
                    checked: quizzesInRooms.some(roomQuiz => roomQuiz === quiz._id)
                }));
                const formattedAllQuizzes = allQuizzes.map(quiz => ({
                    id: quiz._id,
                    title: quiz.title,
                    description: quiz.description,
                    checked: quizzesInRooms.some(roomQuiz => roomQuiz === quiz._id)
                }));
                setAllQuizzes(formattedAllQuizzes);
                console.log('Formatted Quizzes:', formattedQuizzes);
                setQuizzOfAuthor(formattedQuizzes);
                
                // Pre-select quizzes that are already in room
                const preSelectedQuizzes = formattedQuizzes
                    .filter(quiz => quiz.checked)
                    .map(quiz => quiz.id);
                setSelectedQuizzes(preSelectedQuizzes);
        
            } catch (error) {
                console.error('Fetch quizzes error:', error);
            }
        };

        fetchQuizzOfAuthor();
    }, []);

    const handleUpdateQuizzesInRoom = (e) => {
        e.preventDefault();
        const data = {
            roomId,
            quizIds: selectedQuizzes
        };
        console.log('Data:', data);
       
        const update  = async () => {
            try {
                const response = await updateQuizzesInRoom(data);
                showSuccess(response.message);
            }
            catch (error) {
                showError('Failed to update quizzes in room');
            }
        };
        update();
        onClose();
    }


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
                <button className="btn btn-outline-success me-3" onClick={handleUpdateQuizzesInRoom}>
                    <IoSave className='mb-1 me-2' />
                Save
                </button>
                </div>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <h5>Danh sách quizzes của bạn</h5>
                    {quizzOfAuthor.length > 0 ? (
                        <Row className="g-3">
                            {quizzOfAuthor.map(quiz => (
                                <Col key={quiz.id} xs={12} md={6}>
                                    <QuizzeCard
                                        quiz={quiz}
                                        onSelect={handleQuizSelect}
                                    />
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <CreateLoading/>
                    )}
                </div>
                <div>
                    <h5>Danh sách quizzes có sẵn</h5>
                    {quizzOfAuthor.length > 0 ? (
                        <Row className="g-3">
                            {allQuizzes.map(quiz => (
                                <Col key={quiz.id} xs={12} md={6}>
                                    <QuizzeCard
                                        quiz={quiz}
                                        onSelect={handleQuizSelect}
                                    />
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <CreateLoading/>
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default AddQuiz;