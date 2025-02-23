let ws = null;
let messageQueue = [];
let messageHandler = null;
let isConnected = false;

const initializeWebSocket = () => {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    console.log("🔄 WebSocket is already active or connecting...");
    return ws;
  }

  ws = new WebSocket("wss://quizze-backend-lb3j.onrender.com");

  ws.onopen = () => {
    console.log("🔗 WebSocket connected!");
    isConnected = true;

    // Send queued messages once connected
    while (messageQueue.length > 0 && ws.readyState === WebSocket.OPEN) {
      const message = messageQueue.shift();
      ws.send(JSON.stringify(message));
    }
  };

  ws.onerror = (error) => {
    console.error("❌ WebSocket Error:", error);
    isConnected = false;
  };

  ws.onclose = () => {
    console.log("❌ WebSocket disconnected, retrying in 3 seconds...");
    isConnected = false;
    setTimeout(initializeWebSocket, 3000);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("📩 Received data:", data);
      if (messageHandler) {
        messageHandler(data);
      }
    } catch (error) {
      console.error("❌ Error parsing message:", error);
    }
  };

  return ws;
};

const safeSend = (message) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.log("⏳ WebSocket not ready, queuing message...");
    messageQueue.push(message);

    // Reinitialize WebSocket if it's closed
    if (!ws || ws.readyState === WebSocket.CLOSED) {
      initializeWebSocket();
    }
    return;
  }

  try {
    ws.send(JSON.stringify(message));
    console.log("📤 Message sent:", message);
  } catch (error) {
    console.error("❌ Error sending message:", error);
    messageQueue.push(message);
  }
};

export function setMessageHandler(handler) {
  messageHandler = handler;
}

// Initialize WebSocket connection
ws = initializeWebSocket();

// Export functions with safeSend
export const joinGame = (username) => {
  safeSend({ type: "join", username });
};

export const sendAnswer = (roomId, answer, timeRemaining) => {
  safeSend({
      type: 'submit_answer',
      roomId,
      answer,
      timeRemaining
  });
};

export const sendMessage = (roomId, message, username, userAvatar) => {
  safeSend({ 
    type: "message", 
    roomId,
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


export const startGame = (roomId) => {
  safeSend({ type: "start_game", roomId });
}

export const endGame = (roomId_start) => {
  safeSend({ type: "end_game", roomId_start });
}

export const getNextQuestion = (quizId) => {
  safeSend({ type: "next_question", quizId });
}

export default ws;
