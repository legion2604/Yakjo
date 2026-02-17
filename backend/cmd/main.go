package main

import (
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/repository"
	"backend/internal/route"
	"backend/internal/service"
	"backend/pkg/config"
	"backend/pkg/database/postgres"
	"backend/pkg/database/redis"

	_ "backend/docs"

	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title           Yakjo Service API
// @version         1.0
// @description     API документация проекта Yakjo сервиса для поиска попутчиков.
// @BasePath  /api
// @securityDefinitions.apikey CookieAuth
// @in                         header
// @name                       Cookie
// @description                Для тестирования введите в поле: access_token=ваш_токен_тут
func main() {
	config.LoadEnv()
	postgres.ConnectDB()
	redis.ConnectDB()

	c := gin.Default()

	authRepo := repository.NewAuthRepository(postgres.DB)
	authService := service.NewAuthService(authRepo)
	authHandler := Handler.NewAuthHandler(authService)

	c.Use(middleware.CORSMiddleware())

	api := c.Group("/api")
	{
		route.NewAuthRoute(authHandler, api)
	}

	c.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	c.Run("0.0.0.0:8080")
}
