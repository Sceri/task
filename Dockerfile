FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine as production

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE ${PORT}

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist/task ./
RUN npm install --only=production

CMD ["node", "/app/main"]
