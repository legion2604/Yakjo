import { api } from './apiClient';

export const ridesApi = {
    /**
     * Поиск поездок
     */
    search: (params) => {
        // params can include from, to, date, seats, sort, page, limit
        const cleanParams = {};
        for (const key in params) {
            cleanParams[key] = params[key] == null ? '' : params[key];
        }
        const queryParams = new URLSearchParams(cleanParams).toString();
        return api.get(`/rides/search?${queryParams}`);
    },

    /**
     * Получение деталей конкретной поездки
     */
    getById: (id) => {
        return api.get(`/rides/${Number(id)}`);
    },

    /**
     * Создание новой поездки
     */
    create: (data) => {
        return api.post('/rides', data);
    },

    /**
     * Получение популярных маршрутов (для главной страницы)
     */
    getPopular: () => {
        return api.get('/rides/popular');
    },

    /**
     * Получение контактов водителя (телефон, telegram, whatsapp)
     */
    getContacts: (rideId) => {
        return api.get(`/rides/${Number(rideId)}/contacts`);
    },

    /**
     * Получение поездок текущего пользователя
     */
    getMyRides: () => {
        return api.get('/rides/my');
    },

    /**
     * Удаление поездки
     */
    delete: (id) => {
        return api.delete(`/rides/${Number(id)}`);
    },

    /**
     * Обновление поездки
     */
    update: (id, data) => {
        return api.put(`/rides/${Number(id)}`, data);
    }
};
