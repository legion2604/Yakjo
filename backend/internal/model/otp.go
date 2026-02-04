package model

type SmsRequest struct {
	SenderID   string
	Recipients []string
	Message    string
}

type PhoneRequest struct {
	Phone string `json:"phone"`
}

type VerifyOtp struct {
	Phone string `json:"phone"`
	Code  string `json:"code"`
}
