# Authcore

**User, Role & Permission Management System (RBAC)**

## Overview

This is a practice project focused on implementing a complete Role-Based Access Control (RBAC) system using Django REST Framework and React. The goal of the project is to design and understand a real-world authorization flow based on users, roles, and permissions, including dynamic access control, auditing, and frontend integration.

> ⚠️ **Note:** This project is not deployed and is intended for learning and experimentation purposes.

## Core Features

- 🔐 JWT-based authentication (access & refresh tokens)
- 👥 Role-Based Access Control (RBAC)
- ⚡ Dynamic permissions per role
- 🎭 Role assignment to users
- 🛡️ Protected API endpoints based on permissions
- 🎨 Admin panel behavior driven by permissions (frontend)
- 📊 User activity auditing (who did what, when, and from where)

## Tech Stack

### Backend
- Python
- Django
- Django REST Framework
- Simple JWT
- SQLite (local development)

### Frontend
- React
- TypeScript
- React Router

## Authentication Flow

### Phase 1 — Authentication
- User registration → `POST /api/register/`
- Login and token generation → `POST /api/token/`
- Token refresh → `POST /api/token/refresh/`
- Authenticated user profile → `GET /api/me/`

### Phase 2 — Token Control
- Logout / token invalidation via refresh token blacklist

## User Management

### Phase 3 — Users
- CRUD endpoints for users
- Access restricted via RBAC permissions
- Permissions such as:
  - `user.view`
  - `user.add`
  - `user.change`
  - `user.delete`

## Roles & Permissions (RBAC)

### Phase 4 — Roles and Permissions

#### CRUD Endpoints
- `/api/roles/`
- `/api/permissions/`

#### Features
- Assign permissions to roles
- Assign roles to users
- Access control enforced via custom permission classes (not `IsAdminUser`)

### RBAC Design

#### Models

**Role**
- `name`
- `description`

**Permission**
- `name` (e.g. `user.view`, `assign.role`)
- `description`

**UserRole**
- Relationship between User and Role

**RolePermission**
- Relationship between Role and Permission

#### Relationships
- A user can have multiple roles
- A role can have multiple permissions
- Permissions are checked dynamically at runtime

## API Endpoints

### Authentication
```http
POST   /api/register/           # Create new user (admin only)
POST   /api/token/              # Login - get access & refresh tokens
POST   /api/token/refresh/      # Refresh access token
GET    /api/me/                 # Get authenticated user profile
```

#### Example Login
```json
POST /api/token/
{
  "username": "admin",
  "password": "yourpassword"
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### User Management
```http
GET    /api/users/              # List all users
POST   /api/users/              # Create user
GET    /api/users/{id}/         # Get user details
PUT    /api/users/{id}/         # Update user
DELETE /api/users/{id}/         # Delete user
GET    /api/user/{id}/roles/    # Get all roles for a user
```

### Role Management
```http
GET    /api/roles/              # List all roles
POST   /api/roles/              # Create new role (development)
GET    /api/roles/{id}/         # Get role details
PUT    /api/roles/{id}/         # Update role (development)
DELETE /api/roles/{id}/         # Delete role (development)
GET    /api/roles/{id}/permissions/  # Get permissions for a role
```

### Permission Management
```http
GET    /api/permissions/        # List all permissions
POST   /api/permissions/        # Create new permission (development)
GET    /api/permissions/{id}/   # Get permission details
PUT    /api/permissions/{id}/   # Update permission (development)
DELETE /api/permissions/{id}/   # Delete permission (development)
```

> **Development Endpoints:** Role and Permission CRUD operations are intended for development/setup. In production use, roles come pre-configured with their permissions.

### User Role Assignment (Production Use)
```http
POST   /api/user_role/          # Assign role to user
POST   /api/user_role/remove-role/  # Remove role from user
```

#### Assign a role to a user
```json
POST /api/user_role/
{
  "user": "<user_id>",
  "role": "<role_id>"
}
```

#### Remove a role from a user
```json
POST /api/user_role/remove-role/
{
  "user": "<user_id>",
  "role": "<role_id>"
}
```

**How it works in production:**
1. Roles are pre-configured with their permissions (e.g., "Admin", "Editor", "Viewer")
2. Admins assign these pre-existing roles to users
3. Users inherit all permissions from their assigned roles
4. No dynamic permission assignment to users - everything flows through roles

> **Note:** These endpoints avoid exposing internal relationship IDs and align the API with real business use cases.

## Authorization Strategy

- Custom RBAC permission system
- Each ViewSet action maps to a permission string
- Permissions are resolved using: **User → Roles → Permissions**
- Superusers bypass RBAC checks (for system-level administration only)

### Example Permissions
- `user.view`
- `role.view`
- `permission.view`
- `assign.role`

## Permissions & Roles Configuration

### Available Permissions

| Permission | Description |
|------------|-------------|
| `user.view` | View users |
| `user.add` | Create users |
| `user.change` | Edit users |
| `user.delete` | Delete users |
| `role.view` | View roles |
| `role.add` | Create roles |
| `role.change` | Edit roles |
| `role.delete` | Delete roles |
| `permission.view` | View permissions |
| `permission.add` | Create permissions |
| `permission.change` | Edit permissions |
| `permission.delete` | Delete permissions |

### Pre-configured Roles

| Role | Assigned Permissions | Description |
|------|---------------------|-------------|
| **Admin** | All permissions (`user.*`, `role.*`, `permission.*`) | Full system access |
| **Manager** | `user.view`,  `user.change`, `role.view`, `role.add` | Can manage users and create roles |
| **Editor** | `user.view`, `user.change` | Can view and edit users |
| **Viewer** | `user.view`, `role.view`, `permission.view` | Read-only access |

> When a user is assigned a role, they automatically inherit all permissions associated with that role.

## Auditing

### Phase 5 — Audit System

The audit module records:
- User performing the action
- Accessed endpoint
- HTTP method
- IP address
- Timestamp

This allows traceability of sensitive operations in the system.

## Frontend Integration

### Phase 6 — Frontend

- React frontend consumes all backend endpoints
- UI elements (menus, actions, buttons) are shown/hidden based on permissions
- Authorization logic is consistent with backend RBAC rules

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- npm or yarn

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/yourusername/authcore.git
cd authcore
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

#### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install
# or
yarn install

# Run development server
npm run dev
# or
yarn dev
```

The frontend will be available at `http://localhost:5173` (or the port specified by Vite)

### Initial Setup - Create Users

This is an internal system where only admins/superusers can create new users.

#### Create the first superuser:
```bash
# In the backend directory with virtual environment activated
python manage.py createsuperuser
```

#### Create additional users (admin/superuser only):
```bash
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_access_token>" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "securepassword123"
  }'
```

> ⚠️ **Note:** The `/api/register/` endpoint is restricted to admin users only. Regular users cannot self-register.

### Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

## Project Status

- ✅ Backend RBAC flow implemented and functional
- ✅ Frontend consumes secured endpoints
- 📚 Project intended for learning and architectural practice

## Important Notes

- This project intentionally avoids Django's default permission system in favor of a custom RBAC implementation.
- The "Admin" role is a domain role, not tied to `is_superuser`.
- API design prioritizes business use cases over internal database structure.

## License

This project is for educational purposes only.

---

**Made with ❤️ for learning RBAC patterns**
