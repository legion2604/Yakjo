import { api } from './apiClient';

class WebSocketClient {
    constructor() {
        this.socket = null;
        this.listeners = new Set(); // General listeners
        this.messageHandlers = new Map(); // Specific type handlers
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.isConnected = false;
        this.pendingQueue = [];
    }

    connect() {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) return;

        console.log('Connecting to WebSocket...');
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Production vs Dev URL
        const isProd = window.location.hostname !== 'localhost';
        const wsUrl = isProd
            ? `wss://api.yakjo.tj/v1/ws`
            : `ws://localhost:8080/v1/ws`;

        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('WebSocket Connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.processPendingQueue();
        };

        this.socket.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                this.handleMessage(payload);
            } catch (e) {
                console.error('Failed to parse WS message:', e);
            }
        };

        this.socket.onclose = async (event) => {
            console.log(`WebSocket Disconnected. Code: ${event.code}`);
            this.isConnected = false;

            // Handle 4001 (Unauthorized) - trigger token refresh and then reconnect
            if (event.code === 4001) {
                console.log('WS Auth error (4001). Attempting token refresh...');
                try {
                    // Import authApi dynamically to avoid circular dependency
                    const { authApi } = await import('./auth');
                    await authApi.refreshToken();
                    console.log('Token refreshed successfully. Reconnecting WS...');
                    this.connect();
                    return;
                } catch (err) {
                    console.error('Failed to refresh token for WS:', err);
                    // If refresh fails, don't auto-reconnect, user needs to login
                    return;
                }
            }

            this.retryConnection();
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };
    }

    handleMessage(payload) {
        // Notify general listeners
        this.listeners.forEach(listener => listener(payload));

        // Notify specific type handlers
        if (payload.type && this.messageHandlers.has(payload.type)) {
            this.messageHandlers.get(payload.type).forEach(handler => handler(payload));
        }
    }

    retryConnection() {
        if (this.reconnectAttempts < 20) { // Increased to 20 as per docs
            this.reconnectAttempts++;
            // Exponential backoff: 1s, 2s, 4s, 8s, 16s, then max 30s
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
            console.log(`Retrying WS connection in ${delay}ms (Attempt ${this.reconnectAttempts})...`);
            setTimeout(() => this.connect(), delay);
        } else {
            console.error('Max WebSocket reconnection attempts reached.');
        }
    }

    /**
     * Send a raw message object
     */
    send(data) {
        if (this.isConnected && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            this.pendingQueue.push(data);
        }
    }

    processPendingQueue() {
        while (this.pendingQueue.length > 0) {
            const data = this.pendingQueue.shift();
            this.send(data);
        }
    }

    /**
     * Subscribe to ANY message
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Subscribe to specific message type (e.g., 'new_message', 'chats_list')
     */
    on(type, handler) {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, new Set());
        }
        this.messageHandlers.get(type).add(handler);
        return () => {
            const handlers = this.messageHandlers.get(type);
            if (handlers) {
                handlers.delete(handler);
            }
        };
    }
}

export const wsClient = new WebSocketClient();
