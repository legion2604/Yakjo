package utils

import (
	"backend/pkg/config"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// CustomClaims описывает структуру данных внутри токена
type CustomClaims struct {
	UserID int `json:"user_id"`
	// Можно добавить любые поля: Role, Email и т.д.
	jwt.RegisteredClaims
}

// Generate создает новый токен для пользователя
func GenerateJwtToken(userID int, exp time.Duration) (string, error) {
	claims := CustomClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(exp)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.GetEnv("JWT_SECRET")))
}

// Verify проверяет токен и возвращает данные (claims)
func VerifyJwtToken(tokenString string) (*CustomClaims, error) {
	token, err := jwt.ParseWithClaims(
		tokenString,
		&CustomClaims{},
		func(token *jwt.Token) (interface{}, error) {
			// Проверяем алгоритм подписи
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected token signing method")
			}
			return []byte(config.GetEnv("JWT_SECRET")), nil
		},
	)

	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	claims, ok := token.Claims.(*CustomClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}

	return claims, nil
}
