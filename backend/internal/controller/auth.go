package controller

import (
	"backend/internal/middleware"
	"backend/internal/model"
	"backend/internal/service"
	"backend/pkg/utils"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type authController struct {
	s service.AuthService
}

type AuthController interface {
	SendOTP(cxt *gin.Context)
	VerifyOTP(cxt *gin.Context)
	SaveUserData(cxt *gin.Context)
	Me(cxt *gin.Context)
	Logout(cxt *gin.Context)
}

func NewAuthController(s service.AuthService) AuthController {
	return &authController{s: s}
}

// SendOTP godoc
// @Summary      Отправка OTP кода
// @Description  Принимает номер телефона и отправляет на него одноразовый пароль (OTP)
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      model.PhoneRequest  true  "Данные телефона"
// @Success      200      {object}  map[string]string   "massage: Код отправлен"
// @Failure      400      {object}  map[string]string   "error: текст ошибки"
// @Router       /auth/send-otp [post]
func (c *authController) SendOTP(cxt *gin.Context) {
	var req model.PhoneRequest
	err := cxt.ShouldBindJSON(&req)
	if err != nil {
		cxt.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	res := c.s.SendOtp(req)
	if res != nil {
		cxt.JSON(http.StatusBadRequest, gin.H{"error": res})
		return
	}
	cxt.JSON(http.StatusOK, gin.H{"massage": "Код отправлен"})
}

// VerifyOTP godoc
// @Summary      Верификация OTP кода
// @Description  Проверяет код из SMS. Если пользователь существует, устанавливает JWT в Cookie.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      model.VerifyOtp  true  "Код верификации и телефон"
// @Success      200      {object}  model.GetUserInfo   "Данные пользователя (структура зависит от вашей модели)"
// @Failure      400      {object}  map[string]string "error: неверный код или данные"
// @Failure      500      {object}  map[string]string "error: ошибка генерации токена"
// @Header       200      {string}  Set-Cookie       "access_token=...; HttpOnly"
// @Router       /auth/verify-otp [post]
func (c *authController) VerifyOTP(cxt *gin.Context) {
	var req model.VerifyOtp
	err := cxt.ShouldBindJSON(&req)
	if err != nil {
		log.Println("json valid")
		cxt.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userInfo, err := c.s.VarifyOtp(req)
	if userInfo.IsNewUser != true {
		accessToken, err := utils.GenerateJwtToken(userInfo.Id, 15*time.Minute) // 15 мин для access token
		if err != nil {
			cxt.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		cxt.SetCookie("access_token", accessToken, 3600, "/", "localhost", false, true)
	} // сохраняем token в Cookie если пользователь есть в БД

	if err != nil {
		log.Println("userInfo")
		cxt.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cxt.JSON(http.StatusOK, userInfo)
}

// SaveUserData godoc
// @Summary      Завершение регистрации пользователя
// @Description  Сохраняет дополнительные данные нового пользователя и выдает JWT токен в Cookie
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      model.RegisterUser  true  "Данные для регистрации (имя, фамилия и т.д.)"
// @Success      200      {object}  map[string]model.RegisterUser "userInfo: данные пользователя"
// @Failure      400      {object}  map[string]string            "error: ошибка валидации JSON"
// @Failure      500      {object}  map[string]string            "error: внутренняя ошибка сервера"
// @Header       200      {string}  Set-Cookie                   "access_token=...; HttpOnly"
// @Router       /auth/register [post]
func (c *authController) SaveUserData(cxt *gin.Context) {
	var req model.RegisterUser
	err := cxt.ShouldBindJSON(&req)
	if err != nil {
		cxt.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userId, err := c.s.SaveUserData(req)
	if err != nil {
		cxt.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	accessToken, err := utils.GenerateJwtToken(userId, 15*time.Minute) // 15 мин для access token
	if err != nil {
		cxt.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	cxt.SetCookie("access_token", accessToken, 3600, "/", "localhost", false, true)

	cxt.JSON(http.StatusOK, gin.H{"userInfo": req})
}

// Me godoc
// @Summary      Получить данные текущего пользователя
// @Description  Извлекает ID пользователя из JWT токена, находящегося в httpOnly Cookie, и возвращает информацию о профиле.
// @Tags         auth
// @Produce      json
// @Security     CookieAuth
// @Success      200  {object}  model.GetUserInfo  "Данные профиля пользователя"
// @Failure      401  {object}  map[string]string   "error: Unauthorized (токен отсутствует или невалиден)"
// @Failure      500  {object}  map[string]string   "error: Internal Server Error (ошибка БД или сервиса)"
// @Router       /auth/me [get]
func (c *authController) Me(cxt *gin.Context) {
	userId := middleware.GetUserIDFromContext(cxt)
	res, err := c.s.Me(userId)
	if err != nil {
		cxt.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	cxt.JSON(http.StatusOK, res)
}

// Logout godoc
// @Summary      Выход из системы
// @Description  Удаляет JWT токен из Cookie (устанавливает Max-Age: -1).
// @Tags         auth
// @Produce      json
// @Security     CookieAuth
// @Success      200  {object}  map[string]interface{} "userInfo: nil"
// @Header       200  {string}  Set-Cookie             "access_token=; Max-Age=0"
// @Router       /auth/logout [post]
func (c *authController) Logout(cxt *gin.Context) {
	cxt.SetCookie("access_token", "", -1, "/", "", false, true)
	cxt.JSON(http.StatusOK, gin.H{"userInfo": nil})
}
