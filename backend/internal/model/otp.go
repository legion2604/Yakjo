package model

type SmsRequest struct {
	SenderID   string
	Recipients []string
	Message    string
}

type PhoneRequest struct {
	Phone string `json:"phone"`
}
