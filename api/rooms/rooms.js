const express = require('express');
const Room = require('../../models/Room');
const { authenticateToken, authorizeRole } = require('../../config/auth');

const router = express.Router();

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.findAll();
    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching rooms', error: err.message });
  }
});

// Get room by ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ room });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching room', error: err.message });
  }
});

// Create room (admin only)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { name, description, pricePerNight, capacity, amenities, imageUrl } = req.body;

    if (!name || !pricePerNight || !capacity) {
      return res.status(400).json({ message: 'Required fields: name, pricePerNight, capacity' });
    }

    const room = await Room.create(name, description, pricePerNight, capacity, amenities, imageUrl);
    res.status(201).json({ message: 'Room created', room });
  } catch (err) {
    res.status(500).json({ message: 'Error creating room', error: err.message });
  }
});

// Update room (admin only)
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    await Room.update(req.params.id, req.body);
    const room = await Room.findById(req.params.id);
    res.json({ message: 'Room updated', room });
  } catch (err) {
    res.status(500).json({ message: 'Error updating room', error: err.message });
  }
});

// Delete room (admin only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    await Room.delete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting room', error: err.message });
  }
});

// Check availability
router.post('/:id/check-availability', async (req, res) => {
  try {
    const { checkInDate, checkOutDate } = req.body;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Check-in and check-out dates are required' });
    }

    const isAvailable = await Room.getAvailability(req.params.id, checkInDate, checkOutDate);
    res.json({ available: isAvailable });
  } catch (err) {
    res.status(500).json({ message: 'Error checking availability', error: err.message });
  }
});

module.exports = router;
