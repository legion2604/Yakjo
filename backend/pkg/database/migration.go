package database

//import (
//	"database/sql"
//	"log"
//
//	"github.com/golang-migrate/migrate/v4"
//	"github.com/golang-migrate/migrate/v4/database/postgres"
//	_ "github.com/golang-migrate/migrate/v4/source/file"
//	_ "github.com/lib/pq" // Драйвер Postgres
//)
//
//func runMigrations(db *sql.DB) {
//	// 1. Создаем драйвер для миграций на основе существующего *sql.DB
//	driver, err := postgres.WithInstance(db, &postgres.Config{})
//	if err != nil {
//		log.Fatalf("could not create migrate driver: %v", err)
//	}
//
//	// 2. Указываем путь к папке с файлами миграций и базу данных
//	// "file://migrations" — путь относительно корня запуска проекта
//	m, err := migrate.NewWithDatabaseInstance(
//		"file://migrations",
//		"postgres", driver)
//	if err != nil {
//		log.Fatalf("migration failed: %v", err)
//	}
//
//	// 3. Применяем все миграции "вверх"
//	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
//		log.Fatalf("could not run up migrations: %v", err)
//	}
//
//	log.Println("Migrations applied successfully!")
//}
