# Stage 1: Сборка
FROM golang:alpine AS builder
WORKDIR /app

# Указываем путь относительно корня проекта (контекста)
COPY backend/go.mod backend/go.sum ./

RUN go mod download

# Копируем всё содержимое папки backend в рабочую директорию
COPY backend/ .

RUN CGO_ENABLED=0 GOOS=linux go build -o /yakjo_app ./cmd/main.go

# Stage 2: Финальный образ
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /yakjo_app .
EXPOSE 8080
CMD ["./yakjo_app"]