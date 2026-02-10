# Используем более свежую версию Go
FROM golang:alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY go.mod go.sum ./
# 1. Отключаем любые запросы пароля (чтобы не висело вечно)
ENV GIT_TERMINAL_PROMPT=0

# 2. Настраиваем прокси (часто решает проблему "затыка" сети)
ENV GOPROXY=https://goproxy.io,direct
# 3. Добавляем -x для отладки (покажет, что именно качается в моменте)
RUN go mod download -x

# Копируем исходный код
COPY . .

# Собираем приложение
RUN CGO_ENABLED=0 GOOS=linux go build -o /yakjo_app ./cmd/main.go

# Финальный легковесный образ
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /yakjo_app .
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/.env ./.env

EXPOSE 8080
CMD ["./yakjo_app"]