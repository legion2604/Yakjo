import { api } from './apiClient';

export const authApi = {
    /**
     * Отправка OTP кода на номер телефона
     */
    sendOtp: (phone) => {
        return api.post('/auth/send-otp', { phone });
    },

    /**
     * Проверка OTP кода и вход/регистрация
     */
    verifyOtp: (phone, code) => {
        return api.post('/auth/verify-otp', { phone, code });
    },

    /**
     * Завершение регистрации (сохранение данных пользователя)
     */
    register: (data) => {
        // data должен содержать: firstName, lastName, birthDate, gender, bio, car
        return api.post('/auth/register', data);
    },

    /**
     * Обновление access токена через refresh токен (в куках)
     */
    refreshToken: () => {
        return api.post('/auth/refresh-token');
    },

    /**
     * Получение данных текущего пользователя (по cookie)
     */
    getMe: () => {
        return api.get('/auth/me');
    },

    /**
     * Обновление профиля
     */
    updateProfile: (data) => {
        return api.put('/users/me', data);
    },

    /**
     * Загрузка аватара
     */
    updateAvatar: (formData) => {
        return api.post('/users/avatar', formData, {
            headers: {} // Let browser set Content-Type for multipart
        });
    },

    /**
     * Выход из системы
     */
    logout: () => {
        return api.post('/auth/logout');
    }
};
