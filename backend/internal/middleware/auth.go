package middleware

import (
	"backend/internal/utils"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

const contextKey = "user_id"

func JWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie("access_token")
		if err != nil || token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No access token"})
			c.Abort()
			return
		}
		claims, err := utils.VerifyJwtToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}
		c.Set("user_id", claims.UserID)
		cxt, cancel := context.WithCancel(c.Request.Context())
		defer cancel()
		c.Request = c.Request.WithContext(cxt)
		c.Next()
	}
}

func GetUserIDFromContext(c *gin.Context) int {
	id, exists := c.Get(contextKey)
	if !exists {
		return 0
	}

	return id.(int)
}
