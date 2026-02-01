import { api } from './apiClient';

export const ridesApi = {
    /**
     * Поиск поездок
     */
    search: (params) => {
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
     * Бронирование места
     */
    book: (rideId, seats) => {
        return api.post(`/rides/${rideId}/book`, { seats });
    }
};
