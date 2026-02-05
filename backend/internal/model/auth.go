package model

type Auth struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type GetUserInfo struct {
	Id        int    `json:"id"`
	FirstName string `json:"firstName"`
	Phone     string `json:"phone"`
	AvatarUrl string `json:"avatarUrl"`
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
