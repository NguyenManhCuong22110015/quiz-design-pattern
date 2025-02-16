const ws = new WebSocket("ws://localhost:5000");

ws.onopen = () => console.log("🔗 WebSocket connected!");

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("📩 Data received:", data);
};

export const joinGame = (username) => {
    ws.send(JSON.stringify({ type: "join", username }));
};

export const sendAnswer = (username, answer, time) => {
    ws.send(JSON.stringify({ type: "answer", username, answer, time }));
};

export default ws;
