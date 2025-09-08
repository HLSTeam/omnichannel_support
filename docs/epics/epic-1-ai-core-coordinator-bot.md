# Epic 1: AI Core & Coordinator Bot

## Overview
Epic 1 focuses on building the core AI capabilities and coordinator bot functionality for the centralized operations support system. This epic establishes the foundation for natural language processing, intent analysis, and intelligent routing of user requests.

## Epic Goals
- Establish AI-powered intent analysis using Ollama
- Create a coordinator bot that can understand and route natural language requests
- Implement message filtering and role-based access control
- Build transaction status checking capabilities
- Enable supplier response management

## Stories

### Story 1.1: Setup Ollama Service ✅
**Status:** Completed  
**Points:** 8  
**Priority:** High

**As a** system administrator  
**I want** Ollama service deployed and integrated with n8n  
**So that** AI intent analysis can process natural language requests

**Acceptance Criteria:**
- [x] Ollama service deployed at http://vpn.zopost.vn:11434
- [x] n8n workflow can connect to Ollama API
- [x] AI intent analysis returns structured JSON response
- [x] Response includes intent, confidence, and entities
- [x] Service responds within 30 seconds timeout
- [x] Error handling for connection failures

**Dev Notes:**
- Ollama is already deployed and accessible
- Backend should connect to existing Ollama instance
- AI logic is handled by n8n workflows, not backend services

---

### Story 1.2: Implement Intent Analysis ✅
**Status:** Completed  
**Points:** 13  
**Priority:** High

**As a** system administrator  
**I want** AI-powered intent analysis with confidence scoring  
**So that** the system can understand user requests accurately

**Acceptance Criteria:**
- [x] AI analyzes natural language and returns intent
- [x] Confidence scoring from 0.0 to 1.0
- [x] Entity extraction for relevant information
- [x] Fallback to rule-based system when AI fails
- [x] Handles malformed JSON responses gracefully
- [x] Validates confidence values and fixes invalid numbers
- [x] Returns structured response with status and quality indicators

**Dev Notes:**
- AI processing is handled by n8n workflows, not backend services
- Backend should provide webhook endpoints for n8n to call

---

### Story 1.3: Create Fallback Mechanisms ✅
**Status:** Completed  
**Points:** 5  
**Priority:** Medium

**As a** system administrator  
**I want** robust fallback mechanisms when AI analysis fails  
**So that** the system remains functional even during AI service issues

**Acceptance Criteria:**
- [x] Rule-based fallback when AI confidence < 0.3
- [x] Predefined responses for common scenarios
- [x] Graceful degradation when AI service unavailable
- [x] Logs fallback usage for monitoring
- [x] Maintains response quality even in fallback mode

**Dev Notes:**
- Fallback mechanisms are implemented in n8n workflows, not backend services
- Backend should provide webhook endpoints for fallback processing

---

### Story 1.4: Add Monitoring & Health Checks ✅
**Status:** Completed  
**Points:** 3  
**Priority:** Medium

**As a** system administrator  
**I want** comprehensive monitoring and health checks  
**So that** I can ensure system reliability and performance

**Acceptance Criteria:**
- [x] Periodic health checks for Ollama service
- [x] Periodic health checks for n8n instance
- [x] Health status monitoring and alerting
- [x] Service uptime tracking
- [x] Performance metrics collection

**Dev Notes:**
- Monitoring is split between n8n and backend
- n8n handles Ollama health checks
- Backend handles system-level monitoring

---

### Story 1.5: Message Filtering & Tag Processing 🆕
**Status:** To Do  
**Points:** 5  
**Priority:** High

**As a** system administrator  
**I want** bot chỉ xử lý message được tag (@bot hoặc /command)  
**So that** bot không spam và chỉ xử lý yêu cầu thực sự

**Acceptance Criteria:**

**A. Tag Detection:**
- [ ] Bot detects @bot mentions in any message format
- [ ] Bot detects /command format with parameters
- [ ] Bot ignores messages without tags completely
- [ ] Tag detection is case-insensitive (@BOT, /COMMAND)

**B. Command Parsing:**
- [ ] Parse @bot "create ticket for issue X" → command: "create_ticket", params: "issue X"
- [ ] Parse /status ABC123 → command: "status", params: "ABC123"
- [ ] Parse /check logs system → command: "check", params: "logs system"
- [ ] Handle malformed commands gracefully

**C. Message Filtering:**
- [ ] Skip processing for regular chat messages
- [ ] Skip processing for non-tagged messages
- [ ] Log filtered messages for audit purposes
- [ ] Maintain chat flow without bot interference

**D. Error Handling:**
- [ ] Clear error message for invalid command format
- [ ] Suggestion for correct command usage
- [ ] Graceful handling of empty or malformed tags

**Dev Notes:**
- Implement in n8n workflow as first processing step
- Use regex patterns for tag detection
- Maintain message context for proper filtering

---

### Story 1.6: Role-based Access Control 🆕
**Status:** To Do  
**Points:** 8  
**Priority:** High

**As a** system administrator  
**I want** phân quyền rõ ràng cho từng user role  
**So that** security được đảm bảo và quyền hạn được kiểm soát

**Acceptance Criteria:**

**A. Role Detection:**
- [ ] Automatically detect user role based on chat group
- [ ] Admin role: Users in groups with "admin" in title
- [ ] Supplier role: Users in groups with "supplier" in title
- [ ] User role: Default for all other users
- [ ] Private chat users default to "customer" role

**B. Permission Matrix:**
- [ ] **Admin permissions:**
  - [ ] Create notifications
  - [ ] Check system logs
  - [ ] Manage users
  - [ ] System control commands
  - [ ] Create helpdesk tickets
  - [ ] Check transaction status
  - [ ] **EXCLUDED:** RAG operations (knowledge base enrichment)

- [ ] **User permissions:**
  - [ ] Check transaction status only
  - [ ] Create helpdesk tickets
  - [ ] Check basic system status
  - [ ] **EXCLUDED:** Admin commands, system logs, notifications

- [ ] **Supplier permissions:**
  - [ ] Receive notifications from bot
  - [ ] Respond to bot requests
  - [ ] **EXCLUDED:** All command execution

**C. Authorization Enforcement:**
- [ ] Block unauthorized commands immediately
- [ ] Clear error message explaining permission denial
- [ ] Log all authorization attempts (success/failure)
- [ ] Audit trail for security monitoring

**D. Role Persistence:**
- [ ] Remember user role for session duration
- [ ] Update role if user moves between groups
- [ ] Handle role changes gracefully

**Dev Notes:**
- Implement role detection in n8n workflow
- Store role information in workflow context
- Use permission matrix for command validation

---

### Story 1.7: Transaction Status API Integration 🆕
**Status:** To Do  
**Points:** 8  
**Priority:** Medium

**As a** regular user  
**I want** kiểm tra trạng thái giao dịch qua API  
**So that** biết được giao dịch thành công hay thất bại

**Acceptance Criteria:**

**A. API Integration:**
- [ ] Connect to external transaction system API
- [ ] Support multiple transaction ID formats
- [ ] Handle API authentication securely
- [ ] Implement request timeout (30 seconds)
- [ ] Retry mechanism for transient failures

**B. Transaction Status Response:**
- [ ] Return clear status: "success", "failed", "pending", "cancelled"
- [ ] Include transaction details: ID, amount, timestamp, description
- [ ] Handle unknown transaction IDs gracefully
- [ ] Format response for Telegram display

**C. Error Handling:**
- [ ] Handle API unavailability gracefully
- [ ] Clear error messages for users
- [ ] Log API failures for monitoring
- [ ] Fallback response when API is down

**D. Performance & Caching:**
- [ ] Cache transaction results for 5 minutes
- [ ] Avoid repeated API calls for same transaction
- [ ] Response time under 10 seconds for cached results
- [ ] Response time under 30 seconds for new API calls

**Dev Notes:**
- Implement as n8n HTTP Request node
- Use external API credentials securely
- Implement caching in workflow context

---

### Story 1.8: Supplier Response Management 🆕
**Status:** To Do  
**Points:** 5  
**Priority:** Medium

**As a** system administrator  
**I want** bot xử lý phản hồi từ supplier  
**So that** cập nhật thông tin và thông báo cho admin

**Acceptance Criteria:**

**A. Supplier Response Detection:**
- [ ] Automatically detect responses from suppliers
- [ ] Identify supplier based on chat group membership
- [ ] Parse supplier response content
- [ ] Handle multiple response formats

**B. Admin Notification:**
- [ ] Send immediate notification to admin when supplier responds
- [ ] Include supplier response content in notification
- [ ] Include context (original request, supplier info)
- [ ] Support multiple notification channels (Telegram, email)

**C. Logging & Tracking:**
- [ ] Log all supplier interactions
- [ ] Track response time from request to supplier response
- [ ] Store supplier response history
- [ ] Generate reports for supplier performance

**D. Response Processing:**
- [ ] Update request status based on supplier response
- [ ] Handle positive/negative supplier responses
- [ ] Escalate if supplier doesn't respond within timeframe
- [ ] Archive completed supplier interactions

**Dev Notes:**
- Implement in n8n workflow with Telegram integration
- Use workflow context to track supplier interactions
- Implement admin notification system

---

## Epic Summary

**Total Stories:** 8  
**Completed:** 4 stories  
**New Added:** 4 stories  
**Total Points:** 55  
**Remaining Points:** 26  
**Completion Rate:** 50%

**Priority Breakdown:**
- **High Priority:** Stories 1.5, 1.6 (13 points)
- **Medium Priority:** Stories 1.7, 1.8 (13 points)
- **Completed:** Stories 1.1-1.4 (29 points)

## Dependencies
- Ollama service deployment
- n8n workflow automation platform
- Telegram bot integration
- External transaction system API
- Admin notification system

## Success Criteria
- Bot can process natural language requests accurately
- Message filtering prevents spam and unnecessary processing
- Role-based access control ensures system security
- Transaction status checking works reliably
- Supplier responses are properly managed and tracked
- System maintains high availability and performance

## Technical Notes
- All AI processing is handled by n8n workflows
- Backend provides webhook endpoints for n8n integration
- Telegram bot serves as the primary user interface
- Role detection is based on chat group membership
- Caching is implemented at workflow level for performance
