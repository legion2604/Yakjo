package service

import (
	"backend/internal/model"
	"backend/internal/otp"
	"backend/internal/repository/postgres"
	"backend/internal/repository/redis"
	"backend/internal/security"
	"backend/pkg/utils"
	"context"
	"errors"
	"log"
	"strings"
	"time"

	goredis "github.com/redis/go-redis/v9"
)

type authService struct {
	postgres postgres.AuthRepository
	redis    redis.AuthRepository
	osonSms  otp.OsonSMS
	security security.Security
}

type AuthService interface {
	SendOtp(ctx context.Context, phone model.PhoneRequest) error
	VerifyOtp(ctx context.Context, req model.VerifyOtp) (model.GetUserInfo, string, string, error)
	SaveUserData(user model.RegisterUser) (string, string, error)
	Me(userId int) (model.GetFullUserInfo, error)
	UpdateToken(refreshToken string) (string, error)
}

func NewAuthService(postgres postgres.AuthRepository, redis redis.AuthRepository, osonSms otp.OsonSMS, security security.Security) AuthService {
	return &authService{postgres: postgres, redis: redis, osonSms: osonSms, security: security}
}

func (s *authService) SendOtp(ctx context.Context, phone model.PhoneRequest) error {
	if !strings.HasPrefix(phone.Phone, "992") {
		phone.Phone = "992" + phone.Phone
	}

	if len(phone.Phone) < 9 || len(phone.Phone) > 12 || !utils.IsNumeric(phone.Phone) {
		return errors.New("invalid phone number")
	}

	code := otp.GenerateOTP()
	log.Printf("OTP code from %s is : %s", phone, code)
	err := s.osonSms.SendOtp(phone.Phone, code)
	if err != nil {
		return err
	}

	otpSendAttempts, err := s.redis.GetOtpSendAttempts(ctx, phone.Phone)
	if err != nil {
		// Исправлено: проверяем на отсутствие ключа через errors.Is и алиас goredis.Nil
		if errors.Is(err, goredis.Nil) {
			otpSendAttempts = 0
		} else {
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

func (s *authService) VerifyOtp(ctx context.Context, req model.VerifyOtp) (model.GetUserInfo, string, string, error) {

	if !strings.HasPrefix(req.Phone, "992") {
		req.Phone = "992" + req.Phone
	}

	otpVerifyAttempts, err := s.redis.GetOtpVerifyAttempts(ctx, req.Phone)
	if err != nil {
		// Исправлено: проверяем на отсутствие ключа через errors.Is и алиас goredis.Nil
		if errors.Is(err, goredis.Nil) {
			otpVerifyAttempts = 0
		} else {
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
			return model.GetUserInfo{}, "", "", errors.New("incorrect password")
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

	userInfo, err := s.postgres.GetUserInfoByPhone(req.Phone)
	if err != nil {
		return model.GetUserInfo{}, "", "", err
	}
	if userInfo.IsNewUser != true {
		accessToken, err := s.security.GenerateJwtTokenAccess(userInfo.Id) // 15 мин для access token
		if err != nil {
			return model.GetUserInfo{}, "", "", err
		}
		refreshToken, err := s.security.GenerateJwtTokenRefresh(userInfo.Id) // 90 дней для refresh token
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
	accessToken, err := s.security.GenerateJwtTokenAccess(id) // 15 мин для access token
	if err != nil {
		return "", "", err
	}
	refreshToken, err := s.security.GenerateJwtTokenRefresh(id) // 90 дней для refresh token
	if err != nil {
		return "", "", err
	}
	return accessToken, refreshToken, nil
}

func (s *authService) Me(userId int) (model.GetFullUserInfo, error) {
	res, err := s.postgres.GetUserInfoById(userId)
	if err != nil {
		log.Println(err)
		return model.GetFullUserInfo{}, err
	}
	return res, nil
}

func (s *authService) UpdateToken(refreshToken string) (string, error) {
	payload, err := s.security.VerifyJwtToken(refreshToken)
	if err != nil {
		return "", err
	}
	newToken, err := s.security.GenerateJwtTokenAccess(payload.UserID)
	if err != nil {
		return "", err
	}
	return newToken, nil
}
