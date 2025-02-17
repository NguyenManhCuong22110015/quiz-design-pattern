import React, { useState, useEffect } from "react";
import ws, { joinGame,joinRoom, sendAnswer, sendMessage } from "../../services/websocket.js";
import ChoiceName from "../../components/RoomQuestion/ChoiceName";
import { useParams,useNavigate } from "react-router-dom";  // Import from react-router-dom

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


    useEffect(() => {
        const verifyRoomAccess = async () => {
            try {
                // Check if user has room access in session storage
                const hasAccess = sessionStorage.getItem(`room_access_${roomId}`);
                if (!hasAccess) {
                    // Verify room access with backend
                    const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/check-access`);
                    const data = await response.json();

                    if (!data.success || data.requiresPassword) {
                        navigate('/', { 
                            state: { 
                                roomId,
                                message: 'Please enter room password' 
                            } 
                        });
                        return;
                    }
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
        const cachedUsername = localStorage.getItem('username');
        const cachedTimestamp = localStorage.getItem('username_timestamp');
        const ONE_HOUR = 60 * 60 * 1000; 
        if (cachedUsername && cachedTimestamp) {
            const isValid = (Date.now() - parseInt(cachedTimestamp)) < ONE_HOUR;
            if (isValid) {
                setUsername(cachedUsername);
                const cachedAvatar = localStorage.getItem('userAvatar');
                if (cachedAvatar) {
                    setUserAvatar(cachedAvatar);
                }
                // Send join room message with cached data
                ws.send(JSON.stringify({
                    type: 'join_room',
                    roomId,
                    username: cachedUsername,
                    userAvatar: ""
                }));
            } else {
                setShowModal(true);
            }
        } else {
            setShowModal(true);
        }
       
    }, [username,roomId]);

    useEffect(() => {
        const handleWebSocketMessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("📩 Data received FE:", data);
            if (data.type === "question") {
                setQuestion(data);
                setStartTime(Date.now());
            } else if (data.type === "ranking") {
                setRanking(data.ranking);
            } else if (data.type === "message") {
                setMessages(prev => [...prev, {
                    username: data.username, 
                    message: data.message,
                    userAvatar: data.userAvatar
                }]);
            }
        };

        ws.onmessage = handleWebSocketMessage;

        // Cleanup function
        return () => {
            ws.onmessage = null;
        };
    },[]);
        
    if (isVerifying) {
        return <div>Verifying room access...</div>;
    }
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            sendMessage(roomId,inputMessage,username,userAvatar);
            setInputMessage("");
        }
    };
    const handleSetUsername = (userData) => {
        const { name, avatar } = userData;  
        setUsername(name);
        setUserAvatar(avatar)  
        localStorage.setItem('username', name);
        localStorage.setItem('username_timestamp', Date.now().toString());
        if (avatar) {
            localStorage.setItem('userAvatar', avatar);
        }
        joinGame(name);
       
        setShowModal(false);
    };
    return (
        <div>
           {username && <h3>Welcome, {username}!</h3>}
           <ChoiceName 
                show={showModal} 
                onClose={() => setShowModal(false)}
                onSubmit={handleSetUsername}
            />
            <div 
             id=""
            style={{
                border: "1px solid #000", 
                height: "300px", 
                overflowY: "scroll",
                marginTop: "20px"
            }}>
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
                         <strong>{msg.username}</strong>
                         {msg.message}
                     </div>
                 </div>
                ))}
            </div>
            <div>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type a message"
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatPage;