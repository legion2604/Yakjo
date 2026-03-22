package postgres

import (
	"backend/internal/model"
	"database/sql"
	"log"
)

type chatRepository struct {
	db *sql.DB
}

type ChatRepository interface {
	GetChats(userId int) ([]model.Chat, error)
	FindRoom(userId, companionId int) (int, error)
	CreateRoom(userId, companionId int) (int, error)
	GetPartnerInfo(companionId, chatId int) (model.Chat, error)
}

func NewChatRepository(db *sql.DB) ChatRepository {
	return &chatRepository{db: db}
}

func (r *chatRepository) GetChats(userId int) ([]model.Chat, error) {
	var chats []model.Chat
	rows, err := r.db.Query(`SELECT 
    c.id,
    -- Выбираем ID партнера: если первый юзер это Я ($1), значит партнер - второй, и наоборот
    CASE 
        WHEN c.first_user_id = $1 THEN c.second_user_id 
        ELSE c.first_user_id 
    END as partner_id,
    u.first_name as partner_name,
    u.avatar_url as partner_avatar,
    m.content as last_message_content,
    m.created_at as last_message_at,
    -- Считаем непрочитанные, которые прислали МНЕ
    (SELECT COUNT(*) FROM messages 
     WHERE chat_id = c.id AND sender_id != $1 AND is_read = false) as unread_count
	FROM chats c
-- Присоединяем таблицу юзеров для получения данных партнера
	JOIN users u ON u.id = (
    CASE 
        WHEN c.first_user_id = $1 THEN c.second_user_id 
        ELSE c.first_user_id 
    END
	)
-- Берем последнее сообщение через LATERAL или подзапрос
	LEFT JOIN LATERAL (
    SELECT content, created_at 
    FROM messages 
    WHERE chat_id = c.id 
    ORDER BY created_at DESC 
    LIMIT 1
	) m ON true
	WHERE c.first_user_id = $1 OR c.second_user_id = $1
	ORDER BY m.created_at DESC;`, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var item model.Chat
		// Временные переменные для сканирования плоского результата SQL в структуру
		err := rows.Scan(
			&item.Id,
			&item.Partner.Id,
			&item.Partner.FirstName,
			&item.Partner.AvatarUrl,
			&item.LastMessage.Content,
			&item.LastMessage.CreatedAt,
			&item.UnreadCount,
		)
		if err != nil {
			return nil, err
		}
		chats = append(chats, item)
	}
	return chats, nil
}

func (r *chatRepository) FindRoom(userId, companionId int) (int, error) {
	var roomId int

	err := r.db.QueryRow("SELECT id FROM chats WHERE (first_user_id=$1 AND second_user_id=$2) or (first_user_id=$2 AND second_user_id=$1)", userId, companionId).Scan(&roomId)
	if err != nil {
		return 0, err
	}
	log.Println(roomId)
	return roomId, nil
}

func (r *chatRepository) CreateRoom(userId, companionId int) (int, error) {
	var roomId int
	err := r.db.QueryRow(
		"INSERT INTO chats (first_user_id, second_user_id) VALUES ($1, $2) RETURNING id",
		userId,
		companionId,
	).Scan(&roomId)
	if err != nil {
		return 0, nil
	}
	log.Println(roomId)
	return roomId, nil
}

func (r *chatRepository) GetPartnerInfo(companionId, chatId int) (model.Chat, error) {
	var chatInfo model.Chat
	err := r.db.QueryRow(`
    SELECT 
        u.first_name,
        u.last_name,
        u.avatar_url,
        COALESCE(m.id, 0),
        COALESCE(m.sender_id, 0),
        COALESCE(m.content, ''),
        COALESCE(m.created_at, NOW()),
        COALESCE(m.is_read, true),
        COALESCE(unread.unread_count, 0)
    FROM users u
    LEFT JOIN LATERAL (
        SELECT id, sender_id, content, created_at, is_read
        FROM messages
        WHERE chat_id = $2
        ORDER BY created_at DESC
        LIMIT 1
    ) m ON true
    LEFT JOIN (
        SELECT COUNT(*) AS unread_count
        FROM messages
        WHERE chat_id = $2 AND is_read = false AND sender_id != $1
    ) unread ON true
    WHERE u.id = $1;
`, companionId, chatId).Scan(
		&chatInfo.Partner.FirstName,
		&chatInfo.Partner.LastName,
		&chatInfo.Partner.AvatarUrl,
		&chatInfo.LastMessage.Id,
		&chatInfo.LastMessage.SenderId,
		&chatInfo.LastMessage.Content,
		&chatInfo.LastMessage.CreatedAt,
		&chatInfo.LastMessage.IsRead,
		&chatInfo.UnreadCount,
	)
	if err != nil {
		return model.Chat{}, err
	}

	chatInfo.Id = chatId
	chatInfo.Partner.Id = companionId
	chatInfo.LastMessage.ChatId = chatId
	log.Println(chatInfo)
	return chatInfo, nil
}
