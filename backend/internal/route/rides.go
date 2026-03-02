package route

import (
	"backend/internal/handler"
	"backend/internal/security"

	"github.com/gin-gonic/gin"
)

func NewRidesRoute(controller Handler.RidesHandler, group *gin.RouterGroup, security security.Security) {
	rides := group.Group("rides")
	{
		rides.GET("/search", controller.GetRides)
		rides.GET("/:id", controller.GetRideById)
		rides.GET("/:id/contacts", controller.GetRideContacts)
	}
}
