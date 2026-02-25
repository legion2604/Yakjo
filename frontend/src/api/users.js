import { api } from './apiClient';

export const usersApi = {
    /**
     * Получение публичного профиля пользователя
     */
    getById: (id) => {
        return api.get(`/users/${Number(id)}`);
    },

    /**
     * Оценить пользователя
     */
    rate: (userId, rating, comment) => {
        return api.post(`/users/${Number(userId)}/rate`, { rating, comment });
    }
};
