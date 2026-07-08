# ── 1단계: React + Vite 빌드 ───────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build   # dist/ 생성

# ── 2단계: Nginx 로 정적 파일 서빙 ─────────────────────────
FROM nginx:alpine

# SPA 라우팅 + /api 프록시 설정
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 산출물 복사
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
