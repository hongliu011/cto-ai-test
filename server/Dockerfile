FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

RUN npx playwright install-deps
RUN npx playwright install

RUN mkdir -p /app/uploads /app/generated-scripts /app/logs

EXPOSE 3001

CMD ["npm", "start"]
