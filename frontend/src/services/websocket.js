const ws = new WebSocket("ws://localhost:5000");

let messageHandler = null;

ws.onopen = () => {
    console.log("🔗 WebSocket connected!");
    
};

ws.onerror = (error) => {
    console.error("WebSocket Error:", error);
};

ws.onclose = () => {
    console.log("❌ WebSocket disconnected");
};

ws.onmessage = (event) => {
    
    try {
        const data = JSON.parse(event.data);
        console.log("📩 Parsed data:", data);
        if (messageHandler) {
            messageHandler(data);
        }
    } catch (error) {
        console.error("Error parsing message:", error);
    }
};

let messageQueue = [];
const safeSend = (message) => {
    console.log("📤 SafeSend state:", ws.readyState);
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    } else {
        console.log("⏳ Connection not ready, queueing message");
        messageQueue.push(message);
    }
};

export function setMessageHandler(handler) {
    messageHandler = handler;
}

export function joinGame(username) {
    safeSend({ type: "join", username });
};

export const sendAnswer = (username, answer, time) => {
    safeSend({ type: "answer", username, answer, time });
};

export const sendMessage = (roomId,message, username,userAvatar) => {
    safeSend({ 
        roomId,
        type: "message", 
        message,
        username,
        userAvatar 
    });
};

export const createRoom = (roomId, password) => {
    safeSend({ 
        type: "create_room", 
        roomId, 
        password 
    });
};

export const joinRoom = (roomId, username, password) => {
    safeSend({ 
        type: "join_room", 
        roomId, 
        username, 
        password 
    });
};

// Update existing sendMessage

export default ws;