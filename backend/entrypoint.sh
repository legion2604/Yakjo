#!/bin/sh
set -e

# Ждем пока Postgres станет доступным
echo "Waiting for Postgres..."
while ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
    sleep 1
done

# Запускаем миграции
echo "Running migrations..."
migrate -path /app/migrations -database "$DATABASE_URL" up

# Стартуем Go-приложение
echo "Starting backend..."
exec ./app
