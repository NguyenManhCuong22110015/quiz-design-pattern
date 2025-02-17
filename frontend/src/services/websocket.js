const ws = new WebSocket("ws://localhost:5000");

let messageHandler = null;

ws.onopen = () => {
    console.log("🔗 WebSocket connected!");
    ws.send(JSON.stringify({ type: "ping" }));
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
    if (ws.readyState === 1) {
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

export const sendMessage = (message, username) => {
    safeSend({ 
        type: "message", 
        message,
        username 
    });
};

export default ws;