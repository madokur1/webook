// API Client for frontend interactions
class ApiClient {
  constructor(baseURL) {
    const origin = window.location.origin && window.location.origin !== 'null'
      ? window.location.origin
      : 'http://localhost:5000';
    const useLocalBackend = window.location.protocol === 'file:' || (
      ['localhost', '127.0.0.1'].includes(window.location.hostname) && window.location.port !== '5000'
    );
    this.baseURL = baseURL || `${useLocalBackend ? 'http://localhost:5000' : origin}/api`;
    this.token = localStorage.getItem('auth_token');
  }

  // Set token after login
  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Remove token on logout
  removeToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  register(email, password, fullName, phone) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, phone, userType: 'customer' })
    });
  }

  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  verifyAccount(email, code) {
    return this.request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    });
  }

  getCurrentUser() {
    return this.request('/auth/me');
  }

  // Room endpoints
  getRooms() {
    return this.request('/rooms');
  }

  getRoom(id) {
    return this.request(`/rooms/${id}`);
  }

  checkRoomAvailability(roomId, checkInDate, checkOutDate) {
    return this.request(`/rooms/${roomId}/check-availability`, {
      method: 'POST',
      body: JSON.stringify({ checkInDate, checkOutDate })
    });
  }

  createRoom(roomData) {
    return this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    });
  }

  updateRoom(id, roomData) {
    return this.request(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData)
    });
  }

  deleteRoom(id) {
    return this.request(`/rooms/${id}`, {
      method: 'DELETE'
    });
  }

  // Booking endpoints
  createBooking(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  getMyBookings() {
    return this.request('/bookings/my-bookings');
  }

  getBooking(id) {
    return this.request(`/bookings/${id}`);
  }

  getAllBookings(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/bookings?${params}`);
  }

  updateBooking(id, bookingData) {
    return this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData)
    });
  }

  cancelBooking(id, reason = '') {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  getBookingStats() {
    return this.request('/bookings/stats/overview');
  }
}

// Create global instance
const api = new ApiClient();
