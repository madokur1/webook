# 🏡 Dred's Transient House - Complete System Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (HTML/CSS/JS)                    │
│  index.html, login.html, booking.html, customer-dashboard.html  │
│  ├─ Integrated API Client (js/api-client.js)                    │
│  ├─ Main Script (js/main.js) - Updated for Backend              │
│  └─ Auto-fallback to localStorage if server unavailable         │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP/JSON (Axios via Fetch)
                       │ Port 5000
┌──────────────────────┴──────────────────────────────────────────┐
│                    NODE.JS EXPRESS SERVER                        │
│  (server.js + api/ routes)                                       │
├──────────────────────────────────────────────────────────────────┤
│  ├─ /api/auth      - Authentication (Login, Register)           │
│  ├─ /api/rooms     - Room Management                            │
│  ├─ /api/bookings  - Booking System                             │
│  └─ Models (User, Room, Booking) + Database Operations          │
└──────────────────────┬──────────────────────────────────────────┘
                       │ SQL Queries
                       │
┌──────────────────────┴──────────────────────────────────────────┐
│                   SQLITE DATABASE                                │
│  (database/dreds.db - Auto-created)                             │
├──────────────────────────────────────────────────────────────────┤
│  Tables:                                                          │
│  ├─ users (Admin + Customers with encrypted passwords)          │
│  ├─ rooms (Available accommodations)                            │
│  ├─ bookings (Guest reservations)                               │
│  ├─ house_rules, safety_features, cancellation_policies         │
│  ├─ reviews, payments, admin_logs                               │
│  └─ Foreign key relationships for data integrity                │
└──────────────────────────────────────────────────────────────────┘
```

## 📦 Complete File Structure

```
dredsss1/
├── 📄 Configuration Files
│   ├── package.json                 ← Dependencies & scripts
│   ├── .env                        ← Environment variables (gitignored)
│   ├── .env.example                ← Template for .env
│   └── .gitignore                  ← Git ignore rules
│
├── 🖥️ Backend Server
│   ├── server.js                   ← Express app entry point
│   ├── config/
│   │   ├── database.js             ← SQLite connection setup
│   │   ├── schema.js               ← Database tables & initial data
│   │   └── auth.js                 ← JWT utilities
│   ├── models/
│   │   ├── User.js                 ← User operations & auth
│   │   ├── Room.js                 ← Room CRUD & availability
│   │   └── Booking.js              ← Booking operations
│   ├── api/
│   │   ├── auth/auth.js            ← Login/Register endpoints
│   │   ├── rooms/rooms.js          ← Room management endpoints
│   │   └── bookings/bookings.js    ← Booking endpoints
│   └── scripts/
│       └── setup-db.js             ← Initialize database
│
├── 🎨 Frontend
│   ├── index.html                  ← Home page
│   ├── login.html                  ← Login/Register
│   ├── customer-dashboard.html     ← User dashboard
│   ├── pages/
│   │   ├── booking.html            ← Booking page
│   │   ├── rooms.html              ← Rooms listing
│   │   ├── about.html              ← About page
│   │   └── amenities.html          ← Amenities
│   ├── style.css                   ← Global styling
│   ├── js/
│   │   ├── main.js                 ← Main logic (updated for API)
│   │   └── api-client.js           ← API client library
│   └── admin/                      ← Admin panel files
│
├── 📁 Database
│   └── database/
│       └── dreds.db                ← SQLite file (auto-created)
│
└── 📚 Documentation
    ├── README.md                   ← This file
    ├── BACKEND_SETUP.md            ← Detailed backend docs
    └── IMPLEMENTATION_GUIDE.md     ← Quick start & features
```

## 🚀 Getting Started (5 Minutes)

### 1. Install Dependencies
```bash
cd dredsss1
npm install
```

### 2. Initialize Database
```bash
npm run db:setup
```

### 3. Start Backend Server
```bash
npm run dev
```

You should see:
```
╔══════════════════════════════════════════╗
║  Dred's Transient House API Server      ║
║  Running on: http://localhost:5000       ║
║  Environment: development                ║
╚══════════════════════════════════════════╝
```

### 4. Open Frontend in Browser
- Direct: Open `index.html` in your browser
- With server: Run `python -m http.server 8000` and visit `http://localhost:8000`

### 5. Test Login
- Email: `admin@dreds.com`
- Password: `admin123`

**That's it!** ✅ The system is ready.

## 📊 Database Tables

### 1. **users**
```sql
- id (Primary Key)
- email (Unique)
- password (Hashed with bcryptjs)
- full_name
- phone
- user_type ('admin' or 'customer')
- status ('active', 'inactive', 'banned')
- created_at, updated_at (Timestamps)
```

### 2. **rooms**
```sql
- id (Primary Key)
- name (Unique)
- description
- price_per_night
- capacity
- amenities (JSON/String)
- image_url
- status ('available', 'maintenance', 'unavailable')
- created_at, updated_at
```

### 3. **bookings**
```sql
- id (Primary Key)
- user_id (Foreign Key → users)
- room_id (Foreign Key → rooms)
- check_in_date, check_out_date
- total_guests, adults, children, infants, pets
- service_animal (Boolean)
- total_price
- payment_status ('pending', 'paid', 'cancelled', 'refunded')
- booking_status ('confirmed', 'checked_in', 'checked_out', 'cancelled')
- notes
- created_at, updated_at
```

### 4-9. **Supporting Tables**
- `house_rules` - Property rules (Check-in time, pets, etc.)
- `safety_features` - Safety devices (Fire alarm, CO alarm, etc.)
- `cancellation_policies` - Refund policies
- `reviews` - Guest reviews
- `payments` - Payment transactions
- `admin_logs` - Audit trail of admin actions

## 🔐 Authentication System

### JWT (JSON Web Tokens)
- Issued on login/registration
- Stored in browser's localStorage
- Sent with every API request via `Authorization: Bearer <token>`
- Expires in 7 days (configurable)

### Password Security
- Hashed with bcryptjs (10 salt rounds)
- Never stored in plain text
- Compared securely on login

### Role-Based Access
- **Admin**: Can create/edit/delete rooms, view all bookings, manage settings
- **Customer**: Can only view/create/cancel their own bookings

## 🔌 API Usage Examples

### Register New Customer
```javascript
api.register('john@example.com', 'password123', 'John Doe', '09918500322')
  .then(response => {
    console.log('User created:', response.user);
    console.log('Token:', response.token);
  });
```

### Login
```javascript
api.login('john@example.com', 'password123')
  .then(response => {
    api.setToken(response.token); // Store token
    console.log('Welcome:', response.user.fullName);
  });
```

### Create Booking
```javascript
api.createBooking({
  roomId: 1,
  checkInDate: '2024-06-01',
  checkOutDate: '2024-06-03',
  totalGuests: 2,
  adults: 2,
  children: 0,
  infants: 0,
  pets: 0,
  serviceAnimal: false,
  notes: 'Late arrival'
})
  .then(booking => {
    console.log('Booking confirmed! ID:', booking.id);
  });
```

### Get My Bookings
```javascript
api.getMyBookings()
  .then(response => {
    console.log('Your bookings:', response.bookings);
  });
```

### Check Room Availability
```javascript
api.checkRoomAvailability(1, '2024-06-01', '2024-06-03')
  .then(response => {
    console.log('Room available:', response.available);
  });
```

## 🛠️ Development Workflow

### Check API Health
```bash
curl http://localhost:5000/api/health
# Response: { "status": "ok", "message": "Server is running" }
```

### View Database
Using SQLite Browser:
1. Download from https://sqlitebrowser.org/
2. Open `database/dreds.db`
3. Browse tables and data

### Debug API Calls
Open browser DevTools (F12):
1. Network tab → See all API requests
2. Application tab → localStorage to check token
3. Console → View logged messages

### Run Database Setup Again
```bash
# This will recreate tables and reset to defaults
npm run db:setup
```

## 🔄 Frontend Integration Points

### 1. **Login Page** (`login.html`)
- Form submits → `handleCustomerLogin()` in main.js
- Calls `api.login()` → Backend validates
- Token stored in localStorage
- Redirect to dashboard on success

### 2. **Sign Up** (`login.html`)
- Form submits → `handleCustomerSignUp()` in main.js
- Calls `api.register()` → Backend creates user
- Auto-login and redirect

### 3. **Booking Page** (`pages/booking.html`)
- User selects room, dates, guest info
- "Check Availability" button checks dates via API
- "Book Now" button creates booking in database
- Confirmation with booking ID

### 4. **Dashboard** (`customer-dashboard.html`)
- Shows user's bookings from database
- Can cancel bookings (updates status in database)
- Displays booking status and details

## ⚙️ Configuration

### Change Admin Password
Edit `.env`:
```env
ADMIN_PASSWORD=newSecurePassword123
```

Then reinitialize database:
```bash
npm run db:setup
```

### Change Server Port
Edit `.env`:
```env
PORT=3000  # Instead of 5000
```

Then restart server.

### Increase Token Expiration
Edit `.env`:
```env
JWT_EXPIRE=30d  # Instead of 7d
```

## 📱 Features Summary

### For Customers ✨
✅ Create account with email & password  
✅ Login/Logout securely  
✅ View available rooms  
✅ Check availability for dates  
✅ Make reservations  
✅ View own bookings  
✅ Cancel bookings  
✅ Manage profile  

### For Admin 🔧
✅ Admin login  
✅ Create/edit/delete rooms  
✅ View all bookings  
✅ Manage booking status  
✅ View statistics  
✅ Manage house rules  
✅ Manage safety features  
✅ View admin logs  

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot find module 'express'" | Run `npm install` |
| Database connection error | Check `DB_PATH` in `.env`, delete `database/` folder and run `npm run db:setup` |
| Login fails | Verify email/password, check if user exists in database |
| "Port 5000 already in use" | Change `PORT` in `.env` or kill existing process |
| CORS errors | Server and frontend must have correct baseURL in api-client.js |
| Bookings not saving | Ensure user is logged in and token is valid |

## 📖 Detailed Documentation

- **BACKEND_SETUP.md** - Complete API reference with all endpoints
- **IMPLEMENTATION_GUIDE.md** - Quick start, features, and troubleshooting

## 🔒 Security Checklist

- [ ] Change default admin password in `.env`
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Use HTTPS in production
- [ ] Set `NODE_ENV=production`
- [ ] Implement rate limiting
- [ ] Validate all user inputs (already done in backend)
- [ ] Use environment variables for all secrets
- [ ] Keep `node_modules` and `.env` out of git

## 🚀 Production Deployment

### Before Going Live:
1. Change all default passwords
2. Generate strong JWT_SECRET
3. Set NODE_ENV=production in .env
4. Setup HTTPS/SSL certificate
5. Configure CORS for your domain
6. Setup automated backups for database
7. Implement monitoring & logging
8. Test all critical flows

### Deployment Options:
- **Heroku**: `npm start` uses PORT from environment
- **AWS**: EC2 instance with Node.js
- **DigitalOcean**: App Platform or Droplet
- **Docker**: Containerize with Dockerfile

## 📞 Support & Help

### Check Documentation
1. BACKEND_SETUP.md - API endpoints
2. IMPLEMENTATION_GUIDE.md - Features & troubleshooting
3. This README - System overview

### Debug Tips
- Check terminal logs when running `npm run dev`
- Use browser DevTools Network tab to inspect API calls
- Check localStorage for auth token
- Look at SQLite database directly to verify data

## 📝 Version Info

- **Node.js**: 14.0+
- **Express**: 4.18.2
- **SQLite**: 5.1.6
- **Database**: SQLite3
- **Auth**: JWT with bcryptjs

## 📄 License

This is a complete booking management system for Dred's Transient House.

---

**Happy coding!** 🎉

For questions or issues, refer to the detailed documentation files.
