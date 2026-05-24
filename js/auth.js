/**
 * AUTHENTICATION HANDLER FOR PHP BACKEND
 * 
 * Location: /js/auth.js
 * Purpose: Handles login and registration with PHP backend
 * 
 * Include this in your login.html file:
 * <script src="js/auth.js"></script>
 */

document.addEventListener('DOMContentLoaded', () => {
  const customerLoginForm = document.getElementById('customerLoginForm');
  const customerSignupForm = document.getElementById('customerSignupForm');
  const customerLoginError = document.getElementById('customerLoginError');
  const customerSignupError = document.getElementById('customerSignupError');
  const signInModeBtn = document.getElementById('signInModeBtn');
  const signUpModeBtn = document.getElementById('signUpModeBtn');
  const passwordToggleButtons = document.querySelectorAll('.password-toggle');
  const continueAsGuestBtn = document.getElementById('continueAsGuestBtn');
  const continueAsGuestBtnSecondary = document.getElementById('continueAsGuestBtnSecondary');

  // ===== PASSWORD TOGGLE =====
  passwordToggleButtons.forEach((toggle) => {
    const targetId = toggle.dataset.target;
    const targetInput = document.getElementById(targetId);
    
    if (!targetInput) return;

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isPassword = targetInput.type === 'password';
      targetInput.type = isPassword ? 'text' : 'password';
      toggle.innerHTML = isPassword 
        ? '<i class="bi bi-eye-slash"></i>' 
        : '<i class="bi bi-eye"></i>';
    });
  });

  // ===== FORM TABS SWITCHING =====
  if (signInModeBtn && signUpModeBtn) {
    signInModeBtn.addEventListener('click', () => switchAuthMode('signIn'));
    signUpModeBtn.addEventListener('click', () => switchAuthMode('signUp'));
  }

  function switchAuthMode(mode) {
    const loginForm = document.getElementById('customerLoginForm');
    const signupForm = document.getElementById('customerSignupForm');

    if (loginForm && signupForm) {
      loginForm.classList.toggle('hidden', mode !== 'signIn');
      loginForm.classList.toggle('active', mode === 'signIn');
      signupForm.classList.toggle('hidden', mode !== 'signUp');
      signupForm.classList.toggle('active', mode === 'signUp');

      signInModeBtn.classList.toggle('active', mode === 'signIn');
      signUpModeBtn.classList.toggle('active', mode === 'signUp');

      // Clear error messages
      if (customerLoginError) customerLoginError.textContent = '';
      if (customerSignupError) customerSignupError.textContent = '';
    }
  }

  // ===== LOGIN FORM HANDLER =====
  if (customerLoginForm) {
    customerLoginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById('customerEmail').value.trim();
      const password = document.getElementById('customerPassword').value.trim();
      const remember = document.getElementById('customerRemember')?.checked || false;

      // Clear previous error
      if (customerLoginError) customerLoginError.textContent = '';

      // Validation
      if (!email) {
        if (customerLoginError) customerLoginError.textContent = 'Email is required.';
        return;
      }

      if (!isValidEmail(email)) {
        if (customerLoginError) customerLoginError.textContent = 'Please enter a valid email.';
        return;
      }

      if (!password) {
        if (customerLoginError) customerLoginError.textContent = 'Password is required.';
        return;
      }

      // Disable submit button
      const submitBtn = customerLoginForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Signing in...';
      }

      try {
        // Send login request to PHP backend
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('remember', remember ? 'on' : 'off');

        const response = await fetch('api/auth/login.php', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (data.success) {
          // Save auth state so the rest of the customer pages know the user is signed in
          const authData = {
            loggedIn: true,
            email,
            name: data.user?.full_name || '',
            remember
          };

          try {
            if (remember) {
              localStorage.setItem('dredsCustomerAuth', JSON.stringify(authData));
            } else {
              sessionStorage.setItem('dredsCustomerAuth', JSON.stringify(authData));
            }
          } catch (storageError) {
            console.warn('Unable to save login state locally:', storageError);
          }

          // Login successful - redirect to booking page
          window.location.href = data.redirect || 'pages/booking.html';
        } else {
          // Show error message
          if (customerLoginError) {
            customerLoginError.textContent = data.message || 'Login failed. Please try again.';
          }
        }
      } catch (error) {
        console.error('Login error:', error);
        if (customerLoginError) {
          customerLoginError.textContent = 'An error occurred. Please try again later.';
        }
      } finally {
        // Re-enable submit button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Sign In';
        }
      }
    });
  }

  // ===== REGISTRATION FORM HANDLER =====
  if (customerSignupForm) {
    customerSignupForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const fullName = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value.trim();
      const confirmPassword = document.getElementById('signupConfirmPassword').value.trim();

      // Clear previous error
      if (customerSignupError) customerSignupError.textContent = '';

      // Validation
      if (!fullName) {
        if (customerSignupError) customerSignupError.textContent = 'Full name is required.';
        return;
      }

      if (!email) {
        if (customerSignupError) customerSignupError.textContent = 'Email is required.';
        return;
      }

      if (!isValidEmail(email)) {
        if (customerSignupError) customerSignupError.textContent = 'Please enter a valid email.';
        return;
      }

      if (!password) {
        if (customerSignupError) customerSignupError.textContent = 'Password is required.';
        return;
      }

      if (password.length < 6) {
        if (customerSignupError) customerSignupError.textContent = 'Password must be at least 6 characters.';
        return;
      }

      if (!confirmPassword) {
        if (customerSignupError) customerSignupError.textContent = 'Please confirm your password.';
        return;
      }

      if (password !== confirmPassword) {
        if (customerSignupError) customerSignupError.textContent = 'Passwords do not match.';
        return;
      }

      // Disable submit button
      const submitBtn = customerSignupForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Creating account...';
      }

      try {
        // Send registration request to PHP backend
        const formData = new FormData();
        formData.append('full_name', fullName);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('confirm_password', confirmPassword);

        const response = await fetch('api/auth/register.php', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (data.success) {
          // Registration successful
          if (customerSignupError) {
            customerSignupError.textContent = '';
          }
          
          // Show success message
          alert('Account created successfully! Please sign in with your email and password.');
          
          // Switch back to login form
          switchAuthMode('signIn');
          
          // Populate email field
          document.getElementById('customerEmail').value = email;
          document.getElementById('customerPassword').focus();
          
          // Clear signup form
          customerSignupForm.reset();
        } else {
          // Show error message
          if (customerSignupError) {
            customerSignupError.textContent = data.message || 'Registration failed. Please try again.';
          }
        }
      } catch (error) {
        console.error('Registration error:', error);
        if (customerSignupError) {
          customerSignupError.textContent = 'An error occurred. Please try again later.';
        }
      } finally {
        // Re-enable submit button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Create account';
        }
      }
    });
  }

  // ===== GUEST LOGIN =====
  if (continueAsGuestBtn) {
    continueAsGuestBtn.addEventListener('click', () => {
      window.location.href = 'pages/booking.html';
    });
  }

  if (continueAsGuestBtnSecondary) {
    continueAsGuestBtnSecondary.addEventListener('click', () => {
      window.location.href = 'pages/booking.html';
    });
  }

  // ===== HELPER FUNCTION =====
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
});
