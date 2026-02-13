/**
 * Базовый клиент для API запросов
 * Автоматически добавляет credentials: 'include' для работы с HttpOnly cookies
 */

const BASE_URL = 'http://localhost:8080/api'; // В будущем можно вынести в ENV

class ApiClient {
    constructor() {
        this.isRefreshing = false;
        this.failedQueue = [];
    }

    /**
     * Добавляет запрос в очередь на повторную отправку
     */
    processQueue(error, token = null) {
        this.failedQueue.forEach(prom => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve(token);
            }
        });

        this.failedQueue = [];
    }

    async request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const config = {
            ...options,
            headers,
            credentials: 'include', // ВАЖНО: для передачи HttpOnly cookies
        };

        try {
            let response = await fetch(url, config);

            // Обработка 401 Unauthorized
            if (response.status === 401 && !options._retry && endpoint !== '/auth/refresh-token') {
                if (this.isRefreshing) {
                    try {
                        // Если обновление уже идет, ждем его завершения
                        await new Promise((resolve, reject) => {
                            this.failedQueue.push({ resolve, reject });
                        });
                        // Повторяем запрос после успешного обновления
                        return this.request(endpoint, { ...options, _retry: true });
                    } catch (err) {
                        return Promise.reject(err);
                    }
                }

                this.isRefreshing = true;
                options._retry = true;

                try {
                    // Пытаемся обновить токен (прямой вызов fetch чтобы избежать циклических зависимостей)
                    const refreshResponse = await fetch(`${BASE_URL}/auth/refresh-token`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (refreshResponse.ok) {
                        this.processQueue(null, true);
                        // Повторяем исходный запрос
                        return this.request(endpoint, options);
                    } else {
                        // Если обновление не удалось - выбрасываем ошибку (пользователя разлогинит контекст)
                        const err = new Error('Refresh token expired');
                        this.processQueue(err, null);
                        throw err;
                    }
                } catch (refreshError) {
                    this.processQueue(refreshError, null);
                    throw refreshError;
                } finally {
                    this.isRefreshing = false;
                }
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API Error');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', endpoint, error);
            throw error;
        }
    }

    get(endpoint, headers = {}) {
        return this.request(endpoint, { method: 'GET', headers });
    }

    post(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
            headers,
        });
    }

    put(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers,
        });
    }

    delete(endpoint, headers = {}) {
        return this.request(endpoint, { method: 'DELETE', headers });
    }
}

export const api = new ApiClient();
