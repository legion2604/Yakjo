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
     * Завершение регистрации (сохранение имени/фамилии)
     */
    register: (data) => {
        return api.post('/auth/register', data);
    },

    /**
     * Получение данных текущего пользователя (по cookie)
     */
    getMe: () => {
        return api.get('/auth/me');
    },

    /**
     * Выход из системы
     */
    logout: () => {
        return api.post('/auth/logout');
    }
};
