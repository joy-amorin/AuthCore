# AuthCore – Advanced Django Authentication & Authorization API

## Description
AuthCore is a Django REST Framework project providing a fully-featured authentication and authorization system with custom user model, JWT authentication, role-based access control, and permission management. Ideal for practice and real-world backend scenarios.

---

## Features
- Custom user model with UUID and email as identifier
- Registration, login, logout, JWT token refresh
- Password validation and security checks
- Role and permission management
- Assign roles to users, assign permissions to roles
- Middleware/decorators for permission-protected endpoints
- API endpoints ready for frontend integration

---

## Technologies
- Python 3.10+
- Django 5.2+
- Django REST Framework
- djangorestframework-simplejwt
- PostgreSQL (development uses SQLite, can switch to Postgres)

---

## Project Structure
- authcore/
  - authcore/
    - settings.py
    - urls.py
  - users/
    - models.py
    - serializers.py
    - views.py
    - urls.py
  - authentication/
    - serializers.py
    - views.py
    - urls.py
  - audit/
    - (future auditing features)
  - frontend/
  - docs/



---

## Setup Instructions
1. Clone the repository
2. Create a virtual environment and activate it
3. Install dependencies:  
   ```bash
   pip install -r requirements.txt
4. Configure your database in settings.py
5. Run migrations:
    ```bash
    python manage.py migrate

6. Create superuser:
   ```bash
   python manage.py createsuperuser

7. Start the development server:
   ```bash
   python manage.py runserver

## API Endpoints

- POST /api/register/ – User registration
- POST /api/login/ – User login (JWT access & refresh tokens)
- POST /api/logout/ – Logout & revoke refresh token
- POST /api/token/refresh/ – Refresh JWT access token
- CRUD /api/roles/ – Manage roles
- CRUD /api/permissions/ – Manage permissions
- POST /api/roles/<id>/permissions/ – Assign permissions to roles

## Notes

Refresh tokens are stored in DB to enable logout and revocation
Access tokens are short-lived; refresh tokens handle automatic renewal
Endpoints are protected via permission decorators for role-based access control
