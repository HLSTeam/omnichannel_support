# HLS Unified Inbox System - AI-Powered Operations Support

**Project Name:** Hệ thống hỗ trợ vận hành tập trung cho công ty bán mã thẻ, topup/airtime bán buôn  
**Date:** 2025-01-25  
**Version:** 2.0 - AI Integration + Permission System  
**Status:** Active Development

---

## 🎯 **Tổng quan Project**

HLS Unified Inbox System là một hệ thống hỗ trợ vận hành tập trung với khả năng AI, được thiết kế để quản lý conversations, tickets, và workflows tự động hóa thông qua n8n và Ollama.

---

## 🏗️ **Kiến trúc Hệ thống**

### **Backend (Node.js + Express + Prisma)**
- **Core API:** Quản lý conversations, messages, helpdesk tickets
- **AI Integration:** Ollama integration cho intent analysis
- **Permission System:** Role-based access control với user declarations
- **Real-time:** Socket.io cho real-time updates

### **Frontend (Vue.js 3 + Vite + Tailwind)**
- **Unified Inbox:** Quản lý conversations từ nhiều channels
- **Helpdesk Dashboard:** Kanban board cho ticket management
- **Admin Interface:** Quản lý users, groups, permissions
- **Real-time Updates:** Live updates qua WebSocket

### **Automation (n8n)**
- **Coordinator Bot:** Telegram bot workflow coordination
- **Permission Validation:** Check permissions trước khi thực hiện actions
- **Workflow Routing:** Route requests dựa trên AI intent và permissions

---

## 🔐 **Permission System (MỚI)**

### **Thiết kế:**
- **Group-based:** Permissions theo group type (ADMIN, CUSTOMER, SUPPLIER)
- **User Declaration:** User được khai báo thuộc group nào
- **No Guest Access:** Mọi user phải được khai báo trước
- **Template-based:** Permission templates cho mỗi group type

### **Permission Templates:**
- **ADMIN:** Full access (system_logs, helpdesk_ticket, user_management, etc.)
- **CUSTOMER:** Limited access (helpdesk_ticket, view_own_tickets)
- **SUPPLIER:** Extended access (helpdesk_ticket, supplier_dashboard)

---

## 🚀 **Implementation Status**

### **✅ Phase 1: Database Schema - HOÀN THÀNH**
- [x] UserDeclaration model
- [x] Permission templates
- [x] Sample data
- [x] Admin user

### **✅ Phase 2: Backend API - HOÀN THÀNH**
- [x] Enhanced permission check endpoint
- [x] UserDeclaration controller
- [x] PermissionTemplate controller

### **✅ Phase 3: Frontend UI - HOÀN THÀNH**
- [x] Simplified permission management
- [x] User declaration management
- [x] Permission template management

### **📋 Phase 4: n8n Integration - CHƯA THỰC HIỆN**
- [ ] Test Coordinator workflow
- [ ] Validate permission flow

---

## 🔧 **Quick Start**

### **1. Backend Setup:**
```bash
cd src/unified-inbox-backend
npm install
npx prisma migrate dev
node prisma/seed-permission-templates.js
node scripts/create-admin-user.js
npm run dev
```

### **2. Frontend Setup:**
```bash
cd src/unified-inbox-frontend
npm install
npm run dev
```

### **3. Database Reset (nếu cần):**
```bash
npx prisma migrate reset --force
```

---

## 📚 **Documentation**

### **Core Architecture:**
- [Architecture Overview](docs/architecture.md) - Kiến trúc tổng thể
- [Permission System](docs/permission-system-architecture.md) - Chi tiết permission system
- [API Endpoints](docs/api-endpoints-systems.md) - API documentation

### **Epics & Stories:**
- [Epic 1: AI Core Coordinator Bot](docs/epics/epic-1-ai-core-coordinator-bot.md)
- [Epic 2: Coordinator Bot System](docs/epics/epic-2-coordinator-bot-system.md)
- [Epic 3: n8n Integration](docs/epics/epic-3-n8n-integration.md)
- [Epic 4: Helpdesk UI](docs/epics/epic-4-helpdesk-ui.md)

---

## 🔑 **Default Credentials**

### **Admin User:**
- **Email:** `admin@hls.vn`
- **Password:** `admin123`
- **Role:** `ADMIN`

### **Sample Data:**
- **System ID:** `25ceca8e-c455-4b86-a54c-69dc9be79ad9`
- **Admin Group:** `-1001234567890`
- **Customer Group:** `-1001234567891`
- **Supplier Group:** `-1001234567892`

---

## 🛠️ **Tech Stack**

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Backend** | Node.js + Express | ^20.19.0 + ^5.1.0 | API server |
| **Database** | PostgreSQL + Prisma | 14 + ^6.14.0 | Data persistence |
| **Frontend** | Vue.js 3 + Vite | ^3.5.18 + ^7.0.6 | User interface |
| **Styling** | Tailwind CSS | ^4.1.11 | Component styling |
| **Real-time** | Socket.io | ^4.8.1 | Live updates |
| **Automation** | n8n | Latest | Workflow automation |
| **AI** | Ollama | Latest | Local AI models |

---

## 📊 **Project Structure**

```
omnichannel_support/
├── docs/                           # Documentation
│   ├── architecture.md             # Kiến trúc tổng thể
│   ├── permission-system-architecture.md  # Permission system
│   └── epics/                      # Epic documentation
├── src/
│   ├── unified-inbox-backend/      # Backend API
│   │   ├── prisma/                 # Database schema & migrations
│   │   ├── src/                    # Source code
│   │   └── scripts/                # Utility scripts
│   └── unified-inbox-frontend/     # Frontend UI
│       ├── src/                    # Vue.js components
│       └── public/                 # Static assets
└── README.md                       # This file
```

---

## 🎯 **Next Steps**

1. **Complete Phase 2:** Backend API enhancement
2. **Implement Phase 3:** Frontend UI simplification
3. **Test Phase 4:** n8n integration
4. **Documentation:** Update API docs và user guides

---

## 📝 **Notes**

- **Database:** Sử dụng PostgreSQL với Prisma ORM
- **Permissions:** Group-based với user declarations
- **AI:** Local AI models qua Ollama
- **Automation:** n8n workflows với permission validation
- **Architecture:** Monolithic backend với modular frontend

---

**Last Updated:** 2025-01-25  
**Author:** AI Assistant  
**Status:** Active Development - Phase 2 In Progress
