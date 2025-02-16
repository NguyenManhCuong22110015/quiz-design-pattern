import React, { useState, useEffect } from "react";
import ws, { joinGame, sendAnswer } from "../../services/websocket.js";

const ChatPage = () => {
    const [username, setUsername] = useState("");
    const [question, setQuestion] = useState(null);
    const [ranking, setRanking] = useState([]);
    const [startTime, setStartTime] = useState(0);

    useEffect(() => {
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "question") {
                setQuestion(data);
                setStartTime(Date.now());
            } else if (data.type === "ranking") {
                setRanking(data.ranking);
            }
        };
    }, []);

    const handleJoin = () => {
        joinGame(username);
    };

    const handleAnswer = (answer) => {
        const timeTaken = Date.now() - startTime;
        sendAnswer(username, answer, timeTaken);
    };

    return (
        <div>
            <h2>Quiz Game</h2>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your name" />
            <button onClick={handleJoin}>Join Game</button>

            {question && (
                <div>
                    <h3>{question.question}</h3>
                    {question.options.map((opt, index) => (
                        <button key={index} onClick={() => handleAnswer(opt)}>{opt}</button>
                    ))}
                </div>
            )}

            <h3>Leaderboard:</h3>
            <ul>
                {ranking.map((player, index) => (
                    <li key={index}>{player[0]} - Score: {player[1].score}, Time: {player[1].time}ms</li>
                ))}
            </ul>
        </div>
    );
};

export default ChatPage;
