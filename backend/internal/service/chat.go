package service

import (
	"backend/internal/model"
	"backend/internal/repository/postgres"
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type chatService struct {
	postgres postgres.ChatRepository
}

type ChatService interface {
	Disconnect(conn *websocket.Conn, roomId int) error
	GetChats(userId int) ([]byte, error)
	StartChat(data []byte, userId int, conn *websocket.Conn) (int, []byte, error)
	SaveMassage(data []byte, userId int, conn *websocket.Conn) (*websocket.Conn, []byte, error)
	GetHistory(userId int, data []byte) ([]byte, error)
	ReadMessage(data []byte) error
}

func NewChatService(postgres postgres.ChatRepository) ChatService {
	return &chatService{postgres: postgres}
}

var (
	rooms   = make(map[int][]*websocket.Conn)
	roomsMu sync.Mutex // Мьютекс для защиты карты rooms
)

func (s *chatService) Disconnect(conn *websocket.Conn, roomId int) error {
	roomsMu.Lock()
	clients, ok := rooms[roomId]
	if ok {
		for i, c := range clients {
			if c == conn {
				// Удаление из слайса
				rooms[roomId] = append(clients[:i], clients[i+1:]...)
				break
			}
		}
		// Очистка пустой комнаты (важно для памяти)
		if len(rooms[roomId]) == 0 {
			delete(rooms, roomId)
		}
	}
	roomsMu.Unlock()
	log.Println(rooms)
	return conn.Close()
}

func (s *chatService) GetChats(userId int) ([]byte, error) {
	res, err := s.postgres.GetChats(userId)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	response := model.GetChatsResult{
		Type: "chats_list",
		Data: res,
	}

	jsonData, err := json.Marshal(response)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	log.Println(string(jsonData))
	return jsonData, nil
}

func (s *chatService) StartChat(data []byte, userId int, conn *websocket.Conn) (int, []byte, error) {
	var payload model.StartChatMessage
	err := json.Unmarshal(data, &payload)
	if err != nil {
		log.Println(err)
	}
	log.Println("Start chat", payload)
	roomId, err := s.postgres.FindRoom(userId, payload.UserId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			roomId, err = s.postgres.CreateRoom(userId, payload.UserId)
			if err != nil {
				return 0, nil, err
			}
		} else {
			return 0, nil, err
		}
	}

	roomsMu.Lock()
	// Используем defer, чтобы мьютекс разблокировался в любом случае
	defer roomsMu.Unlock()

	chat, err := s.postgres.GetPartnerInfo(payload.UserId, roomId)
	if err != nil {
		return roomId, nil, err
	}

	response := model.StartChatResult{
		Type: "start_chat",
		Chat: chat,
	}

	jsonData, err := json.Marshal(response)
	log.Println(rooms)

	// Проверка на дубликат соединения
	for _, c := range rooms[roomId] {
		if c == conn {
			return roomId, jsonData, nil
		}
	}

	rooms[roomId] = append(rooms[roomId], conn)

	return roomId, jsonData, nil
}

func (s *chatService) SaveMassage(data []byte, userId int, conn *websocket.Conn) (*websocket.Conn, []byte, error) {
	var payload model.NewMessage
	err := json.Unmarshal(data, &payload)
	if err != nil {
		log.Println(err)
	}
	msgId, createdAt, err := s.postgres.SaveMessage(payload.ChatId, userId, payload.Text)
	if err != nil {
		log.Println(err)
		return &websocket.Conn{}, nil, err
	}

	var result = model.NewMessageResult{
		Type:   "send_message",
		ChatId: payload.ChatId,
		Message: struct {
			Id        int       `json:"id"`
			SenderId  int       `json:"senderId"`
			Content   string    `json:"content"`
			CreatedAt time.Time `json:"createdAt"`
		}{Id: msgId, SenderId: userId, Content: payload.Text, CreatedAt: createdAt},
	}

	jsonData, err := json.Marshal(result)

	var senderConn *websocket.Conn

	roomsMu.Lock()
	defer roomsMu.Unlock()

	if len(rooms[payload.ChatId]) <= 2 {
		if rooms[payload.ChatId][0] == conn {
			senderConn = rooms[payload.ChatId][1]
		} else {
			senderConn = rooms[payload.ChatId][0]
		}
	}

	return senderConn, jsonData, nil
}

func (s *chatService) GetHistory(userId int, data []byte) ([]byte, error) {
	var payload model.GetHistory
	err := json.Unmarshal(data, &payload)
	if err != nil {
		log.Println(err)
	}

	history, hasMore, err := s.postgres.GetHistory(userId, payload.ChatId, payload.Limit, payload.Offset)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	response := model.GetHistoryResult{
		Type:    "get_history",
		ChatId:  payload.ChatId,
		Data:    history,
		HasMore: hasMore,
	}
	jsonData, err := json.Marshal(response)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	return jsonData, nil
}

func (s *chatService) ReadMessage(data []byte) error {
	var payload model.ReadMessages
	err := json.Unmarshal(data, &payload)
	if err != nil {
		log.Println(err)
		return err
	}

	err = s.postgres.ReadMessage(payload.MessageIds, payload.ChatId)
	if err != nil {
		log.Println(err)
		return err
	}
	return nil
}
