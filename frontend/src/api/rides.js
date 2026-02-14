import { api } from './apiClient';

export const ridesApi = {
    /**
     * Поиск поездок
     */
    search: (params) => {
        // params can include from, to, date, seats, sort, page, limit
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/rides/search?${queryParams}`);
    },

    /**
     * Получение деталей конкретной поездки
     */
    getById: (id) => {
        return api.get(`/rides/${id}`);
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
        return api.get(`/rides/${rideId}/contacts`);
    }
};
