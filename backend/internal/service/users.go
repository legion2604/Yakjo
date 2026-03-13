package service

import (
	"backend/internal/model"
	"backend/internal/repository/postgres"
	"math"
)

type usersService struct {
	postgres postgres.UsersRepository
}

type UsersService interface {
	GetUserById(userId int) (model.User, error)
	ChangeUserInfo(userId int, data model.NewUserData) error
	AddReview(driverId, authorId int, review model.NewReview) error
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

func (s *usersService) AddReview(driverId, authorId int, review model.NewReview) error {
	err := s.postgres.AddReview(driverId, authorId, review)
	if err != nil {
		return err
	}
	ratingSum, ratingCount, err := s.postgres.GetRatingSum(driverId)
	if err != nil {
		return err
	}
	newRating := ratingSum / float64(ratingCount)
	rounded := math.Round(newRating*10) / 10

	err = s.postgres.ChangeRating(driverId, rounded)
	if err != nil {
		return err
	}
	return nil
}
