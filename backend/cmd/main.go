package main

import (
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/otp"
	postgres2 "backend/internal/repository/postgres"
	redis2 "backend/internal/repository/redis"
	"backend/internal/route"
	"backend/internal/security"
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

	newOsonSms := otp.NewOsonSMS()
	newSecurity := security.NewSecurity()

	authPostgresRepo := postgres2.NewAuthRepository(postgres.DB)
	authRedisRepo := redis2.NewAuthRepository(redis.Client)
	authService := service.NewAuthService(authPostgresRepo, authRedisRepo, newOsonSms, newSecurity)
	authHandler := Handler.NewAuthHandler(authService)

	c.Use(middleware.CORSMiddleware())

	api := c.Group("/api")
	{
		route.NewAuthRoute(authHandler, api)
	}

	c.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	c.Run("0.0.0.0:8080")
}
