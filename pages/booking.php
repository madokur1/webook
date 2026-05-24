<?php
/**
 * AUTHENTICATED BOOKING PAGE
 * 
 * Location: /pages/booking.php
 * Purpose: Shows booking page only for authenticated users
 * 
 * If user is NOT logged in, shows a sign-in prompt.
 * If user IS logged in, shows the full booking form.
 */

session_start();

// Check if user is logged in
$isLoggedIn = isset($_SESSION['user_id']) && isset($_SESSION['user_email']);
// Pull user details from session for display
$user_name = $_SESSION['user_name'] ?? '';
$user_email = $_SESSION['user_email'] ?? '';
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking | Dred's Transient</title>
  <link rel="stylesheet" href="../style.css" />
</head>
<body>
  <nav class="navbar" id="navbar">
    <div class="nav-inner">
      <a href="../index.html" class="nav-logo">
        <span class="logo-icon">🏡</span>
        <span class="logo-text">Dred's <em>Transient</em></span>
      </a>
      <ul class="nav-links">
        <li><a href="../index.html">Home</a></li>
        <li><a href="rooms.html">Rooms</a></li>
        <li><a href="amenities.html">Amenities</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="booking.php" class="nav-cta active">Book Now</a></li>
      </ul>
      <div class="nav-actions">
        <?php if ($isLoggedIn): ?>
          <button class="btn-ghost customerLogout" type="button">Sign Out</button>
        <?php else: ?>
          <a href="../login.html" class="btn-primary">Sign In</a>
        <?php endif; ?>
      </div>
      <button class="burger" id="burger" aria-label="Toggle Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="mobile-menu" id="mobileMenu">
      <a href="../index.html">Home</a>
      <a href="rooms.html">Rooms</a>
      <a href="amenities.html">Amenities</a>
      <a href="about.html">About</a>
      <a href="booking.php">Book Now</a>
      <?php if ($isLoggedIn): ?>
        <a href="#" class="customerLogout">Sign Out</a>
      <?php else: ?>
        <a href="../login.html">Sign In</a>
      <?php endif; ?>
    </div>
  </nav>

  <section class="page-section" id="bookingPage">
    <div class="container">
      <!-- SHOW LOGIN NOTICE ONLY IF NOT AUTHENTICATED -->
      <?php if (!$isLoggedIn): ?>
        <div id="loginRequiredNotice" class="login-required-notice">
          <div class="notice-content">
            <span class="notice-icon">⚠️</span>
            <div class="notice-text">
              <h3>Sign In Required</h3>
              <p>You need to sign in to your account before you can check availability or make a booking.</p>
              <a href="../login.html" class="btn-primary" style="display: inline-block; margin-top: 10px;">Sign In Now</a>
            </div>
          </div>
        </div>
      <?php endif; ?>

      <!-- SHOW BOOKING FORM ONLY IF AUTHENTICATED -->
      <?php if ($isLoggedIn): ?>
        <div class="section-header reveal">
          <span class="section-tag">Check Availability</span>
          <h1>Reserve your room today</h1>
          <p>Search available rooms for your chosen dates and complete your booking with a quick form.</p>
        </div>

        <div class="booking-panel reveal page-enter">
          <form id="bookingForm" class="booking-form" novalidate>
            <div class="form-row">
              <div class="form-group">
                <label for="bookingName">Full Name</label>
                <input type="text" id="bookingName" placeholder="Juan dela Cruz" required />
              </div>
              <div class="form-group">
                <label for="bookingEmail">Email</label>
                <input type="email" id="bookingEmail" placeholder="you@example.com" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="bookingPhone">Phone Number</label>
                <input type="tel" id="bookingPhone" placeholder="0991 850 0322" required />
              </div>
              <div class="form-group">
                <label for="bookingGuests">Total Guests</label>
                <select id="bookingGuests" required>
                  <option value="1-5">1–5</option>
                  <option value="6-10">6–10</option>
                  <option value="11-20">11–20</option>
                  <option value="21-50">21–50</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="bookingAdults">Adults <small>(Age 13+)</small></label>
                <input type="number" id="bookingAdults" min="1" value="1" required />
              </div>
              <div class="form-group">
                <label for="bookingChildren">Children <small>(Ages 2–12)</small></label>
                <input type="number" id="bookingChildren" min="0" value="0" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="bookingInfants">Infants <small>(Under 2)</small></label>
                <input type="number" id="bookingInfants" min="0" value="0" required />
              </div>
              <div class="form-group">
                <label for="bookingPets">Pets</label>
                <input type="number" id="bookingPets" min="0" value="0" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="bookingServiceAnimal">Bringing a service animal?</label>
                <select id="bookingServiceAnimal" required>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>
            <div class="booking-help">
              <h4>Booking Information</h4>
              <p>Please provide the full names and contact details of all guests. Your booking must include:</p>
              <ul>
                <li>Full name, email, and phone number</li>
                <li>Check-in and check-out dates</li>
                <li>Room selection and guest breakdown</li>
                <li>Number of adults, children, infants, and pets</li>
                <li>Service animal declaration if needed</li>
              </ul>
              <p><strong>Note:</strong> If you're bringing more than 2 pets, please let your host know in advance.</p>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="bookingCheckin">Check-In</label>
                <input type="date" id="bookingCheckin" required />
              </div>
              <div class="form-group">
                <label for="bookingCheckout">Check-Out</label>
                <input type="date" id="bookingCheckout" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="bookingRoomType">Room</label>
                <select id="bookingRoomType" required></select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <p id="roomTypeStatus" class="room-type-status">Choose your dates and room to see availability.</p>
              </div>
            </div>

            <div class="booking-actions">
              <button type="button" id="checkAvailabilityBtn" class="btn-primary">Check Availability</button>
              <button type="submit" id="bookNowBtn" class="btn-primary" disabled>Book Now</button>
            </div>
            <p id="bookingFeedback" class="form-feedback"></p>
          </form>

          <div id="availabilityResult" class="availability-result hidden"></div>
        </div>
        <div class="about-features booking-info-features reveal">
          <div class="feature-card">
            <div class="feature-icon">📝</div>
            <h4>Cancellation policy</h4>
            <p>Add your trip dates to get the cancellation details for this stay.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🏠</div>
            <h4>House rules</h4>
            <p>Check-in after 2:00 PM · Checkout before 12:00 PM · Pets allowed.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🛡️</div>
            <h4>Safety &amp; property</h4>
            <p>Carbon monoxide alarm not reported · Smoke alarm not reported.</p>
          </div>
        </div>
      <?php endif; ?>
    </div>
  </section>

  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <span class="logo-icon">🏡</span>
        <span class="logo-text">Dred's <em>Transient</em></span>
        <p>Your cozy home in the heart of Pili, Camarines Sur, Bicol.</p>
      </div>
      <div class="footer-links">
        <h5>Navigate</h5>
        <a href="../index.html">Home</a>
        <a href="rooms.html">Rooms</a>
      </div>
    </div>
  </footer>

  <script src="../js/api-client.js"></script>
  <script src="../js/main.js"></script>
</body>
</html>
