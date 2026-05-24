const express = require('express');
const db = require('../../config/database');
const User = require('../../models/User');
const { generateToken, authenticateToken } = require('../../config/auth');
const { sendMail } = require('../../config/mail');

const router = express.Router();

function createVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function createVerificationRecord(userId, code) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15).toISOString();
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO user_verifications (user_id, code, expires_at) VALUES (?, ?, ?)',
      [userId, code, expiresAt],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

function findVerificationRecord(userId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM user_verifications WHERE user_id = ?',
      [userId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}

function clearVerificationRecord(userId) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM user_verifications WHERE user_id = ?', [userId], function(err) {
      if (err) reject(err);
      else resolve(true);
    });
  });
}

async function sendVerificationEmail(email, fullName, code) {
  if (!email) return;

  const subject = 'Verify your Dred\'s Transient account';
  const text = `Hi ${fullName || 'guest'},\n\nYour verification code is ${code}. Enter this code in the app to complete account setup.\n\nIf you didn't request this, please ignore this message.`;
  const html = `
    <p>Hi ${fullName || 'guest'},</p>
    <p>Your verification code is <strong>${code}</strong>.</p>
    <p>Enter this code in the registration form to complete your account setup.</p>
    <p>If you didn't request this, you can ignore this email.</p>
    <p>Thank you,<br />Dred's Transient Team</p>
  `;

  await sendMail({
    to: email,
    subject,
    text,
    html
  });
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone, userType } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Email, password, and full name are required' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const type = userType === 'admin' ? 'customer' : 'customer';
    const user = await User.create(email, password, fullName, phone, type, 'Staff', 'active');

    res.status(201).json({
      message: 'Registration successful.',
      user: { id: user.id, email: user.email, fullName: user.fullName, userType: user.userType }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// Verify account
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.status === 'active') {
      return res.status(400).json({ message: 'Account is already verified' });
    }

    const record = await findVerificationRecord(user.id);
    if (!record) {
      return res.status(400).json({ message: 'No verification request was found for that account' });
    }
    if (Date.now() > new Date(record.expires_at).getTime()) {
      await clearVerificationRecord(user.id);
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
    }
    if (record.code !== code.trim()) {
      return res.status(400).json({ message: 'Verification code is incorrect' });
    }

    await User.update(user.id, { status: 'active' });
    await clearVerificationRecord(user.id);

    const token = generateToken(user.id, user.email, user.user_type);
    res.json({
      message: 'Account verified successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        userType: user.user_type
      },
      token
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'inactive' || user.status === 'banned') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    const isPasswordValid = await User.verifyPassword(user.password, password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.email, user.user_type);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        userType: user.user_type
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        userType: user.user_type,
        status: user.status
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
});

module.exports = router;
