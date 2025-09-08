# Multi-System Architecture & Current Issues

## Overview
Hệ thống hỗ trợ vận hành được thiết kế để hỗ trợ **nhiều hệ thống bán buôn mã thẻ, topup/airtime** với kiến trúc multi-tenant. Tuy nhiên, hiện tại có một số vấn đề nghiêm trọng cần được giải quyết.

---

## 🚨 Current Issues & Technical Debt

### 1. **Telegram Groups không liên kết với System**
**Vấn đề:**
- `TelegramGroup` model **KHÔNG có** `systemId` field
- Các nhóm Telegram không biết thuộc hệ thống nào
- Không thể phân biệt nhóm khách hàng/nhà cung cấp của hệ thống A vs hệ thống B

**Impact:**
- **Bảo mật**: Nhóm của hệ thống A có thể truy cập dữ liệu hệ thống B
- **Phân quyền**: Không thể giới hạn quyền theo từng hệ thống
- **Tracking**: Không thể theo dõi hoạt động theo từng hệ thống

**Ví dụ thực tế:**
```
Hệ thống A: Nhóm khách hàng "VIP Customers A"
Hệ thống B: Nhóm khách hàng "Premium Users B"

Hiện tại: Cả hai nhóm đều có thể truy cập dữ liệu của nhau
Cần thiết: Mỗi nhóm chỉ truy cập được dữ liệu của hệ thống tương ứng
```

### 2. **API Endpoints thiếu System Context**
**Vấn đề:**
- `check_logs` và `check_trans` không truyền `systemId`
- Backend không biết request đến từ hệ thống nào
- Không thể phân biệt logs/transactions giữa các systems

**Impact:**
- **Data Isolation**: Không thể tách biệt dữ liệu giữa các hệ thống
- **Permission Control**: Không thể kiểm soát quyền truy cập theo hệ thống
- **Audit Trail**: Không thể theo dõi hoạt động theo từng hệ thống

**Ví dụ API call hiện tại:**
```json
{
  "chatId": "123456789",
  "logType": "system",
  "chatTitle": "Customer Group",
  "username": "user123"
}
```

**Cần thiết:**
```json
{
  "systemId": "system-a-uuid",
  "chatId": "123456789",
  "logType": "system",
  "chatTitle": "Customer Group",
  "username": "user123"
}
```

### 3. **Permission System không System-Aware**
**Vấn đề:**
- Permissions chỉ dựa trên `GroupType` (ADMIN/CUSTOMER/SUPPLIER)
- Không có system-level permissions
- Không thể giới hạn quyền theo từng hệ thống

**Impact:**
- **Over-privileged**: User có thể truy cập tất cả hệ thống
- **Security Risk**: Không thể giới hạn quyền theo business unit
- **Compliance**: Khó đáp ứng yêu cầu về data isolation

---

## 🏗️ Required Architecture Changes

### 1. **Database Schema Updates**

#### A. Thêm `systemId` vào `TelegramGroup`
```prisma
model TelegramGroup {
  id            String            @id @default(uuid())
  groupName     String
  groupType     GroupType
  chatId        String            @unique
  systemId      String            // 🆕 THÊM FIELD NÀY
  description   String?
  isActive      Boolean           @default(true)
  chatTitle     String?
  memberCount   Int?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
  
  // Relations
  system        System            @relation(fields: [systemId], references: [id])
  notifications NotificationLog[]
  permissions   GroupPermission[] @relation("GroupPermissionToTelegramGroup")

  @@map("telegram_groups")
}
```

#### B. Cập nhật `GroupPermission` để System-Aware
```prisma
model GroupPermission {
  id             String          @id @default(uuid())
  systemId       String          // 🆕 THÊM FIELD NÀY
  groupType      GroupType
  permissionName String
  description    String?
  createdAt      DateTime        @default(now())
  
  // Relations
  system         System          @relation(fields: [systemId], references: [id])
  telegramGroups TelegramGroup[] @relation("GroupPermissionToTelegramGroup")

  @@unique([systemId, groupType, permissionName]) // 🆕 COMPOSITE UNIQUE
  @@map("group_permissions")
}
```

### 2. **API Endpoints Updates**

#### A. Tất cả endpoints cần truyền `systemId`
```javascript
// Current API call
POST /api/v1/telegram-groups/detect
{
  "chatId": "123456789",
  "chatTitle": "Customer Group",
  "username": "user123"
}

// Required API call
POST /api/v1/telegram-groups/detect
{
  "systemId": "system-a-uuid",  // 🆕 THÊM FIELD NÀY
  "chatId": "123456789",
  "chatTitle": "Customer Group",
  "username": "user123"
}
```

#### B. System-aware permission checking
```javascript
// Current logic
const permissions = await prisma.groupPermission.findMany({
  where: { groupType: detectedType }
});

// Required logic
const permissions = await prisma.groupPermission.findMany({
  where: { 
    systemId: systemId,        // 🆕 THÊM SYSTEM FILTER
    groupType: detectedType 
  }
});
```

### 3. **n8n Workflow Updates**

#### A. Tất cả workflows cần truyền `systemId`
```javascript
// Current workflow data
{
  "chatId": "123456789",
  "logType": "system",
  "chatTitle": "Customer Group",
  "username": "user123"
}

// Required workflow data
{
  "systemId": "system-a-uuid",  // 🆕 THÊM FIELD NÀY
  "chatId": "123456789",
  "logType": "system",
  "chatTitle": "Customer Group",
  "username": "user123"
}
```

#### B. System-aware backend API calls
```javascript
// Current API call
const response = await $http.post('https://ngrok.com/api/v1/telegram-groups/detect', {
  chatId: $json.chatId,
  chatTitle: $json.chatTitle,
  username: $json.username
});

// Required API call
const response = await $http.post('https://ngrok.com/api/v1/telegram-groups/detect', {
  systemId: $json.systemId,    // 🆕 THÊM FIELD NÀY
  chatId: $json.chatId,
  chatTitle: $json.chatTitle,
  username: $json.username
});
```

---

## 🔒 Security & Data Isolation Requirements

### 1. **System-Level Data Isolation**
- Mỗi hệ thống chỉ có thể truy cập dữ liệu của mình
- Không thể cross-system data access
- Audit trail theo từng hệ thống

### 2. **Permission Hierarchy**
```
System Level:
├── System A
│   ├── Admin Groups (full access to System A)
│   ├── Customer Groups (limited access to System A)
│   └── Supplier Groups (limited access to System A)
└── System B
    ├── Admin Groups (full access to System B)
    ├── Customer Groups (limited access to System B)
    └── Supplier Groups (limited access to System B)
```

### 3. **API Security**
- Tất cả API calls phải có `systemId`
- Backend validate `systemId` trước khi xử lý
- Log tất cả cross-system access attempts

---

## 📋 Implementation Priority

### **Phase 1: Critical Security Fixes (Week 1)**
1. ✅ Update database schema (add `systemId` fields)
2. ✅ Update API endpoints (require `systemId`)
3. ✅ Update n8n workflows (pass `systemId`)
4. ✅ Test system isolation

### **Phase 2: Enhanced Features (Week 2)**
1. ✅ System-aware permission system
2. ✅ Cross-system audit logging
3. ✅ System management UI
4. ✅ Migration tools for existing data

### **Phase 3: Advanced Features (Week 3)**
1. ✅ System-level analytics
2. ✅ Cross-system reporting
3. ✅ System template management
4. ✅ Performance optimization

---

## 🎯 Success Metrics

### **Security Metrics**
- ✅ 0 cross-system data breaches
- ✅ 100% API calls include `systemId`
- ✅ Complete audit trail per system

### **Performance Metrics**
- ✅ <100ms system validation overhead
- ✅ 99.9% system isolation accuracy
- ✅ <1% false positive permission denials

### **Business Metrics**
- ✅ Support for 10+ systems simultaneously
- ✅ 100% data isolation compliance
- ✅ Reduced security review time by 80%

---

## 🚨 Immediate Actions Required

1. **Stop deployment** của production system
2. **Implement system isolation** trước khi go-live
3. **Update all workflows** để truyền `systemId`
4. **Test thoroughly** với multiple systems
5. **Document security procedures** cho operations team

---

*Document này cần được review bởi security team và architecture team trước khi implementation.*
