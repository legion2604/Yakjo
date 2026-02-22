package otp

import (
	"math/rand/v2"
)

func GenerateOTP() int {
	return 100_000 + rand.IntN(900_000)
}

type soonSMS struct {
}
