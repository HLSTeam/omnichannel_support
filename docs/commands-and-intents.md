# Commands & Intents Documentation

## Overview
This document outlines the supported commands and intents in the n8n workflow system, their routing, and current implementation status.

## Supported Intents

### 1. `create_notification` ✅ **IMPLEMENTED**
**Description**: Create and send notifications to multiple channels
**Workflow**: `Notification System - Epic 1` (Active)
**Webhook**: `https://n8n.hls.vn/webhook/notification-system`
**Status**: ✅ **FULLY FUNCTIONAL**

**Capabilities**:
- Multi-channel notifications (Telegram, Email, Slack)
- Multiple notification types (info, warning, error, success, urgent)
- Recipient management and targeting
- Message formatting and templating
- Delivery status tracking

**Example Usage**:
```json
{
  "message": "System maintenance scheduled for tonight",
  "type": "warning",
  "recipients": [
    {"channel": "telegram", "target": "admin_group"},
    {"channel": "email", "target": "support@company.com"}
  ]
}
```

---

### 2. `check_logs` ✅ **IMPLEMENTED**
**Description**: Check system logs and application logs
**Workflow**: `Check Logs - Epic 1` (Created)
**Webhook**: `https://n8n.hls.vn/webhook/check-logs`
**Status**: ✅ **WORKFLOW CREATED - NEEDS MANUAL ACTIVATION IN N8N UI**

**Required Capabilities**:
- Access to application logs
- System log parsing and analysis
- Log filtering and search
- Error pattern detection
- Log summarization and reporting

**Current Issue**: Coordinator routes `check_logs` intent to non-existent `logs_workflow`

---

### 3. `create_ticket` ✅ **IMPLEMENTED**
**Description**: Create helpdesk tickets from Telegram requests
**Workflow**: `Helpdesk Ticket Management - Epic 1` (Active)
**Webhook**: `https://n8n.hls.vn/webhook-test/helpdesk-ticket`
**Status**: ✅ **FULLY FUNCTIONAL**

**Capabilities**:
- Automated ticket creation
- Backend API integration
- Ticket categorization and assignment
- Notification system integration
- Error handling and retry mechanisms

---

### 4. `check_trans` ✅ **IMPLEMENTED**
**Description**: Check transaction status and details
**Workflow**: `Transaction Status API - Epic 1 Story 1.7` (Active)
**Webhook**: `https://n8n.hls.vn/webhook/transaction-status`
**Status**: ✅ **FULLY FUNCTIONAL**

**Capabilities**:
- Transaction ID validation
- Role-based access control
- Caching mechanisms
- Backend API integration
- Formatted response generation

**Example Usage**:
```json
{
  "transactionId": "12345",
  "chatId": "123456789",
  "chatTitle": "Admin Group",
  "username": "admin_user"
}
```

---

### 5. `health_check` ✅ **IMPLEMENTED**
**Description**: Check system health and service status
**Workflow**: `Health Monitoring & System Status - Epic 1` (Active)
**Webhook**: Cron-based (not webhook)
**Status**: ✅ **FULLY FUNCTIONAL**

**Capabilities**:
- Ollama service health monitoring
- n8n platform health checks
- Automated health reporting
- Service status tracking
- Health recommendations

---

## Command Structure

### Telegram Commands
**Format**: `/command [parameters]` or `@NineTech01bot [message]`

**Supported Commands**:
- `/help` - Show available commands
- `/status` - Check system status
- `/logs` - Check system logs (⚠️ **NOT IMPLEMENTED**)
- `/notify` - Send notifications
- `/ticket` - Create helpdesk ticket
- `/transaction` - Check transaction status

### Intent Recognition
**AI Analysis**: Ollama-based intent classification
**Confidence Threshold**: Configurable confidence levels
**Fallback**: Default routing to helpdesk for unknown intents

---

## Current Implementation Gaps

### 1. Missing Logs Workflow
**Impact**: `check_logs` intent fails silently
**Priority**: HIGH
**Effort**: 3-5 days

**Required Components**:
- Log access mechanisms
- Log parsing and analysis
- Log filtering and search
- Response formatting
- Error handling

### 2. Command Validation
**Impact**: Limited command structure
**Priority**: MEDIUM
**Effort**: 2-3 days

**Required Components**:
- Command syntax validation
- Parameter validation
- Help system
- Command discovery

### 3. Intent Coverage
**Current**: 3/5 intents implemented (60%)
**Target**: 5/5 intents implemented (100%)
**Gap**: 2 intents missing

---

## Recommendations

### Immediate Actions (Week 1)
1. **Implement Logs Workflow**: Create `check_logs` workflow
2. **Fix Intent Routing**: Ensure all intents have valid workflows
3. **Add Command Help**: Implement `/help` command

### Short Term (Week 2-3)
1. **Enhance Command Structure**: Improve command validation
2. **Add Log Access**: Integrate with application logging
3. **Command Discovery**: Implement command listing and help

### Long Term (Month 2)
1. **Advanced Log Analysis**: AI-powered log pattern detection
2. **Command Extensions**: Add more specialized commands
3. **Workflow Templates**: Reusable command patterns

---

## Testing Requirements

### Command Testing
- [ ] All commands respond correctly
- [ ] Intent recognition accuracy > 90%
- [ ] Error handling for invalid commands
- [ ] Command help and discovery

### Workflow Testing
- [ ] All workflows execute successfully
- [ ] Error scenarios handled gracefully
- [ ] Performance within acceptable limits
- [ ] Integration with backend APIs

---

## Monitoring & Metrics

### Key Metrics
- **Intent Recognition Accuracy**: Target > 90%
- **Command Success Rate**: Target > 95%
- **Workflow Execution Time**: Target < 10 seconds
- **Error Rate**: Target < 5%

### Monitoring Points
- Workflow execution status
- Intent classification accuracy
- Command processing success
- API integration health
- System response times

---

## Future Enhancements

### Advanced Commands
- **`/analyze`**: AI-powered log analysis
- **`/report`**: Generate system reports
- **`/backup`**: System backup management
- **`/deploy`**: Deployment automation

### AI Integration
- **Smart Suggestions**: AI-powered command suggestions
- **Natural Language**: Conversational command interface
- **Learning**: Improve intent recognition over time
- **Predictive**: Anticipate user needs

---

*Last Updated: 2025-01-23*
*Version: 1.0*
*Status: Draft - Requires Implementation*
