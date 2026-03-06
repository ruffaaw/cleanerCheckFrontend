# Build
FROM node:24 as builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Run
FROM node:24 as runner
WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3333
CMD ["npm", "start"]