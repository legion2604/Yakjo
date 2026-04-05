package postgres

import (
	"backend/internal/model"
	"database/sql"
	"log"
	"time"

	"github.com/lib/pq"
)

type chatRepository struct {
	db *sql.DB
}

type ChatRepository interface {
	GetChats(userId int) ([]model.Chat, error)
	FindRoom(userId, companionId int) (int, error)
	CreateRoom(userId, companionId int) (int, error)
	GetPartnerInfo(companionId, chatId int) (model.Chat, error)
	SaveMessage(chatId, userId int, text string) (int, time.Time, error)
	GetHistory(userId, chatId, limit, offset int) ([]model.MsgGetHistory, bool, error)
	ReadMessage(msgId []int, chatId int) error
	GetChatParticipants(chatId int) ([]int, error)
}

func NewChatRepository(db *sql.DB) ChatRepository {
	return &chatRepository{db: db}
}

func (r *chatRepository) GetChats(userId int) ([]model.Chat, error) {
	var chats []model.Chat
	rows, err := r.db.Query(`SELECT 
    c.id,
    CASE 
        WHEN c.first_user_id = $1 THEN c.second_user_id 
        ELSE c.first_user_id 
    END as partner_id,
    u.first_name as partner_name,
    u.avatar_url as partner_avatar,
    COALESCE(m.content, '') as last_message_content,  -- Добавлено COALESCE
    COALESCE(m.created_at, '0001-01-01 00:00:00Z') as last_message_at, -- Добавлено COALESCE
    (SELECT COUNT(*) FROM messages 
     WHERE chat_id = c.id AND sender_id != $1 AND is_read = false) as unread_count
    FROM chats c
    JOIN users u ON u.id = (
        CASE 
            WHEN c.first_user_id = $1 THEN c.second_user_id 
            ELSE c.first_user_id 
        END
    )
    LEFT JOIN LATERAL (
        SELECT content, created_at 
        FROM messages 
        WHERE chat_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
    ) m ON true
    WHERE c.first_user_id = $1 OR c.second_user_id = $1
    ORDER BY m.created_at DESC NULLS LAST;`, userId) // NULLS LAST для пустых чатов

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var item model.Chat
		var lastContent sql.NullString
		var lastAt pq.NullTime // или sql.NullTime

		err := rows.Scan(
			&item.Id,
			&item.Partner.Id,
			&item.Partner.FirstName,
			&item.Partner.AvatarUrl,
			&lastContent, // Сканируем в NullString
			&lastAt,      // Сканируем в NullTime
			&item.UnreadCount,
		)
		if err != nil {
			return nil, err
		}

		if lastContent.Valid {
			item.LastMessage.Content = lastContent.String
		}
		if lastAt.Valid {
			item.LastMessage.CreatedAt = lastAt.Time.String()
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

func (r *chatRepository) SaveMessage(chatId, userId int, text string) (int, time.Time, error) {
	var msgId int
	var createdAt time.Time
	err := r.db.QueryRow("INSERT INTO messages (chat_id,sender_id,content) VALUES ($1,$2,$3) RETURNING id,created_at", chatId, userId, text).Scan(&msgId, &createdAt)
	if err != nil {
		return 0, time.Time{}, err
	}
	return msgId, createdAt, nil
}

func (r *chatRepository) GetHistory(userId, chatId, limit, offset int) ([]model.MsgGetHistory, bool, error) {
	// проверка безопастности что этот юзер вообще с это комнаты
	rows, err := r.db.Query(`
    SELECT m.id, m.sender_id, m.content, m.created_at, m.is_read 
    FROM messages m 
    JOIN chats c ON m.chat_id = c.id 
    WHERE (c.first_user_id = $1 OR c.second_user_id = $1) 
      AND m.chat_id = $2 
    ORDER BY m.created_at DESC 
    LIMIT $3
    OFFSET $4`,
		userId, chatId, limit+1, offset,
	)

	if err != nil {
		return nil, false, err
	}
	var history []model.MsgGetHistory
	var hasMore = false
	var count = 0
	for rows.Next() {
		count++
		if count > limit {
			hasMore = true
			break
		}
		var msg model.MsgGetHistory
		if err := rows.Scan(&msg.Id, &msg.SenderId, &msg.Content, &msg.CreatedAt, &msg.IsRead); err != nil {
			return nil, hasMore, err
		}
		history = append(history, msg)
	}
	return history, hasMore, nil
}

func (r *chatRepository) ReadMessage(msgId []int, chatId int) error {
	_, err := r.db.Exec(`UPDATE messages SET is_read = true  WHERE id = ANY($1) AND chat_id=$2`, pq.Array(msgId), chatId)
	if err != nil {
		log.Println(err)
		return err
	}
	return nil
}

func (r *chatRepository) GetChatParticipants(chatId int) ([]int, error) {
	var u1, u2 int
	err := r.db.QueryRow("SELECT first_user_id, second_user_id FROM chats WHERE id=$1", chatId).Scan(&u1, &u2)
	if err != nil {
		return nil, err
	}
	return []int{u1, u2}, nil
}
