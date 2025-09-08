# 🛠️ Admin Interface Setup Guide

## 📋 **Tổng Quan**

Admin Interface được tạo để quản lý Telegram Groups một cách trực quan và dễ dàng, thay vì phải chỉnh sửa code hoặc database trực tiếp.

## 🏗️ **Kiến Trúc**

### **Components**
- **`TelegramGroupManager.vue`** - Component chính để quản lý groups
- **`AdminDashboard.vue`** - Dashboard tổng quan với tabs
- **`AdminNavLink.vue`** - Navigation link cho admin

### **Views**
- **`/admin`** - Admin Dashboard (Admin only)
- **`/`** - Main Dashboard (All users)

### **API Endpoints**
- **`GET /api/v1/telegram-groups`** - Lấy danh sách groups
- **`POST /api/v1/telegram-groups`** - Tạo group mới
- **`PUT /api/v1/telegram-groups/:id`** - Cập nhật group
- **`DELETE /api/v1/telegram-groups/:id`** - Xóa group
- **`POST /api/v1/telegram-groups/detect`** - Detect group info (public)
- **`GET /api/v1/telegram-groups/chat-ids`** - Lấy chat IDs (public)

## 🚀 **Tính Năng Chính**

### **1. Quản Lý Groups**
- ✅ **Thêm nhóm mới** với validation
- ✅ **Chỉnh sửa thông tin** nhóm
- ✅ **Ẩn/Hiện** nhóm (soft delete)
- ✅ **Xóa vĩnh viễn** nhóm (hard delete)

### **2. Phân Loại Groups**
- 👑 **Admin** - Nhóm quản trị nội bộ
- 👥 **Customer** - Nhóm khách hàng
- 🚚 **Supplier** - Nhóm nhà cung cấp

### **3. Filtering & Search**
- Filter theo **loại nhóm**
- Filter theo **trạng thái** (hoạt động/không hoạt động)
- Hiển thị **số lượng thông báo** của mỗi nhóm

### **4. Responsive Design**
- 📱 **Mobile-first** approach
- 🖥️ **Desktop** optimized
- 🌙 **Dark mode** support
- ♿ **Accessibility** features

## 🔧 **Cài Đặt**

### **1. Backend Setup**
```bash
# Chạy migration
cd src/unified-inbox-backend
npx prisma migrate dev --name add_telegram_groups

# Seed permissions
node prisma/seed-telegram-groups.js
```

### **2. Frontend Setup**
```bash
# Component đã được tạo sẵn
# Route đã được thêm vào router
# Navigation link đã được thêm vào Sidebar
```

### **3. Environment Variables**
```env
# Backend (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/unified_inbox"
JWT_SECRET="your-jwt-secret"

# Frontend (api.js)
baseURL: 'http://localhost:3000/api/v1'
```

## 📱 **Sử Dụng**

### **1. Truy Cập Admin Dashboard**
- Đăng nhập với tài khoản **ADMIN**
- Click vào **"🛠️ Admin Dashboard"** trong Sidebar
- Hoặc truy cập trực tiếp `/admin`

### **2. Thêm Nhóm Mới**
1. Vào tab **"🚀 Quản Lý Nhóm Telegram"**
2. Điền thông tin:
   - **Tên Nhóm**: Tên hiển thị trong hệ thống
   - **Loại Nhóm**: Admin/Customer/Supplier
   - **Chat ID**: ID từ Telegram group (bắt đầu bằng -100)
   - **Tên Group trên Telegram**: Tên thực tế của group
   - **Mô tả**: Mô tả chức năng của nhóm
3. Click **"Thêm Nhóm"**

### **3. Quản Lý Nhóm**
- **✏️ Sửa**: Chỉnh sửa thông tin nhóm
- **🔴 Ẩn/🟢 Hiện**: Toggle trạng thái hoạt động
- **🗑️ Xóa**: Xóa nhóm vĩnh viễn

### **4. Filter & Search**
- Chọn **loại nhóm** để lọc
- Chọn **trạng thái** để lọc
- Xem **số lượng thông báo** của mỗi nhóm

## 🔐 **Bảo Mật**

### **1. Authentication**
- Tất cả routes đều yêu cầu **JWT token**
- Token được lưu trong `localStorage`

### **2. Authorization**
- Chỉ **ADMIN** role mới truy cập được `/admin`
- **Public endpoints** cho n8n workflows:
  - `/detect` - Detect group info
  - `/chat-ids` - Lấy chat IDs

### **3. Input Validation**
- **Backend validation** với Prisma schema
- **Frontend validation** với HTML5 attributes
- **API error handling** với proper HTTP status codes

## 📊 **Database Schema**

### **TelegramGroup Table**
```sql
CREATE TABLE telegram_groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    group_type ENUM('admin', 'customer', 'supplier') NOT NULL,
    chat_id VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    chat_title VARCHAR(255),
    member_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **GroupPermission Table**
```sql
CREATE TABLE group_permissions (
    id SERIAL PRIMARY KEY,
    group_type ENUM('admin', 'customer', 'supplier') NOT NULL,
    permission_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_type, permission_name)
);
```

### **NotificationLog Table**
```sql
CREATE TABLE notification_logs (
    id SERIAL PRIMARY KEY,
    telegram_group_id VARCHAR(255) NOT NULL,
    message_content TEXT NOT NULL,
    message_type VARCHAR(100),
    priority VARCHAR(50) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'pending',
    sent_at TIMESTAMP,
    error_message TEXT,
    reference_type VARCHAR(100),
    reference_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 **Testing**

### **1. API Testing**
```bash
# Sử dụng file test-telegram-groups-api.http
# Hoặc Postman/Insomnia
```

### **2. Frontend Testing**
```bash
# Chạy frontend
cd src/unified-inbox-frontend
npm run dev

# Truy cập http://localhost:5173/admin
```

### **3. Database Testing**
```bash
# Kiểm tra database
cd src/unified-inbox-backend
npx prisma studio
```

## 🚨 **Troubleshooting**

### **1. Lỗi "Cannot access /admin"**
- Kiểm tra user có **ADMIN** role không
- Kiểm tra JWT token có hợp lệ không
- Kiểm tra localStorage có user info không

### **2. Lỗi "API calls failed"**
- Kiểm tra backend có chạy không
- Kiểm tra CORS configuration
- Kiểm tra database connection

### **3. Lỗi "Migration failed"**
- Kiểm tra PostgreSQL connection
- Kiểm tra DATABASE_URL trong .env
- Kiểm tra Prisma schema syntax

## 🔮 **Tính Năng Tương Lai**

### **1. Advanced Features**
- 📊 **Analytics dashboard** với charts
- 📧 **Email notifications** cho admin
- 🔄 **Auto-sync** với Telegram groups
- 📱 **Mobile app** cho admin

### **2. Integration**
- 🔗 **Webhook integration** với external systems
- 📊 **Reporting tools** với export functionality
- 🔐 **Advanced permissions** với role hierarchy
- 🌐 **Multi-language** support

## 📞 **Support**

Nếu gặp vấn đề:
1. Kiểm tra **console logs** trong browser
2. Kiểm tra **backend logs**
3. Kiểm tra **database connection**
4. Tạo **issue** với detailed error message

---

**🎉 Admin Interface đã sẵn sàng sử dụng!**
