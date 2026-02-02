package repository

import "database/sql"

type authRepository struct {
	db *sql.DB
}

type AuthRepository interface {
	SaveOtp(phone, codeHash string) error
}

func NewAuthRepository(db *sql.DB) AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) SaveOtp(phone, codeHash string) error {
	_, err := r.db.Exec(`
        INSERT INTO phone_otps(phone, code_hash, expires_at)
        VALUES($1, $2, NOW() + INTERVAL '5 minutes')
        ON CONFLICT(phone)
        DO UPDATE SET code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at
    `, phone, codeHash)
	return err
}
