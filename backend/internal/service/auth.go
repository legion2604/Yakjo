package service

import (
	"backend/internal/model"
	"backend/internal/repository"
	"backend/pkg/utils"
	"errors"
	"log"
	"time"
)

type authService struct {
	r repository.AuthRepository
}

type AuthService interface {
	SendOtp(phone model.PhoneRequest) error
	VarifyOtp(req model.VerifyOtp) (model.GetUserInfo, string, string, error)
	SaveUserData(user model.RegisterUser) (string, string, error)
	Me(userId int) (model.GetUserInfo, error)
	UpdateToken(refreshToken string) (string, error)
}

func NewAuthService(r repository.AuthRepository) AuthService {
	return &authService{r: r}
}

func (s *authService) SendOtp(phone model.PhoneRequest) error {
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
	err := s.r.SaveOtp(phone.Phone, utils.GenerateHashFromPassword(code)) // сохраняем код в БД
	if err != nil {
		log.Println(err)
		return err
	}
	log.Println("Verify OTP:", code)
	return nil
}

func (s *authService) VarifyOtp(req model.VerifyOtp) (model.GetUserInfo, string, string, error) {
	validOtpHash, err := s.r.GetValidOtpHash(req.Phone)
	if err != nil {
		log.Println(err)
		return model.GetUserInfo{}, "", "", err
	}
	isCodeValid := utils.ComparePasswords(validOtpHash, req.Code)
	if !isCodeValid {
		log.Println(err)
		err = s.r.IncrementOTPAttempt(req.Phone)
		if err != nil {
			log.Println(err)
			return model.GetUserInfo{}, "", "", err
		}
		return model.GetUserInfo{}, "", "", errors.New("Неверный код")
	}
	userInfo, err := s.r.GetUserInfoByPhone(req.Phone)
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
	id, err := s.r.SaveUserData(user)
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
	res, err := s.r.GetUserInfoById(userId)
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
