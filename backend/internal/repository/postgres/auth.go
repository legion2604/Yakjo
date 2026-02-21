package postgres

import (
	"backend/internal/model"
	"database/sql"
	"errors"
	"log"
	"strconv"
)

type authRepository struct {
	db *sql.DB
}

type AuthRepository interface {
	GetUserInfoByPhone(phone string) (model.GetUserInfo, error)
	SaveUserData(user model.RegisterUser) (int, error)
	GetUserInfoById(userId int) (model.GetFullUserInfo, error)
}

func NewAuthRepository(db *sql.DB) AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) GetUserInfoByPhone(phone string) (model.GetUserInfo, error) {
	var res model.GetUserInfo
	res.Phone = phone

	err := r.db.QueryRow(`
		SELECT id
		FROM users
		WHERE phone = $1
	`, phone).Scan(&res.Id)

	if errors.Is(err, sql.ErrNoRows) {
		res.IsNewUser = true
		return res, nil
	}

	if err != nil {
		log.Println(err)
		return model.GetUserInfo{}, err
	}

	res.IsNewUser = false
	return res, nil
}

func (r *authRepository) SaveUserData(user model.RegisterUser) (int, error) {
	var id int
	err := r.db.QueryRow("INSERT INTO users (first_name, last_name, birth_date, car_brand, email, phone, bio) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id", user.FirstName, user.LastName, user.BirthDate, user.CarBrand, user.Email, user.Phone, user.Bio).Scan(&id)
	if err != nil {
		log.Println(err)
		return 0, err
	}
	return id, nil
}

func (r *authRepository) GetUserInfoById(userId int) (model.GetFullUserInfo, error) {
	var res model.GetFullUserInfo
	res.Id = strconv.Itoa(userId)

	err := r.db.QueryRow(`
		SELECT phone, first_name, last_name, avatar_url, rating, rides_count, telegram, whatsapp
		FROM users
		WHERE id = $1
	`, userId).Scan(&res.Phone, &res.FirstName, &res.LastName, &res.AvatarUrl, &res.Rating, &res.RidesCount, &res.Telegram, &res.Whatsapp)

	if err != nil {
		log.Println(err)
		return model.GetFullUserInfo{}, err
	}
	return res, nil
}
