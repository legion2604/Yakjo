package route

import (
	"backend/internal/controller"
	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewAuthRoute(controller controller.AuthController, group *gin.RouterGroup) {
	auth := group.Group("auth")
	{
		auth.POST("/send-otp", controller.SendOTP)
		auth.POST("/verify-otp", controller.VerifyOTP)
		auth.POST("/register", controller.SaveUserData)
		auth.GET("/me", middleware.JWTAuthMiddleware(), controller.Me)

	}
}
