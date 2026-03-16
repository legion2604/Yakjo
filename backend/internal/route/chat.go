package route

import (
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/security"

	"github.com/gin-gonic/gin"
)

func NewChatRoute(controller Handler.ChatHandler, group *gin.RouterGroup, security security.Security) {
	auth := group.Group("ws")
	{
		auth.GET("/", middleware.JWTAuthMiddleware(security), controller.ConnectChat)
	}
}
