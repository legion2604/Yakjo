package redis

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type authRepository struct {
	client *redis.Client
}

type AuthRepository interface {
	CreateOtpSend(cxt context.Context, phone string, otp int, ttl time.Duration) error
	GetOtpSend(cxt context.Context, phone string) (string, error)
	DeleteOtpSend(cxt context.Context, phone string) error
	IncrementOtpSendAttempts(ctx context.Context, phone string, ttl time.Duration) (int64, error)
	GetOtpSendAttempts(ctx context.Context, phone string) (int64, error)
	DeleteOtpSendAttempts(ctx context.Context, phone string) error
	IncrementOtpVerifyAttempts(ctx context.Context, phone string, ttl time.Duration) (int64, error)
	GetOtpVerifyAttempts(cxt context.Context, phone string) (int, error)
}

func NewAuthRepository(client *redis.Client) AuthRepository {
	return &authRepository{client: client}
}

//Создание кода OTP

func (r *authRepository) CreateOtpSend(cxt context.Context, phone string, otp int, ttl time.Duration) error {
	err := r.client.Set(cxt, "otp:send:"+phone, otp, ttl).Err()
	if err != nil {
		return err
	}
	return nil
}

// Получение кода OTP

func (r *authRepository) GetOtpSend(cxt context.Context, phone string) (string, error) {
	res := r.client.Get(cxt, "otp:send:"+phone)
	if res.Err() != nil {
		return "", res.Err()
	}
	return res.Result()
}

// Удаление кода OTP

func (r *authRepository) DeleteOtpSend(ctx context.Context, phone string) error {
	err := r.client.Del(ctx, "otp:send:"+phone).Err()
	if err != nil {
		return err
	}
	return nil
}

// Инкремент попыток отправки OTP

func (r *authRepository) IncrementOtpSendAttempts(ctx context.Context, phone string, ttl time.Duration) (int64, error) {
	val, err := r.client.Incr(ctx, "otp:send:attempts:"+phone).Result()
	if err != nil {
		return 0, err
	}
	if val == 1 {
		r.client.Expire(ctx, "otp:send:attempts:"+phone, ttl)
	}
	return val, nil
}

// Получить количество попыток отправки OTP

func (r *authRepository) GetOtpSendAttempts(ctx context.Context, phone string) (int64, error) {
	return r.client.Get(ctx, "otp:send:attempts:"+phone).Int64()
}

// Удалить попытки с OTP

func (r *authRepository) DeleteOtpSendAttempts(ctx context.Context, phone string) error {
	return r.client.Del(ctx, "otp:send:attempts:"+phone).Err()
}

func (r *authRepository) IncrementOtpVerifyAttempts(ctx context.Context, phone string, ttl time.Duration) (int64, error) {
	val, err := r.client.Incr(ctx, "otp:verify:attempts:"+phone).Result()
	if err != nil {
		return 0, err
	}
	if val == 1 {
		r.client.Expire(ctx, "otp:verify:attempts:"+phone, ttl)
	}
	return val, nil
}

func (r *authRepository) GetOtpVerifyAttempts(cxt context.Context, phone string) (int, error) {
	res := r.client.Get(cxt, "otp:verify:attempts:"+phone)
	if res.Err() != nil {
		return 0, res.Err()
	}
	return res.Int()
}
