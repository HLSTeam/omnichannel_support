# Permission System Architecture - HLS Unified Inbox

**Project Name:** Hệ thống hỗ trợ vận hành tập trung cho công ty bán mã thẻ, topup/airtime bán buôn  
**Date:** 2025-01-25  
**Version:** 1.0 - Permission System Redesign  
**Status:** Implemented Phase 1

---

## 🎯 **Tổng quan Permission System**

### **Mục tiêu thiết kế:**
- **Đơn giản hóa:** Permissions theo group type, không theo user riêng lẻ
- **Dễ quản lý:** Admin chỉ cần khai báo user thuộc group nào
- **Bảo mật:** Không cho phép guest access, mọi user phải được khai báo
- **Linh hoạt:** Dễ dàng thêm/sửa/xóa permissions cho từng group type

---

## 🏗️ **Database Schema**

### **1. System Model (Giữ nguyên)**
```prisma
model System {
  id                String              @id @default(cuid())
  name              String
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @default(now())
  
  // Relations
  group_permissions group_permissions[]
  telegram_groups   telegram_groups[]
  user_declarations UserDeclaration[]
}
```

### **2. Telegram Groups (Giữ nguyên)**
```prisma
model telegram_groups {
  id                String              @id @default(cuid())
  groupName         String
  groupType         GroupType           // ADMIN, CUSTOMER, SUPPLIER
  chatId            String              @unique
  description       String?
  isActive          Boolean             @default(true)
  chatTitle         String?
  memberCount       Int?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @default(now())
  systemId          String
  
  // Relations
  System            System              @relation(fields: [systemId], references: [id])
  group_permissions group_permissions[] @relation("GroupPermissionToTelegramGroup")
  user_declarations UserDeclaration[]
}
```

### **3. Group Permissions (Giữ nguyên)**
```prisma
model group_permissions {
  id              String            @id @default(cuid())
  groupType       GroupType         // ADMIN, CUSTOMER, SUPPLIER
  permissionName  String            // Tên permission
  description     String?           // Mô tả permission
  createdAt       DateTime          @default(now())
  systemId        String
  
  // Relations
  System          System            @relation(fields: [systemId], references: [id])
  telegram_groups telegram_groups[] @relation("GroupPermissionToTelegramGroup")
  
  @@unique([systemId, groupType, permissionName])
}
```

### **4. User Declaration (MỚI)**
```prisma
model UserDeclaration {
  id          String   @id @default(cuid())
  userId      String   // Telegram user ID
  username    String   // Telegram username
  groupId     String   // Reference to telegram_groups
  systemId    String   // Reference to System
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  group       telegram_groups @relation(fields: [groupId], references: [id])
  system      System          @relation(fields: [systemId], references: [id])
  
  @@unique([userId, groupId, systemId])
}
```

---

## 🔐 **Permission Templates**

### **ADMIN Group Permissions:**
```javascript
const adminPermissions = [
  { name: 'general_access', description: 'Quyền truy cập chung' },
  { name: 'system_logs', description: 'Xem system logs' },
  { name: 'helpdesk_ticket', description: 'Quản lý helpdesk tickets' },
  { name: 'system_notification', description: 'Gửi system notifications' },
  { name: 'user_management', description: 'Quản lý users' },
  { name: 'group_management', description: 'Quản lý groups' },
  { name: 'system_config', description: 'Cấu hình hệ thống' }
];
```

### **CUSTOMER Group Permissions:**
```javascript
const customerPermissions = [
  { name: 'general_access', description: 'Quyền truy cập chung' },
  { name: 'helpdesk_ticket', description: 'Tạo và quản lý helpdesk tickets' },
  { name: 'view_own_tickets', description: 'Xem tickets của mình' }
];
```

### **SUPPLIER Group Permissions:**
```javascript
const supplierPermissions = [
  { name: 'general_access', description: 'Quyền truy cập chung' },
  { name: 'helpdesk_ticket', description: 'Tạo và quản lý helpdesk tickets' },
  { name: 'view_own_tickets', description: 'Xem tickets của mình' },
  { name: 'supplier_dashboard', description: 'Truy cập supplier dashboard' }
];
```

---

## 🔄 **Permission Check Flow**

### **1. Input từ n8n:**
```json
{
  "systemId": "25ceca8e-c455-4b86-a54c-69dc9be79ad9",
  "chatId": "123456789",           // ID của Telegram group
  "userId": "987654321",           // ID của Telegram user
  "username": "john_doe",          // Username của Telegram user
  "permissionName": "system_logs"  // Permission cần check
}
```

### **2. Backend Logic:**
```javascript
// 1. Validate systemId exists
const system = await prisma.system.findUnique({
  where: { id: systemId }
});

// 2. Check chatId belongs to systemId
const group = await prisma.telegram_groups.findFirst({
  where: { 
    chatId: chatId,
    systemId: systemId 
  }
});

// 3. Find user declaration in this group
const userDeclaration = await prisma.userDeclaration.findFirst({
  where: {
    userId: userId,
    groupId: group.id,
    systemId: systemId
  }
});

// 4. Get group permissions
const groupPermissions = await prisma.group_permissions.findMany({
  where: {
    systemId: systemId,
    groupType: group.groupType
  }
});

// 5. Check if requested permission exists
const hasPermission = groupPermissions.some(
  p => p.permissionName === permissionName
);
```

### **3. API Response:**
```json
{
  "success": true,
  "data": {
    "isSystemValid": true,
    "isGroupRegistered": true,
    "isUserDeclared": true,
    "userRole": "admin",
    "groupType": "ADMIN",
    "declaredPermissions": ["system_logs", "helpdesk_ticket", "system_notification"],
    "requestedPermission": "system_logs",
    "hasPermission": true,
    "systemId": "25ceca8e-c455-4b86-a54c-69dc9be79ad9",
    "groupId": "group-id-here",
    "userId": "987654321"
  }
}
```

---

## 🚀 **Implementation Phases**

### **Phase 1: Database Schema ✅ HOÀN THÀNH**
- [x] Thêm UserDeclaration model
- [x] Migration database
- [x] Seed permission templates
- [x] Tạo sample data
- [x] Tạo admin user

### **Phase 2: Backend API Enhancement 🔄 ĐANG THỰC HIỆN**
- [ ] Cập nhật `/api/v1/permissions/check` endpoint
- [ ] Tạo UserDeclaration controller
- [ ] Tạo PermissionTemplate controller
- [ ] Test permission check logic

### **Phase 3: Frontend UI Simplification ✅ HOÀN THÀNH**
- [x] Thay thế PermissionManager.vue phức tạp
- [x] Tạo GroupPermissionManager.vue
- [x] Tạo UserDeclarationManager.vue
- [x] Tạo PermissionTemplateManager.vue

### **Phase 4: n8n Integration 📋 CHƯA THỰC HIỆN**
- [ ] Test Coordinator workflow với permission mới
- [ ] Validate permission check flow
- [ ] Monitor logs và performance

---

## 🔧 **Database Commands**

### **Reset Database:**
```bash
npx prisma migrate reset --force
```

### **Create Migration:**
```bash
npx prisma migrate dev --name add_user_declaration_model
```

### **Seed Data:**
```bash
node prisma/seed-permission-templates.js
```

### **Create Admin User:**
```bash
node scripts/create-admin-user.js
```

---

## 📊 **Sample Data Created**

### **System:**
- ID: `25ceca8e-c455-4b86-a54c-69dc9be79ad9`
- Name: `HLS System`

### **Telegram Groups:**
- Admin Group: `-1001234567890`
- Customer Support: `-1001234567891`
- Supplier Network: `-1001234567892`

### **User Declarations:**
- admin_user (ID: 123456789) → Admin Group
- customer_user (ID: 987654321) → Customer Support
- supplier_user (ID: 555666777) → Supplier Network

### **Admin Login:**
- Email: `admin@hls.vn`
- Password: `admin123`

---

## 🎯 **Next Steps**

1. **Complete Phase 2:** Backend API Enhancement
2. **Implement Phase 3:** Frontend UI Simplification
3. **Test Phase 4:** n8n Integration
4. **Documentation:** Update API docs và user guides

---

## 📝 **Notes & Decisions**

### **Design Decisions:**
- **Permissions theo group type:** Đơn giản hóa quản lý
- **User declarations:** Chỉ cần khai báo user thuộc group nào
- **No guest access:** Mọi user phải được khai báo trước
- **Permission inheritance:** Không có, chỉ theo group type

### **Technical Decisions:**
- **Database reset:** Chọn reset thay vì migration phức tạp
- **ES modules:** Sử dụng import/export thay vì require
- **Unique constraints:** Đảm bảo data integrity
- **Relations:** Sử dụng Prisma relations để maintain referential integrity

---

**Last Updated:** 2025-01-25  
**Author:** AI Assistant  
**Status:** Phase 1 Complete, Phase 2 In Progress
