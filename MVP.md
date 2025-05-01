# TaskApp MVP

## 1. Core Task Management

### Essential Features

- Parent creates tasks with:
  - Title and description
  - Type (routine/challenge)
  - Recurrence (daily, weekdays, weekends, custom)
  - Time window (suggested completion time)
  - Mandatory/Optional flag
  - Approval requirement
  - Token reward value
  - Child assignment

### Task Completion Flow

- Child views assigned tasks
- Marks task as complete
- If approval needed → Parent notification
- Parent approves/rejects
- Tokens awarded on completion/approval

## 2. Family Management

### Essential Features

- Parent account creation
- Child profile management:
  - Basic info (name, avatar)
  - Token balance
  - Task assignments

### Views

- Parent Dashboard:
  - Tasks needing approval
  - Children's daily progress
  - Quick task management
- Child Dashboard:
  - Today's tasks
  - Token balance
  - Available shop items

## 3. Basic Token Economy

### Features

- Token earning through tasks
- Simple shop system:
  - Parent creates items
  - Set token cost
  - Basic inventory management
  - Purchase approval option

### Shop Items

- Name and description
- Token cost
- Available quantity
- Time availability (optional)

## 4. Simple Streak System

### Basic Tracking

- Daily task completion
- Visual streak indicator
- Basic streak rewards

## 5. Web Notifications

### In-app Notifications

- Tasks pending approval
- Task completion reminders
- Purchase requests

## Not Included in MVP

To keep focused, these features would come later:

- Mobile app/PWA features
- Offline mode
- Advanced streak bonuses
- Wishlist system
- Collaborative tasks
- Advanced reporting
- Task history/audit trail
- Dynamic token multipliers

## Technical MVP Requirements

### Frontend

- Responsive web design (desktop/tablet/mobile browsers)
- Real-time updates for task status
- Simple, intuitive UI

### Backend

- User authentication
- Basic API endpoints
- Token transaction management
- Task assignment system
