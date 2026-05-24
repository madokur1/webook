<?php
/**
 * CUSTOMER DASHBOARD
 * 
 * Location: /dashboard.php
 * Purpose: Shows logged-in customer information and allows logout
 * 
 * This page requires user to be logged in.
 * Access: Only authenticated users can view this page.
 */

// Start session and check if user is logged in
require_once 'config/check-session.php';

// Get user info from session
$user_name = $_SESSION['user_name'] ?? 'Guest';
$user_email = $_SESSION['user_email'] ?? '';
$login_time = $_SESSION['login_time'] ?? time();

// Format login time
$formatted_time = date('F j, Y - g:i A', $login_time);
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Customer Dashboard | Dred's Transient</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
  <link rel="stylesheet" href="style.css" />
  <style>
    .dashboard-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .dashboard-navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      padding: 16px 24px;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .dashboard-navbar-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .dashboard-logo {
      font-family: var(--font-display);
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--primary);
    }

    .dashboard-logo em {
      color: var(--accent);
    }

    .dashboard-nav-actions {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .dashboard-user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
      background: var(--bg);
      border-radius: 50px;
    }

    .dashboard-user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--primary-light));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
    }

    .dashboard-logout-btn {
      background: linear-gradient(135deg, var(--primary), var(--primary-light));
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 50px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      font-size: 0.95rem;
    }

    .dashboard-logout-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(150, 66, 59, 0.3);
    }

    .dashboard-content {
      flex: 1;
      padding-top: 80px;
      padding: 80px 24px 40px;
      background: var(--bg);
    }

    .dashboard-main {
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-section {
      background: var(--bg-card);
      border-radius: 24px;
      padding: 48px;
      margin-bottom: 40px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
    }

    .welcome-section h1 {
      font-family: var(--font-display);
      font-size: clamp(2rem, 5vw, 3rem);
      color: var(--primary-dark);
      margin-bottom: 16px;
    }

    .welcome-section p {
      font-size: 1.05rem;
      color: var(--text-muted);
      line-height: 1.7;
      margin-bottom: 8px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-top: 40px;
    }

    .info-card {
      background: var(--bg-card);
      border-radius: 16px;
      padding: 28px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .info-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .info-card-title {
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      margin-bottom: 12px;
    }

    .info-card-value {
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--primary-dark);
      word-break: break-all;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      margin-top: 40px;
      flex-wrap: wrap;
    }

    .btn-dashboard {
      padding: 14px 32px;
      border-radius: 50px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: var(--transition);
      font-size: 1rem;
    }

    .btn-primary-dash {
      background: linear-gradient(135deg, var(--primary), var(--primary-light));
      color: white;
      box-shadow: 0 6px 24px rgba(150, 66, 59, 0.35);
    }

    .btn-primary-dash:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 32px rgba(150, 66, 59, 0.45);
    }

    .btn-outline-dash {
      background: transparent;
      color: var(--primary);
      border: 2px solid var(--primary);
    }

    .btn-outline-dash:hover {
      background: var(--primary);
      color: white;
      transform: translateY(-2px);
    }

    @media (max-width: 720px) {
      .dashboard-navbar {
        position: relative;
        padding: 12px 16px;
      }

      .dashboard-navbar-inner {
        flex-direction: column;
        gap: 16px;
      }

      .dashboard-nav-actions {
        width: 100%;
        justify-content: space-between;
      }

      .dashboard-content {
        padding: 20px 16px 40px;
      }

      .welcome-section {
        padding: 28px;
      }

      .welcome-section h1 {
        font-size: 1.8rem;
      }

      .action-buttons {
        flex-direction: column;
      }

      .btn-dashboard {
        width: 100%;
        text-align: center;
      }
    }
  </style>
</head>
<body class="dashboard-container">
  <!-- Dashboard Navbar -->
  <div class="dashboard-navbar">
    <div class="dashboard-navbar-inner">
      <div class="dashboard-logo">
        🏨 Dred's <em>Transient</em>
      </div>
      <div class="dashboard-nav-actions">
        <div class="dashboard-user-info">
          <div class="dashboard-user-avatar" aria-label="Customer account">
            👤
          </div>
        </div>
        <form method="POST" action="api/auth/logout.php" onsubmit="localStorage.removeItem('dredsCustomerAuth'); sessionStorage.removeItem('dredsCustomerAuth');">
          <button type="submit" class="dashboard-logout-btn">
            <i class="bi bi-box-arrow-right"></i> Logout
          </button>
        </form>
      </div>
    </div>
  </div>

  <!-- Dashboard Content -->
  <div class="dashboard-content">
    <div class="dashboard-main">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <h1>Welcome back! 👋</h1>
        <p>You are successfully logged in to Dred's Transient House.</p>
        <p>You can now browse rooms, make bookings, and manage your reservations.</p>

        <!-- User Information Grid -->
        <div class="info-grid">
          <div class="info-card">
            <div class="info-card-title">📧 Email Address</div>
            <div class="info-card-value"><?php echo htmlspecialchars($user_email); ?></div>
          </div>
          <div class="info-card">
            <div class="info-card-title">🔐 Account Status</div>
            <div class="info-card-value">
              <span style="color: #27ae60;">● Active</span>
            </div>
          </div>
          <div class="info-card">
            <div class="info-card-title">📅 Login Time</div>
            <div class="info-card-value"><?php echo $formatted_time; ?></div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <a href="pages/booking.html" class="btn-dashboard btn-primary-dash">
            <i class="bi bi-calendar-check"></i> Book a Room
          </a>
          <a href="index.html" class="btn-dashboard btn-outline-dash">
            <i class="bi bi-house"></i> Back to Home
          </a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
