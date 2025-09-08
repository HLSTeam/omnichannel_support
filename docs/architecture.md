# Hệ thống hỗ trợ vận hành tập trung với AI - Simplified Architecture

**Project Name:** Hệ thống hỗ trợ vận hành tập trung cho công ty bán mã thẻ, topup/airtime bán buôn  
**Date:** 2024-12-19  
**Version:** 2.0 - Simplified  
**Status:** Draft

---

## Introduction

### Scope and Assessment

This architecture document is for **SIMPLE enhancements** to the existing Unified Inbox System that can be implemented within the current monolithic structure without adding unnecessary complexity.

**Key Principle:** Keep it simple, extend existing patterns, avoid over-engineering.

### Intro Content

This document outlines the **simplified architectural approach** for enhancing the existing **Unified Inbox System** with **AI-powered Operations Support Center**. The goal is to add new AI capabilities while maintaining the existing simple, monolithic architecture.

**Relationship to Existing Architecture:**
This document extends the existing monolithic backend by adding new modules and services, following the same patterns already established in the codebase. No architectural changes, just functional extensions.

---

## Existing Project Analysis

### Current Project State
- **Primary Purpose:** Unified inbox system for managing conversations across multiple channels (Telegram, etc.)
- **Current Tech Stack:** Node.js + Express + Prisma + PostgreSQL + Socket.io (Backend), Vue.js 3 + Vite + Tailwind CSS (Frontend)
- **Architecture Style:** Simple monolithic backend with modular frontend
- **Deployment Method:** Docker Compose with PostgreSQL container

### Available Documentation
- Project Brief with detailed requirements
- Brainstorming session results with Coordinator Bot pattern
- Existing Prisma schema with Agent, System, Channel, Conversation, Message, Rule models
- Docker Compose configuration for PostgreSQL

### Identified Constraints
- **Keep it simple:** No microservices, no complex service separation
- **Extend existing:** Add new functionality to current monolithic structure
- **Minimal changes:** Preserve existing database schema and API patterns
- **Same deployment:** Use existing Docker Compose setup

---

## Enhancement Scope and Integration Strategy

### Enhancement Overview
**Enhancement Type:** AI-powered Operations Support Center with Coordinator Bot pattern
**Scope:** Add AI modules to existing backend, integrate n8n and Ollama
**Integration Impact:** Low - simple additions to existing structure

### Integration Approach
**Code Integration Strategy:** Extend existing monolithic backend with new modules
**Database Integration:** Add new models to existing Prisma schema
**API Integration:** Add new endpoints to existing Express app
**UI Integration:** Add new components to existing Vue.js frontend

### Compatibility Requirements
- **Existing API Compatibility:** All current endpoints continue working unchanged
- **Database Schema Compatibility:** Add new tables, no modifications to existing
- **UI/UX Consistency:** Follow existing component patterns
- **Performance Impact:** Minimal impact on existing system

---

## Tech Stack Alignment

### Existing Technology Stack (Keep Everything)

| Category | Current Technology | Version | Usage in Enhancement | Notes |
|----------|-------------------|---------|---------------------|-------|
| Backend Runtime | Node.js | ^20.19.0 | Core runtime for all features | No change needed |
| Web Framework | Express | ^5.1.0 | All API endpoints | Add new routes |
| Database ORM | Prisma | ^6.14.0 | All data models | Add new models |
| Database | PostgreSQL | 14 | Store all data | Use existing container |
| Real-time | Socket.io | ^4.8.1 | All real-time features | Extend existing |
| Frontend Framework | Vue.js | ^3.5.18 | All UI components | Add new components |
| Build Tool | Vite | ^7.0.6 | Build all frontend | No change needed |
| Styling | Tailwind CSS | ^4.1.11 | All styling | Follow existing patterns |

### New Technology Additions (Minimal)

| Technology | Version | Purpose | Rationale | Integration Method |
|------------|---------|---------|-----------|-------------------|
| n8n | Latest | Workflow automation | Required for Coordinator Bot | Docker container + HTTP API |
| Ollama | Latest | Local AI model | Privacy-focused AI | HTTP API calls |

**Note:** No Redis, no complex service separation, no new infrastructure tools.

---

## Data Models and Schema Changes

### New Data Models (Simple Extensions)

#### AI Intent Model
**Purpose:** Store AI-analyzed intents
**Integration:** Simple addition to existing schema

**Key Attributes:**
- `id`: UUID - Primary key
- `messageId`: UUID - Reference to existing Message
- `intent`: String - Classified intent
- `confidence`: Float - AI confidence score
- `entities`: JSON - Extracted entities
- `processedAt`: DateTime - Processing timestamp

**Relationships:**
- **With Existing:** Many-to-one with Message model
- **With New:** One-to-many with AI Response model

#### AI Response Model
**Purpose:** Store AI-generated responses
**Integration:** Simple addition to existing schema

**Key Attributes:**
- `id`: UUID - Primary key
- `intentId`: UUID - Reference to AI Intent
- `responseType`: String - Type of response
- `content`: Text - AI response content
- `actions`: JSON - Required actions
- `status`: String - Processing status
- `createdAt`: DateTime - Creation timestamp

**Relationships:**
- **With Existing:** Many-to-one with AI Intent model
- **With New:** One-to-many with Workflow Execution model

#### Workflow Execution Model
**Purpose:** Track n8n workflow executions
**Integration:** Simple addition to existing schema

**Key Attributes:**
- `id`: UUID - Primary key
- `responseId`: UUID - Reference to AI Response
- `workflowId`: String - n8n workflow identifier
- `executionId`: String - n8n execution identifier
- `status`: String - Execution status
- `result`: JSON - Workflow result
- `startedAt`: DateTime - Start time
- `completedAt`: DateTime - Completion time

**Relationships:**
- **With Existing:** Many-to-one with AI Response model
- **With New:** One-to-many with Notification model

#### Notification Model
**Purpose:** Track notifications sent
**Integration:** Simple addition to existing schema

**Key Attributes:**
- `id`: UUID - Primary key
- `workflowExecutionId`: UUID - Reference to Workflow Execution
- `channelId`: UUID - Reference to existing Channel
- `type`: String - Notification type
- `content`: Text - Notification content
- `recipients`: JSON - Target recipients
- `status`: String - Delivery status
- `sentAt`: DateTime - Sent timestamp

**Relationships:**
- **With Existing:** Many-to-one with Channel model
- **With New:** Many-to-one with Workflow Execution model

### Schema Integration Strategy
**Database Changes Required:**
- **New Tables:** ai_intents, ai_responses, workflow_executions, notifications
- **Modified Tables:** None (maintain backward compatibility)
- **New Indexes:** Simple indexes on foreign keys
- **Migration Strategy:** Simple additive migrations

**Backward Compatibility:**
- All existing functionality continues working
- No changes to existing data models
- New features are completely optional

---

## Component Architecture (Simplified)

### New Components (Simple Modules)

#### AI Module
**Responsibility:** Handle all AI-related functionality
**Integration:** Simple module within existing Express app
**Location:** `src/services/ai.service.js`

**Key Functions:**
- Intent analysis using Ollama
- Entity extraction
- Response generation
- Simple caching (in-memory)

#### Coordinator Module
**Responsibility:** Coordinate between AI and workflows
**Integration:** Simple module within existing Express app
**Location:** `src/services/coordinator.service.js`

**Key Functions:**
- Route requests to appropriate handlers
- Manage workflow triggers
- Handle bot responses
- Simple state management

#### Workflow Module
**Responsibility:** Manage n8n workflow interactions
**Integration:** Simple module within existing Express app
**Location:** `src/services/workflow.service.js`

**Key Functions:**
- Trigger n8n workflows
- Monitor execution status
- Handle workflow results
- Error handling and retries

#### Enhanced Helpdesk Module
**Responsibility:** Extended helpdesk functionality
**Integration:** Simple module within existing Express app
**Location:** `src/services/helpdesk.service.js`

**Key Functions:**
- Ticket management
- AI-assisted responses
- Knowledge base integration
- Simple analytics

### Component Interaction (Simple)

```
┌─────────────────────────────────────────────────────────────┐
│                    SIMPLIFIED ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   EXISTING      │    │   NEW AI        │    │   EXTERNAL      │
│   EXPRESS APP   │    │   MODULES       │    │   SERVICES      │
│   (Controllers) │    │   (Services)    │    │   (n8n, Ollama) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   SAME          │
                    │   EXPRESS APP   │
                    │   (app.js)      │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   SAME          │
                    │   DATABASE      │
                    │   (PostgreSQL)  │
                    └─────────────────┘
```

**Key Points:**
- Everything runs in the same Express app
- No service separation, no inter-service communication
- Simple function calls between modules
- Same database, same deployment

---

## API Design and Integration

### API Integration Strategy
**API Integration Strategy:** Simple RESTful API additions
**Authentication:** Use existing JWT authentication
**Versioning:** No versioning needed - simple additions

### New API Endpoints (Simple Additions)

#### AI Intent Analysis Endpoint
- **Method:** POST
- **Endpoint:** `/api/ai/intent`
- **Purpose:** Analyze message intent
- **Integration:** Simple addition to existing API

**Request Schema:**
```json
{
  "messageId": "uuid",
  "text": "string",
  "context": {
    "channelId": "uuid",
    "senderId": "string",
    "conversationId": "uuid"
  }
}
```

**Response Schema:**
```json
{
  "intent": "string",
  "confidence": "float",
  "entities": {},
  "suggestedActions": []
}
```

#### Workflow Trigger Endpoint
- **Method:** POST
- **Endpoint:** `/api/workflows/trigger`
- **Purpose:** Trigger n8n workflow
- **Integration:** Simple addition to existing API

**Request Schema:**
```json
{
  "workflowId": "string",
  "input": {},
  "context": {
    "messageId": "uuid",
    "intentId": "uuid"
  }
}
```

**Response Schema:**
```json
{
  "executionId": "string",
  "status": "string",
  "estimatedDuration": "number"
}
```

#### Enhanced Helpdesk Endpoint
- **Method:** POST
- **Endpoint:** `/api/helpdesk/tickets`
- **Purpose:** Create helpdesk tickets
- **Integration:** Simple addition to existing API

**Request Schema:**
```json
{
  "title": "string",
  "description": "string",
  "priority": "string",
  "category": "string",
  "conversationId": "uuid"
}
```

**Response Schema:**
```json
{
  "ticketId": "uuid",
  "status": "string",
  "assignedTo": "uuid",
  "createdAt": "datetime"
}
```

---

## External API Integration

### n8n API Integration
- **Purpose:** Workflow automation
- **Base URL:** `http://n8n:5678/api/v1`
- **Authentication:** Simple API key
- **Integration Method:** HTTP calls from workflow service

**Key Endpoints:**
- `POST /workflows/{{id}}/trigger` - Trigger workflow
- `GET /executions/{{id}}` - Get execution status

**Error Handling:** Simple retry with exponential backoff

### Ollama API Integration
- **Purpose:** Local AI model inference
- **Base URL:** `http://ollama:11434/api`
- **Authentication:** None (local service)
- **Integration Method:** HTTP calls from AI service

**Key Endpoints:**
- `POST /generate` - Generate AI responses
- `POST /chat` - Chat-based interactions

**Error Handling:** Fallback to rule-based responses

---

## Source Tree Integration (Simple)

### Existing Project Structure (No Changes)
```
omnichannel_support/
├── src/
│   ├── unified-inbox-backend/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── app.js
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── docker-compose.yml
│   └── unified-inbox-frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── views/
│       │   └── main.js
│       └── package.json
└── docs/
```

### New File Organization (Simple Additions)
```
omnichannel_support/
├── src/
│   ├── unified-inbox-backend/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── ai.controller.js          # NEW: AI controller
│   │   │   │   ├── workflow.controller.js    # NEW: Workflow controller
│   │   │   │   └── helpdesk.controller.js    # NEW: Helpdesk controller
│   │   │   ├── middleware/                   # NO CHANGES
│   │   │   ├── routes/
│   │   │   │   ├── ai.routes.js              # NEW: AI routes
│   │   │   │   └── workflow.routes.js        # NEW: Workflow routes
│   │   │   ├── services/
│   │   │   │   ├── ai.service.js             # NEW: AI service
│   │   │   │   ├── coordinator.service.js    # NEW: Coordinator service
│   │   │   │   └── workflow.service.js       # NEW: Workflow service
│   │   │   └── app.js                        # EXISTING: Add new routes
│   │   ├── prisma/
│   │   │   └── schema.prisma                 # EXISTING: Add new models
│   │   └── docker-compose.yml                # EXISTING: Add n8n, ollama
│   └── unified-inbox-frontend/
│       ├── src/
│       │   ├── components/
│       │   │   ├── AIDashboard.vue           # NEW: AI dashboard
│       │   │   └── WorkflowMonitor.vue       # NEW: Workflow monitor
│       │   ├── views/
│       │   │   ├── AIDashboard.vue           # NEW: AI dashboard view
│       │   │   └── Workflows.vue             # NEW: Workflows view
│       │   └── main.js                       # EXISTING: Add new routes
│       └── package.json                       # NO CHANGES
├── n8n/                                       # NEW: n8n config
│   └── docker-compose.yml
├── ollama/                                    # NEW: Ollama config
│   └── docker-compose.yml
└── docs/                                      # EXISTING + NEW
    ├── brief.md
    ├── architecture.md                        # THIS FILE
    └── api-docs.md                           # NEW: API docs
```

### Integration Guidelines (Simple)
- **File Naming:** Follow existing camelCase convention
- **Folder Organization:** Keep existing structure, add new files
- **Import/Export Patterns:** Use existing ES6 module patterns
- **Code Style:** Follow existing patterns exactly

---

## Infrastructure and Deployment (Simple)

### Existing Infrastructure (No Changes)
**Current Deployment:** Docker Compose with PostgreSQL
**Infrastructure Tools:** Docker, Docker Compose
**Environments:** Development (local Docker)

### Enhancement Deployment Strategy (Simple)
**Deployment Approach:** Extend existing Docker Compose
**Infrastructure Changes:** Add only n8n and Ollama containers
**Pipeline Integration:** No changes to existing workflow

### Docker Compose Extension (Simple)
```yaml
version: '3.8'
services:
  # EXISTING SERVICES (NO CHANGES)
  db:
    image: postgres:14
    restart: always
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: unified_inbox
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # NEW SERVICES (SIMPLE ADDITIONS)
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - '5678:5678'
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password

  ollama:
    image: ollama/ollama
    restart: always
    ports:
      - '11434:11434'
    volumes:
      - ollama_data:/root/.ollama

volumes:
  postgres_data:    # EXISTING
  ollama_data:      # NEW
```

### Rollback Strategy (Simple)
**Rollback Method:** Stop new containers, restart old ones
**Risk Mitigation:** Feature flags in code
**Monitoring:** Use existing logging

---

## Coding Standards and Conventions (Simple)

### Existing Standards Compliance (No Changes)
**Code Style:** Follow existing ES6+ patterns exactly
**Linting Rules:** Use existing setup
**Testing Patterns:** Follow existing test structure
**Documentation Style:** Use existing JSDoc patterns

### Enhancement-Specific Standards (Simple)
- **AI Module Standards:** Follow existing service patterns
- **Workflow Integration:** Use existing error handling patterns
- **Database Operations:** Use existing Prisma patterns

### Critical Integration Rules (Simple)
- **Existing API Compatibility:** Follow existing response formats exactly
- **Database Integration:** Use existing Prisma transaction patterns
- **Error Handling:** Use existing error response format
- **Logging Consistency:** Use existing logging patterns

---

## Testing Strategy (Simple)

### Integration with Existing Tests (No Changes)
**Existing Test Framework:** Use existing setup
**Test Organization:** Follow existing patterns
**Coverage Requirements:** Maintain existing levels

### New Testing Requirements (Simple)

#### Unit Tests for New Components
- **Framework:** Use existing test setup
- **Location:** Follow existing test folder structure
- **Coverage Target:** Same as existing components
- **Integration with Existing:** Use existing test utilities

#### Integration Tests (Simple)
- **Scope:** Test new API endpoints
- **Existing System Verification:** Ensure no breaking changes
- **New Feature Testing:** Basic functionality testing

#### Regression Testing (Simple)
- **Existing Feature Verification:** Run existing test suite
- **Automated Regression:** Use existing CI/CD if available
- **Manual Testing Requirements:** Basic user acceptance testing

---

## Security Integration (Simple)

### Existing Security Measures (No Changes)
**Authentication:** Use existing JWT system
**Authorization:** Use existing role-based system
**Data Protection:** Use existing security patterns
**Security Tools:** Use existing security setup

### Enhancement Security Requirements (Simple)
**New Security Measures:** API key for n8n (simple)
**Integration Points:** Use existing security patterns
**Compliance Requirements:** Follow existing compliance

### Security Testing (Simple)
**Existing Security Tests:** Use existing security test suite
**New Security Test Requirements:** Basic validation testing
**Penetration Testing:** Use existing security assessment

---

## Implementation Plan (Simple)

### Phase 1: AI Service (1-2 tuần)
**Goal:** Basic AI intent analysis
**Tasks:**
- Add AI service to existing backend
- Integrate Ollama API calls
- Test with existing authentication
- Add basic database models

**Deliverables:**
- AI service module
- Basic intent analysis endpoint
- Database migrations

### Phase 2: Coordinator Logic (1-2 tuần)
**Goal:** Basic coordination between AI and workflows
**Tasks:**
- Add coordinator service
- Basic routing logic
- Simple workflow triggers
- Basic bot responses

**Deliverables:**
- Coordinator service module
- Basic workflow integration
- Simple bot response system

### Phase 3: Frontend Integration (1-2 tuần)
**Goal:** Basic UI for new features
**Tasks:**
- Add new Vue components
- Integrate with existing UI
- Basic dashboard functionality
- Simple workflow monitoring

**Deliverables:**
- AI dashboard component
- Workflow monitor component
- Basic helpdesk interface

### Phase 4: Testing and Polish (1 tuần)
**Goal:** Ensure everything works together
**Tasks:**
- End-to-end testing
- Bug fixes
- Performance optimization
- Documentation

**Deliverables:**
- Working system
- Documentation
- Deployment guide

---

## Next Steps

### Story Manager Handoff

**Reference:** This simplified architecture document provides straightforward integration requirements.

**Key Integration Requirements:**
- All new features are simple additions to existing monolithic structure
- No architectural changes, just functional extensions
- Follow existing patterns exactly
- Maintain backward compatibility

**Implementation Approach:**
- Simple module additions to existing Express app
- New database models without breaking changes
- New API endpoints following existing patterns
- New UI components following existing Vue.js patterns

**First Story to Implement:**
1. **AI Intent Analysis Service** - Simple service addition to existing backend
2. **Integration Checkpoints:** 
   - Verify existing functionality continues working
   - Test new AI service with existing authentication
   - Validate new database models

### Developer Handoff

**Reference:** This simplified architecture and existing coding standards.

**Integration Requirements:**
- Follow existing Express.js patterns exactly
- Use existing Prisma patterns for database operations
- Maintain existing API response formats
- Follow existing Vue.js component patterns

**Key Technical Decisions:**
- Keep everything in same Express app (no microservices)
- Use existing authentication and authorization
- Follow existing error handling patterns
- Use existing logging and monitoring

**Implementation Sequence:**
1. **Phase 1:** AI Service (isolated, no existing system impact)
2. **Phase 2:** Coordinator Logic (extends existing message processing)
3. **Phase 3:** Frontend Integration (adds new UI components)
4. **Phase 4:** Testing and Polish (ensures everything works)

**Risk Mitigation:**
- Feature flags for gradual rollout
- Comprehensive testing at each phase
- Simple rollback procedures
- No changes to existing core functionality

---

## Summary

### Key Principles Applied
1. **Keep it Simple:** No microservices, no complex architecture
2. **Extend Existing:** Add new functionality to current structure
3. **Follow Patterns:** Use existing coding and architectural patterns
4. **Minimal Changes:** Preserve existing functionality completely

### Benefits of Simplified Approach
- **Faster Development:** 4-6 tuần instead of 8-12 tuần
- **Easier Maintenance:** Single codebase, simple deployment
- **Lower Risk:** No architectural changes, gradual rollout
- **Team Friendly:** 1-2 developers can handle easily

### What We Avoided
- ❌ Microservices complexity
- ❌ Service mesh and inter-service communication
- ❌ Complex deployment pipelines
- ❌ Redis and additional infrastructure
- ❌ Over-engineering and premature optimization

### What We Gained
- ✅ Simple, maintainable codebase
- ✅ Fast development and deployment
- ✅ Easy testing and debugging
- ✅ Gradual feature rollout
- ✅ Team productivity and satisfaction

---

*Simplified architecture document created using BMAD-METHOD™ framework - Keeping it simple and practical*
