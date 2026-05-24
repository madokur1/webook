# Dred's Transient House - Backend Setup Guide

## Overview

This is a complete booking management system with authentication, room management, and booking functionality. The backend uses Node.js/Express and SQLite database.

## Project Structure

```
├── api/
│   ├── auth/              # Authentication endpoints
│   ├── bookings/          # Booking management
│   └── rooms/             # Room management
├── config/
│   ├── database.js        # SQLite connection
│   ├── schema.js          # Database schema and initialization
│   └── auth.js            # JWT authentication
├── models/
│   ├── User.js            # User model
│   ├── Room.js            # Room model
│   └── Booking.js         # Booking model
├── scripts/
│   └── setup-db.js        # Database initialization script
├── js/
│   └── api-client.js      # Frontend API client
├── server.js              # Main server file
├── package.json           # Dependencies
└── .env.example           # Environment variables template
```

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your settings:

```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secure_secret_key_here
JWT_EXPIRE=7d
DB_PATH=./database/dreds.db
ADMIN_EMAIL=admin@dreds.com
ADMIN_PASSWORD=admin123
```

### 3. Initialize Database

Run the setup script to create tables and seed initial data:

```bash
npm run db:setup
```

This will:
- Create all database tables
- Insert initial house rules, safety features, and cancellation policies
- Create the default admin user

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

**Register Customer**
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "password123",
  "fullName": "Juan Dela Cruz",
  "phone": "09918500322"
}
```

**Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@dreds.com",
  "password": "admin123"
}
```

Response:
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "admin@dreds.com",
    "fullName": "Administrator",
    "userType": "admin"
  },
  "token": "eyJhbGc..."
}
```

**Get Current User**
```
GET /api/auth/me
Authorization: Bearer <token>
```

### Rooms

**Get All Rooms**
```
GET /api/rooms
```

**Get Single Room**
```
GET /api/rooms/:id
```

**Create Room (Admin Only)**
```
POST /api/rooms
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Lorheine Room",
  "description": "Spacious room with...",
  "pricePerNight": 1500,
  "capacity": 4,
  "amenities": "WiFi, AC, Hot Water",
  "imageUrl": "assets/images/lorheine1.jpg"
}
```

**Check Room Availability**
```
POST /api/rooms/:id/check-availability
Content-Type: application/json

{
  "checkInDate": "2024-06-01",
  "checkOutDate": "2024-06-03"
}
```

**Update Room (Admin Only)**
```
PUT /api/rooms/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "price_per_night": 1800,
  "status": "available"
}
```

**Delete Room (Admin Only)**
```
DELETE /api/rooms/:id
Authorization: Bearer <admin-token>
```

### Bookings

**Create Booking**
```
POST /api/bookings
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "roomId": 1,
  "checkInDate": "2024-06-01",
  "checkOutDate": "2024-06-03",
  "totalGuests": 2,
  "adults": 2,
  "children": 0,
  "infants": 0,
  "pets": 0,
  "serviceAnimal": false,
  "notes": "Need extra pillows"
}
```

**Get My Bookings**
```
GET /api/bookings/my-bookings
Authorization: Bearer <customer-token>
```

**Get Single Booking**
```
GET /api/bookings/:id
Authorization: Bearer <token>
```

**Get All Bookings (Admin Only)**
```
GET /api/bookings?bookingStatus=confirmed&paymentStatus=paid
Authorization: Bearer <admin-token>
```

**Update Booking**
```
PUT /api/bookings/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking_status": "checked_in",
  "payment_status": "paid"
}
```

**Cancel Booking**
```
POST /api/bookings/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Change of plans"
}
```

**Get Booking Statistics (Admin Only)**
```
GET /api/bookings/stats/overview
Authorization: Bearer <admin-token>
```

## Frontend Integration

### Using the API Client

Include the API client in your HTML:

```html
<script src="js/api-client.js"></script>
```

Then use it in your JavaScript:

```javascript
// Register
api.register('customer@example.com', 'password', 'Juan Dela Cruz', '09918500322')
  .then(data => {
    api.setToken(data.token);
    console.log('User created:', data.user);
  });

// Login
api.login('admin@dreds.com', 'admin123')
  .then(data => {
    api.setToken(data.token);
    console.log('Logged in as:', data.user);
  });

// Get rooms
api.getRooms()
  .then(data => console.log('Rooms:', data.rooms));

// Create booking
api.createBooking({
  roomId: 1,
  checkInDate: '2024-06-01',
  checkOutDate: '2024-06-03',
  totalGuests: 2,
  adults: 2
}).then(data => console.log('Booking created:', data.booking));
```

## Database Schema

### Users Table
- `id`: Primary key
- `email`: Unique email address
- `password`: Hashed password
- `full_name`: User's full name
- `phone`: Contact number
- `user_type`: 'admin' or 'customer'
- `status`: 'active', 'inactive', or 'banned'
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### Rooms Table
- `id`: Primary key
- `name`: Room name (unique)
- `description`: Room details
- `price_per_night`: Nightly rate
- `capacity`: Maximum guests
- `amenities`: Comma-separated list
- `image_url`: Room image path
- `status`: 'available', 'maintenance', 'unavailable'
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Bookings Table
- `id`: Primary key
- `user_id`: Customer ID (FK)
- `room_id`: Room ID (FK)
- `check_in_date`: Check-in date
- `check_out_date`: Check-out date
- `total_guests`: Number of guests
- `adults`, `children`, `infants`, `pets`: Guest breakdown
- `service_animal`: Boolean
- `total_price`: Booking cost
- `payment_status`: 'pending', 'paid', 'cancelled', 'refunded'
- `booking_status`: 'confirmed', 'checked_in', 'checked_out', 'cancelled'
- `notes`: Special requests
- `created_at`: Booking creation timestamp
- `updated_at`: Last update timestamp

### Other Tables
- **house_rules**: Store property rules
- **safety_features**: Track safety devices
- **cancellation_policies**: Define refund policies
- **reviews**: Customer reviews
- **payments**: Payment transactions
- **admin_logs**: Admin action audit trail

## Authentication

The system uses JWT (JSON Web Tokens) for authentication.

- When a user logs in, they receive a token
- Include the token in the `Authorization` header: `Bearer <token>`
- Tokens expire based on `JWT_EXPIRE` setting (default: 7 days)
- Admin endpoints require `user_type: 'admin'`

## Default Admin Account

- Email: `admin@dreds.com`
- Password: `admin123`

**IMPORTANT**: Change the default password immediately in production!

## Troubleshooting

### Database not connecting
- Check if `database/` directory exists (created automatically)
- Ensure `DB_PATH` in `.env` is correct
- Try deleting `database/` and running `npm run db:setup` again

### Auth token errors
- Generate a new JWT_SECRET in `.env`
- Clear browser localStorage and log in again
- Check token expiration with `JWT_EXPIRE`

### CORS errors
- Update CORS origins in `server.js` to match your frontend URL
- Ensure requests include proper headers

## Development Tips

- Use an API client like Postman to test endpoints
- Check `console.log` output in terminal for debugging
- Database file is in `database/dreds.db` (SQLite)
- Logs show in terminal when running with `npm run dev`

## Security Notes

- Change `JWT_SECRET` in production
- Change default admin password immediately
- Use HTTPS in production
- Implement rate limiting
- Validate all user inputs
- Use environment variables for sensitive data
- Keep `node_modules` and `.env` out of version control

## Support

For issues or questions, check the API response messages and server logs.
