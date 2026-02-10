# 1. Берём образ с Go — он нужен ТОЛЬКО для сборки
FROM golang:1.22-alpine AS builder

# 2. Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# 3. Копируем файлы зависимостей
COPY go.mod go.sum ./

# 4. Скачиваем зависимости
RUN go mod download

# 5. Копируем весь исходный код backend'а
COPY . .

# 6. Собираем бинарный файл приложения
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o project_yakjo

# 7. Берём минимальный Linux без Go
FROM alpine:latest

# 8. Опять задаём рабочую директорию
WORKDIR /app

# 9. Устанавливаем SSL-сертификаты (нужны почти всегда)
RUN apk add --no-cache ca-certificates

# 10. Копируем ТОЛЬКО бинарник из стадии сборки
COPY --from=builder /app/project_yakjo .

# 11. Документируем порт, который слушает приложение
EXPOSE 8080

# 12. Запускаем бинарник
CMD ["./project_yakjo"]
