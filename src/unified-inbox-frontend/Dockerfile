# Dockerfile cho unified-inbox-frontend (Vue.js)
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Expose port (port mặc định của Vue dev server)
EXPOSE 8080

# Chạy ứng dụng Vue.js
CMD ["npm", "run", "serve"]