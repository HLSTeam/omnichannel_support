# Dockerfile cho unified-inbox-backend (Node.js)
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Expose port (port mặc định, thay đổi nếu cần)
EXPOSE 3000

# Chạy ứng dụng Node.js
CMD ["node", "src/app.js"]