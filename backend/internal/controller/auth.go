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
}

func NewAuthController(s service.AuthService) AuthController {
	return &authController{s: s}
}

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

func (c *authController) Me(cxt *gin.Context) {
	userId := middleware.GetUserIDFromContext(cxt)
	res, err := c.s.Me(userId)
	if err != nil {
		cxt.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	cxt.JSON(http.StatusOK, res)
}
