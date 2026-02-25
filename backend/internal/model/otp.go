package model

type PhoneRequest struct {
	Phone string `json:"phone"`
}

type VerifyOtp struct {
	Phone string `json:"phone"`
	Code  string `json:"code"`
}
