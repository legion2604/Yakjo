package route

import (
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/security"

	"github.com/gin-gonic/gin"
)

func NewUsersRoute(controller Handler.UsersHandler, group *gin.RouterGroup, security security.Security) {
	users := group.Group("users")
	{
		users.GET("/:id", middleware.JWTAuthMiddleware(security), controller.GetUserById)
		users.PUT("/me", middleware.JWTAuthMiddleware(security), controller.ChangeUserInfo)
	}
}
