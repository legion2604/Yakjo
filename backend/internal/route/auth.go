package route

import (
	"backend/internal/handler"
	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewAuthRoute(controller Handler.AuthHandler, group *gin.RouterGroup) {
	auth := group.Group("auth")
	{
		auth.POST("/send-otp", controller.SendOTP)
		auth.POST("/verify-otp", controller.VerifyOTP)
		auth.POST("/register", controller.SaveUserData)
		auth.GET("/me", middleware.JWTAuthMiddleware(), controller.Me)
		auth.POST("/logout", middleware.JWTAuthMiddleware(), controller.Logout)
		auth.POST("/refresh-token", controller.UpdateToken)

	}
}
