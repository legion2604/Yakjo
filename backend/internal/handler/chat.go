package Handler

import (
	"backend/internal/middleware"
	"backend/internal/service"
	"log"
	"net/http"
	"sync"

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

var (
	rooms   = make(map[int][]*websocket.Conn)
	roomsMu sync.Mutex // Мьютекс для защиты карты rooms
)

func (h *chatHandler) ConnectChat(c *gin.Context) {
	userId := middleware.GetUserIDFromContext(c)

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Close()

	for {
		_, payload, err := conn.ReadMessage()
		if err != nil {
			break
		}
		ttype, err := h.s.ChatGetCommand(payload)
		if err != nil {
			log.Println(err)
		}
		result, err := h.s.ChatExecuteCommand(userId, ttype, payload)
		if err != nil {
			return
		}
		err = conn.WriteMessage(websocket.TextMessage, result)
		if err != nil {
			log.Println(err)
		}
	}

}
