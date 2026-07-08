# 강릉 여행 API (Express) 도커 이미지
FROM node:20-alpine

WORKDIR /app

# 의존성 먼저 설치 (레이어 캐시 활용)
COPY package*.json ./
RUN npm install --omit=dev

# 소스 복사
COPY . .

EXPOSE 4000

CMD ["node", "server.js"]
