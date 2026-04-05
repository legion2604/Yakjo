# Используем более свежую версию Go
FROM golang:alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download -x

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /yakjo_app ./cmd/main.go

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /yakjo_app .

EXPOSE 8080
CMD ["./yakjo_app"]