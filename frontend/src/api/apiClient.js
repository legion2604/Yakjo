/**
 * Базовый клиент для API запросов
 * Автоматически добавляет credentials: 'include' для работы с HttpOnly cookies
 */

const BASE_URL = 'https://api.yakjo.tj/v1'; // В будущем можно вынести в ENV

class ApiClient {
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
            const response = await fetch(url, config);

            // Обработка 401 Unauthorized (если нужно разлогинить пользователя)
            if (response.status === 401) {
                console.warn('Unauthorized access');
                // window.location.href = '/login'; // Опционально
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API Error');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
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
