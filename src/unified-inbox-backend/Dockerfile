# Dockerfile cho Backend Node.js
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Cài đặt dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy toàn bộ source code
COPY . .

# Expose port
EXPOSE 3000

# Chạy migrations (nếu có mới) và start app
CMD ["sh", "-c", "npx prisma migrate deploy && node src/app.js"]