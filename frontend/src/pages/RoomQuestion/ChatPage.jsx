import React, { useState, useEffect } from "react";
import ws, { joinGame,joinRoom, sendAnswer, sendMessage, startGame,endGame,initializeWebSocket } from "../../services/websocket.js";
import ChoiceName from "../../components/RoomQuestion/ChoiceName";
import { useParams,useNavigate } from "react-router-dom";  // Import from react-router-dom
import NavBar from "../../layout/NavBar.jsx";
import { MdOutlineGroupAdd } from "react-icons/md";
import { FaCircleQuestion } from "react-icons/fa6";
import AddQuiz from "../../components/RoomQuestion/AddQuiz.jsx";
import ViewMember from "../../components/RoomQuestion/ViewMember.jsx";
import { TbArrowsExchange } from "react-icons/tb";
import { FaUsersGear } from "react-icons/fa6";
import { getRoomById, checkAccessRoom } from "../../api/roomApi.js";
import ChangeRoomName from "../../components/RoomQuestion/ChangeRoomName.jsx";
import InviteUser from "../../components/RoomQuestion/InviteUser.jsx";
import { MdSmartDisplay } from "react-icons/md";
import { showSuccess, showError } from "../../components/common/Notification.js";
import PlayGameModal from "../../components/RoomQuestion/PlayGameModal.jsx";
import CreateLoading from "../../components/common/CreateLoading.jsx";
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
    const [room,setRoom] = useState({});
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
                        userAvatar: data.userAvatar
                    }]);
                    break;
                case "playerList":
                    setMembers(data.players.map(playerName => ({
                        username: playerName
                    })));
                    break;
                case "start_game":
                    setShowPlayGame(true);
                    localStorage.setItem(`gameInProgress_${roomId}`, 'true');
                    showSuccess("Game started");
                    break;
                case "end_game":
                    setShowPlayGame(false);
                    localStorage.removeItem(`gameInProgress_${roomId}`);
                    showSuccess("Game ended!");
                    break;
                // Add game state handling here
                case 'question':
                    setCurrentQuestion(data.question);
                    console.log("📩 Question received:", data.question);
                    setTimer(data.timeLimit);
                    setShowResults(false);
                    break;
                    
                case 'all_answers':
                    setShowResults(true);
                    setAllAnswers(data.answers);
                    break;
                    
                case 'game_end':
                    setGameEnded(true);
                    setFinalResults(data.results);
                    break;
            }
            
        };

        ws.onmessage = handleWebSocketMessage;

        // Cleanup function
        return () => {
            ws.onmessage = null;
        };
    },[]);
    
    
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
        return <div><CreateLoading/></div>;
    }
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            sendMessage(roomId,inputMessage,username,userAvatar);
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

    return (
        <div className=" mt-5">
            <NavBar/>
           <div className="d-flex justify-content-between align-items-center container">
           {room &&  <h5 className="card-title mb-0" title={room.name}>
              {room.name.length > 20 ? `${room.name.substring(0, 20)}...` : room.name}
            </h5>} 
           
           <div className=" container d-flex justify-content-end">
            
                <button className="btn btn-danger me-2" onClick={handleChangeRoomName}>
                    <TbArrowsExchange className="mb-1 me-2" />
                    <span className="d-none d-md-inline">Change Room name</span>
                </button>
                <button className="btn btn-success me-2" onClick={handleShowInvite}>
                    <MdOutlineGroupAdd className="mb-1 me-2" />
                    <span className="d-none d-md-inline">Invite</span>
                </button>
                <button className="btn btn-secondary me-2" onClick={handleShowModal}>
                    <FaCircleQuestion className="mb-1 me-2" />
                    <span className="d-none d-md-inline">Add Quiz</span>
                </button>
                <button className="btn btn-secondary" onClick={handleShowMemberModal}>
                    <FaUsersGear className="mb-1 me-2" />
                    <span className="d-none d-md-inline">Members ({members.length})</span>
                </button>
                <button className="btn btn-success me-2 ms-2" onClick={handlePlayGame}>
                    <MdSmartDisplay className="mb-1 me-2" />
                    <span className="d-none d-md-inline">Play Game</span>
                </button>
            </div>
           </div>
           <ChoiceName 
                show={showModal} 
                onClose={() => setShowModal(false)}
                onSubmit={handleSetUsername}
            />
        <div className="container">
           
            <div 
             id="chat"
            style={{
                border: "1px solid #000", 
                height: "500px", 
                overflowY: "scroll",
                marginTop: "20px",
                width: "",
            }}
            >
                {messages.map((msg, index) => (
                     <div 
                     key={index} 
                     style={{
                         display: 'flex',
                         alignItems: 'center',
                         margin: '10px 0',
                         padding: '5px'
                     }}
                 >
                     {msg.userAvatar ? (
                         <img 
                             src={msg.userAvatar} 
                             alt={`${msg.username}'s avatar`}
                             style={{
                                 width: '40px',
                                 height: '40px',
                                 borderRadius: '50%',
                                 marginRight: '10px',
                                 objectFit: 'cover'
                             }}
                         />
                     ) : (
                         <div 
                             style={{
                                 width: '40px',
                                 height: '40px',
                                 borderRadius: '50%',
                                 marginRight: '10px',
                                 backgroundColor: '#ccc',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 fontSize: '18px'
                             }}
                         > 
                             {msg.username.charAt(0).toUpperCase()}
                         </div>
                     )}
                     <div>
                         <strong style={{color:"red"}}>{msg.username}: </strong>
                         {msg.message}
                     </div>
                 </div>
                ))}
            </div>
        </div>
           
            <div style={{
                
            }}
                className="mt-5 mb-5 container"
            >
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type a message"
                    className="me-5"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
                />
                <button 
                    onClick={handleSendMessage}
                    className="btn btn-secondary w-100 mb-5 "
                >
                    Send
                </button>
            </div>
            {showModelAddQuiz && <AddQuiz show={showModelAddQuiz} onClose={() => setShowModelAddQuiz(false)} />}
            
            {showModelMembers && <ViewMember 
            show={showModelMembers}
            onClose={() => setShowModelMembers(false)} 
            members={members}
            />}
            {changeRoom && <ChangeRoomName
            show={changeRoom}
            onClose={() => setChangeRoom(false)}
            room={room}
            />}

            {showInviteUser && <InviteUser
            show={showInviteUser}
            onClose={() => setShowInviteUser(false)}
            url={apiUrl + roomId}
            />}
            {showPlayGame && <PlayGameModal
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
                    onAnswer={(answer, timeRemaining) => sendAnswer(roomId, answer, timeRemaining)}

            />}
        </div>
    );
};

export default ChatPage;