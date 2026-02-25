# Yakjo API Documentation v1

Базовый URL: `https://api.yakjo.tj/v1`
Формат данных: `application/json`
Авторизация: 
- **AccessToken**: `httpOnly` Cookie (TTL: 15 минут).
- **RefreshToken**: `httpOnly` Cookie (TTL: 90 дней).

### WebSocket Auth
- Использует Cookie (автоматически).
- При истечении токена соединение закрывается с кодом `4001` (Unauthorized). Клиент должен обновить токен через HTTP и переподключиться.

### 🛡️ Security & CORS (Important)
Для корректной работы `httpOnly` cookies на фронтенде:
1.  **Frontend**: В запросах (axios/fetch) обязательно указывать `withCredentials: true` или `credentials: 'include'`.
2.  **Backend (Production)**:
    - `Access-Control-Allow-Origin`: `https://frontend.yakjo.tj` (Не `*`!)
    - `Access-Control-Allow-Credentials`: `true`
    - **Cookie Settings**: `SameSite=None; Secure=true; Path=/; Domain=.yakjo.tj`
    - **Localhost Development**: `Secure=true` требует HTTPS. На localhost используйте `SameSite=Lax` или поднимите локальный HTTPS прокси.
    - Для WebSocket `wss://` соединение обязательно.

---

## 🔐 Авторизация (Auth)

### 1. Отправка OTP кода (`POST /auth/send-otp`)
Инициализирует процесс входа или регистрации.
> **Limit:** Максимум 3 запроса в 5 минут (иначе `429 Too Many Requests`).

**Request Body (JSON):**
```json
{
  "phone": "+992900000000" // Обязательно (Intl format)
}
```

**Success Response (200 OK):**
```json
{
  "message": "Код отправлен успешно",
  "expiresIn": 120 // Время жизни кода в секундах
}
```

**Error Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Неверный формат номера телефона",
  "code": "INVALID_PHONE"
}
```
**Rate Limit (429 Too Many Requests):**
```json
{
  "status": "error",
  "message": "Слишком много попыток. Попробуйте через 5 минут.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

---

### 2. Проверка кода и Вход (`POST /auth/verify-otp`)
Проверяет OTP код. Если номер телефона новый — создает пользователя и возвращает `isNewUser: true`. В этом случае клиент должен перенаправить на страницу завершения регистрации.
Устанавливает `httpOnly` cookie `refreshToken`.

**Request Body (JSON):**
```json
{
  "phone": "+992900000000",
  "code": "1234" // 4 цифры
}
```

**Success Response (200 OK):** Устанавливает `httpOnly` cookies `accessToken` и `refreshToken`.
  ```json
  {
    "user": {
    "id": 1,
    "phone": "+992900000000",
    "isNewUser": true // Флаг: если true -> редирект на /register
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Неверный код или срок действия истек",
  "code": "INVALID_OTP"
}
```
> **Security:** После 5 неверных попыток ввод блокируется на 10 минут.

---

### 3. Завершение регистрации (`POST /auth/register`)
Вызывается **только** для новых пользователей (`isNewUser: true`) для заполнения профиля. Требует наличия валидного токена/куки.

**Request Body (JSON):**
```json
{
  "firstName": "Тимур", // Обязательно
  "lastName": "Алиев",  // Обязательно
  "birthDate": "1995-05-20", // Обязательно (YYYY-MM-DD)
  "gender": "male", // Обязательно ('male' | 'female')
  "bio": "Люблю путешествовать", // Опционально (max 500 chars)
  "car": "Toyota Camry" // Опционально (для водителей)
}
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "firstName": "Тимур",
  "lastName": "Алиев",
  "isNewUser": false
}
```

---

### 4. Текущий пользователь (`GET /auth/me`)
Возвращает полные данные профиля текущего авторизованного пользователя.

**Example URL:**
`GET /auth/me`

**Headers:**
- `Cookie: accessToken=...` (автоматически)

**Success Response (200 OK):**
```json
{
  "id": 1,
  "phone": "+992900000000",
  "firstName": "Тимур",
  "lastName": "Алиев",
  "avatarUrl": "https://...",
  "rating": 4.9,
  "ridesCount": 15,
  "whatsapp": "992900000000",
  "telegram": "t_aliev"
}
```

---

### 5. Обновление токена (`POST /auth/refresh-token`)
Используется для получения новой пары токенов, когда Access Token истек. Читает Refresh Token из `httpOnly` cookie.

**Success Response (200 OK):**
```json
{ "message": "Tokens updated" }
```
*Устанавливает новые `accessToken` и `refreshToken` в cookies.*

---

## 🚗 Поездки (Rides)

### 1. Поиск поездок (`GET /rides/search`)

**Example URL:**
`GET /rides/search?from=Душанбе&to=Худжанд&date=2024-02-25&seats=1&sort=price_asc`

**Query Parameters (JSON):**
```json
{
  "from": "Душанбе",
  "to": "Худжанд",
  "date": "2024-02-25", // YYYY-MM-DD
  "seats": 1,           // Min 1
  "sort": "price_asc",  // 'price_asc' | 'price_desc' | 'time_asc'
  "page": 1,            // Optional (Default: 1)
  "limit": 10           // Optional (Max 50)
}
```

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "from": "Душанбе",
      "to": "Худжанд",
      "price": 120,
      "departureTime": "2024-02-25T08:00:00Z", // UTC (ISO 8601)
      "availableSeats": 3,
      "driver": {
        "id": 2,
        "firstName": "Алишер",
        "rating": 4.8,
        "avatarUrl": "..."
      },
      "car": "Toyota Camry 2020",
      "features": ["air_conditioner", "music"]
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

---

### 2. Детали поездки (`GET /rides/:id`)
Возвращает полную информацию о конкретной поездке.

**Example URL:**
`GET /rides/550e8400-e29b-41d4-a716-446655440000`

**Success Response (200 OK):**
```json
{
  "id": 1,
  "from": "Душанбе",
  "to": "Худжанд",
  "description": "Еду аккуратно, могу забрать с Водонасосной",
  "price": 120,
  "totalSeats": 4,
  "availableSeats": 3,
  "departureTime": "2024-02-25T08:00:00Z",
  "driver": {
    "id": 2,
    "firstName": "Алишер",
    "lastName": "Валиев",
    "rating": 4.8,
    "contacts": { // Объект или null (если не авторизован)
       "hidden": true // Флаг для фронта, чтобы показать "Войдите, чтобы увидеть"
    }
  }
}
```

---

### 3. Получение контактов (`GET /rides/:id/contacts`)
Позволяет узнать контакты водителя. Требует авторизации.

**Example URL:**
`GET /rides/550e8400-e29b-41d4-a716-446655440000/contacts`

**Success Response (200 OK):**
```json
{
  "phone": "+992900112233",
  "whatsapp": "992900112233",
  "telegram": "alisher_v"
}
```

---

### 4. Создание поездки (`POST /rides`)
Публикация нового объявления.

**Request Body (JSON):**
```json
{
  "from": "Душанбе",
  "to": "Худжанд",
  "departureTime": "2024-02-25T08:00:00Z", // Обязательно (ISO 8601 UTC)
  "price": 120, // Обязательно (Цена за место)
  "totalSeats": 4, // Обязательно (Всего мест в машине)
  "description": "Заберу с центра" // Опционально
}
```

**Success Response (201 Created):**
```json
{
  "id": 1,
  "status": "created"
}
```

**Errors:**
- `400 Bad Request`: Validation error (seats < 1, past date).
- `403 Forbidden`: Driver banned or limit reached (max 3 active rides).
- `409 Conflict`: Водитель уже имеет поездку в этом временном интервале.

---

## 👤 Пользователи (Users)

### 1. Публичный профиль (`GET /users/:id`)
Просмотр профиля. Если не авторизован — телефон и детали скрыты.

**Example URL:**
`GET /users/550e8400-e29b-41d4-a716-446655440000`

**Success Response (200 OK):**
```json
{
  "id": 1,
  "firstName": "Алишер",
  "createdAt": "2023-10-10",
  "rating": 4.8,
  "reviewCount": 12,
  "reviews": [ // Может быть пустым массивом []
    {
      "id": 10,
      "author": "Мадина",
      "rating": 5,
      "comment": "Отличный водитель, доехали быстро!",
      "date": "2024-01-15"
    }
  ]
}
```

---

### 2. Редактирование профиля (`PUT /users/me`)
Обновление своих данных.

**Request Body (JSON):**
```json
{
  "firstName": "Тимур",      // Min 2 chars
  "bio": "О себе...",        // Max 500 chars
  "whatsapp": "992933333333", // Min 9 digits
  "telegram": "username"     // Without @
}
```
**Errors:**
- `400 Bad Request`: Невалидные данные (bio > 500, неверный формат телефона).


---

### 3. Оценить пользователя (`POST /users/:id/rate`)
Оставить отзыв водителю или пассажиру.
> **Note:** Если пользователь уже оценивал этого человека, старая оценка будет обновлена (поле `updatedAt` изменится). Нельзя оценивать самого себя.

**Request Body (JSON):**
```json
{
  "rating": 5, // 1-5
  "comment": "Отличная поездка!" // Опционально
}
```

**Success Response (200 OK):**
```json
{ "message": "Rating submitted" }
```

## 💬 Чат (WebSocket Only)

Вся коммуникация в реальном времени происходит через единое WebSocket соединение.

### 1. Подключение
- **Production URL:** `wss://api.yakjo.tj/v1/ws` (TLS Required)
- **Dev URL:** `ws://localhost:8080/v1/ws`
- **Аутентификация:** Cookie `httpOnly`.
- **Fallback:** `?token=JWT` (**ВНИМАНИЕ: Небезопасно!** Токен виден в history/logs. Используйте только для dev/mobile).

---

### 2. Структуры данных (Models)

#### User (Short)
```json
{
  "id": "int",
  "firstName": "string",
  "lastName": "string",
  "avatarUrl": "string | null",
  "online": "boolean"
}
```

#### Message
```json
{
  "id": "int",
  "chatId": "int",
  "senderId": "int",
  "content": "string",
  "createdAt": "ISO8601",
  "isRead": "boolean"
}
```

#### Chat
```json
{
  "id": "int",
  "partner": { "User" },
  "lastMessage": { "Message" },
  "unreadCount": "int"
}
```

---

### 3. Команды (Client -> Server)

Клиент отправляет JSON объекты с полем `type`.

#### 3.1 Получить список чатов
Запрашивает список всех чатов текущего пользователя.
```json
{
  "type": "get_chats"
}
```

#### 3.2 Получить историю чата
Загружает сообщения конкретного чата с пагинацией.
```json
{
  "type": "get_history",
  "chatId": 1,
  "limit": 50,  // (Optional) Max 100
  "offset": 0   // (Optional) Сдвиг для подгрузки старых сообщений
}
```

#### 3.3 Начать чат (или получить существующий)
Используется, когда мы на странице поездки и нажимаем "Написать". Если чат уже есть — вернет его ID, если нет — создаст новый.
```json
{
  "type": "start_chat",
  "userId": 2 // ID пользователя, с которым хотим общаться
}
```

#### 3.4 Отправить сообщение
```json
{
  "type": "send_message",
  "chatId": 1,
  "text": "Привет! Где вы находитесь?" // Максимум 4096 символов
}
```

#### 3.5 Прочитать сообщения (Mark as Read)
Отправляется, когда пользователь открыл чат или проскроллил до новых сообщений.
```json
{
  "type": "read_messages",
  "chatId": 1,
  "messageIds": [1, 2] // Или просто chatId, чтобы пометить все как прочитанные
}
```

#### 3.6 Пагинация и Подгрузка (Pagination Advice)
Для подгрузки старых сообщений используйте `offset` равный текущему количеству загруженных сообщений.
**Пример:**
1. Первый запрос: `get_history` (limit: 50, offset: 0) -> Получили 50 сообщений.
2. Скролл вверх -> `get_history` (limit: 50, offset: 50) -> Получили еще 50 (более старых).

#### 3.7 Реконнект (Reconnection Handling)
- При разрыве соединения (`onclose`) клиент должен пытаться переподключиться.
- **Backoff:** Экспоненциальная задержка (1s, 2s, 4s, ... max 30s).
- **Max Attempts:** Лимит 10-20 раз (или 5 минут). Далее показать ошибку "Нет сети".
- Если `onclose` код `4001` (Auth), **сначала** обновить токен (`POST /auth/refresh-token`). Если refresh не удался (401) — разлогинить пользователя.

---

### 4. События (Server -> Client)

Сервер присылает JSON объекты с полем `type`.

#### 4.1 Список чатов (`chats_list`)
Приходит в ответ на `get_chats`.
```json
{
  "type": "chats_list",
  "data": [
    {
      "id": 1,
      "partner": {
        "id": 2,
        "firstName": "Алишер",
        "avatarUrl": "/uploads/avatar1.jpg"
      },
      "lastMessage": {
        "content": "Буду через 5 минут",
        "createdAt": "2024-02-21T10:05:00Z"
      },
      "unreadCount": 2
    }
  ]
}
```

#### 4.2 История сообщений (`chat_history`)
Приходит в ответ на `get_history`.
```json
{
  "type": "chat_history",
  "chatId": 1,
  "data": [
    {
      "id": 10,
      "senderId": 2,
      "content": "Привет!",
      "createdAt": "2024-02-21T10:00:00Z",
      "isRead": true
    }
  ],
  "hasMore": true // Есть ли еще сообщения для подгрузки
}
```

#### 4.3 Чат открыт/создан (`chat_opened`)
Приходит в ответ на `start_chat`.
```json
{
  "type": "chat_opened",
  "chat": {
    "id": 1,
    "partner": { ... } // Данные собеседника
  }
}
```

#### 4.4 Новое входящее сообщение (`new_message`)
Приходит в реальном времени, когда собеседник пишет сообщение.
```json
{
  "type": "new_message",
  "chatId": 1,
  "message": {
    "id": 11,
    "senderId": 2,
    "content": "Я подъехал",
    "createdAt": "2024-02-21T10:10:00Z"
  }
}
```

#### 4.5 Ошибка (`error`)
Приходит, если запрос некорректен (например, чат не найден).

**Пример (start_chat с несуществующим userId):**
```json
{
  "type": "error",
  "message": "User not found",
  "code": "USER_NOT_FOUND",
  "originalRequestType": "start_chat",
  "details": { "userId": "invalid-uuid" }
}
```

**Пример (get_history для чужого чата):**
```json
{
  "type": "error",
  "message": "Access denied",
  "code": "ACCESS_DENIED",
  "originalRequestType": "get_history"
}
```

## 📈 Ошибки (Error Handling)

### HTTP Ошибки
- `429 Too Many Requests`: Превышен лимит запросов (OTP, Rides create).
- `400 Bad Request`: Ошибка валидации.
- `401 Unauthorized`: Токен неверен/истек.
- `403 Forbidden`: Нет прав.
- `404 Not Found`: Ресурс не найден.

### WebSocket Ошибки
Код ошибки (`code`) — строка.
- `USER_NOT_FOUND`: (start_chat) Пользователь не найден.
- `ACCESS_DENIED`: (mark_read, get_history) Нет доступа.
- `INVALID_PAYLOAD`: Неверный JSON.

**Пример ответа (HTTP):**
```json
{
  "status": "error",
  "message": "Слишком много запросов. Попробуйте через 5 минут.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

**Пример (403 Forbidden):**
```json
{
  "status": "error",
  "message": "Вы не можете удалить чужую поездку",
  "code": "ACCESS_DENIED"
}
```

**Пример (500 Internal Error):**
```json
{
  "status": "error",
  "message": "Внутренняя ошибка сервера",
  "code": "INTERNAL_SERVER_ERROR"
}
```
