package otp

import (
	"math/rand/v2"
)

func GenerateOTP() int {
	return 99_999 + rand.IntN(900_000)
}
