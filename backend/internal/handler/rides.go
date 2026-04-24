package Handler

import (
	"backend/internal/middleware"
	"backend/internal/model"
	"backend/internal/security"
	"backend/internal/service"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ridesHandler struct {
	s        service.RideService
	security security.Security
}

type RidesHandler interface {
	GetRides(ctx *gin.Context)
	GetRideById(ctx *gin.Context)
	GetRideContacts(ctx *gin.Context)
	CreateRide(ctx *gin.Context)
}

func NewRidesHandler(s service.RideService, security security.Security) RidesHandler {
	return &ridesHandler{s: s, security: security}
}

// GetRides godoc
// @Summary      Получить список поездок
// @Description  Возвращает список доступных поездок с фильтрацией и пагинацией
// @Tags         rides
// @Accept       json
// @Produce      json
// @Param        page   query      int  false  "Номер страницы"
// @Param        limit  query      int  false  "Количество элементов"
// @Param        from   query      string  false  "Откуда"
// @Param        to     query      string  false  "Куда"
// @Success      200 {object} model.RidesResponse
// @Failure      400 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /rides [get]
func (h *ridesHandler) GetRides(ctx *gin.Context) {
	var req model.RidesRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		log.Println(err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	res, countRides, err := h.s.GetRides(req)
	if err != nil {
		log.Println(err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": res, "meta": gin.H{
		"total": countRides,
		"page":  req.Page,
		"limit": req.Limit,
	}})
}

// GetRideById godoc
// @Summary      Детальная информация о поездке
// @Description  Возвращает полную информацию о поездке. Контакты водителя скрыты, если пользователь не авторизован (проверка access_token в Cookie).
// @Tags         rides
// @Accept       json
// @Produce      json
// @Param        id     path      int  true  "ID поездки"
// @Param        Cookie header    string  false "access_token=..."
// @Success      200 {object} model.RideFullInfo
// @Failure      400 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /rides/{id} [get]
func (h *ridesHandler) GetRideById(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	res, err := h.s.GetRideFullInfoById(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	res.Driver.Contacts.Hidden = false
	token, errT := ctx.Cookie("access_token")
	if _, err := h.security.VerifyJwtToken(token); err != nil || errT != nil {
		res.Driver.Contacts.Hidden = true
	}
	ctx.JSON(http.StatusOK, res)
}

// GetRideContacts godoc
// @Summary      Контакты водителя
// @Description  Возвращает контактную информацию водителя для конкретной поездки
// @Tags         rides
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "ID поездки"
// @Success      200 {object} model.Contacts
// @Failure      400 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /rides/{id}/contacts [get]
func (h *ridesHandler) GetRideContacts(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	res, err := h.s.GetRideContacts(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, res)
}

// CreateRide godoc
// @Summary      Создать новую поездку
// @Description  Создает поездку от имени текущего авторизованного пользователя
// @Tags         rides
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        ride  body   model.RideForm  true  "Данные поездки"
// @Success      201 {object} map[string]interface{} "id, status: created"
// @Failure      400 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /rides [post]
func (h *ridesHandler) CreateRide(ctx *gin.Context) {
	var req model.RideForm
	if err := ctx.ShouldBind(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	driverId := middleware.GetUserIDFromContext(ctx)
	log.Println(driverId)
	id, err := h.s.CreateRide(driverId, req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, gin.H{
		"id":     id,
		"status": "created",
	})
}
