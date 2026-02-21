package model

type Auth struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type GetUserInfo struct {
	Id        int    `json:"id"`
	Phone     string `json:"phone"`
	IsNewUser bool   `json:"isNewUser"`
}

type RegisterUser struct {
	Phone     string `json:"phone"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	BirthDate string `json:"birthDate"`
	CarBrand  string `json:"carBrand"`
	Email     string `json:"email"`
	Bio       string `json:"bio"`
}

type GetFullUserInfo struct {
	Id         string  `json:"id"`
	Phone      string  `json:"phone"`
	FirstName  string  `json:"firstName"`
	LastName   string  `json:"lastName"`
	AvatarUrl  string  `json:"avatarUrl"`
	Rating     float64 `json:"rating"`
	RidesCount int     `json:"ridesCount"`
	Whatsapp   string  `json:"whatsapp"`
	Telegram   string  `json:"telegram"`
}
