document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  const navbar = document.getElementById('navbar');
  const revealElements = document.querySelectorAll('.reveal');
  const customerLoginForm = document.getElementById('customerLoginForm');
  const bookingForm = document.getElementById('bookingForm');
  const checkAvailabilityBtn = document.getElementById('checkAvailabilityBtn');
  const bookNowBtn = document.getElementById('bookNowBtn');
  const availabilityResult = document.getElementById('availabilityResult');
  const bookingFeedback = document.getElementById('bookingFeedback');
  const roomTypeStatus = document.getElementById('roomTypeStatus');
  const customerLogoutEls = Array.from(document.querySelectorAll('.customerLogout, #customerLogout'));
  const welcomeText = document.getElementById('welcomeText');
  const bookingSummary = document.getElementById('bookingSummary');
  const customerNotificationArea = document.getElementById('customerNotificationArea');
  const customerBookingsBody = document.getElementById('customerBookingsBody');
  const customerDashboardPage = document.getElementById('customerDashboardPage');
  const bookingPage = document.getElementById('bookingPage');
  const homeGuestsStat = document.getElementById('homeGuestsStat');
  const homeSupportStat = document.getElementById('homeSupportStat');
  const customerSignupForm = document.getElementById('customerSignupForm');
  const customerSignupError = document.getElementById('customerSignupError');
  const signInModeBtn = document.getElementById('signInModeBtn');
  const signUpModeBtn = document.getElementById('signUpModeBtn');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const recoverBackLink = document.getElementById('recoverBackLink');
  const forgotPasswordError = document.getElementById('forgotPasswordError');
  const googleSignInBtn = document.getElementById('googleSignInBtn');
  const googleSignupBtn = document.getElementById('googleSignupBtn');
  const continueAsGuestBtn = document.getElementById('continueAsGuestBtn');
  const continueAsGuestBtnSecondary = document.getElementById('continueAsGuestBtnSecondary');
  const customerVerificationForm = document.getElementById('customerVerificationForm');
  const customerVerificationError = document.getElementById('customerVerificationError');
  const verificationBackLink = document.getElementById('verificationBackLink');
  const verificationEmailText = document.getElementById('verificationEmailText');
  const passwordToggleButtons = document.querySelectorAll('.password-toggle');

  // ===== API Integration =====
  const USE_BACKEND = typeof api !== 'undefined'; // Check if api-client.js is loaded
  let backendRooms = [];

  // ===== End API Integration =====

  const ROOMS_KEY = 'dredsAdminRooms';
  const BOOKINGS_KEY = 'dredsAdminBookings';
  const CUSTOMER_AUTH_KEY = 'dredsCustomerAuth';
  const CUSTOMER_ACCOUNTS_KEY = 'dredsCustomerAccounts';

  // Notifications
  const ADMIN_NOTIFS_KEY = 'dredsAdminNotifications';
  const CUSTOMER_NOTIFS_KEY = 'dredsCustomerNotifications';

  function getAdminNotifications() {
    return getStoredData(ADMIN_NOTIFS_KEY, []);
  }

  function addAdminNotification(message, meta = {}) {
    const list = getAdminNotifications();
    list.push({ id: `N-${Date.now()}`, message, read: false, createdAt: Date.now(), ...meta });
    setStoredData(ADMIN_NOTIFS_KEY, list);
    // also broadcast via storage event
    try { localStorage.setItem(ADMIN_NOTIFS_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function getCustomerNotifications() {
    return getStoredData(CUSTOMER_NOTIFS_KEY, []);
  }

  function addCustomerNotification(email, message, meta = {}) {
    if (!email) return;
    const list = getCustomerNotifications();
    list.push({ id: `CN-${Date.now()}`, email: email.toLowerCase(), message, read: false, createdAt: Date.now(), ...meta });
    setStoredData(CUSTOMER_NOTIFS_KEY, list);
    try { localStorage.setItem(CUSTOMER_NOTIFS_KEY, JSON.stringify(list)); } catch (e) {}
  }

  const defaultRooms = [
    { id: 'R-001', name: 'Lorheine Room', type: 'UNIT 1', capacity: 20, price: 2200, amenities: 'AC, WiFi, TV, Kitchen' },
    { id: 'R-002', name: 'Elisse Room', type: 'UNIT 2', capacity: 10, price: 1800, amenities: 'AC, WiFi, TV, Bathroom' },
    { id: 'R-003', name: 'Arco Room', type: 'UNIT 3', capacity: 8, price: 1500, amenities: 'AC, WiFi, TV' },
    { id: 'R-004', name: 'Family Suite', type: 'UNIT 4', capacity: 14, price: 2600, amenities: 'AC, WiFi, TV, Kitchen, Crib' },
    { id: 'R-005', name: 'Deluxe Room', type: 'UNIT 5', capacity: 6, price: 2400, amenities: 'AC, WiFi, TV, Bathroom, Minibar' }
  ];

  function getStoredData(key, fallback, storage = localStorage) {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function setStoredData(key, data, storage = localStorage) {
    storage.setItem(key, JSON.stringify(data));
  }

  function getCustomerAuth() {
    return getStoredData(CUSTOMER_AUTH_KEY, null, sessionStorage) || getStoredData(CUSTOMER_AUTH_KEY, null, localStorage);
  }

  function setCustomerAuth(data, remember = true) {
    if (remember) {
      setStoredData(CUSTOMER_AUTH_KEY, data, localStorage);
      sessionStorage.removeItem(CUSTOMER_AUTH_KEY);
    } else {
      setStoredData(CUSTOMER_AUTH_KEY, data, sessionStorage);
      localStorage.removeItem(CUSTOMER_AUTH_KEY);
    }
  }

  function clearCustomerAuth() {
    localStorage.removeItem(CUSTOMER_AUTH_KEY);
    sessionStorage.removeItem(CUSTOMER_AUTH_KEY);
  }

  function getCustomerAccounts() {
    return getStoredData(CUSTOMER_ACCOUNTS_KEY, []);
  }

  function setCustomerAccounts(accounts) {
    setStoredData(CUSTOMER_ACCOUNTS_KEY, accounts);
  }

  function findCustomerAccount(email) {
    return getCustomerAccounts().find((account) => account.email.toLowerCase() === email.toLowerCase());
  }

  function createCustomerAccount(name, email, password) {
    const accounts = getCustomerAccounts();
    accounts.push({ name, email: email.toLowerCase(), password, verified: true });
    setCustomerAccounts(accounts);
  }

  const CUSTOMER_VERIF_KEY = 'dredsCustomerVerification';
  const CUSTOMER_PENDING_VERIFICATION_KEY = 'dredsCustomerPendingVerification';

  function getCustomerVerification() {
    return getStoredData(CUSTOMER_VERIF_KEY, []);
  }

  function setCustomerVerification(records) {
    setStoredData(CUSTOMER_VERIF_KEY, records);
  }

  function findCustomerVerification(email) {
    return getCustomerVerification().find((record) => record.email.toLowerCase() === email.toLowerCase());
  }

  function setCustomerVerificationRecord(email, code) {
    const records = getCustomerVerification().filter((record) => record.email.toLowerCase() !== email.toLowerCase());
    records.push({
      email: email.toLowerCase(),
      code,
      createdAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 15
    });
    setCustomerVerification(records);
  }

  function clearCustomerVerification(email) {
    const records = getCustomerVerification().filter((record) => record.email.toLowerCase() !== email.toLowerCase());
    setCustomerVerification(records);
  }

  function generateVerificationCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function prepareCustomerVerification(email) {
    const code = generateVerificationCode();
    setCustomerVerificationRecord(email, code);
    console.log(`Verification code for ${email}: ${code}`);
    return code;
  }

  function getPendingVerificationEmail() {
    return sessionStorage.getItem(CUSTOMER_PENDING_VERIFICATION_KEY) || localStorage.getItem(CUSTOMER_PENDING_VERIFICATION_KEY);
  }

  function setPendingVerificationEmail(email, remember = false) {
    if (remember) {
      localStorage.setItem(CUSTOMER_PENDING_VERIFICATION_KEY, email.toLowerCase());
      sessionStorage.removeItem(CUSTOMER_PENDING_VERIFICATION_KEY);
    } else {
      sessionStorage.setItem(CUSTOMER_PENDING_VERIFICATION_KEY, email.toLowerCase());
      localStorage.removeItem(CUSTOMER_PENDING_VERIFICATION_KEY);
    }
  }

  function clearPendingVerificationEmail() {
    localStorage.removeItem(CUSTOMER_PENDING_VERIFICATION_KEY);
    sessionStorage.removeItem(CUSTOMER_PENDING_VERIFICATION_KEY);
  }

  function verifyCustomerCode(email, code) {
    const record = findCustomerVerification(email);
    if (!record) {
      return { valid: false, message: 'No verification request was found for that email.' };
    }
    if (Date.now() > record.expiresAt) {
      clearCustomerVerification(email);
      return { valid: false, message: 'Your verification code has expired. Please request a new one.' };
    }
    if (record.code !== code.trim()) {
      return { valid: false, message: 'Verification code is incorrect.' };
    }

    const accounts = getCustomerAccounts();
    const account = accounts.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (account) {
      account.verified = true;
      setCustomerAccounts(accounts);
    }

    clearCustomerVerification(email);
    return { valid: true };
  }

  function normalizeRoom(room) {
    return {
      name: room.name || room.type || room.code || '',
      type: room.type || room.name || room.code || '',
      code: room.code || '',
      capacity: Number(room.capacity) || 0,
      price: Number(String(room.price).replace(/[₱,]/g, '')) || 0,
      status: room.status || 'Available',
      amenities: room.amenities || '',
      photo: room.photo || ''
    };
  }

  function getRooms() {
    return getStoredData(ROOMS_KEY, defaultRooms).map(normalizeRoom);
  }

  function getBookings() {
    return getStoredData(BOOKINGS_KEY, []);
  }

  function getAdminSettings() {
    return getStoredData('dredsAdminSettings', { autoConfirmBookings: false });
  }

  function renderHomepageStats() {
    if (homeGuestsStat) {
      homeGuestsStat.textContent = '50';
    }
    if (homeSupportStat) {
      homeSupportStat.textContent = '24/7';
    }
  }

  function updateNavbarScroll() {
    const scrollY = window.scrollY;
    if (navbar) {
      navbar.classList.toggle('scrolled', scrollY > 20);
    }
  }

  function animateReveal() {
    revealElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight - 80) {
        element.classList.add('in-view');
      }
    });
  }

  function switchAuthMode(mode) {
    const loginForm = document.getElementById('customerLoginForm');
    const signupForm = document.getElementById('customerSignupForm');
    const verificationForm = document.getElementById('customerVerificationForm');
    const recoverForm = document.getElementById('forgotPasswordForm');

    if (!loginForm || !signupForm || !verificationForm || !recoverForm || !signInModeBtn || !signUpModeBtn) return;

    loginForm.classList.toggle('hidden', mode !== 'signIn');
    loginForm.classList.toggle('active', mode === 'signIn');
    signupForm.classList.toggle('hidden', mode !== 'signUp');
    signupForm.classList.toggle('active', mode === 'signUp');
    verificationForm.classList.toggle('hidden', mode !== 'verify');
    verificationForm.classList.toggle('active', mode === 'verify');
    recoverForm.classList.toggle('hidden', mode !== 'recover');
    recoverForm.classList.toggle('active', mode === 'recover');

    signInModeBtn.classList.toggle('active', mode === 'signIn');
    signUpModeBtn.classList.toggle('active', mode === 'signUp');

    if (mode === 'signIn') {
      forgotPasswordError.textContent = '';
      customerSignupError.textContent = '';
      document.getElementById('customerLoginError').textContent = '';
      if (customerVerificationError) customerVerificationError.textContent = '';
    }

    if (mode === 'verify') {
      if (customerSignupError) customerSignupError.textContent = '';
      if (forgotPasswordError) forgotPasswordError.textContent = '';
      if (document.getElementById('customerLoginError')) document.getElementById('customerLoginError').textContent = '';
      if (customerVerificationError) customerVerificationError.textContent = '';
    }
  }

  function setupPasswordToggles() {
    passwordToggleButtons.forEach((toggle) => {
      const targetId = toggle.dataset.target;
      const targetInput = document.getElementById(targetId);
      if (!targetInput) return;

      toggle.addEventListener('click', () => {
        const showing = targetInput.type === 'text';
        targetInput.type = showing ? 'password' : 'text';
        toggle.innerHTML = showing ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
      });
    });
  }

  function showVerificationPrompt(email) {
    if (verificationEmailText) {
      verificationEmailText.textContent = email.toLowerCase();
    }
    if (customerVerificationError) {
      customerVerificationError.textContent = '';
    }
    const codeInput = document.getElementById('verificationCode');
    if (codeInput) {
      codeInput.value = '';
    }
    switchAuthMode('verify');
  }

  function setAuthLoading(isLoading) {
    const loginButton = document.querySelector('#customerLoginForm button[type="submit"]');
    if (!loginButton) return;
    loginButton.disabled = isLoading;
    loginButton.innerHTML = isLoading
      ? '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Signing in...'
      : 'Sign In';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function handleCustomerLogin(event) {
    event.preventDefault();
    const email = document.getElementById('customerEmail').value.trim();
    const password = document.getElementById('customerPassword').value.trim();
    const remember = document.getElementById('customerRemember')?.checked || false;
    const errorElement = document.getElementById('customerLoginError');

    errorElement.textContent = '';
    if (!email) {
      errorElement.textContent = 'Email required.';
      return;
    }
    if (!isValidEmail(email)) {
      errorElement.textContent = 'Invalid email address.';
      return;
    }
    if (!password) {
      errorElement.textContent = 'Password required.';
      return;
    }

    const localAccount = findCustomerAccount(email);
    if (localAccount && !localAccount.verified) {
      errorElement.textContent = 'Your account is not verified yet. Please enter the code sent to your email.';
      setPendingVerificationEmail(email);
      showVerificationPrompt(email);
      return;
    }

    setAuthLoading(true);

    const successRedirect = () => {
      setAuthLoading(false);
      window.location.href = 'pages/booking.html';
    };

    if (USE_BACKEND && api) {
      api.login(email, password)
        .then(data => {
          if (data.token) {
            api.setToken(data.token);
          }

          setCustomerAuth({
            id: data.user.id,
            email: data.user.email,
            name: data.user.fullName,
            userType: data.user.userType,
            loggedIn: true,
            lastLogin: new Date().toISOString()
          }, remember);
          successRedirect();
        })
        .catch(err => {
          setAuthLoading(false);
          const account = findCustomerAccount(email);
          const errText = (err.message || err.toString() || '').toLowerCase();
          const networkError = errText.includes('failed to fetch') || errText.includes('networkerror') || errText.includes('network error') || errText.includes('api request failed');
          const inactiveAccount = errText.includes('not active') || errText.includes('inactive');

          if (inactiveAccount) {
            errorElement.textContent = 'Your account is not verified yet. Please enter the code sent to your email.';
            setPendingVerificationEmail(email);
            showVerificationPrompt(email);
            return;
          }

          if (networkError && account && account.password === password) {
            setCustomerAuth({
              email: account.email,
              name: account.name,
              loggedIn: true,
              lastLogin: new Date().toISOString()
            }, remember);
            successRedirect();
            return;
          }

          if (networkError) {
            errorElement.textContent = 'Unable to reach the backend. Please try again later or use your local account if one exists.';
            return;
          }

          errorElement.textContent = err.message || 'Incorrect email or password.';
        });
    } else {
      const account = findCustomerAccount(email);
      if (!account || account.password !== password) {
        setAuthLoading(false);
        errorElement.textContent = 'Incorrect email or password.';
        return;
      }

      setCustomerAuth({
        email: account.email,
        name: account.name,
        loggedIn: true,
        lastLogin: new Date().toISOString()
      }, remember);

      successRedirect();
    }
  }

  function handleCustomerSignUp(event) {
    event.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const confirmPassword = document.getElementById('signupConfirmPassword').value.trim();

    if (!name || !email || !password || !confirmPassword) {
      customerSignupError.textContent = 'Please complete every field to create an account.';
      return;
    }
    if (password.length < 6) {
      customerSignupError.textContent = 'Password must be at least 6 characters.';
      return;
    }
    if (password !== confirmPassword) {
      customerSignupError.textContent = 'Passwords do not match.';
      return;
    }
    const existingAccount = findCustomerAccount(email);
    if (existingAccount) {
      if (!existingAccount.verified) {
        customerSignupError.textContent = 'An account with that email exists but is not verified. Please verify your code or sign in.';
      } else {
        customerSignupError.textContent = 'An account with that email already exists.';
      }
      return;
    }

    // Try backend API first
    if (USE_BACKEND && api) {
      api.register(email, password, name)
        .then(() => {
          createCustomerAccount(name, email, password);
          api.login(email, password)
            .then(data => {
              if (data.token) {
                api.setToken(data.token);
              }

              setCustomerAuth({
                id: data.user.id,
                email: data.user.email,
                name: data.user.fullName,
                userType: data.user.userType,
                loggedIn: true,
                lastLogin: new Date().toISOString()
              }, true);
              window.location.href = 'pages/booking.html';
            })
            .catch(() => {
              setCustomerAuth({
                email,
                name,
                loggedIn: true,
                lastLogin: new Date().toISOString()
              }, true);
              window.location.href = 'pages/booking.html';
            });
        })
        .catch(err => {
          const errText = (err.message || err.toString() || '').toLowerCase();
          const networkError = errText.includes('failed to fetch') || errText.includes('networkerror') || errText.includes('network error') || errText.includes('api request failed');
          if (networkError) {
            createCustomerAccount(name, email, password);
            setCustomerAuth({
              email,
              name,
              loggedIn: true,
              lastLogin: new Date().toISOString()
            }, true);
            window.location.href = 'pages/booking.html';
            return;
          }

          customerSignupError.textContent = err.message || 'Registration failed. Please try again.';
        });
    } else {
      // Fallback to local storage
      createCustomerAccount(name, email, password);
      setCustomerAuth({
        email,
        name,
        loggedIn: true,
        lastLogin: new Date().toISOString()
      }, true);
      window.location.href = 'pages/booking.html';
    }
  }

  function handleCustomerVerification(event) {
    event.preventDefault();
    const code = document.getElementById('verificationCode')?.value.trim();
    const email = getPendingVerificationEmail();
    const errorElement = document.getElementById('customerVerificationError');

    if (!email) {
      if (errorElement) {
        errorElement.textContent = 'No pending verification was found. Please sign up again.';
      }
      switchAuthMode('signUp');
      return;
    }
    if (!code) {
      if (errorElement) {
        errorElement.textContent = 'Please enter the verification code.';
      }
      return;
    }

    if (USE_BACKEND && api) {
      api.verifyAccount(email, code)
        .then(data => {
          if (data.token) {
            api.setToken(data.token);
          }

          setCustomerAuth({
            id: data.user.id,
            email: data.user.email,
            name: data.user.fullName,
            userType: data.user.userType,
            loggedIn: true,
            lastLogin: new Date().toISOString()
          }, true);
          clearPendingVerificationEmail();
          window.location.href = 'pages/booking.html';
        })
        .catch(err => {
          if (errorElement) {
            errorElement.textContent = err.message || 'Verification failed. Please try again.';
          }
        });
      return;
    }

    const result = verifyCustomerCode(email, code);
    if (!result.valid) {
      if (errorElement) {
        errorElement.textContent = result.message;
      }
      return;
    }

    const account = findCustomerAccount(email);
    const authData = {
      email,
      name: account ? account.name : '',
      loggedIn: true,
      lastLogin: new Date().toISOString()
    };

    clearPendingVerificationEmail();
    setCustomerAuth(authData, true);
    window.location.href = 'pages/booking.html';
  }

  function handlePasswordRecovery(event) {
    event.preventDefault();
    const email = document.getElementById('recoverEmail')?.value.trim();
    const password = document.getElementById('recoverNewPassword')?.value.trim();
    const confirmPassword = document.getElementById('recoverConfirmPassword')?.value.trim();

    if (!email || !password || !confirmPassword) {
      forgotPasswordError.textContent = 'Please complete all fields to reset your password.';
      return;
    }
    if (password.length < 6) {
      forgotPasswordError.textContent = 'New password must be at least 6 characters.';
      return;
    }
    if (password !== confirmPassword) {
      forgotPasswordError.textContent = 'New passwords do not match.';
      return;
    }

    if (USE_BACKEND && api) {
      forgotPasswordError.textContent = 'Password recovery is not available on the backend in this demo.';
      return;
    }

    const accounts = getCustomerAccounts();
    const account = accounts.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!account) {
      forgotPasswordError.textContent = 'No account found with that email address.';
      return;
    }

    account.password = password;
    setCustomerAccounts(accounts);
    forgotPasswordError.textContent = 'Password updated. Please sign in with your new password.';
    switchAuthMode('signIn');
  }

  function showEditBookingModal(bookingId) {
    const bookings = getBookings();
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    if (document.getElementById('editBookingOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'editBookingOverlay';
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-modal">
        <h3>Edit Booking: ${booking.id}</h3>
        <div style="margin: 16px 0;">
          <div style="margin-bottom: 12px;">
            <label style="font-weight: 600; color: var(--text-muted);">Room:</label>
            <p>${booking.room}</p>
          </div>
          <div style="margin-bottom: 12px;">
            <label style="font-weight: 600; color: var(--text-muted);">Check-in:</label>
            <input type="date" id="editCheckin" value="${booking.checkin}" style="border: 1px solid var(--border); padding: 8px; border-radius: 6px; width: 100%; font-family: var(--font-body);" />
          </div>
          <div style="margin-bottom: 12px;">
            <label style="font-weight: 600; color: var(--text-muted);">Check-out:</label>
            <input type="date" id="editCheckout" value="${booking.checkout}" style="border: 1px solid var(--border); padding: 8px; border-radius: 6px; width: 100%; font-family: var(--font-body);" />
          </div>
          <div style="margin-bottom: 12px;">
            <label style="font-weight: 600; color: var(--text-muted);">Guests:</label>
            <p>${booking.guests || 'N/A'}</p>
          </div>
        </div>
        <div class="confirm-actions">
          <button class="btn-ghost cancel-edit">Discard</button>
          <button class="btn-primary save-edit">Save Changes</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const cancelBtn = overlay.querySelector('.cancel-edit');
    const saveBtn = overlay.querySelector('.save-edit');

    function removeOverlay() {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    cancelBtn.addEventListener('click', () => removeOverlay());

    saveBtn.addEventListener('click', () => {
      const newCheckin = document.getElementById('editCheckin').value;
      const newCheckout = document.getElementById('editCheckout').value;

      if (!newCheckin || !newCheckout) {
        alert('Please fill in all date fields.');
        return;
      }

      const checkinDate = new Date(newCheckin);
      const checkoutDate = new Date(newCheckout);

      if (checkinDate >= checkoutDate) {
        alert('Check-out must be later than check-in.');
        return;
      }

      booking.checkin = newCheckin;
      booking.checkout = newCheckout;
      setStoredData(BOOKINGS_KEY, bookings);

      removeOverlay();
      renderCustomerBookings();
      alert('Booking updated successfully!');
    });
  }

  function showCancelBookingModal(bookingId) {
    const bookings = getBookings();
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    if (document.getElementById('cancelBookingOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'cancelBookingOverlay';
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-modal">
        <h3>Cancel Booking</h3>
        <p>Are you sure you want to cancel booking <strong>${booking.id}</strong> for <strong>${booking.room}</strong>?</p>
        <p style="color: var(--text-muted); font-size: 0.9rem;">This action cannot be undone.</p>
        <div class="confirm-actions">
          <button class="btn-ghost cancel-modal">Keep Booking</button>
          <button class="btn-primary confirm-cancel" style="background: #dc3545;">Confirm Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const keepBtn = overlay.querySelector('.cancel-modal');
    const confirmBtn = overlay.querySelector('.confirm-cancel');

    function removeOverlay() {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    keepBtn.addEventListener('click', () => removeOverlay());

    confirmBtn.addEventListener('click', () => {
      booking.status = 'Cancelled';
      setStoredData(BOOKINGS_KEY, bookings);

      removeOverlay();
      renderCustomerBookings();
      alert('Booking cancelled successfully.');
    });
  }

  function renderCustomerBookings() {
    if (!customerBookingsBody) return;
    const auth = getCustomerAuth();
    if (!auth) {
      customerBookingsBody.innerHTML = '<tr><td colspan="7">Please log in to view your bookings.</td></tr>';
      return;
    }
    const bookings = getBookings().filter((booking) => booking.customerEmail === auth.email);
    if (!bookings.length) {
      customerBookingsBody.innerHTML = '<tr><td colspan="7">No reservations found. Book a room to get started.</td></tr>';
      return;
    }

    customerBookingsBody.innerHTML = bookings
      .map((booking) => {
        const totalAmount = booking.amount != null ? Number(booking.amount) : 0;
        return `
        <tr>
          <td>${booking.id}</td>
          <td>${booking.room}</td>
          <td>${booking.checkin}</td>
          <td>${booking.checkout}</td>
          <td>₱${totalAmount.toLocaleString()}</td>
          <td><span class="status-badge ${booking.status.toLowerCase()}">${booking.status}</span></td>
          <td>
            <div class="booking-actions">
              <button class="btn-small btn-edit" data-booking-id="${booking.id}">Edit</button>
              <button class="btn-small btn-cancel" data-booking-id="${booking.id}">Cancel</button>
            </div>
          </td>
        </tr>
      `;
      })
      .join('');

    // Attach event listeners to edit/cancel buttons
    const editBtns = customerBookingsBody.querySelectorAll('.btn-edit');
    const cancelBtns = customerBookingsBody.querySelectorAll('.btn-cancel');

    editBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const bookingId = e.target.dataset.bookingId;
        showEditBookingModal(bookingId);
      });
    });

    cancelBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const bookingId = e.target.dataset.bookingId;
        showCancelBookingModal(bookingId);
      });
    });
  }

  function renderCustomerNotifications() {
    if (!customerNotificationArea) return;
    const auth = getCustomerAuth();
    if (!auth || !auth.email) {
      customerNotificationArea.innerHTML = '';
      return;
    }
    
    const notifications = getCustomerNotifications()
      .filter((notification) => notification.email === auth.email.toLowerCase())
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    if (!notifications.length) {
      customerNotificationArea.innerHTML = '';
      return;
    }

    const unreadCount = notifications.filter((notification) => !notification.read).length;
    const readCount = notifications.filter((notification) => notification.read).length;
    customerNotificationArea.innerHTML = `
      <div class="customer-notifications-card">
        <div class="notification-header">
          <div>
            <h3>Notifications</h3>
            <p class="small text-muted">${unreadCount > 0 ? `${unreadCount} new notification${unreadCount === 1 ? '' : 's'}` : 'All notifications are read.'}</p>
          </div>
          <div class="notification-actions" style="display: flex; gap: 8px;">
            <button class="btn-small" id="markCustomerNotificationsReadBtn">Mark all as read</button>
            ${readCount > 0 ? `<button class="btn-small" id="deleteCustomerReadNotificationsBtn" style="background: #dc3545; color: #fff;">Delete read</button>` : ''}
          </div>
        </div>
        <div class="notification-list">
          ${notifications.slice(0, 5).map((notification) => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}">
              <div class="notification-message">${notification.message}</div>
              <div class="notification-meta">${new Date(notification.createdAt || Date.now()).toLocaleString()}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('markCustomerNotificationsReadBtn')?.addEventListener('click', () => {
      const allNotifications = getCustomerNotifications().map((notification) => (
        notification.email === auth.email.toLowerCase() ? { ...notification, read: true } : notification
      ));
      setStoredData(CUSTOMER_NOTIFS_KEY, allNotifications);
      renderCustomerNotifications();
    });

    document.getElementById('deleteCustomerReadNotificationsBtn')?.addEventListener('click', () => {
      const allNotifications = getCustomerNotifications().filter((notification) => {
        if (notification.email === auth.email.toLowerCase() && notification.read) return false;
        return true;
      });
      setStoredData(CUSTOMER_NOTIFS_KEY, allNotifications);
      renderCustomerNotifications();
    });
  }

  function renderCustomerDashboard() {
    const auth = getCustomerAuth();
    if (!auth || !auth.loggedIn) {
      window.location.href = 'login.html';
      return;
    }

    if (welcomeText) {
      welcomeText.textContent = `Welcome, ${auth.name}.`;
    }

    const bookings = getBookings().filter((booking) => booking.customerEmail === auth.email);
    if (bookingSummary) {
      const totalAmount = bookings.reduce((sum, booking) => sum + (Number(booking.amount) || 0), 0);
      bookingSummary.textContent = bookings.length
        ? `You have ${bookings.length} reservation${bookings.length === 1 ? '' : 's'} totaling ₱${totalAmount.toLocaleString()}.`
        : 'You have no active reservations yet.';
    }

    renderCustomerBookings();
    renderCustomerNotifications();
  }

  function getDateValue(fieldId) {
    const field = document.getElementById(fieldId);
    return field ? field.value : '';
  }

  function parseDate(value) {
    return value ? new Date(value + 'T00:00:00') : null;
  }

  function isValidDateRange(checkin, checkout) {
    return checkin && checkout && checkin < checkout;
  }

  function findAvailableRoom(roomName, checkin, checkout) {
    const room = getRooms().find((roomItem) => roomItem.name === roomName && roomItem.status === 'Available');
    if (!room) return null;

    const bookings = getBookings().filter((booking) => booking.room === roomName && booking.status !== 'Cancelled');
    const conflict = bookings.some((booking) => {
      const existingCheckin = parseDate(booking.checkin);
      const existingCheckout = parseDate(booking.checkout);
      return checkin < existingCheckout && checkout > existingCheckin;
    });

    return conflict ? null : room;
  }

  function setAvailabilityMessage(message, positive = false) {
    if (!availabilityResult) return;
    availabilityResult.textContent = message;
    availabilityResult.classList.toggle('hidden', false);
    availabilityResult.classList.toggle('available', positive);
    availabilityResult.classList.toggle('unavailable', !positive);
  }

  function getRoomOptions() {
    return getRooms().map((room) => room.name).filter(Boolean);
  }

  function populateRoomTypeOptions() {
    const roomTypeField = document.getElementById('bookingRoomType');
    if (!roomTypeField) return;

    const currentSelection = roomTypeField.value;
    const totalGuests = getBookingGuestCount();
    const roomNames = getRoomOptions();

    const options = ['<option value="">Select a room</option>'];
    roomNames.forEach((roomName) => {
      const room = getRooms().find((roomItem) => roomItem.name === roomName);
      const capacity = room && typeof room.capacity !== 'undefined' ? Number(room.capacity) : null;
      const isTooSmall = capacity !== null && totalGuests > 0 && totalGuests > capacity;
      const label = capacity !== null ? `${roomName} (up to ${capacity} guests)` : roomName;
      options.push(
        `<option value="${roomName}" ${isTooSmall ? 'disabled' : ''}>${label}${isTooSmall ? ' — too many guests' : ''}</option>`
      );
    });

    roomTypeField.innerHTML = options.join('');
    if (currentSelection) {
      const selectedRoom = getRooms().find((roomItem) => roomItem.name === currentSelection);
      const selectedCapacity = selectedRoom && typeof selectedRoom.capacity !== 'undefined' ? Number(selectedRoom.capacity) : null;
      if (selectedRoom && selectedCapacity !== null && totalGuests <= selectedCapacity) {
        roomTypeField.value = currentSelection;
      }
    }
  }

  function updateRoomTypeOptions() {
    const roomTypeField = document.getElementById('bookingRoomType');
    if (!roomTypeField) return;

    const currentSelection = roomTypeField.value;
    populateRoomTypeOptions();

    const selectedRoomCapacity = getSelectedRoomCapacity(currentSelection);
    const totalGuests = getBookingGuestCount();
    if (currentSelection && selectedRoomCapacity !== null && totalGuests > selectedRoomCapacity) {
      roomTypeField.value = '';
    }
  }

  function attachBookingFieldListeners() {
    const roomTypeField = document.getElementById('bookingRoomType');
    const checkinField = document.getElementById('bookingCheckin');
    const checkoutField = document.getElementById('bookingCheckout');
    const guestsField = document.getElementById('bookingGuests');
    const adultsField = document.getElementById('bookingAdults');
    const childrenField = document.getElementById('bookingChildren');
    const infantsField = document.getElementById('bookingInfants');

    const updateAvailability = () => {
      updateRoomTypeOptions();
      showRoomDetails();
      showRoomAvailabilityHint();
      if (bookNowBtn) bookNowBtn.disabled = true;
    };

    if (roomTypeField) {
      roomTypeField.addEventListener('change', updateAvailability);
    }

    [checkinField, checkoutField, guestsField, adultsField, childrenField, infantsField].forEach((field) => {
      if (field) {
        field.addEventListener('change', updateAvailability);
      }
    });
  }

  function showRoomDetails() {
    const roomTypeField = document.getElementById('bookingRoomType');
    const roomDetailsContainer = document.getElementById('roomDetailsContainer');
    
    if (!roomTypeField || !roomDetailsContainer) return;
    
    const selectedRoomName = roomTypeField.value;
    const rooms = getRooms();
    const selectedRoom = rooms.find(r => r.name === selectedRoomName);
    
    if (!selectedRoom) {
      roomDetailsContainer.style.display = 'none';
      return;
    }
    
    const capacityDisplay = document.getElementById('roomCapacityDisplay');
    const priceDisplay = document.getElementById('roomPriceDisplay');
    const totalPriceDisplay = document.getElementById('totalPriceDisplay');
    const amenitiesDisplay = document.getElementById('roomAmenitiesDisplay');

    const checkinValue = getDateValue('bookingCheckin');
    const checkoutValue = getDateValue('bookingCheckout');
    const checkinDate = parseDate(checkinValue);
    const checkoutDate = parseDate(checkoutValue);
    const nights = isValidDateRange(checkinDate, checkoutDate) ? Math.max(Math.round((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24)), 1) : 0;
    const roomPrice = selectedRoom.price ? Number(String(selectedRoom.price).replace(/[^0-9.-]+/g, '')) : 0;
    const estimatedTotal = roomPrice * nights;

    if (capacityDisplay) {
      capacityDisplay.textContent = selectedRoom.capacity ? `${selectedRoom.capacity} guests` : 'Not specified';
    }
    if (priceDisplay) {
      priceDisplay.textContent = selectedRoom.price ? `₱${Number(roomPrice).toLocaleString()} / night` : 'Not specified';
    }
    if (totalPriceDisplay) {
      totalPriceDisplay.textContent = roomPrice && nights
        ? `₱${Number(estimatedTotal).toLocaleString()} for ${nights} night${nights === 1 ? '' : 's'}`
        : 'Select dates to estimate total';
    }
    if (amenitiesDisplay) {
      amenitiesDisplay.textContent = selectedRoom.amenities || 'None listed';
    }
    
    roomDetailsContainer.style.display = 'block';
  }

  function setRoomTypeStatus(message, positive = false) {
    if (!roomTypeStatus) return;
    roomTypeStatus.textContent = message;
    roomTypeStatus.classList.toggle('available', positive);
    roomTypeStatus.classList.toggle('unavailable', !positive);
  }

  function getBookingGuestCount() {
    const adults = Number(document.getElementById('bookingAdults')?.value) || 0;
    const children = Number(document.getElementById('bookingChildren')?.value) || 0;
    const infants = Number(document.getElementById('bookingInfants')?.value) || 0;
    const explicitCount = adults + children + infants;

    const bookingGuests = document.getElementById('bookingGuests')?.value || '';
    const rangeMatch = bookingGuests.match(/(\d+)-(\d+)/);
    const rangeMax = rangeMatch ? Number(rangeMatch[2]) : 0;

    if (explicitCount > 0 && rangeMax > 0) {
      return Math.max(explicitCount, rangeMax);
    }
    if (rangeMax > 0) {
      return rangeMax;
    }
    return Math.max(explicitCount, 1);
  }

  function getSelectedRoomCapacity(roomName) {
    const room = getRooms().find((roomItem) => roomItem.name === roomName);
    return room && typeof room.capacity !== 'undefined' ? Number(room.capacity) : null;
  }

  function getRoomTypeSelection() {
    const field = document.getElementById('bookingRoomType');
    return field ? field.value : '';
  }

  function showRoomAvailabilityHint() {
    if (!bookingPage || !roomTypeStatus) return;
    const roomType = getRoomTypeSelection();
    const checkinValue = getDateValue('bookingCheckin');
    const checkoutValue = getDateValue('bookingCheckout');
    const checkin = parseDate(checkinValue);
    const checkout = parseDate(checkoutValue);

    if (!roomType) {
      setRoomTypeStatus('Choose a room to see availability.', false);
      return;
    }
    if (!checkinValue || !checkoutValue) {
      setRoomTypeStatus('Select arrival and departure dates to check availability.', false);
      return;
    }
    if (!isValidDateRange(checkin, checkout)) {
      setRoomTypeStatus('Please choose valid check-in and check-out dates.', false);
      return;
    }

    const totalGuests = getBookingGuestCount();
    const roomCapacity = getSelectedRoomCapacity(roomType);
    const availableRoom = findAvailableRoom(roomType, checkin, checkout);
    if (!availableRoom) {
      setRoomTypeStatus(`The ${roomType} is not available on these dates.`, false);
      return;
    }
    if (roomCapacity !== null && totalGuests > roomCapacity) {
      setRoomTypeStatus(`The ${roomType} is limited to ${roomCapacity} guests but your party is ${totalGuests}.`, false);
      if (bookNowBtn) bookNowBtn.disabled = true;
      return;
    }
    setRoomTypeStatus(`Available: ${availableRoom.name} is open for your dates.`, true);
  }

  function handleAvailabilityCheck() {
    if (!bookingForm) return;
    const name = document.getElementById('bookingName').value.trim();
    const email = document.getElementById('bookingEmail').value.trim();
    const checkinValue = getDateValue('bookingCheckin');
    const checkoutValue = getDateValue('bookingCheckout');
    const roomType = getRoomTypeSelection();
    const checkin = parseDate(checkinValue);
    const checkout = parseDate(checkoutValue);

    if (!name || !email || !checkinValue || !checkoutValue || !roomType) {
      bookingFeedback.textContent = 'Please complete all booking fields before checking availability.';
      return;
    }
    if (!isValidDateRange(checkin, checkout)) {
      bookingFeedback.textContent = 'Check-out must be later than check-in.';
      return;
    }

    const totalGuests = getBookingGuestCount();
    const roomCapacity = getSelectedRoomCapacity(roomType);
    const availableRoom = findAvailableRoom(roomType, checkin, checkout);
    if (!availableRoom) {
      setAvailabilityMessage(`The ${roomType} is not available for the selected dates. Try another date.`, false);
      if (bookNowBtn) bookNowBtn.disabled = true;
      setRoomTypeStatus(`The ${roomType} is not available on these dates.`, false);
      return;
    }
    if (roomCapacity !== null && totalGuests > roomCapacity) {
      setAvailabilityMessage(`The ${roomType} can only accommodate ${roomCapacity} guests but your party is ${totalGuests}.`, false);
      if (bookNowBtn) bookNowBtn.disabled = true;
      setRoomTypeStatus(`The ${roomType} is limited to ${roomCapacity} guests.`, false);
      return;
    }

    setAvailabilityMessage(`Great news! The ${availableRoom.name} is available from ${checkinValue} to ${checkoutValue}.`, true);
    if (bookNowBtn) bookNowBtn.disabled = false;
    bookNowBtn.dataset.roomName = availableRoom.name;
    bookingFeedback.textContent = '';
    setRoomTypeStatus(`Available: ${availableRoom.name} is open for your dates.`, true);
  }

  function handleBookingSubmit(event) {
    event.preventDefault();
    if (!bookingForm) return;
    if (!checkAvailabilityBtn || bookNowBtn.disabled) {
      bookingFeedback.textContent = 'Please check availability before booking.';
      return;
    }

    const name = document.getElementById('bookingName').value.trim();
    const email = document.getElementById('bookingEmail').value.trim();
    const phone = document.getElementById('bookingPhone').value.trim();
    const checkinValue = getDateValue('bookingCheckin');
    const checkoutValue = getDateValue('bookingCheckout');
    const selectedRoomName = document.getElementById('bookingRoomType').value;
    const adults = Number(document.getElementById('bookingAdults').value) || 0;
    const children = Number(document.getElementById('bookingChildren').value) || 0;
    const infants = Number(document.getElementById('bookingInfants').value) || 0;
    const totalGuests = adults + children + infants;
    const pets = Number(document.getElementById('bookingPets').value) || 0;
    const serviceAnimal = document.getElementById('bookingServiceAnimal').value === 'Yes';
    const room = getRooms().find((roomItem) => roomItem.name === selectedRoomName);
    const roomType = room ? room.type : '';
    const roomPrice = room && room.price ? Number(String(room.price).replace(/[^0-9.-]+/g, '')) || 0 : 0;
    const roomCapacity = getSelectedRoomCapacity(selectedRoomName);
    const nights = (() => {
      const checkinDate = parseDate(checkinValue);
      const checkoutDate = parseDate(checkoutValue);
      if (!checkinDate || !checkoutDate) return 0;
      return Math.max(Math.round((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24)), 1);
    })();
    const amount = roomPrice * nights;

    if (!name || !email || !phone || !checkinValue || !checkoutValue || !selectedRoomName || adults < 1) {
      bookingFeedback.textContent = 'Please complete all booking fields and include at least one adult.';
      return;
    }
    if (roomCapacity !== null && totalGuests > roomCapacity) {
      bookingFeedback.textContent = `The selected room can only accommodate ${roomCapacity} guests, but your party has ${totalGuests}.`;
      bookingFeedback.style.color = '#d00';
      return;
    }

    bookNowBtn.disabled = true;
    bookingFeedback.textContent = 'Processing your booking...';
    bookingFeedback.style.color = '#666';

    // Try backend API first
    if (USE_BACKEND && api && api.token) {
      // Find room ID from backend
      const roomId = room ? room.id : null;
      if (!roomId) {
        bookingFeedback.textContent = 'Error: Room not found. Please refresh and try again.';
        bookingFeedback.style.color = '#d00';
        bookNowBtn.disabled = false;
        return;
      }

      api.createBooking({
        roomId: roomId,
        checkInDate: checkinValue,
        checkOutDate: checkoutValue,
        totalGuests: totalGuests,
        adults: adults,
        children: children,
        infants: infants,
        pets: pets,
        serviceAnimal: serviceAnimal,
        notes: `Phone: ${phone}`
      })
        .then(data => {
          bookingFeedback.textContent = `✓ Booking successful! Your confirmation ID: ${data.booking.id}`;
          bookingFeedback.style.color = '#0a5';
          availabilityResult.classList.add('hidden');
          bookingForm.reset();
          setTimeout(() => {
            bookingFeedback.textContent = '';
          }, 5000);
        })
        .catch(err => {
          bookingFeedback.textContent = `Error: ${err.message || 'Failed to create booking'}`;
          bookingFeedback.style.color = '#d00';
          bookNowBtn.disabled = false;
        });
    } else {
      // Fallback to local storage
      const bookings = getBookings();
      const settings = getAdminSettings();
      const newBooking = {
        id: `BK-${Math.floor(Math.random() * 900 + 100)}`,
        customer: name,
        customerEmail: email,
        phone,
        room: selectedRoomName,
        roomType,
        checkin: checkinValue,
        checkout: checkoutValue,
        guests: totalGuests,
        adults,
        children,
        infants,
        pets,
        serviceAnimal,
        amount,
        status: settings.autoConfirmBookings ? 'Confirmed' : 'Pending'
      };

      bookings.push(newBooking);
      setStoredData(BOOKINGS_KEY, bookings);

      // create admin notification about new booking
      addAdminNotification(`New booking ${newBooking.id} by ${newBooking.customer}`, { bookingId: newBooking.id });

      // create customer notification without extra payment instructions
      const paymentMessage = `Your booking ${newBooking.id} is received.`;
      addCustomerNotification(newBooking.customerEmail, paymentMessage, { bookingId: newBooking.id });

      bookingFeedback.textContent = 'Your booking request has been submitted.';
      bookingFeedback.style.color = '#0a5';
      bookNowBtn.disabled = true;
      availabilityResult.classList.add('hidden');
      bookingForm.reset();
    }
  }

  function initBookingPage() {
    if (!bookingPage) return;
    populateRoomTypeOptions();
    attachBookingFieldListeners();
    showRoomAvailabilityHint();

    const auth = getCustomerAuth();
    const loginNotice = document.getElementById('loginRequiredNotice');
    const bookingPanel = document.querySelector('.booking-panel');
    const isLoggedIn = auth && auth.loggedIn;

    // Show/hide login notice and disable form if not logged in
    if (loginNotice) {
      if (isLoggedIn) {
        loginNotice.classList.add('hidden');
      } else {
        loginNotice.classList.remove('hidden');
      }
    }
    if (bookingPanel) {
      if (isLoggedIn) {
        bookingPanel.classList.remove('disabled');
      } else {
        bookingPanel.classList.add('disabled');
      }
    }

    if (auth && auth.loggedIn) {
      const emailField = document.getElementById('bookingEmail');
      const nameField = document.getElementById('bookingName');
      if (emailField) emailField.value = auth.email;
      if (nameField) nameField.value = auth.name;
    }

    if (checkAvailabilityBtn) {
      checkAvailabilityBtn.addEventListener('click', handleAvailabilityCheck);
    }
    if (bookingForm) {
      bookingForm.addEventListener('submit', handleBookingSubmit);
    }
  }

  function initAuthPage() {
    if (!customerLoginForm || !customerSignupForm || !signInModeBtn || !signUpModeBtn || !forgotPasswordForm || !forgotPasswordLink || !recoverBackLink) return;

    signInModeBtn.addEventListener('click', () => switchAuthMode('signIn'));
    signUpModeBtn.addEventListener('click', () => switchAuthMode('signUp'));
    forgotPasswordLink.addEventListener('click', () => switchAuthMode('recover'));
    recoverBackLink.addEventListener('click', () => switchAuthMode('signIn'));

    customerLoginForm.addEventListener('submit', handleCustomerLogin);
    customerSignupForm.addEventListener('submit', handleCustomerSignUp);
    if (customerVerificationForm) {
      customerVerificationForm.addEventListener('submit', handleCustomerVerification);
    }
    forgotPasswordForm.addEventListener('submit', handlePasswordRecovery);

    if (verificationBackLink) {
      verificationBackLink.addEventListener('click', () => switchAuthMode('signIn'));
    }

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

    if (googleSignInBtn) {
      googleSignInBtn.addEventListener('click', () => handleGoogleAuth('login'));
    }
    if (googleSignupBtn) {
      googleSignupBtn.addEventListener('click', () => handleGoogleAuth('signup'));
    }

    const pendingEmail = getPendingVerificationEmail();
    if (pendingEmail) {
      showVerificationPrompt(pendingEmail);
    }

    setupPasswordToggles();
  }

  function handleCustomerLogout(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    clearCustomerAuth();

    const basePath = window.location.pathname.includes('/pages/') ? '../' : '';
    const logoutUrl = basePath + 'api/auth/logout.php';
    const redirectUrl = basePath + 'login.html';

    fetch(logoutUrl, {
      method: 'POST',
      credentials: 'same-origin'
    }).catch(() => {
      // Ignore network errors; still redirect to login.
    }).finally(() => {
      window.location.href = redirectUrl;
    });
  }

  function handleGoogleAuth(mode) {
    const targetUrl = mode === 'signup'
      ? 'https://accounts.google.com/signup'
      : 'https://accounts.google.com/signin/v2/identifier';

    const message = mode === 'signup'
      ? 'Redirecting to Google sign-up so you can create a Google account first.'
      : 'Redirecting to Google sign-in. After signing in with Google, please return to create or login to your account here.';

    alert(message);
    window.open(targetUrl, '_blank');
  }

  function showSignOutConfirm(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    // prevent multiple modals
    if (document.getElementById('signoutConfirmOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'signoutConfirmOverlay';
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-modal">
        <h3>Confirm sign out</h3>
        <p>Are you sure you want to sign out? You will be redirected to the login page.</p>
        <div class="confirm-actions">
          <button class="btn-ghost confirm-cancel">Cancel</button>
          <button class="btn-primary confirm-accept">Sign Out</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const cancelBtn = overlay.querySelector('.confirm-cancel');
    const acceptBtn = overlay.querySelector('.confirm-accept');

    function removeOverlay() {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    cancelBtn.addEventListener('click', () => {
      removeOverlay();
    });

    acceptBtn.addEventListener('click', () => {
      removeOverlay();
      handleCustomerLogout();
    });
  }

  function renderRoomsGrid() {
    const roomsGrid = document.getElementById('roomsGrid');
    if (!roomsGrid) return;

    const rooms = getRooms();
    roomsGrid.innerHTML = rooms
      .map((room) => {
        const roomPhoto = room.photo || 'https://via.placeholder.com/300x200?text=Room';
        const roomName = room.type || room.name || 'Room';
        const capacity = room.capacity || '2';
        const amenities = room.amenities || 'AC, WiFi, TV';
        const status = room.status || 'Available';
        const statusClass = status === 'Available' ? 'available' : status === 'Occupied' ? 'occupied' : 'maintenance';

        return `
          <article class="room-card" data-images='["${roomPhoto}"]'>
            <div class="room-image" style="background-image:url('${roomPhoto}');"></div>
            <div class="room-info">
              <div class="room-status-badge ${statusClass}">${status}</div>
              <h3>${roomName.toUpperCase()}</h3>
              <p>Good for ${capacity} guest${capacity !== '1' ? 's' : ''}</p>
              <div class="room-features">
                ${amenities
                  .split(',')
                  .slice(0, 4)
                  .map((amenity) => `<span>${amenity.trim()}</span>`)
                  .join('')}
              </div>
            </div>
          </article>
        `;
      })
      .join('');

  }

  function showRoomGallery(images, title) {
    // allow empty image arrays and show a placeholder/message
    if (!images || !images.length) {
      images = [];
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal';
    overlay.innerHTML = `
      <div class="modal-card">
        <button class="modal-close" aria-label="Close">×</button>
        <div style="padding: 24px; text-align: center;">
          <h2 style="margin: 0 0 16px; font-family: var(--font-display); font-size: 2rem; color: var(--primary-dark);">${title}</h2>
        </div>
        <div class="modal-image" id="roomGalleryImage" style="background-image:url('${images[0] || 'https://via.placeholder.com/800x500?text=No+images+yet'}');"></div>
        <div class="modal-thumbs">
          ${images.length ? images
            .map((src, index) => `
              <div class="thumb-item${index === 0 ? ' active' : ''}" data-src="${src}" style="background-image:url('${src}')"></div>
            `)
            .join('') : `<div class="thumb-empty">No images have been added yet.</div>`}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('.modal-close');
    const imageEl = overlay.querySelector('#roomGalleryImage');
    const thumbItems = overlay.querySelectorAll('.thumb-item');

    function closeModal() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeModal();
    });

    thumbItems.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const src = thumb.dataset.src;
        if (src && imageEl) {
          imageEl.style.backgroundImage = `url('${src}')`;
          thumbItems.forEach((item) => item.classList.remove('active'));
          thumb.classList.add('active');
        }
      });
    });
  }

  function initRoomGallery() {
    const roomCards = Array.from(document.querySelectorAll('.rooms-preview .room-card'));
    roomCards.forEach((card) => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const images = JSON.parse(card.dataset.images || '[]');
        const title = card.querySelector('.room-info h3')?.textContent || 'Room Gallery';
        showRoomGallery(images, title);
      });
    });
  }

  function initRoomsSlider() {
    const slider = document.getElementById('roomsSlider');
    const track = document.getElementById('roomsTrack');
    const dotsContainer = document.getElementById('roomsDots');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    if (!slider || !track || !dotsContainer || !prevBtn || !nextBtn) return;

    const cards = Array.from(track.querySelectorAll('.room-card'));
    if (!cards.length) return;

    let currentIndex = 0;
    let autoTimer = null;

    function getSlideWidth() {
      const card = track.querySelector('.room-card');
      if (!card) return 0;
      const style = window.getComputedStyle(card);
      const gap = 24;
      return card.getBoundingClientRect().width + gap;
    }

    function updateDots() {
      const dots = Array.from(dotsContainer.children);
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });
    }

    function goToSlide(index) {
      currentIndex = (index + cards.length) % cards.length;
      const offset = getSlideWidth() * currentIndex;
      slider.querySelector('.rooms-frame').scrollTo({ left: offset, behavior: 'smooth' });
      updateDots();
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(nextSlide, 2600);
    }

    function stopAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    cards.forEach((card, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = index === 0 ? 'active' : '';
      button.addEventListener('click', () => {
        stopAuto();
        goToSlide(index);
        startAuto();
      });
      dotsContainer.appendChild(button);
    });

    prevBtn.addEventListener('click', () => {
      stopAuto();
      prevSlide();
      startAuto();
    });

    nextBtn.addEventListener('click', () => {
      stopAuto();
      nextSlide();
      startAuto();
    });

    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', startAuto);

    goToSlide(0);
    startAuto();
  }

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      burger.classList.toggle('active');
    });
  }

  const currentCustomerAuth = getCustomerAuth();

  function updateAuthUI() {
    const auth = getCustomerAuth();
    const logoutEls = Array.from(document.querySelectorAll('.customerLogout, #customerLogout'));
    logoutEls.forEach((el) => {
      if (auth && auth.loggedIn) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // Fix login link paths and hide them when logged in
    const loginAnchors = Array.from(document.querySelectorAll('a[href$="login.html"]'));
    loginAnchors.forEach((a) => {
      // Ensure correct path based on location
      const basePath = window.location.pathname.includes('/pages/') ? '../' : '';
      a.href = basePath + 'login.html';

      if (auth && auth.loggedIn) {
        a.style.display = 'none';
        a.classList.remove('login-button-bold');
      } else {
        a.style.display = '';
        a.textContent = 'Login';
        a.classList.add('login-button-bold');
      }
    });

    // Toggle Book Now visibility - hide when logged out, show when logged in
    const bookNowLinks = Array.from(document.querySelectorAll('a[href*="booking.html"].nav-cta'));
    bookNowLinks.forEach((btn) => {
      if (auth && auth.loggedIn) {
        btn.style.display = '';
      } else {
        btn.style.display = 'none';
      }
    });

    // Also handle mobile menu Book Now links
    const mobileBookNow = Array.from(document.querySelectorAll('#mobileMenu a[href*="booking.html"]'));
    mobileBookNow.forEach((link) => {
      if (auth && auth.loggedIn) {
        link.style.display = '';
      } else {
        link.style.display = 'none';
      }
    });

    // Add account icon next to sign-out in nav-actions
    const navActions = Array.from(document.querySelectorAll('.nav-actions'));
    navActions.forEach((container) => {
      let nameEl = container.querySelector('.nav-username');
      if (!nameEl) {
        nameEl = document.createElement('a');
        nameEl.className = 'nav-username';
        nameEl.setAttribute('aria-label', 'Customer account');
        // Dynamically set correct path based on current location
        const basePath = window.location.pathname.includes('/pages/') ? '../' : '';
        nameEl.href = basePath + 'customer-dashboard.html';
        nameEl.style.marginRight = '8px';
        container.insertBefore(nameEl, container.firstChild);
      }
      if (auth && auth.loggedIn) {
        nameEl.textContent = '👤';
        nameEl.title = auth.name || 'Account';
        nameEl.style.display = '';
      } else {
        nameEl.style.display = 'none';
      }
    });
  }

  // Initialize visibility of auth-related UI
  updateAuthUI();

  if (customerLoginForm || customerSignupForm) {
    if (currentCustomerAuth && currentCustomerAuth.loggedIn) {
      window.location.href = 'customer-dashboard.html';
      return;
    }
    initAuthPage();
  }

  // Attach sign-out click handlers to show confirmation modal
  const logoutElements = Array.from(document.querySelectorAll('.customerLogout, #customerLogout'));
  if (logoutElements && logoutElements.length) {
    logoutElements.forEach((el) => {
      el.addEventListener('click', showSignOutConfirm);
    });
  }

  if (customerDashboardPage) {
    renderCustomerDashboard();
  }

  if (bookingPage) {
    initBookingPage();
  }

  renderHomepageStats();
  renderRoomsGrid();
  initRoomGallery();
  initRoomsSlider();

  updateNavbarScroll();
  animateReveal();
  window.addEventListener('scroll', () => {
    updateNavbarScroll();
    animateReveal();
  });
});
