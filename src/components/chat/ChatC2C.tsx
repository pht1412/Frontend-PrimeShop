import { useState, useRef, useEffect } from "react";
import api from "../../api/api";
import "./assets/css/prime-chat.css";
import "./assets/css/chatbox.css";
import { FaChevronUp, FaChevronDown, FaPaperPlane, FaSpinner, FaFacebookMessenger } from "react-icons/fa";
import dayjs from "../../config/dayjsConfig";
import { wsChatClient } from "./wsClient";
import ConversationItem from "./ConversationItem";

const userData = localStorage.getItem("user");
const userObject = userData ? JSON.parse(userData) : null;
const CURRENT_USER_ID = userObject?.id || 0;

interface Conversation {
  id?: number;
  otherUserId: number;
  otherUsername: string;
  otherAvatar: string;
  lastMessage: string;
  lastMessageAt: string;
}

interface Message {
  id: number;
  conversationId: number;
  content: string;
  senderId: number;
  createdAt: string;
}

export default function PrimeShopChat() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const res = await api.get("/chat/conversations");
      setConversations(res.data);
    } catch (err) {
      console.error("Lỗi fetchConversations:", err);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId: number | null, pageToLoad: number = 0) => {
    if (!conversationId) return;
    setIsLoadingMessages(pageToLoad === 0);
    setIsLoadingMore(pageToLoad > 0);
    try {
      const res = await api.get(`/chat/messages`, {
        params: { conversationId, page: pageToLoad, size: 30 },
      });
      if (res.data && res.data.content) {
        const newMessages = res.data.content.reverse();
        setMessages((prev) => (pageToLoad === 0 ? newMessages : [...newMessages, ...prev]));
        setHasMore(res.data.content.length === 30);
        setPage(pageToLoad);
      } else {
        setMessages([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Lỗi loadMessages:", err);
    } finally {
      setIsLoadingMessages(false);
      setIsLoadingMore(false);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !selectedConversationId) return;
    if (!wsChatClient.isConnected()) {
      console.warn("❌ WebSocket chưa kết nối!");
      return;
    }
    setIsSending(true);
    wsChatClient.sendMessage(selectedConversationId, input);
    setInput("");
  };

  useEffect(() => {
    fetchConversations();
    if (wsChatClient.isConnected()) {
      setIsWsConnected(true);
    } else if (!wsChatClient.client) {
      wsChatClient.connect(
        () => {
          console.log("Kết nối WebSocket thành công");
          setIsWsConnected(true);
        },
        () => console.error("Lỗi kết nối WebSocket")
      );
    }
  }, []);

  useEffect(() => {
    if (!chatMessagesRef.current || !hasMore || isLoadingMore) return;
    const handleScroll = () => {
      if (chatMessagesRef.current) {
        const { scrollTop } = chatMessagesRef.current;
        if (scrollTop < 50 && !isLoadingMore) {
          loadMessages(selectedConversationId, page + 1);
        }
      }
    };

    chatMessagesRef.current.addEventListener("scroll", handleScroll);
    return () => chatMessagesRef.current?.removeEventListener("scroll", handleScroll);
  }, [selectedConversationId, page, hasMore, isLoadingMore]);

  useEffect(() => {
    if (!selectedConversationId) return;
    setPage(0);
    setHasMore(true);
    loadMessages(selectedConversationId, 0);
    if (!isWsConnected) return;
    const subscription = wsChatClient.subscribeConversation(
      selectedConversationId,
      (msg: Message) => {
        console.log("📨 Tin nhắn vào đúng conversation:", msg);
        setMessages((prev) => {
          if (msg.id && prev.some((m) => m.id === msg.id)) {
            console.log("🚫 Bỏ qua tin nhắn trùng lặp:", msg);
            return prev;
          }
          if (msg.senderId === CURRENT_USER_ID) {
            setIsSending(false);
          }
          return [...prev, msg];
        });
      }
    );
    return () => {
      console.log("❌ Unsubscribe conversation channel...");
      wsChatClient.unsubscribeConversation(selectedConversationId);
      setIsSending(false);
    };
  }, [isWsConnected, selectedConversationId]);

  useEffect(() => {
    if (!isWsConnected) return;
    console.log("📌 Subscribing personal queue once...");
    const subscription = wsChatClient.subscribePersonal((msg: Message) => {
      console.log("🔔 Update sidebar real-time:", msg);
      fetchConversations();
    });
    return () => subscription?.unsubscribe();
  }, [isWsConnected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChatbox = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getSelectedConversation = () => {
    return conversations.find((c) => c.id === selectedConversationId);
  };

  const getHeaderText = () => {
    if (isCollapsed) return "Tin nhắn";
    const selected = getSelectedConversation();
    return selected ? selected.otherUsername : "Tin nhắn";
  };

  const formatTime = (time: string) => {
    return dayjs(time).format("HH:mm");
  };

  return (
    <div className={`chatbox-container ${isCollapsed ? "collapsed" : ""}`}>
      <div className="chatbox-header" onClick={toggleChatbox}>
        <h3>
          <FaFacebookMessenger style={{ marginRight: 8 }} /> {getHeaderText()}
        </h3>
        <button className="chatbox-toggle">
          {isCollapsed ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="chatbox-content">
          <div className="primeshop-chat-layout">
            <div className="chat-sidebar">
              <div className="sidebar-header">
                <h4>Danh sách trò chuyện</h4>
              </div>
              <div className="sidebar-search">
                <input type="text" placeholder="Tìm kiếm..." />
              </div>
              <div className="conversation-list">
                {isLoadingConversations ? (
                  <div className="chat-loading">
                    <FaSpinner className="spin" /> Đang tải...
                  </div>
                ) : (
                  conversations.map((convo) => (
                    <ConversationItem
                      key={convo.id}
                      otherAvatar={convo.otherAvatar}
                      otherUsername={convo.otherUsername}
                      lastMessage={convo.lastMessage}
                      lastMessageAt={dayjs(convo.lastMessageAt).fromNow()}
                      isActive={convo.id === selectedConversationId}
                      onClick={() => setSelectedConversationId(convo.id)}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="chat-main">
              {!selectedConversationId ? (
                <div className="chat-empty-main">
                  <FaFacebookMessenger style={{ width: 100, height: 100, opacity: 0.5, color: "#007bff" }} />
                  <h4>Chọn một cuộc trò chuyện</h4>
                  <p>Bắt đầu liên lạc với các shop hoặc xem tin nhắn hỗ trợ.</p>
                </div>
              ) : (
                <>
                  <div className="chat-messages" ref={chatMessagesRef}>
            {isLoadingMore && (
              <div className="chat-loading">
                <FaSpinner className="spin" /> Đang tải tin nhắn cũ hơn...
              </div>
            )}
            {isLoadingMessages ? (
              <div className="chat-loading">
                <FaSpinner className="spin" /> Đang tải tin nhắn...
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`chat-message ${msg.senderId === CURRENT_USER_ID ? "me" : ""}`}>
                  <p>{msg.content}</p>
                  <span className="msg-time">{formatTime(msg.createdAt)}</span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isSending && sendMessage()}
              disabled={isSending}
            />
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={isSending}
            >
              {isSending ? <FaSpinner className="spin" /> : <FaPaperPlane />}
            </button>
          </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}