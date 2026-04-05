# --- Этап 1: Сборка (Build Stage) ---
FROM node:20-alpine AS build-stage
WORKDIR /app

# Копируем package.json из папки frontend (контекст у нас корень проекта)
COPY frontend/package*.json ./
RUN npm install

# Копируем все файлы фронтенда
COPY frontend/ .
RUN npm run build

# --- Этап 2: Финальный образ (Nginx) ---
FROM nginx:stable-alpine

# Удаляем дефолтный конфиг
RUN rm /etc/nginx/conf.d/default.conf

# Копируем ТВОЙ конфиг из папки nginx в корне проекта
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Очищаем папку и копируем билд из первого этапа (build-stage)
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]