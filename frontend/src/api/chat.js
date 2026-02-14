import { wsClient } from './socket';

export const chatApi = {
    /**
     * Запросить список чатов
     * Ответ придет асинхронно с типом 'chats_list'
     */
    getChats: () => {
        wsClient.send({ type: 'get_chats' });
    },

    /**
     * Запросить историю сообщений
     * Ответ придет с типом 'chat_history'
     */
    getMessages: (chatId, limit = 50, offset = 0) => {
        wsClient.send({ type: 'get_history', chatId, limit, offset });
    },

    /**
     * Отправить сообщение
     */
    sendMessage: (chatId, text) => {
        wsClient.send({ type: 'send_message', chatId, text });
    },

    /**
     * Пометить сообщения как прочитанные
     */
    readMessages: (chatId, messageIds = []) => {
        wsClient.send({ type: 'read_messages', chatId, messageIds });
    },

    /**
     * Начать новый чат с пользователем
     * Ответ придет с типом 'chat_started'
     */
    startChat: (userId) => {
        wsClient.send({ type: 'start_chat', userId });
    },

    /**
     * Инициализировать подключение (если еще не создано)
     */
    connect: () => {
        wsClient.connect();
    },

    /**
     * Подписаться на обновления (обертка над wsClient)
     */
    on: (type, handler) => {
        return wsClient.on(type, handler);
    }
};
