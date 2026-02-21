package security

import (
	"backend/pkg/config"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type security struct {
}

type Security interface {
	GenerateJwtTokenAccess(userID int) (string, error)
	GenerateJwtTokenRefresh(userID int) (string, error)
	VerifyJwtToken(key string) (*CustomClaims, error)
}

func NewSecurity() Security {
	return &security{}
}

type CustomClaims struct {
	UserID int `json:"user_id"`
	jwt.RegisteredClaims
}

func (s *security) GenerateJwtTokenAccess(userID int) (string, error) {
	claims := CustomClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.GetEnv("JWT_SECRET")))
}
func (s *security) GenerateJwtTokenRefresh(userID int) (string, error) {
	claims := CustomClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(90 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.GetEnv("JWT_SECRET")))
}

func (s *security) VerifyJwtToken(key string) (*CustomClaims, error) {
	claims := &CustomClaims{}
	token, err := jwt.ParseWithClaims(key, claims, func(token *jwt.Token) (interface{}, error) { return []byte(config.GetEnv("JWT_SECRET")), nil })
	if err != nil || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}
