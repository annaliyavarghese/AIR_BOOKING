#  AirBooking – Flight Booking Management System

## 1. Project Overview

AirBooking is a full-stack Flight Booking Management System developed using Django REST Framework and React. The application provides a platform for users to register, log in, search for available flights, book tickets, manage their trips and view booking details.

The system also includes an admin module that allows administrators to manage users, approve registration requests, manage flights and monitor bookings.

The project follows a frontend-backend architecture, where the React frontend communicates with the Django REST API.

## 2. Project Objectives

- To provide an easy-to-use online flight booking platform.
- To allow users to search and view available flights.
- To provide secure user authentication using JWT.
- To allow users to book and manage flight tickets.
- To provide admin approval for registered users.
- To allow administrators to manage flights and bookings.
- To provide a simulated payment process.
- To display booking and flight information through a user-friendly interface.

## 3. Technologies Used

### Backend
- Python
- Django
- Django REST Framework
- JWT Authentication
- SQLite / Configured Database
- Django CORS Headers
- Celery
- Redis / Memurai
- Requests

### Frontend
- React.js
- Vite
- JavaScript
- Axios
- React Router DOM
- HTML5
- CSS3

### Development Tools
- Visual Studio Code
- Postman
- Git
- GitHub
- Node.js
- npm

## 4. Project Features

### User Module

- User registration.
- User login and authentication.
- JWT-based authentication.
- Admin approval for newly registered users.
- User profile viewing.
- Flight search.
- Flight details viewing.
- Available seat information.
- Flight booking.
- Booking management.
- My Trips section.
- Booking status and payment status viewing.
- Flight status checking where live data is available.

### Flight Management

- View available flights.
- Search flights using source and destination.
- Search flights based on travel date.
- View flight details.
- Check available seats.
- View flight prices.
- Manage flight information through admin APIs.
- Update flight status.

### Booking Management

- Create flight bookings.
- Select the number of passengers.
- Calculate booking amount.
- View booking details.
- View booking history.
- Cancel bookings where supported.
- Update booking and payment status.
- Simulated payment functionality.
- Booking confirmation details.

### Admin Module

- Admin authentication and access control.
- View pending user registrations.
- Approve user accounts.
- Reject user accounts.
- Manage flight information.
- Update flight status.
- View and monitor bookings.
- Access administrative booking information.

### Background Email Processing

- Celery is used for asynchronous email processing.
- Redis / Memurai is used as the message broker.
- Account approval email content is processed in the background.
- Django Console Email Backend is used during development.

## 5. Project Structure

```text
AirBooking/
│
├── backend/
│   └── config/
│       ├── accounts/
│       ├── flights/
│       ├── bookings/
│       ├── config/
│       ├── manage.py
│       └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
│
└── README.md
```

## 6. Backend Installation and Setup

### Step 1: Clone the Repository

```bash
git clone <your-github-repository-url>
```

### Step 2: Open the Backend Folder

```bash
cd AirBooking/backend/config
```

### Step 3: Create a Virtual Environment

```bash
python -m venv env
```

### Step 4: Activate the Virtual Environment

Windows:

```bash
env\Scripts\activate
```

### Step 5: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 6: Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 7: Create a Superuser

```bash
python manage.py createsuperuser
```

### Step 8: Start the Django Server

```bash
python manage.py runserver
```

Backend URL:

http://127.0.0.1:8000/

Django Admin:

http://127.0.0.1:8000/admin/

## 7. Frontend Installation and Setup

Open a separate terminal.

### Step 1: Navigate to the Frontend Folder

```bash
cd AirBooking/frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start the React Development Server

```bash
npm run dev
```

Frontend URL:

http://localhost:5173/

## 8. API Endpoints

All API requests are handled through the Django REST Framework backend.

### Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | User registration |
| POST | `/api/auth/login/` | User login |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| GET | `/api/auth/profile/` | View user profile |

### Flight APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/flights/search/` | Search flights |
| GET | `/api/flights/<id>/` | View flight details |
| GET | `/api/flights/admin/` | View flights through admin API |
| POST | `/api/flights/admin/` | Add a flight |
| PUT/PATCH | `/api/flights/admin/<id>/` | Update flight |
| PUT/PATCH | `/api/flights/admin/<id>/status/` | Update flight status |
| GET | `/api/flights/<id>/live-status/` | Check live flight information |

### Booking APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/bookings/` | View user bookings |
| POST | `/api/bookings/` | Create a booking |
| GET | `/api/bookings/<id>/` | View booking details |
| PATCH | `/api/bookings/<id>/` | Update booking |
| DELETE | `/api/bookings/<id>/` | Delete booking where permitted |
| POST | `/api/bookings/payment/<booking_id>/` | Process demo payment |
| GET | `/api/bookings/admin/all/` | View all bookings through admin API |

### Admin User Management APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/auth/admin/users/pending/` | View pending users |
| POST | `/api/auth/admin/users/<id>/approve/` | Approve a user |
| POST | `/api/auth/admin/users/<id>/reject/` | Reject a user |

## 9. Authentication and Security

The application uses JSON Web Token (JWT) authentication.

- Users can register and log in.
- Login generates authentication tokens.
- Protected APIs require a valid access token.
- JWT access tokens are sent through the Authorization header.
- Admin APIs require appropriate administrator permissions.
- Pending users must be approved before accessing approved-user features.

Example Authorization Header:

```text
Authorization: Bearer <access_token>
```

## 10. Flight Booking Workflow

1. User registers an account.
2. Admin approves the user account.
3. User logs in.
4. User searches for flights.
5. User views flight details and available seats.
6. User selects the number of passengers.
7. User creates a booking.
8. The booking amount is calculated.
9. User proceeds through the demo payment process.
10. Booking and payment information can be viewed in My Trips.

## 11. Celery and Redis Setup

AirBooking uses Celery for background email processing.

### Requirements

- Celery
- Redis / Memurai

### Step 1: Start Redis / Memurai

Make sure the Memurai service is running on the system.

### Step 2: Start Celery Worker

Open a terminal in the backend folder containing `manage.py`.

```bash
celery -A config worker --pool=solo -l info
```

### Step 3: Start Django Server

Open another terminal.

```bash
python manage.py runserver
```

### Email Configuration

The project uses Django Console Email Backend during development. Approval email content is printed in the Django terminal instead of being delivered to a real email inbox.

## 12. Testing

The backend APIs can be tested using Postman.

Testing includes:

- User registration.
- User login.
- JWT authentication.
- Admin approval and rejection.
- Flight search.
- Flight details.
- Booking creation.
- Booking retrieval.
- Payment simulation.
- Admin flight management.

Frontend and backend integration can be tested using the local development servers.

## 13. Important Notes

- The payment feature is for demonstration purposes only.
- No real money is processed.
- Live flight information depends on the availability of the external flight data provider.
- Email processing uses the development console backend.
- Database and environment settings may need to be configured when running the project on another system.

## 14. Future Enhancements

- Integration with a real payment gateway.
- Real email delivery.
- Improved flight tracking and status updates.
- Advanced flight filtering.
- Booking invoice generation.
- Improved responsive design.
- Additional user dashboard features.
- Production deployment.

## 15. Conclusion

AirBooking is a full-stack flight booking application developed using Django REST Framework and React. It combines user authentication, admin approval, flight search, booking management and simulated payment functionality in one application.

The project demonstrates the integration of REST APIs with a modern React frontend and provides practical experience in full-stack web application development.

---

**Project Name:** AirBooking

**Backend:** Django REST Framework

**Frontend:** React.js with Vite

**Authentication:** JWT

**Payment:** Demo Payment System