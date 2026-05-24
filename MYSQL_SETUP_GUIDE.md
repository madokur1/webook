# PHP MySQL Login & Registration Setup Guide

## ✅ COMPLETE SETUP INSTRUCTIONS FOR XAMPP & phpMyAdmin

### STEP 1: Start XAMPP Services
1. **Open XAMPP Control Panel**
   - On Windows: Click "XAMPP Control Panel" from Start Menu
   - Look for the main XAMPP window

2. **Start Apache & MySQL**
   - Click "Start" next to **Apache** (should turn green)
   - Click "Start" next to **MySQL** (should turn green)
   - Wait for both to say "Running"

3. **Verify Installation**
   - Open browser: `http://localhost`
   - Should see XAMPP landing page

---

### STEP 2: Create Database in phpMyAdmin

1. **Open phpMyAdmin**
   - Go to: `http://localhost/phpmyadmin`
   - Login (default: username=root, password=blank)

2. **Create New Database**
   - Click "New" button on left side
   - Database name: `dreds_transient`
   - Collation: `utf8_general_ci`
   - Click "Create"

3. **Create Users Table**
   - Click on `dreds_transient` database
   - Click "SQL" tab at top
   - Copy and paste this SQL code:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_email ON users(email);
```

   - Click "Go" button
   - Success! Table created ✓

---

### STEP 3: File Placement (IMPORTANT!)

Your XAMPP files go in: `C:\xampp\htdocs\dredsss1\`

**File Structure:**
```
dredsss1/
├── config/
│   ├── db.php              ← Database connection
│   └── check-session.php   ← Session verification
├── api/
│   └── auth/
│       ├── login.php       ← Login handler
│       ├── register.php    ← Registration handler
│       └── logout.php      ← Logout handler
├── js/
│   └── auth.js             ← Frontend authentication logic
├── database/
│   └── users-setup.sql     ← SQL schema
├── dashboard.php           ← Logged-in user page
├── login.html              ← Login page (updated)
├── style.css               ← Your CSS (unchanged)
└── other files...
```

---

### STEP 4: Configure Database Connection

**File: `/config/db.php`**

The file is already configured for XAMPP defaults:
```php
$servername = "localhost";
$db_username = "root";      // XAMPP default
$db_password = "";          // XAMPP default (empty)
$database = "dreds_transient";
```

**If you changed MySQL credentials, update these values.**

---

### STEP 5: Update Your HTML

Your `login.html` now includes `auth.js` which handles all form submissions:

```html
<script src="js/auth.js"></script>
```

No changes needed to your form HTML - it stays the same!

---

### STEP 6: Test the System

1. **Open login page**
   - Go to: `http://localhost/dredsss1/login.html`

2. **Test Registration**
   - Click "Create Account" tab
   - Fill in: Name, Email, Password, Confirm Password
   - Click "Create account"
   - Should see success message

3. **Test Login**
   - Use the email/password you just created
   - Click "Sign In"
   - Should redirect to `dashboard.php`
   - Should show your name and email

4. **Test Logout**
   - Click "Logout" button on dashboard
   - Should redirect back to login.html

5. **Check Database (phpMyAdmin)**
   - Go to: `http://localhost/phpmyadmin`
   - Click `dreds_transient` → `users` table
   - Should see your registered users
   - Password is hashed (bcrypt) - never shows in plain text ✓

---

## 📁 FILE DESCRIPTIONS

### `/config/db.php`
**Purpose:** Connect to MySQL database
- Uses MySQLi (modern method)
- Sets charset to UTF-8
- Handles connection errors

**Usage:** Every auth file requires this:
```php
require_once '../../config/db.php';
```

---

### `/config/check-session.php`
**Purpose:** Verify user is logged in
- Checks session exists
- Enforces 30-minute timeout
- Redirects to login if expired

**Usage:** At the top of protected pages:
```php
require_once 'config/check-session.php';
```

---

### `/api/auth/register.php`
**Purpose:** Handle user registration
**Features:**
- ✓ Validates all form fields
- ✓ Checks email format
- ✓ Checks password strength (min 6 chars)
- ✓ Prevents duplicate emails
- ✓ Hashes password with bcrypt
- ✓ Prevents SQL injection (prepared statements)
- ✓ Returns JSON response

**Form Data Expected:**
- full_name (string)
- email (string)
- password (string, min 6 chars)
- confirm_password (string, must match)

---

### `/api/auth/login.php`
**Purpose:** Handle user login
**Features:**
- ✓ Validates email/password
- ✓ Finds user in database
- ✓ Verifies password against hash
- ✓ Creates session on success
- ✓ Optional remember-me cookie
- ✓ Prevents SQL injection (prepared statements)
- ✓ Generic error messages (security)
- ✓ Returns JSON response

**Form Data Expected:**
- email (string)
- password (string)
- remember (optional)

---

### `/api/auth/logout.php`
**Purpose:** Destroy session and log out user
**Features:**
- ✓ Clears all session variables
- ✓ Destroys session
- ✓ Clears cookies
- ✓ Redirects to login

**No form data needed** - just direct user to this file.

---

### `/js/auth.js`
**Purpose:** Frontend form handling
**Features:**
- ✓ Form validation before submission
- ✓ Calls PHP endpoints
- ✓ Shows error messages
- ✓ Handles loading states
- ✓ Password toggle visibility
- ✓ Form switching (login/signup tabs)

**No configuration needed** - works out of the box!

---

### `/dashboard.php`
**Purpose:** User dashboard after login
**Features:**
- ✓ Requires login to view
- ✓ Shows user name and email
- ✓ Shows login time
- ✓ Logout button
- ✓ Links to booking page
- ✓ Fully styled dashboard

**Automatically checks session** via check-session.php

---

## 🔐 SECURITY FEATURES

✅ **Password Hashing:** bcrypt (industry standard)
- Even database admin can't see passwords
- One-way encryption - can't be reversed
- `password_verify()` compares hashes safely

✅ **SQL Injection Prevention:** Prepared Statements
- All database queries use `?` placeholders
- Prevents malicious SQL code injection
- Used in: registration, login, email checking

✅ **Session Management:**
- Session storage on server (not client)
- Unique session IDs for each user
- 30-minute inactivity timeout
- Automatic session refresh on activity

✅ **Input Validation:**
- Email format validation
- Password strength requirements (min 6 chars)
- Name length requirements
- HTML sanitization in output

✅ **Error Handling:**
- Generic error messages (don't reveal if email exists)
- Server-side validation
- Prevents user enumeration attacks

---

## 🚀 USEFUL COMMANDS

### View All Users (phpMyAdmin)
```sql
SELECT id, full_name, email, created_at FROM users;
```

### Delete a User
```sql
DELETE FROM users WHERE email = 'user@example.com';
```

### Reset All Data
```sql
DELETE FROM users;
```

### Check Password (Don't Display)
```sql
SELECT email, password FROM users LIMIT 1;
-- Don't copy this hash - it won't work for login!
```

---

## ❌ COMMON ISSUES & FIXES

### "Connection failed"
- **Problem:** MySQL not running
- **Fix:** Start MySQL in XAMPP Control Panel

### "Database not found"
- **Problem:** Database name wrong
- **Fix:** Check `dreds_transient` exists in phpMyAdmin

### "Email already registered"
- **Problem:** User already has account
- **Fix:** Use different email or login

### "Invalid email or password"
- **Problem:** Wrong email/password combination
- **Fix:** Check capitalization and spaces

### Page shows blank/error
- **Problem:** File path wrong or server not running
- **Fix:** 
  1. Check Apache is running
  2. Check file path starts with `/dredsss1/`
  3. Check URL is `http://localhost/dredsss1/`

### Forms not submitting
- **Problem:** JavaScript not loaded or auth.js path wrong
- **Fix:** 
  1. Open browser console (F12)
  2. Check for JavaScript errors
  3. Verify `js/auth.js` path in HTML

---

## 📝 NEXT STEPS

1. ✅ Start XAMPP (Apache + MySQL)
2. ✅ Create database in phpMyAdmin
3. ✅ Copy all files to `C:\xampp\htdocs\dredsss1\`
4. ✅ Test at `http://localhost/dredsss1/login.html`
5. ✅ Create a test account
6. ✅ Login and check dashboard
7. ✅ Verify user appears in phpMyAdmin

---

## 🎓 LEARNING TIPS

To understand how the code works:

1. **Start with login.html** - See the form structure
2. **Then look at js/auth.js** - See frontend validation
3. **Then check api/auth/login.php** - See database interaction
4. **Finally check config/db.php** - See connection setup

Each file has comments explaining what it does!

---

## 📞 TROUBLESHOOTING CHECKLIST

Before asking for help, verify:

- [ ] XAMPP Apache running (green)
- [ ] XAMPP MySQL running (green)
- [ ] Database `dreds_transient` exists in phpMyAdmin
- [ ] Table `users` exists with correct columns
- [ ] All files copied to correct folder paths
- [ ] Using correct URL: `http://localhost/dredsss1/`
- [ ] No browser console errors (F12)
- [ ] JavaScript enabled in browser

---

**You're all set! Happy coding!** 🎉

For questions about specific functions, read the comments in each PHP file.
