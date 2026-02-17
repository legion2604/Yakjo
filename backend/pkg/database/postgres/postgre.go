package postgres

import (
	"backend/pkg/config"
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq" // <- важен символ "_"!
)

var DB *sql.DB

func ConnectDB() {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		config.GetEnv("POSTGRESQL_DB_HOST"),
		config.GetEnv("POSTGRESQL_DB_PORT"),
		config.GetEnv("POSTGRESQL_DB_USER"),
		config.GetEnv("POSTGRESQL_DB_PASSWORD"),
		config.GetEnv("POSTGRESQL_DB_NAME"),
	)
	var err error
	DB, err = sql.Open("postgres", dsn) // присваиваем глобальной переменной
	if err != nil {
		log.Fatal(err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatal(err)
	}

	log.Println("Successfully connected to PostgresSQL!")
	//	runMigrations(DB)
}
