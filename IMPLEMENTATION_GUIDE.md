# Dred's Transient House - Complete Backend Implementation

## ✅ What Has Been Implemented

### 1. **Database System (SQLite)**
- Complete schema with 9 interconnected tables
- User Management (Admin & Customers)
- Room Management
- Booking System
- House Rules, Safety Features, Cancellation Policies
- Reviews and Payments tracking
- Admin Audit Logs

### 2. **Authentication System**
- Customer Registration with password hashing
- Customer & Admin Login with JWT tokens
- Token-based authorization
- Role-based access control (Admin/Customer)
- Password security with bcryptjs

### 3. **API Endpoints** (RESTful)
- **Auth**: Register, Login, Get Current User
- **Rooms**: CRUD operations, availability checking
- **Bookings**: Create, read, update, cancel bookings
- **Admin Features**: Room management, booking statistics, audit logs

### 4. **Frontend Integration**
- JavaScript API Client (`js/api-client.js`)
- Updated login/signup to use backend
- Booking system connected to database
- Automatic token management in localStorage
- Fallback to local storage if backend unavailable

### 5. **Security Features**
- Password hashing with bcryptjs
- JWT token authentication
- CORS configuration
- Input validation on all endpoints
- Role-based access control
- Foreign key constraints in database

## 📋 Project Structure

```
dredsss1/
├── api/
│   ├── auth/
│   │   └── auth.js                 # Login, Register endpoints
│   ├── bookings/
│   │   └── bookings.js             # Booking CRUD & statistics
│   └── rooms/
│       └── rooms.js                # Room management & availability
├── config/
│   ├── auth.js                     # JWT utilities
│   ├── database.js                 # SQLite connection
│   └── schema.js                   # Database schema & seeding
├── models/
│   ├── User.js                     # User data operations
│   ├── Room.js                     # Room data operations
│   └── Booking.js                  # Booking data operations
├── scripts/
│   └── setup-db.js                 # Database initialization
├── js/
│   ├── main.js                     # Updated with API integration
│   └── api-client.js               # Frontend API client
├── database/
│   └── dreds.db                    # SQLite database (auto-created)
├── server.js                       # Express app entry point
├── package.json                    # Dependencies
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
└── BACKEND_SETUP.md               # Detailed documentation
```

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
cd dredsss1
npm install
```

### Step 2: Setup Environment
```bash
cp .env.example .env
```

### Step 3: Initialize Database
```bash
npm run db:setup
```

Output will show:
```
Setting up database...
✓ Tables created successfully
✓ Initial data seeded
✓ Default admin user created
  Email: admin@dreds.com
  Password: admin123 (Change this!)
```

### Step 4: Start Backend Server
```bash
npm run dev
```

Or for production:
```bash
npm start
```

Server will run on: `http://localhost:5000`

### Step 5: Open Frontend
Open `index.html` in browser (or use a local server):
```bash
# In another terminal
python -m http.server 8000
```

Then visit: `http://localhost:8000`

## 📊 Database Schema Overview

### Users Table
Stores both admin and customer accounts with password hashing

### Rooms Table
Room details, pricing, capacity, amenities, and status

### Bookings Table
Guest bookings with:
- Check-in/check-out dates
- Guest breakdown (adults, children, infants, pets)
- Service animal declaration
- Payment and booking status
- Total cost calculation

### Supporting Tables
- **house_rules**: Property rules
- **safety_features**: Safety device status
- **cancellation_policies**: Refund policies
- **reviews**: Guest reviews
- **payments**: Payment records
- **admin_logs**: Admin action audit trail

## 🔐 Default Admin Account

**Email**: `admin@dreds.com`
**Password**: `admin123`

⚠️ **IMPORTANT**: Change this password immediately in production!

## 🔌 API Endpoints Summary

### Authentication
```
POST /api/auth/register          - Register new customer
POST /api/auth/login             - Login (returns JWT token)
GET  /api/auth/me                - Get current user info
```

### Rooms
```
GET  /api/rooms                  - Get all rooms
GET  /api/rooms/:id              - Get single room
POST /api/rooms/:id/check-availability  - Check dates
POST /api/rooms                  - Create room (admin)
PUT  /api/rooms/:id              - Update room (admin)
DELETE /api/rooms/:id            - Delete room (admin)
```

### Bookings
```
POST   /api/bookings             - Create booking
GET    /api/bookings/my-bookings - Get user's bookings
GET    /api/bookings/:id         - Get booking details
GET    /api/bookings             - Get all bookings (admin)
PUT    /api/bookings/:id         - Update booking
POST   /api/bookings/:id/cancel  - Cancel booking
GET    /api/bookings/stats/overview - Get stats (admin)
```

## 💻 Using the API from Frontend

```javascript
// The api-client is automatically loaded
// Use it anywhere in your JavaScript:

// Login
api.login('customer@example.com', 'password')
  .then(data => {
    console.log('Logged in as:', data.user);
  });

// Get rooms
api.getRooms()
  .then(data => {
    console.log('Available rooms:', data.rooms);
  });

// Create booking
api.createBooking({
  roomId: 1,
  checkInDate: '2024-06-01',
  checkOutDate: '2024-06-03',
  totalGuests: 2,
  adults: 2
}).then(data => {
  console.log('Booking created:', data.booking);
});
```

## 🛠️ Development Tips

### View Database Directly
SQLite database is stored at `database/dreds.db`

You can inspect it using:
- SQLite Browser: https://sqlitebrowser.org/
- VS Code SQLite extension
- Terminal: `sqlite3 database/dreds.db`

### Check Server Logs
```bash
npm run dev   # Shows all requests and errors in terminal
```

### Test Endpoints with Postman
1. Download Postman
2. Create requests to test:
   - `POST http://localhost:5000/api/auth/login`
   - `GET http://localhost:5000/api/rooms`
   - etc.

### Reset Database
If you need to start fresh:
```bash
rm database/dreds.db
npm run db:setup
```

## 🔄 Frontend-Backend Integration

### Authentication Flow
1. User fills login form
2. Form submits → `handleCustomerLogin()` in main.js
3. API call → `api.login()` in api-client.js
4. Backend validates → `/api/auth/login`
5. Token returned → stored in localStorage
6. User redirected to dashboard

### Booking Flow
1. User selects room & dates
2. Clicks "Check Availability"
3. API checks `/api/rooms/:id/check-availability`
4. Displays availability status
5. User confirms & submits booking
6. API creates booking in database
7. Confirmation shown with booking ID

## ⚙️ Environment Variables

```
PORT=5000                                    # Server port
NODE_ENV=development                         # development/production
JWT_SECRET=your_jwt_secret_key_change_this  # Change in production!
JWT_EXPIRE=7d                               # Token expiration
DB_PATH=./database/dreds.db                 # Database location
ADMIN_EMAIL=admin@dreds.com                 # Default admin email
ADMIN_PASSWORD=admin123                     # Default admin password
```

## 📱 Features by User Type

### Customer Features
✅ Register & Login
✅ View available rooms
✅ Check room availability for dates
✅ Create bookings
✅ View own bookings
✅ Cancel bookings
✅ Leave reviews (database ready)
✅ Track booking status

### Admin Features
✅ Login with admin account
✅ Create/Edit/Delete rooms
✅ View all bookings
✅ Manage booking status
✅ View booking statistics
✅ Manage house rules (in database)
✅ View admin action logs
✅ User management (database ready)

## 🚨 Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### Database connection errors
```bash
rm database/dreds.db
npm run db:setup
```

### Login not working
- Check server is running: `npm run dev`
- Verify token in localStorage (DevTools → Application)
- Check email/password in database

### Booking creation fails
- Ensure user is logged in
- Check availability dates are valid (checkout > check-in)
- Verify room exists and is available

### CORS errors
- Make sure server is running on port 5000
- Update CORS origins in server.js if needed

## 📚 More Information

See `BACKEND_SETUP.md` for:
- Detailed API documentation
- Complete database schema
- Security notes
- Advanced configuration

## 🎯 Next Steps

1. ✅ Database is ready with all tables
2. ✅ API server is built and tested
3. ✅ Frontend is integrated
4. 📌 (Optional) Add email notifications for bookings
5. 📌 (Optional) Implement payment gateway
6. 📌 (Optional) Add room images upload
7. 📌 (Optional) Create admin dashboard UI

## 📞 Support

For detailed API information, check `BACKEND_SETUP.md`

All endpoints are documented with examples.
