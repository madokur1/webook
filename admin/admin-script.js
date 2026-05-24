// Minimal admin script: login, logout, simple nav placeholders
(function(){
  document.addEventListener('DOMContentLoaded', ()=>{
    const loginForm = document.getElementById('loginForm');
    if (loginForm){
      loginForm.addEventListener('submit', e=>{
        e.preventDefault();
        // very simple auth for local dev
        const user = document.getElementById('user').value.trim();
        const pass = document.getElementById('pass').value;
        if (user && pass){
          localStorage.setItem('adminAuth','true');
          localStorage.setItem('adminUser', user);
          location.replace('dashboard.html');
        } else alert('Enter username and password');
      });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn){
      logoutBtn.addEventListener('click', ()=>{
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminUser');
        location.replace('login.html');
      });
    }

    // Simple sidebar link hooks (placeholders)
    const bind = id=>{
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', e=>{
        e.preventDefault();
        const panel = document.getElementById('mainPanel');
        if (panel) panel.innerHTML = '<p>Content for '+el.textContent+'</p>';
        document.querySelectorAll('.sidebar nav a').forEach(a=>a.classList.remove('active'));
        el.classList.add('active');
      });
    };
    ['bookingsLink','roomsLink','customersLink','settingsLink'].forEach(bind);
  });
})();
