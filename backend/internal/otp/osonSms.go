package otp

import (
	"backend/pkg/config"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"

	"github.com/google/uuid"
)

type osonSMS struct {
}
type OsonSMS interface {
	SendOtp(phone string, otp int) error
}

func NewOsonSMS() OsonSMS {
	return &osonSMS{}
}

func (o *osonSMS) SendOtp(phone string, otp int) error {
	OsonSmsUrl := config.GetEnv("SMS_PROVIDER_OSONSMS_URL")
	login := config.GetEnv("SMS_PROVIDER_OSONSMS_LOGIN")
	token := config.GetEnv("SMS_PROVIDER_OSONSMS_TOKEN")
	from := config.GetEnv("SMS_PROVIDER_OSONSMS_FROM")
	msg := fmt.Sprintf("Ваш код: %d", otp)

	txnID := uuid.New().String()

	data := fmt.Sprintf("%s;%s;%s;%s;%s",
		txnID,
		login,
		from,
		phone,
		token,
	)
	hash := sha256.Sum256([]byte(data))
	strHash := hex.EncodeToString(hash[:])

	params := url.Values{}
	params.Set("login", login)
	params.Set("from", from)
	params.Set("phone_number", phone)
	params.Set("msg", msg)
	params.Set("txn_id", txnID)
	params.Set("str_hash", strHash)

	fullURL := OsonSmsUrl + "?" + params.Encode()

	req, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		return err
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("status: %s, body: %s", resp.Status, string(body))
	}

	log.Println("Success:", string(body))
	return nil
}
