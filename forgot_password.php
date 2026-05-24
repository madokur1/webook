<?php
// Simple page with JS to request a password reset link
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Forgot Password - Dred's Transient</title>
  <link rel="stylesheet" href="style.css">
</head>
<body class="auth-page">
  <main class="auth-panel">
    <div class="auth-brand">
      <div class="brand-icon">🏨</div>
      <div>
        <p class="brand-name">Dred's Transient</p>
        <p class="brand-tagline">Recover your account and continue booking.</p>
      </div>
    </div>

    <div class="auth-heading">
      <h1>Forgot your password?</h1>
      <p>Enter your email address below and we'll send a secure reset link.</p>
    </div>

    <form id="forgotForm" class="auth-form">
      <div class="form-group">
        <label for="email">Email address</label>
        <input id="email" name="email" type="email" required placeholder="you@example.com" />
      </div>

      <p id="result" class="form-feedback" aria-live="polite"></p>

      <div class="auth-actions">
        <button type="submit" class="btn-primary">Send reset link</button>
        <a class="btn-secondary auth-link" href="login.html">Back to sign in</a>
      </div>
    </form>
  </main>

  <script>
    const form = document.getElementById('forgotForm');
    const result = document.getElementById('result');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      result.textContent = '';
      const email = document.getElementById('email').value.trim();
      if (!email) {
        result.textContent = 'Please enter your email.';
        return;
      }

      try {
        const fd = new FormData(); fd.append('email', email);
        const res = await fetch('api/auth/request_reset.php', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
          result.className = 'form-feedback';
          result.style.color = '#1b5e20';
          result.textContent = data.message || 'Check your email for a reset link.';
          if (data.debug_reset_link) {
            result.innerHTML += '<br/><small>Debug link (local): <a href="'+data.debug_reset_link+'">Open reset link</a></small>';
          }
        } else {
          result.className = 'form-feedback';
          result.style.color = '#cc0000';
          result.textContent = data.message || 'Unable to process request.';
        }
      } catch (err) {
        result.className = 'form-feedback';
        result.style.color = '#cc0000';
        result.textContent = 'An error occurred.';
      }
    });
  </script>
</body>
</html>
