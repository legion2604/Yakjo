package route

import (
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/security"

	"github.com/gin-gonic/gin"
)

func NewRidesRoute(controller Handler.RidesHandler, group *gin.RouterGroup, security security.Security) {
	rides := group.Group("rides")
	{
		rides.GET("/search", controller.GetRides)
		rides.GET("/:id", controller.GetRideById)
		rides.GET("/:id/contacts", controller.GetRideContacts)
		rides.POST("", middleware.JWTAuthMiddleware(security), controller.CreateRide)
		rides.GET("/my", middleware.JWTAuthMiddleware(security), controller.GetRidesByUserId)
		rides.DELETE(":id", middleware.JWTAuthMiddleware(security), controller.DeleteRideById)
		rides.PUT(":id", middleware.JWTAuthMiddleware(security), controller.ChangeRideById)
	}
}
