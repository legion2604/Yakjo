package main

import (
	"backend/internal/controller"
	"backend/internal/middleware"
	"backend/internal/repository"
	"backend/internal/route"
	"backend/internal/service"
	"backend/pkg/config"
	"backend/pkg/database"

	_ "backend/docs"

	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title           Yakjo Service API
// @version         1.0
// @description     API документация проекта Yakjo сервиса для поиска попутчиков.
// @host      localhost:8080
// @BasePath  /api
// @securityDefinitions.apikey CookieAuth
// @in                         header
// @name                       Cookie
// @description                Для тестирования введите в поле: access_token=ваш_токен_тут
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

	c.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	c.Run(":8080")
}
