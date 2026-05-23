import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, User } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { wsClient } from '../api/socket';
import './ChatsPage.css';

const ChatsPage = () => {
    const { t } = useSettings();
    const navigate = useNavigate();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to chat list updates (initial load or full refresh)
        const unsubscribeList = wsClient.on('chats_list', (payload) => {
            console.log('Received chats_list:', payload);
            setChats(payload.data || []);
            setLoading(false);
        });

        // Listen for real-time messages to update the list preview & unread counts
        const unsubscribeMessage = wsClient.on('send_message', (payload) => {
            console.log('Received real-time message in list:', payload);
            const msgObj = payload.message || payload;
            const chatId = payload.chatId || msgObj.chatId;

            setChats(prev => {
                const index = prev.findIndex(c => c.id === chatId);
                if (index === -1) {
                    // If chat not in list yet, we might need to refresh full list
                    // but for now, just ignore or could trigger get_chats
                    wsClient.send({ type: 'get_chats' });
                    return prev;
                }

                const updatedChat = { ...prev[index] };
                updatedChat.lastMessage = {
                    id: msgObj.id,
                    content: msgObj.content,
                    createdAt: msgObj.createdAt,
                    senderId: msgObj.senderId,
                    isRead: false // It's a new message
                };

                // Increment unread count if it's from someone else
                // Note: local user's own messages also come back as send_message
                // We should only increment if we are not the sender
                // Logic for current user ID would be needed here, or just trust the backend pushes
                // Since this is just a preview, we'll keep it simple
                if (msgObj.senderId !== updatedChat.partner?.id) {
                    // This was sent BY us, so don't increment unread
                } else {
                    updatedChat.unreadCount = (updatedChat.unreadCount || 0) + 1;
                }

                const newChats = [...prev];
                newChats.splice(index, 1); // Remove from old position
                newChats.unshift(updatedChat); // Move to top
                return newChats;
            });
        });

        // Убеждаемся что WS подключён перед запросом (connect() идемпотентен)
        wsClient.connect();
        wsClient.send({ type: 'get_chats' });

        return () => {
            unsubscribeList();
            unsubscribeMessage();
        };
    }, []);

    const handleChatClick = (partnerId) => {
        if (partnerId) {
            navigate(`/chats/${partnerId}`);
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chats-page container">
            <h1 className="page-title">{t('chats.title')}</h1>
            <div className="chats-list">
                {loading ? (
                    <div className="text-center p-4">{t('chats.loading')}</div>
                ) : chats.length === 0 ? (
                    <div className="empty-state">
                        <MessageCircle size={48} className="text-secondary" />
                        <h3>{t('chats.empty')}</h3>
                    </div>
                ) : (
                    chats.map(chat => (
                        <div key={chat.id} className="chat-item" onClick={() => handleChatClick(chat.partner?.id)}>
                            <div className="chat-avatar">
                                {chat.partner?.avatarUrl ? (
                                    <img src={chat.partner.avatarUrl} alt={chat.partner.firstName} />
                                ) : (
                                    <User size={24} />
                                )}
                            </div>
                            <div className="chat-details">
                                <div className="chat-header">
                                    <span className="chat-name">{chat.partner?.firstName || t('chats.unknown')}</span>
                                    <span className="chat-time">{formatTime(chat.lastMessage?.createdAt)}</span>
                                </div>
                                <div className="chat-message">
                                    <span className="message-preview">{chat.lastMessage?.content || t('chats.noMessages')}</span>
                                    {chat.unreadCount > 0 && (
                                        <div className="unread-badge">{chat.unreadCount}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatsPage;
