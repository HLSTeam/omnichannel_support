# Group Topics Feature Implementation

## Overview
This document describes the implementation of the Group Topics feature, which allows each Telegram group to have multiple topics, with each topic related to a specific system.

## Database Changes

### New Migration: `add_group_topics`
Location: `src/unified-inbox-backend/prisma/migrations/20251002094953_add_group_topics/`

### New Table: `group_topics`
```prisma
model group_topics {
  id              String          @id @default(cuid())
  topicName       String
  topicId         String?         // Telegram thread/topic ID (for forum groups)
  description     String?
  isActive        Boolean         @default(true)
  systemId        String
  groupId         String
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @default(now())
  telegram_groups telegram_groups @relation(fields: [groupId], references: [id], onDelete: Cascade)
  System          System          @relation(fields: [systemId], references: [id])

  @@unique([groupId, topicName])
  @@index([groupId])
  @@index([systemId])
}
```

### Key Features:
- **topicName**: Name of the topic (required)
- **topicId**: Optional Telegram thread/topic ID for forum-style groups
- **systemId**: Reference to the System this topic belongs to
- **groupId**: Reference to the Telegram group
- **isActive**: Soft delete flag
- **Cascade delete**: When a telegram_group is deleted, all its topics are automatically deleted
- **Unique constraint**: Prevents duplicate topic names within the same group

## Backend Implementation

### 1. Controller: `group-topics.controller.js`
Location: `src/unified-inbox-backend/src/controllers/group-topics.controller.js`

#### Endpoints:

**GET /api/v1/group-topics**
- Get all topics for a specific group
- Query parameter: `groupId` (required)
- Returns: List of topics with related System information

**GET /api/v1/group-topics/:id**
- Get a specific topic by ID
- Returns: Topic details with System and Group information

**GET /api/v1/group-topics/by-system/:systemId**
- Get all topics for a specific system
- Returns: List of topics grouped by system

**POST /api/v1/group-topics**
- Create a new topic
- Required fields: `topicName`, `systemId`, `groupId`
- Optional fields: `topicId`, `description`, `isActive`
- Validates that both group and system exist

**PUT /api/v1/group-topics/:id**
- Update an existing topic
- All fields are optional
- Validates unique constraint

**DELETE /api/v1/group-topics/:id**
- Soft delete by default (sets `isActive` to false)
- Hard delete with query param: `?hard=true`

### 2. Routes: `group-topics.routes.js`
Location: `src/unified-inbox-backend/src/routes/group-topics.routes.js`

All routes are registered under `/api/v1/group-topics`

### 3. Updated: `telegram-groups.controller.js`
All telegram group queries now include `group_topics` relation:
```javascript
include: {
  group_topics: {
    where: {
      isActive: true
    },
    include: {
      System: {
        select: {
          id: true,
          name: true,
          elasticUrl: true
        }
      }
    }
  }
}
```

## Frontend Implementation

### Updated Component: `TelegramGroupManager.vue`
Location: `src/unified-inbox-frontend/src/components/TelegramGroupManager.vue`

### New Features:

#### 1. Topics Button
- Added "📂 Topics (N)" button next to Permissions button
- Shows count of active topics for each group

#### 2. Topic Management Modal
Features:
- Displays group information (name, type, chat ID)
- Form to add new topics with:
  - Topic Name (required)
  - System selection (dropdown, required)
  - Topic ID (optional - for Telegram thread ID)
  - Description (optional)
- List of existing topics showing:
  - Topic name
  - Associated system (badge)
  - Telegram topic ID (if present)
  - Description
  - Edit and delete buttons

#### 3. Edit Topic Modal
- Allows updating all topic fields
- Validates system exists
- Updates topic in real-time

### New Functions:
- `loadSystems()`: Loads available systems for dropdown
- `manageTopics(group)`: Opens topic management modal
- `addTopic()`: Creates new topic
- `editTopic(topic)`: Opens edit modal
- `updateTopic()`: Updates existing topic
- `deleteTopic(topic)`: Soft deletes topic with confirmation

## Usage Guide

### For Administrators:

1. **Navigate to Telegram Groups Management**
   - Access the admin panel
   - Go to Telegram Groups section

2. **Manage Topics for a Group**
   - Click the "📂 Topics" button on any group row
   - The Topics Management modal will open

3. **Add a New Topic**
   - Fill in the form:
     - Enter topic name
     - Select the system this topic belongs to
     - (Optional) Enter Telegram thread ID if using forum groups
     - (Optional) Add a description
   - Click "➕ Thêm Topic"

4. **Edit a Topic**
   - Click the ✏️ icon next to any topic
   - Update the fields in the modal
   - Click "Cập nhật" to save

5. **Delete a Topic**
   - Click the 🗑️ icon next to any topic
   - Confirm the deletion
   - The topic will be soft-deleted (marked inactive)

## API Examples

### Create a Topic
```bash
POST /api/v1/group-topics
Content-Type: application/json

{
  "topicName": "Customer Support",
  "systemId": "clx1234567890",
  "groupId": "clx0987654321",
  "topicId": "123456",
  "description": "Customer support inquiries"
}
```

### Get Topics for a Group
```bash
GET /api/v1/group-topics?groupId=clx0987654321
```

### Update a Topic
```bash
PUT /api/v1/group-topics/clx1111111111
Content-Type: application/json

{
  "topicName": "Updated Topic Name",
  "description": "Updated description"
}
```

### Delete a Topic (Soft)
```bash
DELETE /api/v1/group-topics/clx1111111111
```

### Delete a Topic (Hard)
```bash
DELETE /api/v1/group-topics/clx1111111111?hard=true
```

## Database Relationships

```
System
  ├── group_topics (one-to-many)
  └── telegram_groups (one-to-many)

telegram_groups
  └── group_topics (one-to-many, cascade delete)

group_topics
  ├── System (many-to-one)
  └── telegram_groups (many-to-one)
```

## Benefits

1. **Multi-System Support**: Each group can manage topics from different systems
2. **Telegram Forum Integration**: Support for Telegram's topic/thread feature via `topicId`
3. **Flexible Organization**: Groups can organize conversations by topics
4. **System Isolation**: Topics are properly linked to their respective systems
5. **Audit Trail**: Timestamps track creation and updates
6. **Soft Delete**: Topics can be deactivated without losing data

## Future Enhancements

Potential improvements:
- [ ] Topic-based message routing
- [ ] Topic analytics and statistics
- [ ] Bulk topic operations
- [ ] Topic templates
- [ ] Topic permissions
- [ ] Export/Import topic configurations
- [ ] Topic activity tracking

## Testing

To test the implementation:

1. Start the backend server:
```bash
cd src/unified-inbox-backend
npm start
```

2. Start the frontend:
```bash
cd src/unified-inbox-frontend
npm run dev
```

3. Access the admin panel and navigate to Telegram Groups
4. Click on "📂 Topics" for any group
5. Add, edit, and delete topics to verify functionality

## Migration Status

✅ Migration created and applied successfully
✅ Backend API implemented and tested
✅ Frontend UI implemented and integrated
✅ No linter errors

## Files Modified

### Backend:
- `src/unified-inbox-backend/prisma/schema.prisma`
- `src/unified-inbox-backend/src/controllers/telegram-groups.controller.js`
- `src/unified-inbox-backend/src/controllers/group-topics.controller.js` (new)
- `src/unified-inbox-backend/src/routes/group-topics.routes.js` (new)
- `src/unified-inbox-backend/src/app.js`

### Frontend:
- `src/unified-inbox-frontend/src/components/TelegramGroupManager.vue`

### Database:
- Migration: `20251002094953_add_group_topics`

