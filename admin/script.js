// Admin Dashboard Script
(() => {
  const BOOKINGS_KEY = 'dredsAdminBookings';
  const ROOMS_KEY = 'dredsAdminRooms';
  const API_BASE = '/api';
  const ROOM_API = `${API_BASE}/rooms`;
  const ANALYTICS_API = `${API_BASE}/bookings/stats/analytics`;

  const state = {
    bookings: [],
    rooms: [],
    analytics: null,
    trends: null
  };

  function q(id) { return document.getElementById(id); }

  function parseAmount(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    return Number(String(value).replace(/[^0-9.-]+/g, '')) || 0;
  }

  function formatCurrency(value) {
    return '₱' + Number(value || 0).toLocaleString();
  }

  function setText(id, value) {
    const el = q(id);
    if (el) el.textContent = value;
  }

  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
  }

  function loadBookingsData() {
    const stored = localStorage.getItem(BOOKINGS_KEY);
    const sampleBookings = [
      {id: 'BK-001', customer: 'John Doe', customerEmail: 'john@example.com', phone: '09171234567', room: 'Lorheine Room', roomType: 'UNIT 1', checkin: '2025-05-25', checkout: '2025-05-27', guests: '20 guests', adults: 20, children: 0, infants: 0, pets: 0, serviceAnimal: 'No', amount: 4400, status: 'Confirmed'},
      {id: 'BK-002', customer: 'Jane Smith', customerEmail: 'jane@example.com', phone: '09179876543', room: 'Arco Room', roomType: 'UNIT 3', checkin: '2025-05-24', checkout: '2025-05-25', guests: '8 guests', adults: 8, children: 0, infants: 0, pets: 0, serviceAnimal: 'No', amount: 2200, status: 'Pending'},
      {id: 'BK-003', customer: 'Alice Johnson', customerEmail: 'alice@example.com', phone: '09173456789', room: 'Elisse Room', roomType: 'UNIT 2', checkin: '2025-05-26', checkout: '2025-05-29', guests: '10 guests', adults: 8, children: 2, infants: 0, pets: 0, serviceAnimal: 'No', amount: 6600, status: 'Confirmed'},
      {id: 'BK-004', customer: 'Bob Brown', customerEmail: 'bob@example.com', phone: '09170001122', room: 'Family Suite', roomType: 'UNIT 4', checkin: '2025-05-28', checkout: '2025-06-02', guests: '14 guests', adults: 12, children: 2, infants: 0, pets: 1, serviceAnimal: 'No', amount: 11000, status: 'Confirmed'},
      {id: 'BK-005', customer: 'Mary Lee', customerEmail: 'mary@example.com', phone: '09179887766', room: 'Deluxe Room', roomType: 'UNIT 5', checkin: '2025-05-30', checkout: '2025-06-01', guests: '6 guests', adults: 6, children: 0, infants: 0, pets: 0, serviceAnimal: 'No', amount: 4400, status: 'Cancelled'}
    ];

    if (stored) {
      try {
        state.bookings = JSON.parse(stored);
      } catch (error) {
        state.bookings = sampleBookings.slice();
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(state.bookings));
      }
    } else {
      state.bookings = sampleBookings.slice();
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(state.bookings));
    }
  }

  async function loadRoomsData() {
    try {
      const data = await fetchJson(ROOM_API);
      const rooms = Array.isArray(data.rooms) ? data.rooms : [];
      if (rooms.length) {
        state.rooms = rooms.map((room) => ({
          ...room,
          capacity: Number(room.capacity) || 0
        }));
        localStorage.setItem(ROOMS_KEY, JSON.stringify(state.rooms));
        return;
      }
    } catch (error) {
      console.warn('Rooms API failed, using fallback data.', error);
    }
    loadRoomsFallback();
  }

  function loadRoomsFallback() {
    const stored = localStorage.getItem(ROOMS_KEY);
    const sampleRooms = [
      { id: 'R-001', name: 'Lorheine Room', type: 'UNIT 1', capacity: 20, price: 2200 },
      { id: 'R-002', name: 'Elisse Room', type: 'UNIT 2', capacity: 10, price: 2200 },
      { id: 'R-003', name: 'Arco Room', type: 'UNIT 3', capacity: 8, price: 2200 },
      { id: 'R-004', name: 'Family Suite', type: 'UNIT 4', capacity: 14, price: 2200 },
      { id: 'R-005', name: 'Deluxe Room', type: 'UNIT 5', capacity: 6, price: 2200 }
    ];

    if (stored) {
      try {
        state.rooms = JSON.parse(stored).map((room) => ({
          ...room,
          capacity: Number(room.capacity) || 0
        }));
      } catch (error) {
        state.rooms = sampleRooms.slice();
        localStorage.setItem(ROOMS_KEY, JSON.stringify(state.rooms));
      }
    } else {
      state.rooms = sampleRooms.slice();
      localStorage.setItem(ROOMS_KEY, JSON.stringify(state.rooms));
    }
  }

  async function loadAnalyticsData() {
    try {
      const data = await fetchJson(ANALYTICS_API);
      state.analytics = data.summary;
      state.trends = data.trends;
    } catch (error) {
      console.warn('Analytics API failed, using local fallback.', error);
      state.analytics = null;
      state.trends = null;
    }
  }

  function renderStats() {
    const totalRooms = state.rooms.length;
    const totalCapacity = state.rooms.reduce((sum, room) => sum + (Number(room.capacity) || 0), 0);
    const pendingBookings = state.analytics?.pending_bookings ?? state.bookings.filter(b => b.status === 'Pending').length;
    const confirmedBookings = state.analytics?.confirmed_bookings ?? state.bookings.filter(b => b.status === 'Confirmed').length;
    const totalRevenue = state.analytics?.total_revenue ?? state.bookings.reduce((sum, b) => sum + parseAmount(b.amount), 0);
    const occupancyRate = state.analytics?.occupancy_rate != null ? `${state.analytics.occupancy_rate}%` : '--';

    q('statRooms').textContent = totalRooms;
    q('statCapacity').textContent = `${totalCapacity} guests`;
    q('statNewBookings').textContent = pendingBookings;
    q('statConfirmed').textContent = confirmedBookings;
    q('statTotalRevenue').textContent = formatCurrency(totalRevenue);

    setText('snapshotTotalRooms', state.analytics?.total_rooms ?? totalRooms ?? '--');
    setText('snapshotPendingBookings', pendingBookings);
    setText('snapshotConfirmedBookings', confirmedBookings);
    setText('snapshotTotalCapacity', state.analytics?.total_capacity ? `${state.analytics.total_capacity} guests` : `${totalCapacity} guests`);
    setText('snapshotTotalGuests', state.analytics?.total_guests ?? '--');
    setText('snapshotCheckedIn', state.analytics?.currently_checked_in ?? '--');
    setText('snapshotOccupancy', occupancyRate);
  }

  function getMonthlySummary() {
    if (state.trends && Array.isArray(state.trends.bookingsByMonth) && Array.isArray(state.trends.revenueByMonth)) {
      return {
        labels: state.trends.labels,
        bookingsByMonth: state.trends.bookingsByMonth,
        revenueByMonth: state.trends.revenueByMonth
      };
    }

    const months = Array.from({ length: 12 }, (_, i) => new Date(Date.now() - ((11 - i) * 30 * 24 * 60 * 60 * 1000)).toLocaleString('en', { month: 'short' }));
    const bookingsByMonth = Array(12).fill(0);
    const revenueByMonth = Array(12).fill(0);

    state.bookings.forEach((booking) => {
      const date = new Date(booking.checkin || booking.createdAt || booking.date);
      if (Number.isNaN(date.getTime())) return;
      const monthIndex = date.getMonth();
      bookingsByMonth[monthIndex] += 1;
      revenueByMonth[monthIndex] += parseAmount(booking.amount);
    });

    return { labels: months, bookingsByMonth, revenueByMonth };
  }

  let analyticsChart = null;

  function initAnalyticsChart() {
    const chartEl = document.getElementById('analyticsChart');
    if (!chartEl) return;

    const summary = getMonthlySummary();
    const ctx = chartEl.getContext('2d');
    const revenueGradient = ctx.createLinearGradient(0, 0, 0, 260);
    revenueGradient.addColorStop(0, 'rgba(76, 175, 80, 0.35)');
    revenueGradient.addColorStop(1, 'rgba(76, 175, 80, 0.05)');

    const bookingsGradient = ctx.createLinearGradient(0, 0, 0, 260);
    bookingsGradient.addColorStop(0, 'rgba(33, 150, 243, 0.35)');
    bookingsGradient.addColorStop(1, 'rgba(33, 150, 243, 0.05)');

    if (analyticsChart) {
      analyticsChart.destroy();
    }

    analyticsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: summary.labels,
        datasets: [
          {
            label: 'Bookings',
            data: summary.bookingsByMonth,
            borderColor: '#2196F3',
            backgroundColor: bookingsGradient,
            fill: true,
            tension: 0.38,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#2196F3',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          },
          {
            label: 'Revenue',
            data: summary.revenueByMonth,
            borderColor: '#4CAF50',
            backgroundColor: revenueGradient,
            fill: true,
            tension: 0.38,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#4CAF50',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            yAxisID: 'revenueAxis'
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              padding: 16,
              color: '#ffffff'
            }
          },
          tooltip: {
            callbacks: {
              label(context) {
                if (context.dataset.label === 'Revenue') {
                  return `${context.dataset.label}: ₱${Number(context.parsed.y).toLocaleString()}`;
                }
                return `${context.dataset.label}: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.08)' },
            ticks: { color: '#e9ecef' }
          },
          y: {
            type: 'linear',
            beginAtZero: true,
            position: 'left',
            grid: { color: 'rgba(255,255,255,0.08)' },
            ticks: { color: '#e9ecef', precision: 0 }
          },
          revenueAxis: {
            type: 'linear',
            beginAtZero: true,
            position: 'right',
            grid: { display: false },
            ticks: { color: '#e9ecef', callback: value => `₱${Number(value).toLocaleString()}` }
          }
        }
      }
    });
  }


  function bindUI() {
    document.querySelectorAll('.sidebar .nav-link').forEach((a) => {
      a.addEventListener('click', () => {
        document.querySelectorAll('.sidebar .nav-link').forEach((x) => x.classList.remove('active'));
        a.classList.add('active');
      });
    });

    const toggle = document.getElementById('toggleSidebar');
    toggle && toggle.addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));

    const logout = document.getElementById('logoutBtn');
    logout && logout.addEventListener('click', () => {
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminUser');
      location.replace('../index.html');
    });

    const logoutMenu = document.getElementById('logoutMenu');
    logoutMenu && logoutMenu.addEventListener('click', () => {
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminUser');
      location.replace('../index.html');
    });

    const csvButton = q('exportCsvBtn');
    const jsonButton = q('exportJsonBtn');

    csvButton && csvButton.addEventListener('click', () => exportReport('csv'));
    jsonButton && jsonButton.addEventListener('click', () => exportReport('json'));
  }

  function showFeedback(message, isError = false) {
    const feedback = q('reportFeedback');
    if (!feedback) return;
    feedback.textContent = message;
    feedback.style.color = isError ? '#ffbbbb' : '#d1f2ff';
  }

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function saveReportMetadata(report, format) {
    try {
      await fetch(`${ANALYTICS_API.replace('/analytics', '/report')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportName: 'Admin Analytics Export',
          reportType: 'dashboard',
          generatedBy: localStorage.getItem('adminUser') || 'admin',
          format,
          summary: report.summary
        })
      });
    } catch (error) {
      console.warn('Unable to save report metadata', error);
    }
  }

  function buildCsvReport(report) {
    let output = 'Metric,Value\n';
    output += `Generated At,${report.generatedAt}\n`;
    output += `Total Rooms,${report.summary.totalRooms}\n`;
    output += `Total Capacity,${report.summary.totalCapacity}\n`;
    output += `Pending Bookings,${report.summary.pendingBookings}\n`;
    output += `Confirmed Bookings,${report.summary.confirmedBookings}\n`;
    output += `Total Revenue,${report.summary.totalRevenue}\n`;
    output += `Total Guests,${report.summary.totalGuests}\n`;
    output += `Occupancy Rate,${report.summary.occupancyRate}%\n\n`;
    output += 'Month,Bookings,Revenue\n';
    report.trends.labels.forEach((month, index) => {
      output += `${month},${report.trends.bookingsByMonth[index] || 0},${report.trends.revenueByMonth[index] || 0}\n`;
    });
    return output;
  }

  function exportReport(format) {
    const totalRooms = state.rooms.length;
    const totalCapacity = state.rooms.reduce((sum, room) => sum + (Number(room.capacity) || 0), 0);
    const summary = {
      totalRooms,
      totalCapacity,
      pendingBookings: state.analytics?.pending_bookings ?? state.bookings.filter(b => b.status === 'Pending').length,
      confirmedBookings: state.analytics?.confirmed_bookings ?? state.bookings.filter(b => b.status === 'Confirmed').length,
      totalRevenue: state.analytics?.total_revenue ?? state.bookings.reduce((sum, b) => sum + parseAmount(b.amount), 0),
      totalGuests: state.analytics?.total_guests ?? state.bookings.reduce((sum, b) => sum + parseAmount(b.guests), 0),
      occupancyRate: state.analytics?.occupancy_rate ?? 0
    };
    const trends = getMonthlySummary();
    const report = {
      generatedAt: new Date().toISOString(),
      summary,
      trends
    };

    if (format === 'json') {
      const content = JSON.stringify(report, null, 2);
      downloadFile(`admin-report-${new Date().toISOString().slice(0,10)}.json`, content, 'application/json');
      showFeedback('JSON report ready to download.');
      saveReportMetadata(report, 'json');
      return;
    }

    const content = buildCsvReport(report);
    downloadFile(`admin-report-${new Date().toISOString().slice(0,10)}.csv`, content, 'text/csv');
    showFeedback('CSV report ready to download.');
    saveReportMetadata(report, 'csv');
  }

  // ensure user is authenticated
  function ensureAuth(){
    if(localStorage.getItem('adminAuth')!=='true'){
      location.replace('login.html');
    }
  }

  function watchBookingStorage() {
    window.addEventListener('storage', (event) => {
      if (event.key === BOOKINGS_KEY || event.key === ROOMS_KEY) {
        loadBookingsData();
        loadRoomsData();
        renderStats();
        initAnalyticsChart();
      }
    });
  }

  // init
  document.addEventListener('DOMContentLoaded', async () => {
    ensureAuth();
    loadBookingsData();
    await loadRoomsData();
    await loadAnalyticsData();
    renderStats();
    initAnalyticsChart();
    bindUI();
    watchBookingStorage();
  });

})();
