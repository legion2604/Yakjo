package Handler

import (
	"backend/internal/middleware"
	"backend/internal/model"
	"backend/internal/security"
	"backend/internal/service"
	"net/http"
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
	AddReview(c *gin.Context)
}

func NewUsersHandler(s service.UsersService, security security.Security) UsersHandler {
	return &usersHandler{s: s, security: security}
}

// GetUserById godoc
// @Summary      Получить профиль пользователя
// @Description  Возвращает публичную информацию о пользователе по его идентификатору
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "ID пользователя"
// @Success      200  {object}  model.User "Данные пользователя"
// @Failure      400  {object}  map[string]string "Неверный ID или пользователь не найден"
// @Router       /users/{id} [get]
func (h *usersHandler) GetUserById(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	res, err := h.s.GetUserById(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}

// ChangeUserInfo godoc
// @Summary      Обновить данные профиля
// @Description  Изменяет информацию о текущем авторизованном пользователе
// @Tags         users
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        user  body      model.NewUserData  true  "Новые данные пользователя"
// @Success      200   {object}  map[string]string "message: user updated"
// @Failure      400   {object}  map[string]string "Ошибка валидации или обновления"
// @Router       /users/me [put]
func (h *usersHandler) ChangeUserInfo(c *gin.Context) {
	var req model.NewUserData

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userId := middleware.GetUserIDFromContext(c)

	err := h.s.ChangeUserInfo(userId, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user updated"})
}

// AddReview godoc
// @Summary      Оставить отзыв водителю
// @Description  Добавляет отзыв и рейтинг водителю. Нельзя оставить отзыв самому себе.
// @Tags         reviews
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id      path      int                         true  "ID водителя"
// @Param        review  body      model.NewReview  true  "Текст отзыва и оценка"
// @Success      200     {object}  map[string]string "message: Rating submitted"
// @Failure      400     {object}  map[string]string "Ошибка (например, попытка оценить себя)"
// @Router       /users/{id}/reviews [post]
func (h *usersHandler) AddReview(c *gin.Context) {
	driverId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	authorId := middleware.GetUserIDFromContext(c)

	var req model.NewReview

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if driverId == authorId {
		c.JSON(http.StatusBadRequest, gin.H{"error": "you can't add yourself"})
		return
	}

	err = h.s.AddReview(driverId, authorId, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Rating submitted"})
}
