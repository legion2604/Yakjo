package service

import (
	"backend/internal/model"
	"backend/internal/repository"
	"backend/pkg/config"
	"backend/pkg/utils"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
)

type authService struct {
	r repository.AuthRepository
}

type AuthService interface {
	SendOtp(phone model.PhoneRequest) error
}

func NewAuthService(r repository.AuthRepository) AuthService {
	return &authService{r: r}
}

func (s *authService) SendOtp(phone model.PhoneRequest) error {
	code := utils.GenerateOTP()
	reqBody := model.SmsRequest{
		SenderID:   "MsgRush",
		Recipients: []string{phone.Phone},
		Message:    fmt.Sprintf("Your code is: %s", code),
	}
	err := s.r.SaveOtp(phone.Phone, utils.GenerateHashFromPassword(code)) // сохраняем код в БД

	bodyBytes, _ := json.Marshal(reqBody)

	url := config.GetEnv("msgRushUrl")

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return err
	}
	apiKey := config.GetEnv("msgRushApiKey")
	req.Header.Set("X-API-Key", apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Ошибка при отправке запроса: %v\n", err)
		return err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return errors.New(string(body))
	}
	err = s.r.SaveOtp(phone.Phone, utils.GenerateHashFromPassword(code)) // сохраняем код в БД
	if err != nil {
		return err
	}
	return nil
}
