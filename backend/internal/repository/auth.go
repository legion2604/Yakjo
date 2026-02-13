package repository

import (
	"backend/internal/model"
	"database/sql"
	"errors"
	"log"
)

type authRepository struct {
	db *sql.DB
}

type AuthRepository interface {
	SaveOtp(phone, codeHash string) error
	GetValidOtpHash(phone string) (string, error)
	GetUserInfoByPhone(phone string) (model.GetUserInfo, error)
	SaveUserData(user model.RegisterUser) (int, error)
	GetUserInfoById(userId int) (model.GetUserInfo, error)
	IncrementOTPAttempt(phone string) error
}

func NewAuthRepository(db *sql.DB) AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) SaveOtp(phone, codeHash string) error {
	_, err := r.db.Exec(`
        INSERT INTO phone_otps(phone, code_hash, expires_at)
        VALUES($1, $2, NOW() + INTERVAL '120 minutes') 
        ON CONFLICT(phone)
        DO UPDATE SET code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at, attempts=0
    `, phone, codeHash) // 120 минут уменьшим до 5 мин в проде
	if err != nil {
		log.Println(err)
		return err
	}
	return nil
}

func (r *authRepository) GetValidOtpHash(phone string) (string, error) {
	var hash string
	err := r.db.QueryRow("SELECT code_hash FROM phone_otps WHERE phone=$1 AND expires_at>NOW() AND attempts<5", phone).Scan(&hash)

	if err != nil {
		log.Println(err)
		return "", err
	}

	return hash, nil
}

func (r *authRepository) GetUserInfoByPhone(phone string) (model.GetUserInfo, error) {
	var res model.GetUserInfo
	res.Phone = phone

	err := r.db.QueryRow(`
		SELECT id, first_name, avatar_url
		FROM users
		WHERE phone = $1
	`, phone).Scan(&res.Id, &res.FirstName, &res.AvatarUrl)

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

func (r *authRepository) GetUserInfoById(userId int) (model.GetUserInfo, error) {
	var res model.GetUserInfo
	res.Id = userId

	err := r.db.QueryRow(`
		SELECT phone, first_name, avatar_url
		FROM users
		WHERE id = $1
	`, userId).Scan(&res.Phone, &res.FirstName, &res.AvatarUrl)

	if err != nil {
		log.Println(err)
		return model.GetUserInfo{}, err
	}
	return res, nil
}

func (r *authRepository) IncrementOTPAttempt(phone string) error {
	_, err := r.db.Exec("UPDATE phone_otps SET attemps = attemps + 1 WHERE phone = $1", phone)
	if err != nil {
		return err
	}
	return nil
}
