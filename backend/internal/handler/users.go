package Handler

import (
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
