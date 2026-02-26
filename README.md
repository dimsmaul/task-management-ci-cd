# Task Management System

A full-stack task management application built with Next.js 16, TypeScript, Prisma ORM, and shadcn/ui components.

## 🚀 Features

### Authentication
- User registration with email and password
- User login with JWT token authentication
- Protected routes and API endpoints
- Session management with HTTP-only cookies
- Password hashing with bcryptjs

### Task Management
- Full CRUD operations for tasks
- Multi-user support (each user sees only their tasks)
- Task status management with workflow
- Filter tasks by status
- Real-time task updates

### Task Status Workflow
The application supports the following task statuses:
- `todo` - Initial state
- `in_progress` - Task is being worked on
- `testing` - Task is under testing
- `fixing` - Task needs fixes
- `done` - Task completed successfully
- `closed` - Task is closed

### Custom API Endpoints
The application exposes custom endpoints for integration:
- `POST /api/task/:id` - Move task from `in_progress` to `testing`
- `POST /api/task-failed/:id` - Move task to `fixing` status
- `POST /api/bulk-task` - Bulk update tasks from `testing` to `fixing`
- `POST /api/bulk-task-failed` - Bulk update tasks to `fixing`

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Database**: SQLite with Prisma ORM
- **Authentication**: Custom JWT implementation
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **State Management**: React hooks
- **Password Hashing**: bcryptjs
- **Token Management**: jsonwebtoken

## 📋 Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-management-system
```

2. Install dependencies:
```bash
bun install
# or
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./db/custom.db"
JWT_SECRET="your-secret-key-change-in-production"
```

4. Initialize the database:
```bash
bun run db:push
```

5. (Optional) Seed the database with sample data:
```bash
bun run db:seed
```

This will create two test accounts:
- Email: `john@example.com`, Password: `password123`
- Email: `jane@example.com`, Password: `password123`

## 🏃 Running the Application

### Development Mode
```bash
bun run dev
# or
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
bun run build
bun run start
```

## 📁 Project Structure

```
task-management-system/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data script
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── logout/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── me/
│   │   │   │   │   └── route.ts
│   │   │   │   └── register/
│   │   │   │       └── route.ts
│   │   │   ├── tasks/
│   │   │   │   ├── route.ts          # GET / POST tasks
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # GET / PUT / DELETE single task
│   │   │   ├── task/[id]/
│   │   │   │   └── route.ts          # Move to testing
│   │   │   ├── task-failed/[id]/
│   │   │   │   └── route.ts          # Move to fixing
│   │   │   ├── bulk-task/
│   │   │   │   └── route.ts          # Bulk update to fixing
│   │   │   └── bulk-task-failed/
│   │   │       └── route.ts          # Bulk update to fixing
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Main dashboard
│   │   ├── login/
│   │   │   └── page.tsx             # Login page
│   │   ├── register/
│   │   │   └── page.tsx             # Register page
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home page (redirects)
│   │   └── globals.css
│   ├── components/
│   │   └── ui/                      # shadcn/ui components
│   ├── hooks/
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── auth.ts                  # Authentication utilities
│   │   ├── db.ts                    # Prisma client
│   │   └── utils.ts
│   └── middleware.ts                # Auth middleware
├── .env
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🔐 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "cuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt-token"
  }
}
```

#### POST /api/auth/login
Login user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt-token"
  }
}
```

#### POST /api/auth/logout
Logout user.

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### GET /api/auth/me
Get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Task Endpoints

#### GET /api/tasks
Get all tasks for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by status (todo, in_progress, testing, done, fixing, closed)

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "cuid",
        "title": "Task title",
        "description": "Task description",
        "status": "todo",
        "userId": "cuid",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Task title",
  "description": "Task description (optional)",
  "status": "todo"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "id": "cuid",
      "title": "Task title",
      "description": "Task description",
      "status": "todo",
      "userId": "cuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### GET /api/tasks/:id
Get a single task by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "cuid",
      "title": "Task title",
      "description": "Task description",
      "status": "todo",
      "userId": "cuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### PUT /api/tasks/:id
Update a task.

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in_progress"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "task": {
      "id": "cuid",
      "title": "Updated title",
      "description": "Updated description",
      "status": "in_progress",
      "userId": "cuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### DELETE /api/tasks/:id
Delete a task.

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### Custom Status Update Endpoints

#### POST /api/task/:id
Move task status from `in_progress` to `testing`.

**Response:**
```json
{
  "success": true,
  "message": "Task updated to testing",
  "data": {
    "task": {
      "id": "cuid",
      "title": "Task title",
      "status": "testing",
      ...
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Task status must be 'in_progress' to update to testing. Current status: todo"
}
```

#### POST /api/task-failed/:id
Move task status to `fixing`.

**Response:**
```json
{
  "success": true,
  "message": "Task status updated to fixing",
  "data": {
    "task": {
      "id": "cuid",
      "title": "Task title",
      "status": "fixing",
      ...
    }
  }
}
```

#### POST /api/bulk-task
Bulk update tasks from `testing` to `fixing`.

**Request Body:**
```json
{
  "ids": ["cuid1", "cuid2", "cuid3"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "3 tasks updated from testing to fixing",
  "data": {
    "updated": 3,
    "tasks": [...]
  }
}
```

#### POST /api/bulk-task-failed
Bulk update tasks to `fixing` status (any current status).

**Request Body:**
```json
{
  "ids": ["cuid1", "cuid2"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "2 tasks updated to fixing",
  "data": {
    "updated": 2,
    "tasks": [...]
  }
}
```

## 🎨 UI Features

- Responsive design (mobile-first)
- Dark mode support
- Task filtering by status
- Modal dialogs for creating and editing tasks
- Confirmation dialogs for deleting tasks
- Toast notifications for user feedback
- Loading states for async operations
- Status badges with icons

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- HTTP-only cookies for token storage
- Protected API routes
- Ownership validation for task operations
- Input validation and sanitization
- CSRF protection

## 🧪 Testing

### Run Linting
```bash
bun run lint
```

### Seed Database
```bash
bun run db:seed
```

### Reset Database
```bash
bun run db:reset
```

## 📝 Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  tasks     Task[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Task Model
```prisma
model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(todo)
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}
```

### TaskStatus Enum
```prisma
enum TaskStatus {
  todo
  in_progress
  testing
  done
  fixing
  closed
}
```

## 🚀 Deployment

### Environment Variables
Make sure to set these environment variables in production:
```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-secret-key"
NODE_ENV="production"
```

### Build for Production
```bash
bun run build
```

### Start Production Server
```bash
bun run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- shadcn/ui for the beautiful UI components
- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- Vercel for hosting and deployment tools

## 📞 Support

For support, please open an issue in the repository or contact the development team.

---

Built with ❤️ using Next.js and TypeScript
