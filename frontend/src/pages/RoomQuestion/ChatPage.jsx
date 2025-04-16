import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Button, InputGroup, Form, Badge, Dropdown } from 'react-bootstrap';
import ws, { joinGame, joinRoom, sendAnswer, sendMessage, startGame, endGame, initializeWebSocket } from "../../services/websocket.js";
import ChoiceName from "../../components/RoomQuestion/ChoiceName";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../../layout/NavBar.jsx";
import { MdOutlineGroupAdd, MdSmartDisplay, MdSend, MdMoreVert } from "react-icons/md";
import { FaCircleQuestion, FaUsersGear, FaRegCopy, FaPlay } from "react-icons/fa6";
import { TbArrowsExchange } from "react-icons/tb";
import { IoMdSettings } from "react-icons/io";
import AddQuiz from "../../components/RoomQuestion/AddQuiz.jsx";
import ViewMember from "../../components/RoomQuestion/ViewMember.jsx";
import { getRoomById, checkAccessRoom } from "../../api/roomApi.js";
import ChangeRoomName from "../../components/RoomQuestion/ChangeRoomName.jsx";
import InviteUser from "../../components/RoomQuestion/InviteUser.jsx";
import { showSuccess, showError } from "../../components/common/Notification.js";
import PlayGameModal from "../../components/RoomQuestion/PlayGameModal.jsx";
import CreateLoading from "../../components/common/CreateLoading.jsx";
import Footer from "../../components/common/Footer.jsx";
import { motion } from "framer-motion";

const ChatPage = () => {
    const { roomId } = useParams();
    const [username, setUsername] = useState("");
    const [userAvatar, setUserAvatar] = useState("");
    const [question, setQuestion] = useState(null);
    const [ranking, setRanking] = useState([]);
    const [startTime, setStartTime] = useState(0);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const [isVerifying, setIsVerifying] = useState(true);
    const [showModelAddQuiz, setShowModelAddQuiz] = useState(false);
    const [showModelMembers, setShowModelMembers] = useState(false);
    const [members, setMembers] = useState([]);
    const [room, setRoom] = useState(null);
    const [changeRoom, setChangeRoom] = useState(false);
    const [showInviteUser, setShowInviteUser] = useState(false);
    const apiUrl = import.meta.env.VITE_ROOM_URL;
    const [showPlayGame, setShowPlayGame] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [timer, setTimer] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [allAnswers, setAllAnswers] = useState([]);
    const [gameEnded, setGameEnded] = useState(false);
    const [finalResults, setFinalResults] = useState(null);
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
    const [totalQuestions, setTotalQuestions] = useState(0);
    
    // Refs for auto-scrolling
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    const handleRestartGame = () => {
        // Send restart game message to websocket
        sendMessage(roomId, "/restart", username, userAvatar);
    };

    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        const verifyRoomAccess = async () => {
            try {
                // Check if user has room access in session storage
                const hasAccess = sessionStorage.getItem(`room_access_${roomId}`);
                if (!hasAccess) {
                    // Verify room access with backend
                    const data = await checkAccessRoom(roomId)
                    console.log("data"+ data);
                    if (!data.success || data.requiresPassword) {
                        navigate('/', { 
                            state: { 
                                roomId,
                                message: 'Please enter room password' 
                            } 
                        });
                        return;
                    }
                    // Store room access after verification
                    sessionStorage.setItem(`room_access_${roomId}`, 'true');
                }
                
                // Get cached username after verification
                const cachedUsername = localStorage.getItem('username');
                if (cachedUsername) {
                    setUsername(cachedUsername);
                    const cachedAvatar = localStorage.getItem('userAvatar');
                    if (cachedAvatar) {
                        setUserAvatar(cachedAvatar);
                    }
                    
                    // Ensure WebSocket is connected before joining room
                    await initializeWebSocket();
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay to ensure connection
                    joinRoom(roomId, cachedUsername);
                } else {
                    setShowModal(true);
                }
    
                setIsVerifying(false);
            } catch (error) {
                console.error('Room verification error:', error);
                navigate('/');
            }
        };
    
        verifyRoomAccess();
    }, [roomId, navigate]);
       
    useEffect(() => {
        // Check game state on component mount
        const gameState = localStorage.getItem(`gameInProgress_${roomId}`);
        if (gameState === 'true') {
            setShowPlayGame(!showPlayGame);
        }
    }, [roomId]);
   
    useEffect(() => {
        const handleWebSocketMessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("📩 Data received FE:", data);
            switch(data.type) {
                case "message":
                    setMessages(prev => [...prev, {
                        username: data.username, 
                        message: data.message,
                        userAvatar: data.userAvatar,
                        timestamp: new Date().toISOString()
                    }]);
                    break;
                case "playerList":
                    setMembers(data.players.map(playerName => ({
                        username: playerName
                    })));
                    break;
                case "start_game":
                    setShowPlayGame(true);
                    setGameEnded(false);
                    localStorage.setItem(`gameInProgress_${roomId}`, 'true');
                    showSuccess("Game started");
                    break;
                case 'end_game':
                    setGameEnded(true);
                    setFinalResults(data.results);
                    localStorage.removeItem(`gameInProgress_${roomId}`);
                    break;
                case 'question':
                    setCurrentQuestion(data.question);
                    console.log("📩 Question received:", data.question);
                    
                    setShowResults(false);
                    setCurrentQuestionNumber(data.questionNumber || currentQuestionNumber + 1);
                    setTotalQuestions(data.totalQuestions);
                    break;
                    
                case 'all_answers':
                    setShowResults(true);
                    setAllAnswers(data.answers);
                   
                    if (currentQuestionNumber === totalQuestions) {
                        setGameEnded(true);
                    }
                    break;
            }
        };

        ws.onmessage = handleWebSocketMessage;

        // Cleanup function
        return () => {
            ws.onmessage = null;
        };
    },[currentQuestionNumber, totalQuestions, roomId]);
    
    
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const response = await getRoomById(roomId);
                setRoom(response);
                
            } catch (error) {
                console.error('Fetch room error:', error);
            }
        }
        fetchRoom();
    }, [roomId]);

    useEffect(() => {
        const cachedUsername = localStorage.getItem('username');
        
        if (!cachedUsername) {
            setShowModal(true);
        }
    }, []);

    if (isVerifying) {
        return (
            <div className="loading-container d-flex flex-column align-items-center justify-content-center vh-100">
                <CreateLoading />
                <p className="mt-3 text-muted">Verifying room access...</p>
            </div>
        );
    }

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            sendMessage(roomId, inputMessage, username, userAvatar);
            setInputMessage("");
        }
    };

    const handleSetUsername = async (userData) => {
        const { name, avatar } = userData;  
        setUsername(name);
        setUserAvatar(avatar)  
        localStorage.setItem('username', name);
        localStorage.setItem('username_timestamp', Date.now().toString());
        if (avatar) {
            localStorage.setItem('userAvatar', avatar);
        }
        
        try {
            await initializeWebSocket();
            joinGame(name);
            joinRoom(roomId, name);
            setShowModal(false);
        } catch (error) {
            console.error('Failed to join room:', error);
            showError('Failed to join room. Please try again.');
        }
    };
    const handleShowModal = () => {
        setShowModelAddQuiz(true);
    }
    const handleShowMemberModal = () => {
        setShowModelMembers(true);
    }

    const handleChangeRoomName = () => {
        setChangeRoom(true);
    }
    const handleShowInvite = () => {
        setShowInviteUser(true);
    }
    const handlePlayGame = () => {
        startGame(roomId);
    }

    const handleCopyRoomLink = () => {
        const roomLink = `${window.location.origin}/room/${roomId}`;
        navigator.clipboard.writeText(roomLink)
            .then(() => showSuccess("Room link copied to clipboard"))
            .catch(() => showError("Failed to copy room link"));
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chat-page-container min-vh-100 d-flex flex-column" style={{ backgroundColor: "#f5f7fa" }}>
            <NavBar/>
            
            <Container fluid className="flex-grow-1 py-4 px-lg-5">
                <Row className="h-100 g-4">
                    {/* Left Sidebar - Members & Options */}
                    <Col lg={3} className="d-none d-lg-block">
                        <Card className="room-sidebar shadow-sm h-100">
                            <Card.Header className="bg-primary text-white py-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 text-truncate">
                                        Room Members <Badge bg="light" text="dark">{members.length}</Badge>
                                    </h5>
                                    <Button 
                                        variant="light" 
                                        size="sm" 
                                        className="rounded-circle p-1"
                                        onClick={handleShowMemberModal}
                                    >
                                        <FaUsersGear />
                                    </Button>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0 member-list">
                                <div className="p-3">
                                    <InputGroup size="sm" className="mb-3">
                                        <Form.Control
                                            placeholder="Search members..."
                                            aria-label="Search members"
                                        />
                                    </InputGroup>
                                </div>
                                <ul className="list-group list-group-flush">
                                    {members.map((member, index) => (
                                        <motion.li 
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="list-group-item border-0 d-flex align-items-center px-3 py-2"
                                        >
                                            <div className="member-avatar me-2">
                                                {member.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-truncate">
                                                {member.username}
                                            </span>
                                            {member.username === username && (
                                                <Badge bg="primary" className="ms-auto">You</Badge>
                                            )}
                                        </motion.li>
                                    ))}
                                </ul>
                            </Card.Body>
                            <Card.Footer className="p-3 bg-white">
                                <Button 
                                    variant="primary" 
                                    className="w-100 d-flex align-items-center justify-content-center"
                                    onClick={handleShowInvite}
                                >
                                    <MdOutlineGroupAdd className="me-2" />
                                    Invite Others
                                </Button>
                            </Card.Footer>
                        </Card>
                    </Col>
                    
                    {/* Main Chat Area */}
                    <Col lg={9} md={12}>
                        <Card className="chat-container shadow-sm h-100">
                            <Card.Header className="d-flex justify-content-between align-items-center py-3">
                                <div className="d-flex align-items-center">
                                    {room && (
                                        <>
                                            <div className="room-avatar me-2">
                                                {room.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h5 className="mb-0 room-title text-truncate" title={room?.name}>
                                                    {room?.name}
                                                </h5>
                                                <small className="text-muted">
                                                    {members.length} members • Active now
                                                </small>
                                            </div>
                                        </>
                                    )}
                                </div>
                                
                                <div className="d-flex">
                                    <Button 
                                        variant="success"
                                        className="d-flex align-items-center me-2"
                                        onClick={handlePlayGame}
                                    >
                                        <FaPlay size={16} className="me-2" />
                                        <span className="d-none d-md-inline">Play Quiz</span>
                                    </Button>
                                    
                                    <Dropdown align="end">
                                        <Dropdown.Toggle variant="light" id="dropdown-room-options" className="rounded-circle p-2">
                                            <MdMoreVert />
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu className="shadow-sm border-0">
                                            <Dropdown.Item onClick={handleShowModal}>
                                                <FaCircleQuestion className="me-2 text-primary" />
                                                Add Quiz
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={handleChangeRoomName}>
                                                <TbArrowsExchange className="me-2 text-danger" />
                                                Change Room Name
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={handleShowMemberModal}>
                                                <FaUsersGear className="me-2 text-secondary" />
                                                Manage Members
                                            </Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item onClick={handleCopyRoomLink}>
                                                <FaRegCopy className="me-2 text-info" />
                                                Copy Room Link
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </Card.Header>
                            
                            <Card.Body className="p-0 position-relative">
                                <div 
                                    className="chat-messages p-3"
                                    ref={chatContainerRef}
                                    style={{ height: "calc(100vh - 260px)", overflowY: "auto" }}
                                >
                                    {messages.length === 0 ? (
                                        <div className="text-center py-5 text-muted">
                                            <MdSmartDisplay size={50} className="mb-3 text-primary opacity-50" />
                                            <h5>Welcome to the Room!</h5>
                                            <p>Start chatting or play a quiz with your friends.</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, index) => {
                                            const isCurrentUser = msg.username === username;
                                            const showAvatar = index === 0 || messages[index - 1]?.username !== msg.username;
                                            
                                            return (
                                                <motion.div 
                                                    key={index} 
                                                    className={`message-container ${isCurrentUser ? 'current-user' : ''} mb-2`}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <div className="d-flex">
                                                        {!isCurrentUser && showAvatar && (
                                                            <div className="me-2">
                                                                {msg.userAvatar ? (
                                                                    <img 
                                                                        src={msg.userAvatar} 
                                                                        alt={`${msg.username}'s avatar`}
                                                                        className="message-avatar"
                                                                    />
                                                                ) : (
                                                                    <div className="message-avatar-placeholder">
                                                                        {msg.username.charAt(0).toUpperCase()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        
                                                        <div className={`message-content-wrapper ${isCurrentUser ? 'ms-auto' : ''}`}>
                                                            {!isCurrentUser && showAvatar && (
                                                                <div className="message-username">
                                                                    {msg.username}
                                                                </div>
                                                            )}
                                                            
                                                            <div className={`message-bubble ${isCurrentUser ? 'current-user-bubble' : 'other-user-bubble'}`}>
                                                                {msg.message}
                                                                <span className="message-time">
                                                                    {formatTime(msg.timestamp || new Date())}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        {isCurrentUser && showAvatar && (
                                                            <div className="ms-2 d-none d-md-block">
                                                                {msg.userAvatar ? (
                                                                    <img 
                                                                        src={msg.userAvatar} 
                                                                        alt={`${msg.username}'s avatar`}
                                                                        className="message-avatar"
                                                                    />
                                                                ) : (
                                                                    <div className="message-avatar-placeholder">
                                                                        {msg.username.charAt(0).toUpperCase()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </Card.Body>
                            
                            <Card.Footer className="p-3 bg-white">
                                <Form onSubmit={handleSendMessage}>
                                    <InputGroup>
                                        <Form.Control
                                            placeholder="Type a message..."
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            className="py-2"
                                        />
                                        <Button 
                                            variant="primary" 
                                            type="submit"
                                            disabled={!inputMessage.trim()}
                                            className="d-flex align-items-center"
                                        >
                                            <MdSend />
                                            <span className="ms-2 d-none d-md-inline">Send</span>
                                        </Button>
                                    </InputGroup>
                                </Form>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            </Container>
            
            {/* Mobile bottom navigation bar */}
            <div className="d-lg-none fixed-bottom bg-white shadow-lg p-2 border-top">
                <Row className="text-center g-0">
                    <Col xs={3}>
                        <Button 
                            variant="light" 
                            className="rounded-circle p-2"
                            onClick={handleShowMemberModal}
                        >
                            <FaUsersGear />
                            <div className="small mt-1">Members</div>
                        </Button>
                    </Col>
                    <Col xs={3}>
                        <Button 
                            variant="light" 
                            className="rounded-circle p-2"
                            onClick={handleShowInvite}
                        >
                            <MdOutlineGroupAdd />
                            <div className="small mt-1">Invite</div>
                        </Button>
                    </Col>
                    <Col xs={3}>
                        <Button 
                            variant="light" 
                            className="rounded-circle p-2"
                            onClick={handleShowModal}
                        >
                            <FaCircleQuestion />
                            <div className="small mt-1">Quiz</div>
                        </Button>
                    </Col>
                    <Col xs={3}>
                        <Button 
                            variant="light" 
                            className="rounded-circle p-2"
                            onClick={handlePlayGame}
                        >
                            <FaPlay />
                            <div className="small mt-1">Play</div>
                        </Button>
                    </Col>
                </Row>
            </div>
            
            {/* Modals */}
            <ChoiceName 
                show={showModal} 
                onClose={() => setShowModal(false)}
                onSubmit={handleSetUsername}
            />
            
            {showModelAddQuiz && 
                <AddQuiz 
                    show={showModelAddQuiz} 
                    onClose={() => setShowModelAddQuiz(false)} 
                />
            }
            
            {showModelMembers && 
                <ViewMember 
                    show={showModelMembers}
                    onClose={() => setShowModelMembers(false)} 
                    members={members}
                />
            }
            
            {changeRoom && 
                <ChangeRoomName
                    show={changeRoom}
                    onClose={() => setChangeRoom(false)}
                    room={room}
                />
            }
            
            {showInviteUser && 
                <InviteUser
                    show={showInviteUser}
                    onClose={() => setShowInviteUser(false)}
                    url={apiUrl + roomId}
                />
            }
            
            {showPlayGame && 
                <PlayGameModal
                    show={showPlayGame}
                    onClose={() => {
                        setShowPlayGame(false); 
                        endGame(roomId);
                        localStorage.removeItem(`gameInProgress_${roomId}`);
                    }}
                    currentQuestion={currentQuestion}
                    timer={timer}
                    showResults={showResults}
                    allAnswers={allAnswers}
                    gameEnded={gameEnded}
                    finalResults={finalResults}
                    onAnswer={(answer) => sendAnswer(roomId, answer)}
                    currentQuestionNumber={currentQuestionNumber}
                    totalQuestions={totalQuestions}
                    onRestart={handleRestartGame}
                />
            }
            
          
        </div>
    );
};

export default ChatPage;