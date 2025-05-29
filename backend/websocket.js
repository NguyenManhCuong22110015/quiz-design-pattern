import { WebSocketServer, WebSocket } from 'ws';
import Room from './models/RoomQuiz.js';
import Quizze from './models/Quizze.js';
import Question from './models/Question.js';
// Store active connections and game states
const activeRooms = new Map();
class GameState {
    constructor() {
        this.isActive = false;
        this.questions = [];
        this.currentQuestionIndex = -1;
        this.playerAnswers = new Map();
        this.scores = new Map();
        this.totalQuestions = 0;
    }
}

async function createRoom(roomId) {
    try {
        const roomDoc = await Room.findById(roomId);
        if (!roomDoc) return false;

        activeRooms.set(roomId, {
            players: new Map(),
            messages: [],
            gameState: new GameState()
        });

        await Room.findByIdAndUpdate(roomId, { isActive: true });
        return true;
    } catch (error) {
        console.error("Error creating room:", error);
        return false;
    }
}
async function startGame(roomId) {
    const activeRoom = activeRooms.get(roomId);
    if (!activeRoom) return false;

    try {
        const roomDoc = await Room.findById(roomId);
        const quizzes = await Quizze.find({
            _id: { $in: roomDoc.QuizzIds }
        });

        if (!quizzes.length) {
            broadcastToRoom(roomId, {
                type: "error",
                message: "No quizzes found"
            });
            return false;
        }
        const questions = await Question.find({
            quizId: { $in: quizzes.map(quiz => quiz._id) }
        });

        activeRoom.gameState.isActive = true;
        activeRoom.gameState.questions = questions;
        activeRoom.gameState.currentQuestionIndex = 0;
        activeRoom.gameState.playerAnswers.clear();
        activeRoom.gameState.scores.clear();
        activeRoom.gameState.totalQuestions = questions.length; // Set total questions

        sendNextQuestion(roomId);
        return true;
    } catch (error) {
        console.error("Error starting game:", error);
        return false;
    }
}


async function joinRoom(roomId, username, ws) {
    try {
        // Get room from database
        const roomDoc = await Room.findById(roomId);
        if (!roomDoc) {
            return { success: false, message: "Room not found" };
        }

        // Check max players
        const activeRoom = activeRooms.get(roomId);
        if (activeRoom && activeRoom.players.size >= roomDoc.maxPlayers) {
            return { success: false, message: "Room is full" };
        }


        // Create room state if doesn't exist
        if (!activeRoom) {
            const created = await createRoom(roomId);
            if (!created) {
                return { success: false, message: "Failed to initialize room" };
            }
        }

        // Add player
        activeRooms.get(roomId).players.set(username, {
            score: 0,
            time: 0,
            ws: ws
        });

        // Update player count in database
        await Room.findByIdAndUpdate(roomId, {
            currentPlayers: activeRooms.get(roomId).players.size
        });

        return { success: true };
    } catch (error) {
        console.error("❌ Error joining room:", error);
        return { success: false, message: "Server error" };
    }
}

function sendNextQuestion(roomId) {
    const activeRoom = activeRooms.get(roomId);
    if (!activeRoom?.gameState?.isActive) return;

    const { gameState } = activeRoom;

    if (gameState.currentQuestionIndex >= gameState.questions.length) {
        console.log("🏁 Game over");
        endGame(roomId);
        return;
    }

    const question = gameState.questions[gameState.currentQuestionIndex];

    // Clear previous answers
    gameState.playerAnswers.clear();

    // Send question to all players with question number info
    broadcastToRoom(roomId, {
        type: 'question',
        question: {
            text: question.text,
            options: question.options,

        },
        questionNumber: gameState.currentQuestionIndex + 1,
        totalQuestions: gameState.totalQuestions
    });
}
function checkAnswersAndProgress(roomId) {
    const activeRoom = activeRooms.get(roomId);
    if (!activeRoom?.gameState?.isActive) return;

    const { gameState } = activeRoom;
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];

    // Calculate results
    const results = Array.from(activeRoom.players.keys()).map(username => {
        const playerAnswer = gameState.playerAnswers.get(username);
        // Kiểm tra đáp án đúng bằng cách so sánh với isCorrect của option
        const isCorrect = currentQuestion.options[playerAnswer?.answer]?.isCorrect === true;

        if (isCorrect) {
            const currentScore = gameState.scores.get(username) || 0;
            gameState.scores.set(username, currentScore + 10);
        }

        return {
            username,
            answer: playerAnswer?.answer,
            correct: isCorrect,
            score: gameState.scores.get(username) || 0
        };
    });

    // Gửi kết quả về client
    broadcastToRoom(roomId, {
        type: 'all_answers',
        answers: results,
        correctAnswer: currentQuestion.options.findIndex(opt => opt.isCorrect === true)
    });
}

function endGame(roomId) {
    const activeRoom = activeRooms.get(roomId);
    if (!activeRoom?.gameState?.isActive) return;

    const { gameState } = activeRoom;

    // Make sure we have scores for all players
    activeRoom.players.forEach((player, username) => {
        if (!gameState.scores.has(username)) {
            gameState.scores.set(username, 0);
        }
    });

    // Calculate final results
    const finalResults = Array.from(gameState.scores.entries())
        .map(([username, score]) => ({
            username,
            score: score || 0 // Ensure score is never undefined
        }))
        .filter(result => activeRoom.players.has(result.username)) // Only include active players
        .sort((a, b) => b.score - a.score);

    // Send end game message with results
    broadcastToRoom(roomId, {
        type: 'end_game',
        results: finalResults,
        totalQuestions: gameState.totalQuestions
    });

    // Reset game state
    activeRoom.gameState = new GameState();
}

function initWebSocket(server) {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        console.log("🔗 New connection");
        let userRoom = null;

        ws.on("message", async (message) => {
            try {
                const data = JSON.parse(message);
                console.log("📩 Data received:", data);

                switch (data.type) {
                    case "join_room":
                        const joinResult = await joinRoom(data.roomId, data.username, ws);
                        if (joinResult.success) {
                            userRoom = data.roomId;
                            broadcastToRoom(data.roomId, {
                                type: "playerList",
                                players: Array.from(activeRooms.get(data.roomId).players.keys())
                            });
                        } else {
                            ws.send(JSON.stringify({
                                type: "error",
                                message: joinResult.message
                            }));
                        }
                        break;

                    case "message":
                        console.log("📩 userRoom:", userRoom);
                        console.log("📩 activeRooms:", activeRooms);
                        if (!userRoom || !activeRooms.has(userRoom)) {
                            ws.send(JSON.stringify({
                                type: "error",
                                message: "You are not in an active room"
                            }));
                            return;
                        }
                        broadcastToRoom(userRoom, {
                            type: "message",
                            username: data.username,
                            message: data.message,
                            userAvatar: data.userAvatar
                        });
                        break;

                    case "answer":
                        if (!userRoom || !activeRooms.has(userRoom)) return;
                        const activeRoom = activeRooms.get(userRoom);
                        if (data.answer === activeRoom.currentQuestion?.correct) {
                            const player = activeRoom.players.get(data.username);
                            player.score += 10;
                            player.time = data.time;
                            broadcastToRoom(userRoom, {
                                type: "ranking",
                                ranking: Array.from(activeRoom.players.entries())
                                    .map(([name, data]) => [name, {
                                        score: data.score,
                                        time: data.time
                                    }])
                            });
                        }
                        break;
                    case "start_game": {
                        const { roomId } = data;
                        const room = activeRooms.get(roomId);
                        if (room) {
                            // First notify all players
                            broadcastToRoom(roomId, {
                                type: "start_game",
                                message: "Game is starting"
                            });
                            // Then start the game
                            await startGame(roomId);
                        }
                        break;
                    }

                    case "submit_answer": {
                        if (!userRoom) return;
                        const activeRoom = activeRooms.get(userRoom);
                        if (!activeRoom?.gameState?.isActive) return;

                        const { username, answer } = data;
                        activeRoom.gameState.playerAnswers.set(username, { answer });

                        if (activeRoom.gameState.playerAnswers.size === activeRoom.players.size) {
                            checkAnswersAndProgress(userRoom);
                        }
                        break;
                    }
                    case "end_game":
                        const { roomId_start } = data;
                        console.log("📩 End game:", roomId_start);
                        const playroom = activeRooms.get(roomId_start);
                        if (playroom) {
                            playroom.players.forEach(player => {
                                player.ws.send(JSON.stringify({
                                    type: "end_game",
                                    message: "Game has ended"
                                }));
                            })
                        }
                        break;
                    case "next_question": {
                        const { roomId } = data;
                        const activeRoom = activeRooms.get(roomId);
                        if (activeRoom?.gameState?.isActive) {
                            activeRoom.gameState.currentQuestionIndex++;
                            sendNextQuestion(roomId);
                        }
                        break;
                    }
                   case 'global_quiz_completed': {
                console.log("🎉 Backend: Global quiz completion received:", data);
                
                // Broadcast to ALL connected clients
                console.log(`📊 Broadcasting to ${wss.clients.size} total clients`);
                
                let successCount = 0;
                let errorCount = 0;
                
                wss.clients.forEach((client) => {
                    if (client.readyState === 1) { // WebSocket.OPEN
                        try {
                            const responseMessage = {
                                type: 'global_quiz_completed',
                                username: data.username,
                                timestamp: data.timestamp || new Date().toISOString()
                            };
                            
                            client.send(JSON.stringify(responseMessage));
                            successCount++;
                            console.log("✅ Sent to client:", responseMessage);
                        } catch (error) {
                            console.error("❌ Error sending to client:", error);
                            errorCount++;
                        }
                    }
                });
                
                console.log(`📊 Broadcast result: ${successCount} success, ${errorCount} errors`);
                break;
            }
                }



            } catch (error) {
                console.error('Error processing message:', error);
            }
        });

        ws.on("close", async () => {
            if (userRoom) {
                const activeRoom = activeRooms.get(userRoom);
                if (activeRoom) {
                    // Remove player
                    for (const [username, data] of activeRoom.players) {
                        if (data.ws === ws) {
                            activeRoom.players.delete(username);
                            break;
                        }
                    }

                    try {
                        // Update database
                        await Room.findByIdAndUpdate(userRoom, {
                            currentPlayers: activeRoom.players.size
                        });

                        // Clean up if room empty
                        if (activeRoom.players.size === 0) {
                            activeRooms.delete(userRoom);
                            await Room.findByIdAndUpdate(userRoom, {
                                isActive: true,
                                currentPlayers: 0
                            });
                        } else {
                            // Notify remaining players
                            broadcastToRoom(userRoom, {
                                type: "playerList",
                                players: Array.from(activeRoom.players.keys())
                            });
                        }
                    } catch (error) {
                        console.error("Error updating room status:", error);
                    }
                }
            }
            console.log("🚪 Client disconnected");
        });
    });

    return wss;
}

function broadcastToRoom(roomId, data) {
    const activeRoom = activeRooms.get(roomId);
    if (!activeRoom) {
        console.error("❌ Active room not found:", roomId);
        return;
    }

    console.log(`📢 Broadcasting to ${activeRoom.players.size} players in room ${roomId}`);

    // Filter out disconnected players first
    for (const [username, player] of activeRoom.players) {
        if (player.ws.readyState !== 1) {  // If not OPEN
            console.log(`⚠️ Removing disconnected player: ${username}`);
            activeRoom.players.delete(username);
        }
    }

    // Then broadcast to remaining players
    activeRoom.players.forEach(({ ws }, username) => {
        try {
            ws.send(JSON.stringify(data));
            console.log(`✅ Message sent to: ${username}`);
        } catch (error) {
            console.error(`❌ Failed to send to ${username}:`, error);
            activeRoom.players.delete(username);
        }
    });
}
export default initWebSocket;