package Handler

import (
	"backend/internal/middleware"
	"backend/internal/model"
	"backend/internal/service"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type authHandler struct {
	s service.AuthService
}

type AuthHandler interface {
	SendOTP(c *gin.Context)
	VerifyOTP(c *gin.Context)
	SaveUserData(c *gin.Context)
	Me(c *gin.Context)
	Logout(c *gin.Context)
	UpdateToken(c *gin.Context)
}

func NewAuthHandler(s service.AuthService) AuthHandler {
	return &authHandler{s: s}
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
func (h *authHandler) SendOTP(c *gin.Context) {
	var req model.PhoneRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	res := h.s.SendOtp(req)
	if res != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": res})
		return
	}
	c.JSON(http.StatusOK, gin.H{"massage": "Код отправлен"})
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
func (h *authHandler) VerifyOTP(c *gin.Context) {
	var req model.VerifyOtp
	err := c.ShouldBindJSON(&req)
	if err != nil {
		log.Println("json valid")
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userInfo, accessToken, refreshToken, err := h.s.VarifyOtp(req)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !userInfo.IsNewUser && accessToken != "" && refreshToken != "" {
		c.SetCookie("access_token", accessToken, 60*15, "/", "localhost", false, true)
		c.SetCookie("refresh_token", refreshToken, 60*60*24*90, "/", "localhost", false, true)
	}

	c.JSON(http.StatusOK, userInfo)
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
func (h *authHandler) SaveUserData(c *gin.Context) {
	var req model.RegisterUser
	err := c.ShouldBindJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	accessToken, refreshToken, err := h.s.SaveUserData(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.SetCookie("access_token", accessToken, 60*15, "/", "localhost", false, true)
	c.SetCookie("refresh_token", refreshToken, 60*60*24*90, "/", "localhost", false, true)

	c.JSON(http.StatusOK, gin.H{"massage": "Register success!"})
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
func (h *authHandler) Me(c *gin.Context) {
	userId := middleware.GetUserIDFromContext(c)
	res, err := h.s.Me(userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
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
func (h *authHandler) Logout(c *gin.Context) {
	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"userInfo": nil})
}

func (h *authHandler) UpdateToken(c *gin.Context) {
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	newAccessToken, err := h.s.UpdateToken(refreshToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.SetCookie("access_token", newAccessToken, 60*15, "/", "localhost", false, true)
	c.JSON(http.StatusOK, gin.H{"massage": "Update success!"})
}
