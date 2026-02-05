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
	"log"
	"net/http"
)

type authService struct {
	r repository.AuthRepository
}

type AuthService interface {
	SendOtp(phone model.PhoneRequest) error
	VarifyOtp(req model.VerifyOtp) (model.GetUserInfo, error)
	SaveUserData(user model.RegisterUser) (int, error)
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
	log.Println("Code: ", code)

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

func (s *authService) VarifyOtp(req model.VerifyOtp) (model.GetUserInfo, error) {
	validOtpHash, err := s.r.GetValidOtpHash(req.Phone)
	if err != nil {
		return model.GetUserInfo{}, err
	}
	isCodeValid := utils.ComparePasswords(validOtpHash, req.Code)
	if !isCodeValid {
		return model.GetUserInfo{}, errors.New("Неверный код")
	}
	userInfo, err := s.r.GetUserInfo(req.Phone)
	if err != nil {
		return model.GetUserInfo{}, err
	}
	return userInfo, nil
}

func (s *authService) SaveUserData(user model.RegisterUser) (int, error) {
	id, err := s.r.SaveUserData(user)
	if err != nil {
		return 0, err
	}
	return id, nil
}
