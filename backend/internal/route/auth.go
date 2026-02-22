package route

import (
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/security"

	"github.com/gin-gonic/gin"
)

func NewAuthRoute(controller Handler.AuthHandler, group *gin.RouterGroup, security security.Security) {
	auth := group.Group("auth")
	{
		auth.POST("/send-otp", controller.SendOTP)
		auth.POST("/verify-otp", controller.VerifyOTP)
		auth.POST("/register", controller.SaveUserData)
		auth.GET("/me", middleware.JWTAuthMiddleware(security), controller.Me)
		auth.POST("/logout", middleware.JWTAuthMiddleware(security), controller.Logout)
		auth.POST("/refresh-token", controller.UpdateToken)

	}
}
