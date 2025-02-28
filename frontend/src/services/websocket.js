let ws = null;
let messageQueue = [];
let messageHandler = null;
let isConnecting = false;
const apiUrl = import.meta.env.VITE_BACKEND_API;

export const initializeWebSocket = () => {
  return new Promise((resolve, reject) => {
    if (ws?.readyState === WebSocket.OPEN) {
      resolve(ws);
      return;
    }

    if (isConnecting) {
      const checkConnection = setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) {
          clearInterval(checkConnection);
          resolve(ws);
        }
      }, 100);
      return;
    }

    isConnecting = true;
    ws = new WebSocket(apiUrl);

    ws.onopen = () => {
      isConnecting = false;
      console.log("🔗 WebSocket connected!");
      
      // Process queued messages
      while (messageQueue.length > 0) {
        const msg = messageQueue.shift();
        ws.send(JSON.stringify(msg));
      }
      
      resolve(ws);
    };

    ws.onerror = (error) => {
      isConnecting = false;
      console.error("❌ WebSocket Error:", error);
      reject(error);
    };
    ws.onclose = () => {
      isConnecting = false;
      console.log("❌ WebSocket disconnected, reconnecting...");
      ws = null;
    
      setTimeout(() => {
        initializeWebSocket().then((socket) => {
          ws = socket;
          processQueue();
        });
      }, 3000);
    };
  });
};

export const isWebSocketConnected = () => {
  return ws && ws.readyState === WebSocket.OPEN;
};

// Modify the safeSend function to return a promise
const safeSend = (message) => {
  return new Promise((resolve, reject) => {
    const sendMessage = () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify(message));
          console.log("📤 Message sent:", message);
          resolve();
        } catch (error) {
          console.error("❌ Error sending message:", error);
          reject(error);
        }
      } else {
        console.log("⏳ WebSocket not ready, queuing message:", message);
        messageQueue.push({ message, resolve, reject });

        // Kiểm tra nếu chưa có kết nối, thử lại sau 100ms
        if (!isConnecting) {
          initializeWebSocket().then(() => {
            processQueue();
          });
        }
      }
    };

    if (!ws || ws.readyState === WebSocket.CONNECTING) {
      messageQueue.push({ message, resolve, reject });
    } else {
      sendMessage();
    }
  });
};

// Hàm xử lý tin nhắn chờ
const processQueue = () => {
  while (messageQueue.length > 0 && ws.readyState === WebSocket.OPEN) {
    const { message, resolve, reject } = messageQueue.shift();
    try {
      ws.send(JSON.stringify(message));
      resolve();
    } catch (error) {
      reject(error);
    }
  }
};


export function setMessageHandler(handler) {
  messageHandler = handler;
}

// Initialize WebSocket connection
initializeWebSocket().then((socket) => {
  ws = socket;
});

// Export functions with safeSend
export const joinGame = (username) => {
  safeSend({ type: "join", username });
};

export const sendAnswer = (roomId, answer) => {
  console.log("📤 Submitting answer:", answer)
  safeSend({
      type: 'submit_answer',
      roomId,
      answer,
      username: localStorage.getItem('username')
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

export const joinRoom = (roomId, username) => {
  safeSend({ 
    type: "join_room", 
    roomId, 
    username, 
     
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

export const sendNextQuestion = (roomId) => {
  safeSend({ 
      type: "next_question", 
      roomId 
  });
};

export default ws;
