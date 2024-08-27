FROM node:14

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080 8081 8082
CMD ["node", "index.js"]
