package model

type UserChat struct {
	Id        string `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	AvatarUrl string `json:"avatarUrl"`
	Online    string `json:"online"`
}

type Message struct {
	Id        string `json:"id"`
	ChatId    string `json:"chatId"`
	SenderId  string `json:"senderId"`
	Content   string `json:"content"`
	CreatedAt string `json:"createdAt"`
	IsRead    string `json:"isRead"`
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
type BaseMessage struct {
	Type string `json:"type"`
}
