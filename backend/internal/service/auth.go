package service

import (
	"backend/internal/model"
	"backend/internal/repository/postgres"
	"backend/internal/repository/redis"
	"backend/pkg/utils"
	"context"
	"errors"
	"log"
	"time"
)

type authService struct {
	postgres postgres.AuthRepository
	redis    redis.AuthRepository
}

type AuthService interface {
	SendOtp(ctx context.Context, phone model.PhoneRequest) error
	VarifyOtp(ctx context.Context, req model.VerifyOtp) (model.GetUserInfo, string, string, error)
	SaveUserData(user model.RegisterUser) (string, string, error)
	Me(userId int) (model.GetUserInfo, error)
	UpdateToken(refreshToken string) (string, error)
}

func NewAuthService(postgres postgres.AuthRepository, redis redis.AuthRepository) AuthService {
	return &authService{postgres: postgres, redis: redis}
}

func (s *authService) SendOtp(ctx context.Context, phone model.PhoneRequest) error {
	code := utils.GenerateOTP()
	//reqBody := model.SmsRequest{
	//	SenderID:   "Yakjo",
	//	Recipients: []string{phone.Phone},
	//	Message:    fmt.Sprintf("Your code is: %s", code),
	//}
	//log.Println("Code: ", code)
	//
	//bodyBytes, _ := json.Marshal(reqBody)
	//
	//url := config.GetEnv("msgRushUrl")
	//
	//req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	//if err != nil {
	//	return err
	//}
	//apiKey := config.GetEnv("msgRushApiKey")
	//req.Header.Set("X-API-Key", apiKey)
	//req.Header.Set("Content-Type", "application/json")
	//
	//client := &http.Client{}
	//resp, err := client.Do(req)
	//if err != nil {
	//	fmt.Printf("Ошибка при отправке запроса: %v\n", err)
	//	return err
	//}
	//defer resp.Body.Close()
	//
	//body, _ := io.ReadAll(resp.Body)
	//if resp.StatusCode != http.StatusOK {
	//	return errors.New(string(body))
	//}
	//err := s.postgres.SaveOtp(phone.Phone, utils.GenerateHashFromPassword(code)) // сохраняем код в БД
	otpSendAttempts, err := s.redis.GetOtpSendAttempts(ctx, phone.Phone)

	if err != nil {
		// Если это ошибка "ключа нет", мы её игнорируем и считаем попытки = 0
		if err.Error() == "redis: nil" {
			otpSendAttempts = 0
		} else {
			// Если это ошибка сети или базы — возвращаем её
			return err
		}
	}
	if otpSendAttempts < 3 {
		_, err := s.redis.IncrementOtpSendAttempts(ctx, phone.Phone, time.Minute*30)
		if err != nil {
			return err
		}
		err = s.redis.DeleteOtpSend(ctx, phone.Phone)
		err = s.redis.CreateOtpSend(ctx, phone.Phone, code, time.Minute*3)
		if err != nil {
			return err
		}
	} else if 3 <= otpSendAttempts {
		return errors.New("слишком много попыток повторите позже")
	}

	log.Println("Verify OTP:", code)
	return nil
}

func (s *authService) VarifyOtp(ctx context.Context, req model.VerifyOtp) (model.GetUserInfo, string, string, error) {

	otpVerifyAttempts, err := s.redis.GetOtpVerifyAttempts(ctx, req.Phone)
	if err != nil {
		// Если это ошибка "ключа нет", мы её игнорируем и считаем попытки = 0
		if err.Error() == "redis: nil" {
			otpVerifyAttempts = 0
		} else {
			// Если это ошибка сети или базы — возвращаем её
			return model.GetUserInfo{}, "", "", err
		}
	}

	if otpVerifyAttempts < 5 {
		_, err := s.redis.IncrementOtpVerifyAttempts(ctx, req.Phone, time.Minute*5)
		if err != nil {
			return model.GetUserInfo{}, "", "", err
		}
		otpSendCode, err := s.redis.GetOtpSend(ctx, req.Phone)
		if err != nil {
			return model.GetUserInfo{}, "", "", err
		}
		if otpSendCode != req.Code {
			return model.GetUserInfo{}, "", "", errors.New("неверный код! Повторите пожалуйств")
		}

		err = s.redis.DeleteOtpSend(ctx, req.Phone) // удаляем сам код otp
		if err != nil {
			return model.GetUserInfo{}, "", "", err
		}
		err = s.redis.DeleteOtpSendAttempts(ctx, req.Phone) // удаляем счётчик попыток otp
		if err != nil {
			return model.GetUserInfo{}, "", "", err
		}

	} else {
		return model.GetUserInfo{}, "", "", errors.New("слишком много попыток повторите позже")
	}

	//redis.deleteOTPsend
	userInfo, err := s.postgres.GetUserInfoByPhone(req.Phone)
	if err != nil {
		return model.GetUserInfo{}, "", "", err
	}
	if userInfo.IsNewUser != true {
		accessToken, err := utils.GenerateJwtToken(userInfo.Id, 15*time.Minute) // 15 мин для access token
		if err != nil {
			return model.GetUserInfo{}, "", "", err
		}
		refreshToken, err := utils.GenerateJwtToken(userInfo.Id, 90*24*time.Hour) // 90 дней для refresh token
		if err != nil {
			return model.GetUserInfo{}, "", "", err
		}
		return userInfo, accessToken, refreshToken, nil
	} // сохраняем token в Cookie если пользователь есть в БД
	return userInfo, "", "", nil
}

func (s *authService) SaveUserData(user model.RegisterUser) (string, string, error) {
	id, err := s.postgres.SaveUserData(user)
	if err != nil {
		log.Println(err)
		return "", "", err
	}
	accessToken, err := utils.GenerateJwtToken(id, 15*time.Minute) // 15 мин для access token
	if err != nil {
		return "", "", err
	}
	refreshToken, err := utils.GenerateJwtToken(id, 90*24*time.Hour) // 90 дней для refresh token
	if err != nil {
		return "", "", err
	}
	return accessToken, refreshToken, nil
}

func (s *authService) Me(userId int) (model.GetUserInfo, error) {
	res, err := s.postgres.GetUserInfoById(userId)
	if err != nil {
		log.Println(err)
		return model.GetUserInfo{}, err
	}
	return res, nil
}

func (s *authService) UpdateToken(refreshToken string) (string, error) {
	payload, err := utils.VerifyJwtToken(refreshToken)
	if err != nil {
		return "", err
	}
	newToken, err := utils.GenerateJwtToken(payload.UserID, 15*time.Minute)
	if err != nil {
		return "", err
	}
	return newToken, nil
}
