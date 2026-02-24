package Handler

import (
	"backend/internal/model"
	"backend/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ridesHandler struct {
	s service.RideService
}
type RidesHandler interface {
	GetRides(ctx *gin.Context)
}

func NewRidesHandler(s service.RideService) RidesHandler {
	return &ridesHandler{s: s}
}

func (h *ridesHandler) GetRides(ctx *gin.Context) {
	var req model.GetRidesRequest
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
