package postgres

import (
	"backend/internal/model"
	"database/sql"
)

type chatRepository struct {
	db *sql.DB
}

type ChatRepository interface {
	GetChats(userId int) ([]model.Chat, error)
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
