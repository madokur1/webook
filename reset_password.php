<?php
$token = $_GET['token'] ?? ''; 
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Password - Dred's Transient</title>
  <link rel="stylesheet" href="style.css">
</head>
<body class="auth-page">
  <main class="auth-panel">
    <div class="auth-brand">
      <div class="brand-icon">🏨</div>
      <div>
        <p class="brand-name">Dred's Transient</p>
        <p class="brand-tagline">Securely update your password and sign back in.</p>
      </div>
    </div>

    <div class="auth-heading">
      <h1>Reset your password</h1>
      <p>Enter a new password below to finish resetting your account.</p>
    </div>

    <?php if (!$token): ?>
      <p class="form-feedback" style="color:#cc0000;">Missing reset token. Use the link provided in the reset email.</p>
      <div class="auth-actions">
        <a class="btn-secondary auth-link" href="forgot_password.php">Request a new link</a>
        <a class="btn-secondary auth-link" href="login.html">Back to sign in</a>
      </div>
    <?php else: ?>
      <form id="resetForm" class="auth-form">
        <input type="hidden" id="token" value="<?php echo htmlspecialchars($token, ENT_QUOTES); ?>" />
        <div class="form-group">
          <label for="password">New password</label>
          <input id="password" name="password" type="password" minlength="6" required />
        </div>
        <div class="form-group">
          <label for="confirm">Confirm new password</label>
          <input id="confirm" name="confirm_password" type="password" minlength="6" required />
        </div>

        <p id="result" class="form-feedback" aria-live="polite"></p>

        <div class="auth-actions">
          <button type="submit" class="btn-primary">Reset password</button>
          <a class="btn-secondary auth-link" href="login.html">Back to sign in</a>
        </div>
      </form>
    <?php endif; ?>
  </main>

  <script>
    const form = document.getElementById('resetForm');
    if (form) {
      const result = document.getElementById('result');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        result.textContent = '';
        const token = document.getElementById('token').value;
        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirm').value;
        if (!password || password.length < 6) {
          result.textContent = 'Password must be at least 6 characters.';
          result.style.color = '#cc0000';
          return;
        }
        if (password !== confirm) {
          result.textContent = 'Passwords do not match.';
          result.style.color = '#cc0000';
          return;
        }

        try {
          const fd = new FormData();
          fd.append('token', token);
          fd.append('password', password);
          fd.append('confirm_password', confirm);
          const res = await fetch('api/auth/perform_reset.php', { method: 'POST', body: fd });
          const data = await res.json();
          if (data.success) {
            result.style.color = '#1b5e20';
            result.textContent = data.message || 'Password reset successful.';
            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
          } else {
            result.style.color = '#cc0000';
            result.textContent = data.message || 'Unable to reset password.';
          }
        } catch (err) {
          result.style.color = '#cc0000';
          result.textContent = 'An error occurred.';
        }
      });
    }
  </script>
</body>
</html>
