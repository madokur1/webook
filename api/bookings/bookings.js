const express = require('express');
const Booking = require('../../models/Booking');
const Room = require('../../models/Room');
const { authenticateToken, authorizeRole } = require('../../config/auth');

const router = express.Router();

// Create booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate, totalGuests, adults, children, infants, pets, serviceAnimal, notes } = req.body;
    const userId = req.user.id;

    if (!roomId || !checkInDate || !checkOutDate || !totalGuests) {
      return res.status(400).json({ message: 'Missing required booking fields' });
    }

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check availability
    const isAvailable = await Room.getAvailability(roomId, checkInDate, checkOutDate);
    if (!isAvailable) {
      return res.status(409).json({ message: 'Room is not available for selected dates' });
    }

    // Calculate number of nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return res.status(400).json({ message: 'Invalid check-in/check-out dates' });
    }

    const totalPrice = room.price_per_night * nights;

    const booking = await Booking.create(
      userId,
      roomId,
      checkInDate,
      checkOutDate,
      totalGuests,
      adults || 0,
      children || 0,
      infants || 0,
      pets || 0,
      serviceAnimal || false,
      totalPrice,
      notes || ''
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking: { ...booking, totalNights: nights }
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ message: 'Error creating booking', error: err.message });
  }
});

// Get user's bookings
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.findByUserId(req.user.id);
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bookings', error: err.message });
  }
});

// Get booking by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (booking.user_id !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching booking', error: err.message });
  }
});

// Get all bookings (admin only)
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const filters = {
      bookingStatus: req.query.bookingStatus,
      paymentStatus: req.query.paymentStatus,
      roomId: req.query.roomId
    };

    const bookings = await Booking.findAll(filters);
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bookings', error: err.message });
  }
});

// Update booking status
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (booking.user_id !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Booking.update(req.params.id, req.body);
    const updated = await Booking.findById(req.params.id);

    res.json({ message: 'Booking updated', booking: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating booking', error: err.message });
  }
});

// Cancel booking
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (booking.user_id !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (booking.booking_status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    const reason = req.body.reason || 'Cancelled by user';
    await Booking.cancel(req.params.id, reason);

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling booking', error: err.message });
  }
});

// Get booking stats (admin only)
router.get('/stats/overview', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const stats = await Booking.getStats();
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
});

// Get analytics summary and trends for dashboard
router.get('/stats/analytics', async (req, res) => {
  try {
    const summary = await Booking.getAnalyticsSummary();
    const trends = await Booking.getMonthlyTrends(new Date().getFullYear());

    await Booking.saveAnalyticsSnapshot({
      snapshot_date: new Date().toISOString().split('T')[0],
      total_rooms: summary.total_rooms,
      total_capacity: summary.total_capacity,
      pending_bookings: summary.pending_bookings,
      confirmed_bookings: summary.confirmed_bookings,
      currently_checked_in: summary.currently_checked_in,
      total_revenue: summary.total_revenue,
      total_guests: summary.total_guests,
      occupancy_rate: summary.occupancy_rate,
      monthly_bookings: trends.bookingsByMonth,
      monthly_revenue: trends.revenueByMonth
    });

    res.json({ summary, trends });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching analytics', error: err.message });
  }
});

// Get recent analytics snapshots
router.get('/stats/snapshots', async (req, res) => {
  try {
    const snapshots = await Booking.getRecentSnapshots(5);
    res.json({ snapshots });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching snapshot history', error: err.message });
  }
});

router.post('/stats/report', async (req, res) => {
  try {
    const { reportName, reportType, generatedBy, format, summary } = req.body;
    const report = await Booking.saveReportEntry(
      reportName || 'Admin Analytics Export',
      reportType || 'dashboard',
      generatedBy || 'admin',
      format || 'json',
      summary ? JSON.stringify(summary) : null
    );
    res.json({ reportId: report.id });
  } catch (err) {
    res.status(500).json({ message: 'Error saving report', error: err.message });
  }
});

module.exports = router;
