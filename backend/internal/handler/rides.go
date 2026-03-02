package Handler

import (
	"backend/internal/model"
	"backend/internal/security"
	"backend/internal/service"
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
}

func NewRidesHandler(s service.RideService, security security.Security) RidesHandler {
	return &ridesHandler{s: s, security: security}
}

func (h *ridesHandler) GetRides(ctx *gin.Context) {
	var req model.RidesRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	res, countRides, err := h.s.GetRides(req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": res, "meta": gin.H{
		"total": countRides,
		"page":  req.Page,
		"limit": req.Limit,
	}})
}

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
