import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { wsClient } from '../api/socket';
import { useSettings } from '../context/SettingsContext';
import Button from '../components/ui/Button';
import './ChatPage.css';

// Безопасный парсинг даты для предотвращения NaN
const getSafeTime = (dateStr) => {
    if (!dateStr) return 0;
    const t = new Date(dateStr).getTime();
    return isNaN(t) ? 0 : t;
};

// Самый надежный способ: переводим всё в миллисекунды (Timestamp) и сравниваем
const sortMessagesChronologically = (arr) => {
    return [...arr].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

        // 1. Сначала строго сортируем по реальному физическому времени
        if (timeA !== timeB) {
            return timeA - timeB; // Старые сверху, новые снизу
        }

        // 2. Если время совпало до миллисекунды (например, у оптимистичного и серверного),
        // делаем так, чтобы временное сообщение с отрицательным ID всегда уступало место серверному
        return a.id - b.id;
    });
};

const ChatPage = () => {
    const { id: routeUserId } = useParams();
    const userId = parseInt(routeUserId, 10);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useSettings();

    const [chatId, setChatId] = useState(null);
    const chatIdRef = useRef(null);
    const userRef = useRef(user);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [partner, setPartner] = useState(null);
    const messagesEndRef = useRef(null);

    // Синхронизация рефов со стейтом для использования в слушателях WebSocket
    useEffect(() => {
        chatIdRef.current = chatId;
    }, [chatId]);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // Плавный скролл вниз при обновлении массива сообщений
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const handleChatHistory = (payload) => {
            console.log('Received history:', payload);
            setMessages(sortMessagesChronologically(payload.data || []));
            setLoading(false);

            // Отметка сообщений как прочитанных
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
                // Если сообщение с валидным ID уже есть в списке — игнорируем дубликат
                if (prev.some(m => m.id === msgObj.id && m.id > 0)) return prev;

                // Ищем оптимистичное сообщение для замены (совпадает отправитель и текст)
                const optimisticIndex = prev.findIndex(m =>
                    m.id < 0 && m.senderId === msgObj.senderId && m.content === msgObj.content
                );

                const newArr = [...prev];
                if (optimisticIndex !== -1) {
                    // Заменяем временное сообщение официальным ответом от сервера
                    newArr[optimisticIndex] = msgObj;
                } else {
                    newArr.push(msgObj);
                }

                return sortMessagesChronologically(newArr);
            });

            // Отметка входящего сообщения как прочитанного
            const receivedChatId = payload.chatId || chatIdRef.current;
            if (msgObj?.senderId !== userRef.current?.id && receivedChatId && msgObj.id) {
                wsClient.send({ type: 'read_messages', chatId: receivedChatId, messageIds: [msgObj.id] });
            }
        };

        const handleChatOpened = (payload) => {
            console.log('Received chat open payload:', payload);
            const chatObj = payload.chat || payload;
            const openChatId = chatObj?.id || payload.chatId;
            const openPartner = chatObj?.partner || payload.partner || null;

            if (openChatId) {
                setPartner(openPartner);
                setChatId(openChatId);
                // Запрос истории чата
                wsClient.send({ type: 'get_history', chatId: openChatId, limit: 50, offset: 0 });
            } else {
                console.error("No chatId found in open payload", payload);
            }
        };

        // Подписка на события сокета
        const unsubHistory = wsClient.on('get_history', handleChatHistory);
        const unsubNewMessage = wsClient.on('send_message', handleNewMessage);
        const unsubChatOpened = wsClient.on('start_chat', handleChatOpened);

        wsClient.connect();
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

        // Создаем временное оптимистичное сообщение
        const optimisticMsg = {
            id: -Math.floor(Date.now() / 1000), // Отрицательный ID, корректно работающий с сортировкой
            senderId: user?.id,
            content: text,
            createdAt: new Date().toISOString()
        };

        // Добавляем в стейт и сразу сортируем
        setMessages(prev => sortMessagesChronologically([...prev, optimisticMsg]));
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
                        <span className="partner-name">{partner?.firstName || t('chats.partner')}</span>
                    </div>
                </div>

                <div className="chat-messages">
                    {loading ? (
                        <div className="text-center p-4">{t('chats.loading')}</div>
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
                        placeholder={t('chats.typeMessage')}
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