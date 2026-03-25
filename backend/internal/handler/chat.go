package Handler

import (
	"backend/internal/middleware"
	"backend/internal/model"
	"backend/internal/service"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type chatHandler struct {
	s service.ChatService
}

type ChatHandler interface {
	ConnectChat(c *gin.Context)
}

func NewChatHandler(s service.ChatService) ChatHandler {
	return &chatHandler{s: s}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		//	origin := r.Header.Get("Origin")
		// Разрешаем только наш официальный сайт
		return true
	},
}

func (h *chatHandler) ConnectChat(c *gin.Context) {
	userId := middleware.GetUserIDFromContext(c)

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	var currentRoomId int

	defer func() {
		log.Printf("User %d disconnecting from room %d", userId, currentRoomId)
		h.s.Disconnect(conn, currentRoomId)
	}()

	for {
		_, payload, err := conn.ReadMessage()
		if err != nil {
			break
		}

		var baseMessage model.BaseMessage
		if err := json.Unmarshal(payload, &baseMessage); err != nil {
			log.Println("Unmarshal error:", err)
			continue // Не выходим из цикла, просто ждем следующее сообщение
		}

		var result []byte
		var rId int
		var sendConn = conn
		switch baseMessage.Type {
		case "get_chats":
			result, err = h.s.GetChats(userId)
		case "start_chat":
			rId, result, err = h.s.StartChat(payload, userId, conn)
			if err == nil {
				currentRoomId = rId
			}
		case "send_message":
			sendConn, result, err = h.s.SaveMassage(payload, userId, conn)
			if err != nil {
				log.Println("SaveMassage error:", err)
			}

		}

		if err != nil {
			log.Println("Service error:", err)
			continue
		}

		if result != nil && sendConn != nil {
			err = sendConn.WriteMessage(websocket.TextMessage, result)
			if err != nil {
				log.Println("Write error:", err)
				break
			}
		}
	}
}
