import React, { useState, useEffect } from "react";
import ws, { joinGame, sendAnswer, sendMessage } from "../../services/websocket.js";
import ChoiceName from "../../components/RoomQuestion/ChoiceName";

const ChatPage = () => {
    const [username, setUsername] = useState("");
    const [question, setQuestion] = useState(null);
    const [ranking, setRanking] = useState([]);
    const [startTime, setStartTime] = useState(0);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    useEffect(() => {
        const cachedUsername = localStorage.getItem('username');
        const cachedTimestamp = localStorage.getItem('username_timestamp');
        const ONE_HOUR = 60 * 60 * 1000; 
        if (cachedUsername && cachedTimestamp) {
            const isValid = (Date.now() - parseInt(cachedTimestamp)) < ONE_HOUR;
            if (isValid) {
                setUsername(cachedUsername);
                joinGame(cachedUsername);
            } else {
                setShowModal(true);
            }
        } else {
            setShowModal(true);
        }
       
    }, []);

    useEffect(() => {
        const handleWebSocketMessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("📩 Data received:", data);
           
            if (data.type === "question") {
                setQuestion(data);
                setStartTime(Date.now());
            } else if (data.type === "ranking") {
                setRanking(data.ranking);
            } else if (data.type === "message") {
                setMessages(prev => [...prev, data.message]);
            }
        };

        ws.onmessage = handleWebSocketMessage;

        // Cleanup function
        return () => {
            ws.onmessage = null;
        };
    },[]);
        
   
 
    const handleAnswer = (answer) => {
        const timeTaken = Date.now() - startTime;
        sendAnswer(username, answer, timeTaken);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            
            sendMessage(inputMessage,username);
            setInputMessage("");
        }
    };
    const handleSetUsername = (name) => {
        if (name.trim()) {
            setUsername(name);
            localStorage.setItem('username', name);
            localStorage.setItem('username_timestamp', Date.now().toString());
            joinGame(name);
            setShowModal(false);
        }
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
             id="chat-box"
            style={{
                border: "1px solid #000", 
                height: "300px", 
                overflowY: "scroll",
                marginTop: "20px"
            }}>
                {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
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