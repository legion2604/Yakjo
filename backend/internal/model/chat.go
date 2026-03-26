package model

import "time"

type UserChat struct {
	Id        int    `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	AvatarUrl string `json:"avatarUrl"`
	Online    string `json:"online"`
}

type Message struct {
	Id        string `json:"id"`
	ChatId    int    `json:"chatId"`
	SenderId  int    `json:"senderId"`
	Content   string `json:"content"`
	CreatedAt string `json:"createdAt"`
	IsRead    bool   `json:"isRead"`
}

type Chat struct {
	Id          int      `json:"id"`
	Partner     UserChat `json:"partner"`
	LastMessage Message  `json:"lastMessage"`
	UnreadCount int      `json:"unreadCount"`
}

type GetChatsResult struct {
	Type string `json:"type"`
	Data []Chat `json:"data"`
}

type StartChatResult struct {
	Type string `json:"type"`
	Chat Chat   `json:"chat"`
}

type BaseMessage struct {
	Type string `json:"type"`
}

type GetChatsMessage struct {
	Type string `json:"type"`
}

type StartChatMessage struct {
	Type   string `json:"type"`
	UserId int    `json:"userId"`
}

type NewMessage struct {
	Type   string `json:"type"`
	ChatId int    `json:"chatId"`
	Text   string `json:"text"`
}
type NewMessageResult struct {
	Type    string `json:"type"`
	ChatId  int    `json:"chatId"`
	Message struct {
		Id        int       `json:"id"`
		SenderId  int       `json:"senderId"`
		Content   string    `json:"content"`
		CreatedAt time.Time `json:"createdAt"`
	} `json:"message"`
}

type GetHistory struct {
	Type   string `json:"type"`
	ChatId int    `json:"chatId"`
	Limit  int    `json:"limit"`
	Offset int    `json:"offset"`
}

type GetHistoryResult struct {
	Type    string          `json:"type"`
	ChatId  int             `json:"chatId"`
	Data    []MsgGetHistory `json:"data"`
	HasMore bool            `json:"hasMore"`
}
type MsgGetHistory struct {
	Id        int       `json:"id"`
	SenderId  int       `json:"senderId"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
	IsRead    bool      `json:"isRead"`
}
