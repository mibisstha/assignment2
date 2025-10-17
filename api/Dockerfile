FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache git openssl

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD npx prisma generate && npx prisma db push --accept-data-loss && npm run dev