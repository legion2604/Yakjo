package service

import (
	"backend/internal/model"
	"backend/internal/repository/postgres"
	"encoding/json"
	"log"
)

type chatService struct {
	postgres postgres.ChatRepository
}

type ChatService interface {
	ChatGetCommand(data []byte) (string, error)
	ChatExecuteCommand(userId int, ttype string, data []byte) ([]byte, error)
	getChats(userId int) ([]byte, error)
}

func NewChatService(postgres postgres.ChatRepository) ChatService {
	return &chatService{postgres: postgres}
}

func (s *chatService) ChatGetCommand(data []byte) (string, error) {
	var payload model.BaseMessage
	err := json.Unmarshal(data, &payload)
	if err != nil {
		return "", err
	}
	return payload.Type, nil
}

func (s *chatService) ChatExecuteCommand(userId int, ttype string, data []byte) ([]byte, error) {
	switch ttype {
	case "get_chats":
		var payload model.BaseMessage
		err := json.Unmarshal(data, &payload)
		if err != nil {
			log.Println(err)
			return nil, err
		}
		results, err := s.getChats(userId)
		if err != nil {
			log.Println(err)
			return nil, err
		}
		return results, nil
	case "start_chat":

	}
	return nil, nil
}

func (s *chatService) getChats(userId int) ([]byte, error) {
	res, err := s.postgres.GetChats(userId)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	response := model.GetChatsResult{
		Type: "chats_list",
		Data: res,
	}

	jsonData, err := json.Marshal(response)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	log.Println(string(jsonData))
	return jsonData, nil
}
