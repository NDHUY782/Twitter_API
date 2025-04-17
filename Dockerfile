# Step 1: Build app
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Step 2: Run app
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

EXPOSE 4000
CMD ["npm", "start"]
