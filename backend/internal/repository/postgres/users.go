package postgres

import (
	"backend/internal/model"
	"database/sql"
)

type userRepository struct {
	db *sql.DB
}

type UsersRepository interface {
	GetUserById(id int) (model.User, error)
	GetReviewsByUserId(userId int) ([]model.Review, error)
}

func NewUsersRepository(db *sql.DB) UsersRepository {
	return &userRepository{db: db}
}

func (r *userRepository) GetUserById(id int) (model.User, error) {
	var user model.User
	user.Id = id
	err := r.db.QueryRow("SELECT first_name,created_at,rating FROM users WHERE id = $1", id).Scan(&user.FirstName, &user.CreatedAt, &user.Rating)
	if err != nil {
		return model.User{}, err
	}
	return user, err
}

func (r *userRepository) GetReviewsByUserId(userId int) ([]model.Review, error) {
	row, err := r.db.Query("SELECT id,author_name,rating,comment,date FROM reviews WHERE driver_id = $1", userId)
	if err != nil {
		return nil, err
	}
	defer row.Close()
	var reviews []model.Review
	for row.Next() {
		var review model.Review
		if err = row.Scan(&review.Id, &review.Author, &review.Rating, &review.Comment, &review.Date); err != nil {
			return nil, err
		}
		reviews = append(reviews, review)
	}
	return reviews, nil
}

/*
	Id      int    `json:"id"`
	Author  string `json:"author"`
	Rating  int    `json:"rating"`
	Comment string `json:"comment"`
	Date    string `json:"date"`

*/
