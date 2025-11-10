import { useState, useRef, useEffect } from "react";
import api from "../../api/api";
import "./assets/css/chatbox.css";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import chatbotIcon from "./assets/images/icons/chatbot.png";

function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;
        
        const userMessage = { sender: "user", text: input.trim() };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await api.get(`/chatbot/ask?question=${encodeURIComponent(userMessage.text)}`);
            const answer = res.data;
            const botMessage = { sender: "bot", text: answer };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage = { sender: "bot", text: "Xin lỗi, tôi không thể trả lời ngay bây giờ. Vui lòng thử lại sau." };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const toggleChatbox = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`chatbox-container ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="chatbox-header" onClick={toggleChatbox}>
                <h3>💬 Trợ lý AI</h3>
                <button className="chatbox-toggle">
                    {isCollapsed ? <FaChevronUp /> : <FaChevronDown />}
                </button>
            </div>
            
            {!isCollapsed && (
                <div className="chatbox-content">
                    <div className="chatbox-messages">
                        {messages.length === 0 ? (
                            <div className="chatbox-empty">
                                <div className="chatbox-empty-icon">
                                    <img src={chatbotIcon} alt="Chatbot" />
                                </div>
                                <div className="chatbox-empty-text">
                                    Xin chào! Tôi là trợ lý AI của PrimeShop.<br />
                                    Tôi có thể giúp bạn tìm hiểu về sản phẩm, đặt hàng, hoặc trả lời các câu hỏi khác.
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <div key={i} className={`chatbox-message ${msg.sender}`}>
                                    {renderMessage(msg.text)}
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div className="chatbox-message bot">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    Đang trả lời...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <div className="chatbox-input-container">
                        <input
                            className="chatbox-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Nhập câu hỏi của bạn..."
                            disabled={isLoading}
                        />
                        <button 
                            className="chatbox-send-btn"
                            onClick={sendMessage}
                            disabled={!input.trim() || isLoading}
                        >
                            Gửi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

function renderMessage(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) =>
      urlRegex.test(part) ? (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
          {part}
        </a>
      ) : (
        part
      )
    );
  }  

export default Chatbot;