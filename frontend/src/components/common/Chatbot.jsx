import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, Form, InputGroup } from 'react-bootstrap';
import {  FaTimes, FaPaperPlane } from 'react-icons/fa';
import { SiDependabot } from "react-icons/si";
import {getDataByPrompt} from '../../api/chatbotApi'; // Giả lập API chatbot
import { RiRobot3Fill } from "react-icons/ri";
import ReactMarkdown from 'react-markdown'; // Import Markdown renderer

import '../../styles/Chatbot.css'; 

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Cuộn xuống cuối cùng khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mở/đóng chat
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      // Tin nhắn chào mừng khi mở chat lần đầu
      setTimeout(() => {
        setMessages([
          {
            id: 1,
            text: 'Xin chào! Tôi là QuizzBot. Hãy đặt câu hỏi về bất kỳ điều gì bạn đang tìm kiếm!',
            sender: 'bot',
            time: new Date()
          }
        ]);
      }, 500);
    }
  };

  // Hàm gửi tin nhắn
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    // Thêm tin nhắn của người dùng
    const userMessage = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      time: new Date()
    };

    const currentMessage = newMessage;
    setMessages([...messages, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Giả lập bot đang trả lời
    setTimeout(async () => {
      try {
        // Await the response
        const response = await getBotResponse(currentMessage);
        
        // Tin nhắn trả lời của bot
        const botMessage = {
          id: messages.length + 2,
          text: response,
          sender: 'bot',
          time: new Date()
        };

        setMessages(prevMessages => [...prevMessages, botMessage]);
      } catch (error) {
        console.error("Error getting bot response:", error);
        // Handle error - maybe show an error message
        const errorMessage = {
          id: messages.length + 2,
          text: "Sorry, I encountered an error processing your request.",
          sender: 'bot',
          time: new Date()
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }, 1500);
  };

  // Hàm giả lập trả lời của bot (sẽ thay bằng API thực tế sau)
  const getBotResponse = async (message) => {
    try {
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('xin chào')) {
        return 'Xin chào! Tôi có thể giúp gì cho bạn?';
      } else {
        const response = await getDataByPrompt(message); 
        console.log("Bot response:", response);
        
        // Check if we got a valid response
        if (response && response.trim() !== '') {
          return response;
        } else {
          return 'Tôi không hiểu câu hỏi của bạn. Bạn có thể thử lại không?';
        }
      }
    } catch (error) {
      console.error("Error in getBotResponse:", error);
      return 'Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Bạn có thể thử lại không?';
    }
  };

  // Format thời gian
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chatbot-container">
      {/* Nút chat bot cố định */}
      <Button 
        className={`chatbot-button ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        variant="success"
        aria-label="Chat with bot"
      >
        {isOpen ? <FaTimes /> : <SiDependabot />}
      </Button>

      {/* Khung chat */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <Card className="chatbot-card">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <SiDependabot className="me-2" />
              <span className="fw-bold">QuizzBot</span>
            </div>
            <Button 
              variant="link" 
              className="p-0 text-dark" 
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <FaTimes />
            </Button>
          </Card.Header>
          
          <Card.Body className="chatbot-body">
            <div className="messages-container">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
                >
                  <div className="message-content">
                    <p className="mb-0 small-text "  >
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </p>
                    <small className="message-time">{formatTime(msg.time)}</small>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="message bot-message">
                  <div className="message-content typing">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </Card.Body>
          
          <Card.Footer className="chatbot-footer">
            <Form onSubmit={handleSendMessage}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  aria-label="Type a message"
                />
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={!newMessage.trim()}
                >
                  <FaPaperPlane />
                </Button>
              </InputGroup>
            </Form>
          </Card.Footer>
        </Card>
      </div>
    </div>
  );
};

export default Chatbot;