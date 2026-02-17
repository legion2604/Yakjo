package redis

import (
	"context"
	"log"

	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()
var Client *redis.Client

func ConnectDB() {
	Client = redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	if err := Client.Ping(ctx).Err(); err != nil {
		log.Fatal(err)
	}

	log.Println("Connected to redis server")

}
