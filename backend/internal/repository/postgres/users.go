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
	ChangeUserInfo(userId int, data model.NewUserData) error
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

func (r *userRepository) ChangeUserInfo(userId int, data model.NewUserData) error {
	_, err := r.db.Exec("UPDATE users SET first_name=$1, bio=$2, whatsapp=$3, telegram=$4 WHERE id=$5", data.FirstName, data.Bio, data.Whatsapp, data.Telegram, userId)
	if err != nil {
		return err
	}
	return nil
}

/*
{
  "firstName": "Тимур",      // Min 2 chars
  "bio": "О себе...",        // Max 500 chars
  "whatsapp": "992933333333", // Min 9 digits
  "telegram": "username"     // Without @
}
*/
