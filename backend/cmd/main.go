package main

import (
	"backend/internal/controller"
	"backend/internal/middleware"
	"backend/internal/repository"
	"backend/internal/route"
	"backend/internal/service"
	"backend/pkg/config"
	"backend/pkg/database"

	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadEnv()
	database.InitDB()

	c := gin.Default()

	authRepo := repository.NewAuthRepository(database.DB)
	authService := service.NewAuthService(authRepo)
	authController := controller.NewAuthController(authService)

	c.Use(middleware.CORSMiddleware())

	api := c.Group("/api")
	{
		route.NewAuthRoute(authController, api)
	}
	c.Run("localhost:8080")
}
