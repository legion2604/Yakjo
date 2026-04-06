package redis

import (
	"backend/pkg/config"
	"context"
	"log"

	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()
var Client *redis.Client

func ConnectDB() {
	Client = redis.NewClient(&redis.Options{
		Addr:     config.GetEnv("REDIS_DB_HOST"),
		Password: config.GetEnv("REDIS_DB_PASSWORD"), // no password set
		DB:       0,                                  // use default DB
	})

	if err := Client.Ping(ctx).Err(); err != nil {
		log.Fatal(err)
	}

	log.Println("Connected to redis server")

}
