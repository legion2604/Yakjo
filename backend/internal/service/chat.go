package service

import (
	"backend/internal/model"
	"backend/internal/repository/postgres"
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

type chatService struct {
	postgres postgres.ChatRepository
}

type ChatService interface {
	Disconnect(conn *websocket.Conn, roomId int) error
	GetChats(userId int) ([]byte, error)
	StartChat(data []byte, userId int, conn *websocket.Conn) (int, []byte, error)
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

	// Проверка на дубликат соединения
	for _, c := range rooms[roomId] {
		if c == conn {
			return roomId, nil, nil
		}
	}

	rooms[roomId] = append(rooms[roomId], conn)

	chat, err := s.postgres.GetPartnerInfo(payload.UserId, userId)
	if err != nil {
		return roomId, nil, err
	}

	response := model.StartChatResult{
		Type: "start_chat",
		Chat: chat,
	}

	jsonData, err := json.Marshal(response)
	log.Println(rooms)
	return roomId, jsonData, nil
}
