import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { wsClient } from '../api/socket';
import Button from '../components/ui/Button';
import './ChatPage.css';

const ChatPage = () => {
    const { id: routeUserId } = useParams();
    const userId = parseInt(routeUserId, 10);
    const navigate = useNavigate();
    const { user } = useAuth();

    const [chatId, setChatId] = useState(null);
    const chatIdRef = useRef(null);
    const userRef = useRef(user);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [partner, setPartner] = useState(null);
    const messagesEndRef = useRef(null);

    // Keep refs in sync with state for use in listeners
    useEffect(() => {
        chatIdRef.current = chatId;
    }, [chatId]);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    useEffect(() => {
        // Scroll to bottom when messages update
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        // Safe date parsing to handle missing/invalid createdAt strings without returning NaN
        const getSafeTime = (dateStr) => {
            if (!dateStr) return 0;
            const t = new Date(dateStr).getTime();
            return isNaN(t) ? 0 : t;
        };

        // Sort by createdAt; use id as secondary key only for same-millisecond messages
        const sortByTime = (arr) =>
            arr.slice().sort((a, b) => {
                const diff = getSafeTime(a.createdAt) - getSafeTime(b.createdAt);
                if (diff !== 0) return diff;
                return 0;
            });

        const handleChatHistory = (payload) => {
            console.log('Received history:', payload);
            setMessages(sortByTime(payload.data || []));
            setLoading(false);

            // Mark as read
            const receivedChatId = payload.chatId || chatIdRef.current;
            const unreadIds = payload.data?.filter(m => !m.isRead && m.senderId !== userRef.current?.id).map(m => m.id);
            if (unreadIds?.length > 0 && receivedChatId) {
                wsClient.send({ type: 'read_messages', chatId: receivedChatId, messageIds: unreadIds });
            }
        };

        const handleNewMessage = (payload) => {
            console.log('Received real-time message:', payload);

            const msgObj = payload.message || payload;

            setMessages(prev => {
                // If the message is already in the list with the exact same valid ID, skip
                if (prev.some(m => m.id === msgObj.id && m.id > 0)) return prev;

                // Look for an optimistic message to replace (same sender, same text, temporary negative ID)
                const optimisticIndex = prev.findIndex(m =>
                    m.id < 0 && m.senderId === msgObj.senderId && m.content === msgObj.content
                );

                const newArr = [...prev];
                if (optimisticIndex !== -1) {
                    // Replace optimistic message with the real server authoritative message
                    newArr[optimisticIndex] = msgObj;
                } else {
                    newArr.push(msgObj);
                }

                return sortByTime(newArr);
            });

            // Mark as read if not ours
            const receivedChatId = payload.chatId || chatIdRef.current;
            if (msgObj?.senderId !== userRef.current?.id && receivedChatId && msgObj.id) {
                wsClient.send({ type: 'read_messages', chatId: receivedChatId, messageIds: [msgObj.id] });
            }
        };

        const handleChatOpened = (payload) => {
            console.log('Received chat open payload:', payload);
            // Support both wrapped "chat": {...} and unrolled payload
            const chatObj = payload.chat || payload;
            const openChatId = chatObj?.id || payload.chatId;
            const openPartner = chatObj?.partner || payload.partner || null;

            if (openChatId) {
                setPartner(openPartner);
                setChatId(openChatId);
                // Request history using the received chatId
                wsClient.send({ type: 'get_history', chatId: openChatId, limit: 50, offset: 0 });
            } else {
                console.error("No chatId found in open payload", payload);
            }
        };

        // Бэкенд шлёт тип 'send_message' (не 'new_message') получателю
        const unsubHistory = wsClient.on('get_history', handleChatHistory);
        const unsubNewMessage = wsClient.on('send_message', handleNewMessage);
        const unsubChatOpened = wsClient.on('start_chat', handleChatOpened);

        // Ensure WS is connected (idempotent)
        wsClient.connect();

        // When entering the chat, we MUST send start_chat as per documentation
        wsClient.send({ type: 'start_chat', userId });

        return () => {
            unsubHistory();
            unsubNewMessage();
            unsubChatOpened();
        };
    }, [userId]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        const text = inputValue.trim();
        if (!text || !chatId) return;

        wsClient.send({
            type: 'send_message',
            chatId,
            text
        });

        // Server timestamps might be shifted by +5 hours due to backend UTC vs local timezone mismatches.
        // To guarantee this optimistic message sorts to the very bottom, we ensure its timestamp
        // is at least 1 second strictly greater than the last currently visible message in the chat.
        let timestampToUse = Date.now();
        if (messages.length > 0) {
            const lastMsgTime = new Date(messages[messages.length - 1].createdAt).getTime();
            if (!isNaN(lastMsgTime)) {
                // Pick whichever is further in the future: true local time, or last message + 1 sec
                timestampToUse = Math.max(Date.now(), lastMsgTime + 1000);
            }
        }

        const optimisticMsg = {
            id: -(Date.now()),
            senderId: user?.id,
            content: text,
            createdAt: new Date(timestampToUse).toISOString()
        };
        setMessages(prev => {
            const newArr = [...prev, optimisticMsg];
            // Sort by createdAt; fallback to original order
            return newArr.slice().sort((a, b) => {
                const getSafeTimeLocal = (dateStr) => {
                    if (!dateStr) return 0;
                    const t = new Date(dateStr).getTime();
                    return isNaN(t) ? 0 : t;
                };
                return getSafeTimeLocal(a.createdAt) - getSafeTimeLocal(b.createdAt);
            });
        });

        setInputValue('');
    };

    return (
        <div className="chat-page container">
            <div className="chat-container">
                <div className="chat-header-bar">
                    <button className="back-btn" onClick={() => navigate('/chats')}>
                        <ArrowLeft size={24} />
                    </button>
                    <div className="chat-partner-info">
                        <div className="avatar-small">
                            {partner?.avatarUrl ? <img src={partner.avatarUrl} alt="" /> : <User size={20} />}
                        </div>
                        <span className="partner-name">{partner?.firstName || 'Собеседник'}</span>
                    </div>
                </div>

                <div className="chat-messages">
                    {loading ? (
                        <div className="text-center p-4">Загрузка...</div>
                    ) : (
                        messages.map(msg => {
                            const isMine = msg.senderId === user?.id;
                            return (
                                <div key={msg.id} className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                                    <div className="message-content">{msg.content}</div>
                                    <div className="message-time">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-area" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Написать сообщение..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="message-input"
                    />
                    <Button type="submit" className="send-btn" disabled={!inputValue.trim()}>
                        <Send size={20} />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;
