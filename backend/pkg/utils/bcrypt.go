package utils

import (
	"log"

	"golang.org/x/crypto/bcrypt"
)

func GenerateHashFromPassword(password string) string {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Error:: %v", err)
	}

	hashStr := string(hashedPassword)

	return hashStr
}

func ComparePasswords(hashedPassword, passwordFromUser string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(passwordFromUser))
	if err != nil {
		return false
	}
	return true
}
