# 🔐 Permission Management System

## 📋 Tổng Quan

Hệ thống Permission Management được thiết kế để quản lý quyền truy cập của các nhóm Telegram users một cách linh hoạt và bảo mật. Hệ thống áp dụng nguyên tắc **Role-Based Access Control (RBAC)** và yêu cầu **explicit registration** cho tất cả Telegram groups.

## 🏗️ Kiến Trúc Hệ Thống

### Core Components

1. **PermissionManager.vue** - Frontend component chính
2. **TelegramGroupManager.vue** - Enhanced với permission management
3. **permission.service.js** - Backend service logic
4. **permission.controller.js** - API endpoints
5. **Database Models** - `telegram_groups`, `group_permissions`

### Data Flow

```
Frontend (PermissionManager) 
    ↓
Backend API (/permissions/*)
    ↓
Permission Service
    ↓
Database (Prisma ORM)
```

## 🎯 Tính Năng Chính

### 1. Permission Matrix
- **Visual overview** của tất cả permissions theo role
- **Real-time status** của từng permission
- **Color-coded indicators** (✅ Có / ❌ Không)

### 2. Group Permission Management
- **Select group** để quản lý permissions
- **Individual permission toggles** với checkboxes
- **Bulk permission updates** thông qua templates

### 3. Permission Templates
- **Pre-configured templates** cho từng role
- **One-click application** của permission sets
- **Customizable templates** cho business needs

### 4. Real-time Updates
- **Immediate feedback** khi thay đổi permissions
- **Database synchronization** với frontend state
- **Error handling** và user notifications

## 🔧 Cài Đặt & Sử Dụng

### Frontend Integration

```vue
<!-- Trong AdminLayout.vue -->
<template>
  <div v-if="activeTab === 'permissions'" class="space-y-6">
    <PermissionManager />
  </div>
</template>

<script>
import PermissionManager from '../components/PermissionManager.vue';

export default {
  components: {
    PermissionManager
  }
}
</script>
```

### Backend API Endpoints

```javascript
// Permission Management
POST   /api/v1/permissions/check          // Kiểm tra quyền
GET    /api/v1/permissions/role/:role     // Lấy permissions theo role
POST   /api/v1/permissions/register-group // Đăng ký group mới
GET    /api/v1/permissions/available      // Lấy danh sách permissions

// Enhanced Telegram Groups
PUT    /api/v1/telegram-groups/:id        // Cập nhật group + permissions
```

## 📊 Permission Types

### System Permissions
- `view_all` - Xem tất cả dữ liệu
- `system_logs` - Xem system logs
- `application_logs` - Xem application logs
- `error_logs` - Xem error logs
- `system_management` - Quản lý hệ thống

### Business Permissions
- `transaction_logs` - Xem transaction logs
- `transaction_status` - Xem trạng thái giao dịch
- `create_ticket` - Tạo ticket mới
- `view_tickets` - Xem danh sách tickets
- `assign_ticket` - Assign ticket cho agent
- `manage_tickets` - Quản lý tickets

### User Permissions
- `view_own` - Chỉ xem dữ liệu của mình

## 🎭 Role Templates

### 👑 Admin Role
```javascript
permissions: [
  'view_all',
  'system_logs', 
  'application_logs',
  'error_logs',
  'transaction_logs',
  'system_management'
]
```

### 🚚 Supplier Role
```javascript
permissions: [
  'view_own',
  'transaction_logs',
  'transaction_status',
  'create_ticket',
  'view_tickets'
]
```

### 👥 Customer Role
```javascript
permissions: [
  'view_own',
  'transaction_status',
  'create_ticket',
  'view_tickets'
]
```

### 👨‍💼 Agent Role
```javascript
permissions: [
  'view_own',
  'view_tickets',
  'assign_ticket',
  'manage_tickets',
  'create_ticket'
]
```

## 🔒 Security Features

### 1. Explicit Registration
- **Không có auto-detection** cho unregistered groups
- **Explicit error messages** khi group chưa được đăng ký
- **Admin approval required** cho tất cả group registrations

### 2. Permission Validation
- **Real-time validation** của tất cả permission requests
- **Role-based access control** với granular permissions
- **Audit logging** của tất cả permission changes

### 3. API Security
- **Authentication required** cho tất cả permission endpoints
- **Admin-only access** cho permission management
- **Rate limiting** và input validation

## 🧪 Testing

### Test Script
```bash
# Chạy test script
node test-permission-ui.js

# Test individual functions
node -e "
import { testPermissionAPIs } from './test-permission-ui.js';
testPermissionAPIs();
"
```

### Test Cases
1. **Permission Creation** - Tạo permissions mới
2. **Template Application** - Áp dụng permission templates
3. **Permission Updates** - Cập nhật existing permissions
4. **Access Validation** - Kiểm tra quyền truy cập
5. **Error Handling** - Xử lý các trường hợp lỗi

## 🚀 Deployment

### Frontend
```bash
# Build và deploy
npm run build
# Deploy dist/ folder
```

### Backend
```bash
# Install dependencies
npm install

# Database migration
npx prisma migrate dev

# Start server
npm start
```

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# API Keys
N8N_API_KEY="your-n8n-api-key"

# Server
PORT=3000
NODE_ENV=production
```

## 📈 Monitoring & Maintenance

### Health Checks
- **Permission API status** monitoring
- **Database connection** health checks
- **Permission validation** performance metrics

### Backup & Recovery
- **Regular permission data** backups
- **Permission change history** logging
- **Rollback procedures** cho permission changes

### Performance Optimization
- **Permission caching** cho frequently accessed data
- **Database indexing** trên permission fields
- **API response optimization** với pagination

## 🔮 Future Enhancements

### Planned Features
1. **Permission Inheritance** - Hierarchical permission structure
2. **Time-based Permissions** - Temporary access grants
3. **Permission Analytics** - Usage statistics và insights
4. **Bulk Operations** - Mass permission updates
5. **Permission Workflows** - Approval processes cho permission changes

### Integration Opportunities
1. **Telegram Bot Integration** - Auto-registration khi bot join group
2. **LDAP/AD Integration** - Enterprise user management
3. **SSO Integration** - Single sign-on authentication
4. **API Gateway** - Centralized permission validation

## 🆘 Troubleshooting

### Common Issues

#### 1. Permission Not Applied
```bash
# Check database
npx prisma studio

# Verify API response
curl -X GET "http://localhost:3000/api/v1/permissions/role/admin"
```

#### 2. Group Not Found
```bash
# Check group registration
curl -X GET "http://localhost:3000/api/v1/telegram-groups"

# Verify systemId
npx prisma db seed
```

#### 3. API Errors
```bash
# Check server logs
npm run dev

# Verify authentication
curl -H "x-api-key: YOUR_KEY" "http://localhost:3000/api/v1/permissions/available"
```

### Debug Mode
```javascript
// Enable debug logging
const DEBUG = true;

if (DEBUG) {
  console.log('Permission check:', {
    systemId,
    chatId,
    action,
    result: permissionResult
  });
}
```

## 📚 References

- [Vue.js 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Prisma ORM Documentation](https://www.prisma.io/docs/)
- [RBAC Best Practices](https://en.wikipedia.org/wiki/Role-based_access_control)
- [Telegram Bot API](https://core.telegram.org/bots/api)

---

**🎯 Hệ thống Permission Management đã sẵn sàng sử dụng!**

Với thiết kế modular và security-first approach, hệ thống này cung cấp một foundation vững chắc cho việc quản lý quyền truy cập trong omnichannel support platform.
