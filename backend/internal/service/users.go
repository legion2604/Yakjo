package service

import (
	"backend/internal/model"
	"backend/internal/repository/postgres"
)

type usersService struct {
	postgres postgres.UsersRepository
}

type UsersService interface {
	GetUserById(userId int) (model.User, error)
	ChangeUserInfo(userId int, data model.NewUserData) error
}

func NewUsersService(postgres postgres.UsersRepository) UsersService {
	return &usersService{postgres: postgres}
}

func (s *usersService) GetUserById(userId int) (model.User, error) {
	res, err := s.postgres.GetUserById(userId)
	if err != nil {
		return model.User{}, err
	}
	reviews, err := s.postgres.GetReviewsByUserId(userId)
	if err != nil {
		return model.User{}, err
	}
	res.ReviewCount = len(reviews)
	res.Reviews = reviews

	return res, nil
}

func (s *usersService) ChangeUserInfo(userId int, data model.NewUserData) error {
	err := s.postgres.ChangeUserInfo(userId, data)
	if err != nil {
		return err
	}
	return nil
}
