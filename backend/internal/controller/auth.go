package controller

import (
	"backend/internal/model"
	"backend/internal/service"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type authController struct {
	s service.AuthService
}

type AuthController interface {
	SendOTP(cxt *gin.Context)
	VerifyOTP(cxt *gin.Context)
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
	if err != nil {
		log.Println("userInfo")
		cxt.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	cxt.JSON(http.StatusOK, userInfo)
}
