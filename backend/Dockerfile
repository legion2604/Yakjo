# Stage 1: Сборка
FROM golang:alpine AS builder
WORKDIR /app

# Теперь мы копируем файлы из ТЕКУЩЕЙ папки (.) в контейнер (./)
COPY go.mod go.sum ./

RUN go mod download

# Копируем все остальное содержимое (включая папку cmd и файл .env)
COPY . .

# Сборка. Путь ./cmd/main.go должен существовать внутри папки backend
RUN CGO_ENABLED=0 GOOS=linux go build -v -o /yakjo_app ./cmd/main.go

# Stage 2: Финальный образ
FROM alpine:latest
WORKDIR /root/

# Копируем бинарник
COPY --from=builder /yakjo_app .

# КРИТИЧНО для вашего случая: копируем .env файл в финальный образ
COPY --from=builder /app/.env .

EXPOSE 8080
CMD ["./yakjo_app"]