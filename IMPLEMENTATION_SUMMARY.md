# Tickets and Comments API Implementation

## What Was Implemented

### 1. Ticket Management APIs

#### Entities Created/Updated:
- `Ticket` entity (already existed, now properly used)
- `TicketStatusLog` entity (already existed, now properly used)
- `TicketComment` entity (newly created)

#### DTOs Created:
- `CreateTicketDto` - with validation (min 5 chars title, min 10 chars description)
- `UpdateStatusDto` - for status transitions
- `AssignTicketDto` - for assigning tickets to users
- `CreateCommentDto` - for adding comments
- `UpdateCommentDto` - for editing comments

#### Endpoints Implemented:

**Tickets:**
- `POST /tickets` - Create ticket (USER, MANAGER roles)
- `GET /tickets` - Get tickets (role-based filtering)
  - MANAGER: sees all tickets
  - SUPPORT: sees assigned tickets
  - USER: sees own tickets
- `PATCH /tickets/:id/assign` - Assign ticket (MANAGER, SUPPORT roles)
- `PATCH /tickets/:id/status` - Update status (MANAGER, SUPPORT roles)
- `DELETE /tickets/:id` - Delete ticket (MANAGER only)

**Comments:**
- `POST /tickets/:id/comments` - Add comment
- `GET /tickets/:id/comments` - List comments
- `PATCH /comments/:id` - Edit comment (author or MANAGER)
- `DELETE /comments/:id` - Delete comment (author or MANAGER)

### 2. Business Logic Implemented

#### Status Transition Validation:
- OPEN → IN_PROGRESS
- IN_PROGRESS → RESOLVED
- RESOLVED → CLOSED
- Invalid transitions return 400 error

#### Status Logging:
- Every status change is logged in `ticket_status_logs` table
- Tracks old status, new status, who changed it, and when

#### Role-Based Access Control:
- Tickets cannot be assigned to users with USER role
- Comment access restricted based on ticket ownership/assignment
- Proper 401/403 responses for unauthorized access

#### Validation:
- Title minimum 5 characters
- Description minimum 10 characters
- Priority and Status must be valid enums
- All protected endpoints require JWT token

### 3. Service Layer Features

**TicketsService methods:**
- `create()` - Creates ticket with current user as creator
- `findAll()` - Returns tickets based on user role
- `findOne()` - Gets single ticket with relations
- `assignTicket()` - Assigns ticket to SUPPORT/MANAGER
- `updateStatus()` - Updates status with validation and logging
- `remove()` - Deletes ticket
- `addComment()` - Adds comment with access check
- `getComments()` - Gets comments with access check
- `updateComment()` - Updates comment (author or MANAGER)
- `deleteComment()` - Deletes comment (author or MANAGER)

### 4. Security Enhancements

- Updated `JwtStrategy` to include role information in request
- Added `findOneWithRole()` method to UsersService
- Updated `findByEmail()` to include role relations
- Proper guards on all endpoints (JwtAuthGuard + RolesGuard)

### 5. Module Configuration

Updated `TicketsModule` to:
- Import TypeORM repositories for Ticket, TicketStatusLog, TicketComment, User
- Export both TicketsController and CommentsController
- Properly inject dependencies

## Database Schema

All entities follow the specification:
- `tickets` table with proper enums and foreign keys
- `ticket_comments` table with CASCADE delete
- `ticket_status_logs` table for audit trail
- Proper relationships between User, Ticket, and Comment entities

## Testing the Implementation

### 1. Create a MANAGER user (via database or existing endpoint)

### 2. Login to get JWT token:
```bash
POST /auth/login
{
  "email": "manager@example.com",
  "password": "password"
}
```

### 3. Create users (as MANAGER):
```bash
POST /users
Authorization: Bearer <token>
{
  "name": "Support User",
  "email": "support@example.com",
  "password": "password",
  "role": "SUPPORT"
}
```

### 4. Create a ticket (as USER):
```bash
POST /tickets
Authorization: Bearer <user-token>
{
  "title": "Login Issue",
  "description": "Cannot login to the system",
  "priority": "HIGH"
}
```

### 5. Assign ticket (as MANAGER/SUPPORT):
```bash
PATCH /tickets/1/assign
Authorization: Bearer <manager-token>
{
  "userId": 2
}
```

### 6. Update status (as MANAGER/SUPPORT):
```bash
PATCH /tickets/1/status
Authorization: Bearer <support-token>
{
  "status": "IN_PROGRESS"
}
```

### 7. Add comment:
```bash
POST /tickets/1/comments
Authorization: Bearer <token>
{
  "comment": "Working on this issue"
}
```

## Next Steps

1. Run `npm install` to ensure all dependencies are installed
2. Configure your database connection in `.env` file
3. Start the server with `npm run start:dev`
4. Test the endpoints using Postman or similar tool
5. Access Swagger documentation at `http://localhost:3000/docs` (if configured)

## Notes

- All password handling uses bcrypt
- JWT tokens are required for all protected endpoints
- Status transitions are strictly enforced
- Proper HTTP status codes (200, 201, 204, 400, 401, 403, 404)
- TypeORM synchronize is enabled for development (disable in production)
