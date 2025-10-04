# System Management UI Guide

## 🖥️ System Management Interface

This guide shows what the System Management interface looks like and how to use it.

## Main Interface

### Navigation
1. Login as admin at `/login`
2. You'll be redirected to `/admin`
3. Click on the **"🖥️ Quản Lý Hệ Thống"** tab

### System List View

The main view displays a table with all systems:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🖥️ Quản Lý Hệ Thống                          [+ Thêm Hệ Thống Mới]        │
│  Tạo và quản lý các hệ thống trong ứng dụng                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Tên Hệ Thống  │  Elasticsearch URL      │ Số Kênh │ Ngày Tạo │ Hành Động│ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │ [R] Rosa      │  https://es.example.com │ 2 kênh  │ 02/10/25 │ ✏️  🗑️  │ │
│  │ [P] Production│  https://prod.es.com    │ 5 kênh  │ 01/10/25 │ ✏️  🗑️  │ │
│  │ [D] Dev       │  Chưa cấu hình          │ 0 kênh  │ 30/09/25 │ ✏️  🗑️  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Table Features

#### Column 1: Tên Hệ Thống
- Shows system name with an icon
- Icon displays first letter of system name
- Blue background for the icon

#### Column 2: Elasticsearch URL
- Shows the full URL (truncated if too long)
- Clickable link that opens in new tab
- Shows "Chưa cấu hình" if no URL set
- Displayed in gray italic if empty

#### Column 3: Số Kênh
- Badge showing number of channels
- Blue badge with white text

#### Column 4: Ngày Tạo
- Creation date in Vietnamese format (DD/MM/YY HH:MM)

#### Column 5: Hành Động
- ✏️ Edit button (pencil icon)
- 🗑️ Delete button (trash icon)
- Hover effects on both buttons

## Create System Modal

Click "Thêm Hệ Thống Mới" to open:

```
┌──────────────────────────────────────────┐
│  ➕ Thêm Hệ Thống Mới              ✕    │
├──────────────────────────────────────────┤
│                                          │
│  Tên Hệ Thống *                         │
│  ┌────────────────────────────────────┐ │
│  │ Nhập tên hệ thống                  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Elasticsearch URL                      │
│  ┌────────────────────────────────────┐ │
│  │ https://elasticsearch.example.com  │ │
│  └────────────────────────────────────┘ │
│  URL kết nối đến Elasticsearch để       │
│  tìm kiếm logs và transactions          │
│                                          │
│            [ Hủy ]  [ Tạo Mới ]         │
│                                          │
└──────────────────────────────────────────┘
```

### Form Fields

1. **Tên Hệ Thống** (Required)
   - Text input
   - Must not be empty
   - Example: "Production System"

2. **Elasticsearch URL** (Optional)
   - URL input with validation
   - Shows helper text below
   - Example: "https://elasticsearch.example.com:9200"

### Form Actions

- **Hủy**: Close modal without saving
- **Tạo Mới**: Create the system (disabled while submitting)

## Edit System Modal

Click the edit icon (✏️) on any system:

```
┌──────────────────────────────────────────┐
│  ✏️ Chỉnh Sửa Hệ Thống            ✕    │
├──────────────────────────────────────────┤
│                                          │
│  Tên Hệ Thống *                         │
│  ┌────────────────────────────────────┐ │
│  │ Rosa Market System                 │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Elasticsearch URL                      │
│  ┌────────────────────────────────────┐ │
│  │ https://es.rosa.com:9200          │ │
│  └────────────────────────────────────┘ │
│  URL kết nối đến Elasticsearch để       │
│  tìm kiếm logs và transactions          │
│                                          │
│            [ Hủy ]  [ Cập Nhật ]        │
│                                          │
└──────────────────────────────────────────┘
```

## Delete Confirmation Modal

### Normal Delete (No Related Data)

Click the delete icon (🗑️):

```
┌──────────────────────────────────────────┐
│                                          │
│            ⚠️  (Red Circle)             │
│                                          │
│     Xác Nhận Xóa Hệ Thống               │
│                                          │
│  Bạn có chắc chắn muốn xóa hệ thống     │
│  "Dev System"? Hành động này không      │
│  thể hoàn tác.                           │
│                                          │
│         [ Hủy ]  [ Xóa Hệ Thống ]       │
│                                          │
└──────────────────────────────────────────┘
```

### Delete with Related Data (Blocked)

If system has related data:

```
┌──────────────────────────────────────────┐
│                                          │
│            ⚠️  (Red Circle)             │
│                                          │
│     Xác Nhận Xóa Hệ Thống               │
│                                          │
│  Bạn có chắc chắn muốn xóa hệ thống     │
│  "Production System"? Hành động này     │
│  không thể hoàn tác.                     │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ ⚠️ Không thể xóa! Hệ thống có dữ   │ │
│  │    liệu liên quan:                  │ │
│  │  • 2 kênh                           │ │
│  │  • 15 cuộc trò chuyện               │ │
│  │  • 5 quy tắc                        │ │
│  │  • 3 nhóm Telegram                  │ │
│  │  • 10 ticket                        │ │
│  │                                     │ │
│  │  Vui lòng xóa các dữ liệu này trước│ │
│  └────────────────────────────────────┘ │
│                                          │
│    [ Hủy ]  [ Xóa Hệ Thống ] (disabled)│
│                                          │
└──────────────────────────────────────────┘
```

## State Indicators

### Loading State
```
┌─────────────────────────────────────────┐
│                                         │
│          ⟳  (Spinning Wheel)           │
│        Đang tải dữ liệu...              │
│                                         │
└─────────────────────────────────────────┘
```

### Empty State
```
┌─────────────────────────────────────────┐
│  Chưa có hệ thống nào.                  │
│  Hãy tạo hệ thống đầu tiên!             │
└─────────────────────────────────────────┘
```

### Error Message (in forms)
```
┌────────────────────────────────────────┐
│ ❌ Không thể tạo hệ thống. Tên hệ     │
│    thống đã tồn tại.                   │
└────────────────────────────────────────┘
```

### Warning Message
```
┌────────────────────────────────────────┐
│ ⚠️ Không thể xóa hệ thống có dữ liệu  │
│    liên quan. Vui lòng xóa các dữ      │
│    liệu liên quan trước.               │
│  • 2 kênh                              │
│  • 15 cuộc trò chuyện                  │
└────────────────────────────────────────┘
```

## Color Scheme

### Primary Colors
- **Blue (#3B82F6)**: Primary actions, system icons, badges
- **Red (#DC2626)**: Delete actions, error messages
- **Yellow (#F59E0B)**: Warning messages
- **Gray (#6B7280)**: Text, borders, disabled states
- **Green (#10B981)**: Success states (not currently used but available)

### Button States
- **Normal**: Full color
- **Hover**: Darker shade
- **Disabled**: Gray (#9CA3AF)
- **Loading**: Disabled with spinner

## Responsive Behavior

### Desktop (>1024px)
- Full table layout
- All columns visible
- Modal centered on screen

### Tablet (768px - 1024px)
- Table scrolls horizontally if needed
- Modal takes 90% width

### Mobile (<768px)
- Table scrolls horizontally
- Modal takes full width
- Buttons stack vertically

## Keyboard Navigation

- **Tab**: Navigate between form fields
- **Enter**: Submit form (when in input field)
- **Escape**: Close modal (not yet implemented, future enhancement)

## Accessibility Features

- Semantic HTML structure
- Proper ARIA labels on icons
- Focus states on interactive elements
- High contrast text
- Readable font sizes

## Usage Flow

### Creating a System

1. Click "Thêm Hệ Thống Mới"
2. Enter system name (required)
3. Optionally enter Elasticsearch URL
4. Click "Tạo Mới"
5. See success (or error message)
6. Modal closes automatically on success
7. System appears in the table

### Editing a System

1. Click edit icon (✏️) on a system row
2. Update name or Elasticsearch URL
3. Click "Cập Nhật"
4. See success (or error message)
5. Modal closes on success
6. Table refreshes with new data

### Deleting a System

1. Click delete icon (🗑️) on a system row
2. Read confirmation message
3. If related data exists, see warning
4. Click "Xóa Hệ Thống" (or "Hủy" to cancel)
5. If successful, system removed from table
6. If failed, see error with details

## Tips for Users

1. **Elasticsearch URL Format**: Use full URL including protocol
   - ✅ Good: `https://elasticsearch.example.com:9200`
   - ❌ Bad: `elasticsearch.example.com`

2. **System Names**: Choose descriptive names
   - ✅ Good: "Production - Rosa Market", "Development System"
   - ❌ Bad: "Sys1", "Test"

3. **Before Deleting**: Check if system has related data
   - Look at the "Số Kênh" column
   - Systems with 0 channels are usually safe to delete
   - The system will prevent deletion if there's related data

4. **Elasticsearch URL**: Can be added later
   - You can create a system without URL
   - Edit it later when you have the URL ready

## Common Scenarios

### Scenario 1: Setting Up a New System
1. Create system with just a name
2. Set up channels and other configurations
3. Come back later to add Elasticsearch URL

### Scenario 2: Updating Elasticsearch URL
1. Open edit modal for existing system
2. Update or add Elasticsearch URL
3. Test the connection (external step)
4. Save changes

### Scenario 3: Cleaning Up Test Systems
1. Identify test systems (0 channels)
2. Delete them one by one
3. Production systems with data will be protected

### Scenario 4: System Migration
1. Create new system with new Elasticsearch URL
2. Migrate channels and other data
3. Keep old system until migration complete
4. Delete old system after verification

