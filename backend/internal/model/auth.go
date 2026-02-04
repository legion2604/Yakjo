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
