package model

import "time"

type Ride struct {
	Id             string    `json:"id"`
	From           string    `json:"from"`
	To             string    `json:"to"`
	Price          int       `json:"price"`
	DepartureTime  time.Time `json:"departureTime"`
	AvailableSeats int       `json:"availableSeats"`
	Driver         struct {
		Id        int     `json:"id"`
		FirstName string  `json:"firstName"`
		Rating    float64 `json:"rating"`
		AvatarUrl string  `json:"avatarUrl"`
	} `json:"driver"`
	Car      string   `json:"car"`
	Features []string `json:"features"`
}

type RidesRequest struct {
	From  string `form:"from" binding:"required"`
	To    string `form:"to" binding:"required"`
	Date  string `form:"date" binding:"required"` // YYYY-MM-DD
	Seats int    `form:"seats" binding:"required"`
	Sort  string `form:"sort"`
	Page  int    `form:"page,default=1"`
	Limit int    `form:"limit,default=10"`
}

type FullInfoRide struct {
	Id             int       `json:"id"`
	From           string    `json:"from"`
	To             string    `json:"to"`
	Description    string    `json:"description"`
	Price          int       `json:"price"`
	TotalSeats     int       `json:"totalSeats"`
	AvailableSeats int       `json:"availableSeats"`
	DepartureTime  time.Time `json:"departureTime"`
	Driver         struct {
		Id        string  `json:"id"`
		FirstName string  `json:"firstName"`
		LastName  string  `json:"lastName"`
		Rating    float64 `json:"rating"`
		Contacts  struct {
			Hidden bool `json:"hidden"`
		} `json:"contacts"`
	} `json:"driver"`
}
