package Handler

import (
	"backend/internal/middleware"
	"backend/internal/model"
	"backend/internal/security"
	"backend/internal/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

type usersHandler struct {
	s        service.UsersService
	security security.Security
}
type UsersHandler interface {
	GetUserById(c *gin.Context)
	ChangeUserInfo(c *gin.Context)
}

func NewUsersHandler(s service.UsersService, security security.Security) UsersHandler {
	return &usersHandler{s: s, security: security}
}

func (h *usersHandler) GetUserById(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	res, err := h.s.GetUserById(id)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, res)
}

func (h *usersHandler) ChangeUserInfo(c *gin.Context) {
	var req model.NewUserData

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
	}
	userId := middleware.GetUserIDFromContext(c)

	err := h.s.ChangeUserInfo(userId, req)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": "user updated"})
}
