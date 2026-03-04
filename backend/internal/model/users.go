package model

type User struct {
	Id          int      `json:"id"`
	FirstName   string   `json:"firstName"`
	CreatedAt   string   `json:"createdAt"`
	Rating      float64  `json:"rating"`
	ReviewCount int      `json:"reviewCount"`
	Reviews     []Review `json:"reviews"`
}

type Review struct {
	Id      int    `json:"id"`
	Author  string `json:"author"`
	Rating  int    `json:"rating"`
	Comment string `json:"comment"`
	Date    string `json:"date"`
}
