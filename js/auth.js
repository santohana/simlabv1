/* ===== Authentication Module ===== */
function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="logo">🔬</div>
        <h1>SIM-LAB</h1>
        <p class="subtitle">Sistem Informasi Manajemen Laboratorium</p>
        <form id="loginForm" onsubmit="handleLogin(event)">
          <div class="form-group">
            <label>Username</label>
            <input type="text" id="loginUser" placeholder="Masukkan username" required autocomplete="username">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="loginPass" placeholder="Masukkan password" required autocomplete="current-password">
          </div>
          <div id="loginError" style="color:var(--danger);font-size:.85rem;margin-bottom:1rem;display:none"></div>
          <button type="submit" class="btn btn-primary btn-block">Masuk ke Sistem</button>
        </form>
        <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--border)">
          <p style="font-size:.75rem;color:var(--text-muted);text-align:center;margin-bottom:.5rem">Akun Tersedia:</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.35rem;font-size:.7rem;color:var(--text-secondary)">
            <div>👨‍💼 admin / admin123</div>
            <div>🧑‍🔬 laboran / laboran123</div>
            <div>👨‍🏫 guru / guru123</div>
            <div>👨‍🎓 siswa / siswa123</div>
          </div>
        </div>
      </div>
    </div>`;
  document.getElementById('loginUser').focus();
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  const users = DB.getAll('users');
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    DB.setSession({ id: user.id, nama: user.nama, username: user.username, role: user.role, email: user.email });
    window.location.hash = '#dashboard';
    initApp();
  } else {
    const err = document.getElementById('loginError');
    err.textContent = 'Username atau password salah!';
    err.style.display = 'block';
    document.getElementById('loginPass').value = '';
  }
}

function handleLogout() {
  DB.clearSession();
  window.location.hash = '';
  renderLogin();
}
