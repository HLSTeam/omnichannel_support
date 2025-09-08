# Systems API Endpoints

**Phần này mô tả các endpoints cho system-specific operations với multi-system isolation.**

---

## **POST /api/v1/systems/check-logs**

### **Mô tả**
Check system logs cho một hệ thống cụ thể với system-aware permissions.

### **Request Body**
```json
{
  "systemId": "uuid", // REQUIRED - System ID for isolation
  "chatId": "string", // REQUIRED - Telegram chat ID
  "logType": "string", // OPTIONAL - system|application|error|access
  "logLevel": "string", // OPTIONAL - debug|info|warn|error
  "timeRange": "string", // OPTIONAL - last_1_hour|last_24_hours|last_7_days
  "chatTitle": "string", // OPTIONAL - For role detection
  "username": "string" // OPTIONAL - For role detection
}
```

### **Response Success (200)**
```json
{
  "success": true,
  "data": {
    "systemId": "uuid",
    "systemName": "Hệ thống Bán thẻ A",
    "logType": "system",
    "logLevel": "info",
    "timeRange": "last_1_hour",
    "userRole": "admin",
    "permissions": ["view_all", "system_logs"],
    "logs": [
      {
        "id": "log_uuid_1",
        "timestamp": "2025-08-23T18:06:57.146Z",
        "level": "info",
        "type": "system",
        "message": "[System] Service started successfully",
        "source": "System-service",
        "systemId": "uuid"
      }
    ],
    "totalLogs": 12,
    "timestamp": "2025-08-23T18:08:40.726Z"
  }
}
```

### **Response Error (400)**
```json
{
  "success": false,
  "error": "systemId is required for multi-system isolation"
}
```

### **Response Error (403)**
```json
{
  "success": false,
  "error": "Insufficient permissions to access logs",
  "userRole": "customer",
  "permissions": ["view_own"],
  "systemId": "uuid"
}
```

### **Permission Requirements**
- **Admin**: Full access to all logs
- **Supplier**: Limited access to transaction logs
- **Customer**: No access to system logs

---

## **POST /api/v1/systems/check-trans**

### **Mô tả**
Check transaction status cho một hệ thống cụ thể với system-aware permissions.

### **Request Body**
```json
{
  "systemId": "uuid", // REQUIRED - System ID for isolation
  "chatId": "string", // REQUIRED - Telegram chat ID
  "transactionId": "string", // OPTIONAL - Specific transaction ID
  "status": "string", // OPTIONAL - completed|pending|failed|cancelled
  "timeRange": "string", // OPTIONAL - last_1_hour|last_24_hours|last_7_days
  "chatTitle": "string", // OPTIONAL - For role detection
  "username": "string" // OPTIONAL - For role detection
}
```

### **Response Success (200)**
```json
{
  "success": true,
  "data": {
    "systemId": "uuid",
    "systemName": "Hệ thống Bán thẻ A",
    "transactionId": "TX123456", // If specific transaction requested
    "searchCriteria": {
      "timeRange": "last_24_hours",
      "status": "completed"
    },
    "userRole": "admin",
    "permissions": ["view_all", "transaction_status"],
    "transactions": [
      {
        "id": "trans_uuid_1",
        "timestamp": "2025-08-23T17:25:25.661Z",
        "status": "completed",
        "type": "topup",
        "amount": 50000,
        "currency": "VND",
        "details": "Topup transaction",
        "systemId": "uuid",
        "provider": "Hệ thống Bán thẻ A"
      }
    ],
    "totalTransactions": 17,
    "timestamp": "2025-08-23T18:09:06.954Z"
  }
}
```

### **Response Error (400)**
```json
{
  "success": false,
  "error": "systemId is required for multi-system isolation"
}
```

### **Response Error (403)**
```json
{
  "success": false,
  "error": "Insufficient permissions to access transaction data",
  "userRole": "customer",
  "permissions": ["view_own"],
  "systemId": "uuid"
}
```

### **Permission Requirements**
- **Admin**: Full access to all transactions
- **Supplier**: Access to own transactions
- **Customer**: Limited access to own transactions

---

## **🔒 Security Features**

### **System Isolation**
- Tất cả endpoints require `systemId` parameter
- Zero cross-system data access
- System-level permission checking

### **Role-Based Access Control**
- **Auto-detection**: Dựa trên `chatTitle` và `username`
- **Database lookup**: Telegram groups đã register
- **Fail-safe**: Default role = customer (minimum permissions)

### **Permission Levels**
| Role | Logs Access | Transaction Access | System Access |
|------|-------------|-------------------|---------------|
| **Admin** | ✅ Full | ✅ Full | ✅ Full |
| **Supplier** | ❌ None | ✅ Own only | ❌ Limited |
| **Customer** | ❌ None | ✅ Own only | ❌ None |

### **Audit Trail**
- Tất cả requests được log với system context
- User role và permissions tracking
- Cross-system access attempts monitoring

---

## **🧪 Testing Examples**

### **Test 1: Admin accessing logs**
```bash
curl -X POST http://localhost:3000/api/v1/systems/check-logs \
  -H "Content-Type: application/json" \
  -d '{
    "systemId": "25ceca8e-c455-4b86-a54c-69dc9be79ad9",
    "chatId": "123456789",
    "logType": "system",
    "chatTitle": "Admin Group",
    "username": "admin_user"
  }'
```

### **Test 2: Customer accessing transactions**
```bash
curl -X POST http://localhost:3000/api/v1/systems/check-trans \
  -H "Content-Type: application/json" \
  -d '{
    "systemId": "25ceca8e-c455-4b86-a54c-69dc9be79ad9",
    "chatId": "123456789",
    "chatTitle": "Customer Group",
    "username": "customer_user"
  }'
```

### **Test 3: Security validation**
```bash
curl -X POST http://localhost:3000/api/v1/systems/check-logs \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "123456789",
    "logType": "system"
  }'
# Expected: Error - systemId required
```

---

## **🚀 Integration with n8n**

### **Workflow Configuration**
```javascript
// n8n HTTP Request node configuration
const response = await $http.post('http://localhost:3000/api/v1/systems/check-logs', {
  systemId: $json.systemId,        // Pass from workflow input
  chatId: $json.chatId,
  logType: $json.logType || 'system',
  chatTitle: $json.chatTitle,
  username: $json.username
});

return response.data;
```

### **Required Workflow Data**
```json
{
  "systemId": "uuid",     // 🚨 CRITICAL - Must be provided
  "chatId": "string",     // From Telegram
  "chatTitle": "string",  // From Telegram
  "username": "string",   // From Telegram
  "logType": "system",    // Optional
  "timeRange": "last_1_hour" // Optional
}
```

---

*Documentation này mô tả endpoints đã được implement và tested. Sẵn sàng cho n8n integration.*
