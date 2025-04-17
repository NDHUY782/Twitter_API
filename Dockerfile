# Sử dụng image Node.js phiên bản 20
FROM node:20.12.1

# Tạo thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt các dependency
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Biên dịch TypeScript sang JavaScript
RUN npm run build

# Chạy lệnh này để xuất biến môi trường
ENV PORT=5000

# Mở cổng 4000
EXPOSE 5000

# Chạy ứng dụng
CMD ["npm", "run", "start"]
