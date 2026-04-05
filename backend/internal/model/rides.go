package model

import "time"

type Ride struct {
	Id             string    `json:"id"`
	From           string    `json:"from"`
	To             string    `json:"to"`
	Price          int       `json:"price"`
	DepartureTime  time.Time `json:"departureTime"`
	ArrivalTime    time.Time `json:"arrivalTime"`
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
	From  string `form:"from"  default:"*"`
	To    string `form:"to" default:"*"`
	Date  string `form:"date" default:"*"`
	Seats int    `form:"seats" default:"4"`
	Sort  string `form:"sort"  default:"desc"`
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
	ArrivalTime    time.Time `json:"arrivalTime"`
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

type RideContacts struct {
	Phone    string `json:"phone"`
	Whatsapp string `json:"whatsapp"`
	Telegram string `json:"telegram"`
}

type RideForm struct {
	From          string    `json:"from"`
	To            string    `json:"to"`
	DepartureTime time.Time `json:"departureTime"`
	ArrivalTime   time.Time `json:"arrivalTime"`
	Price         int       `json:"price"`
	TotalSeats    int       `json:"totalSeats"`
	Description   string    `json:"description"`
}
