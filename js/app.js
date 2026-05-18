/* ===== Main Application — Router & Navigation ===== */
async function initApp() {
  await DB.init();
  const session = DB.getSession();
  if (!session) { renderLogin(); return; }
  renderLayout(session);
  handleRoute();
  window.onhashchange = handleRoute;
}

function renderLayout(user) {
  const role = user.role;
  const navItems = [
    { hash: '#dashboard', icon: ICONS.dashboard, label: 'Dashboard', roles: ['admin', 'laboran', 'guru', 'siswa'] },
    { hash: '#jadwal', icon: ICONS.calendar, label: 'Jadwal Lab', roles: ['admin', 'laboran', 'guru', 'siswa'] },
    { hash: '#katalog', icon: ICONS.catalog, label: 'Katalog Alat', roles: ['admin', 'laboran', 'guru', 'siswa'] },
    { hash: '#inventaris', icon: ICONS.inventory, label: 'Inventaris', roles: ['admin', 'laboran'] },
    { hash: '#peminjaman', icon: ICONS.borrow, label: 'Peminjaman', roles: ['admin', 'laboran', 'guru'] },
    { hash: '#users', icon: ICONS.users, label: 'Pengguna', roles: ['admin'] },
    { hash: '#laporan', icon: ICONS.report, label: 'Laporan', roles: ['admin', 'laboran'] }
  ];
  const notifCount = DB.getAll('notifikasi').filter(n => n.user_id === user.id && !n.read).length;

  document.getElementById('app').innerHTML = `
    <div class="app-layout">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <div class="brand-icon">🔬</div>
          <div class="brand-text"><h2>SIM-LAB</h2><span>Lab Management System</span></div>
        </div>
        <div class="sidebar-user">
          <div class="avatar">${user.nama.charAt(0)}</div>
          <div class="user-info"><h4>${user.nama}</h4><span>${roleLabel(user.role)}</span></div>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-section">Menu Utama</div>
          ${navItems.filter(n => n.roles.includes(role)).map(n => `
            <div class="nav-item" data-page="${n.hash}" onclick="window.location.hash='${n.hash}';closeSidebar()">
              ${n.icon}<span>${n.label}</span>
            </div>`).join('')}
        </nav>
        <div class="sidebar-footer">
          <div class="nav-item" onclick="handleLogout()">${ICONS.logout}<span>Keluar</span></div>
        </div>
      </aside>
      <div class="main-content">
        <header class="topbar">
          <div class="topbar-left">
            <button class="menu-toggle" onclick="toggleSidebar()">${ICONS.dashboard}</button>
            <div><h1 id="pageTitle">Dashboard</h1></div>
          </div>
          <div class="topbar-right">
            <div style="position:relative">
              <button class="notif-btn" onclick="toggleNotifPanel()" id="notifBtn">
                ${ICONS.bell}
                ${notifCount > 0 ? `<span class="notif-count">${notifCount}</span>` : ''}
              </button>
              <div class="notif-panel" id="notifPanel" style="display:none"></div>
            </div>
          </div>
        </header>
        <main class="page-content" id="pageContent"></main>
      </div>
    </div>
    <div id="modalContainer"></div>
    <div class="toast-container" id="toastContainer"></div>`;
  updateActiveNav();
}

function handleRoute() {
  const session = DB.getSession();
  if (!session) { renderLogin(); return; }
  const hash = window.location.hash || '#dashboard';
  const page = hash.split('/')[0].replace('#', '');
  const titles = { dashboard: 'Dashboard', jadwal: 'Jadwal Laboratorium', katalog: 'Katalog Alat', inventaris: 'Inventaris Alat', peminjaman: 'Peminjaman Alat', users: 'Manajemen Pengguna', laporan: 'Laporan' };
  const el = document.getElementById('pageTitle');
  if (el) el.textContent = titles[page] || 'Dashboard';
  updateActiveNav();

  const content = document.getElementById('pageContent');
  if (!content) return;
  switch (page) {
    case 'dashboard': renderDashboard(content, session); break;
    case 'jadwal': renderJadwal(content, session); break;
    case 'katalog': renderKatalog(content, session); break;
    case 'inventaris': if (['admin', 'laboran'].includes(session.role)) renderInventaris(content, session); else content.innerHTML = '<div class="empty-state"><h4>Akses Ditolak</h4></div>'; break;
    case 'peminjaman': if (['admin', 'laboran', 'guru'].includes(session.role)) renderPeminjaman(content, session); else content.innerHTML = '<div class="empty-state"><h4>Akses Ditolak</h4></div>'; break;
    case 'users': if (session.role === 'admin') renderUsers(content, session); else content.innerHTML = '<div class="empty-state"><h4>Akses Ditolak</h4></div>'; break;
    case 'laporan': if (['admin', 'laboran'].includes(session.role)) renderLaporan(content, session); else content.innerHTML = '<div class="empty-state"><h4>Akses Ditolak</h4></div>'; break;
    default: renderDashboard(content, session);
  }
}

function updateActiveNav() {
  const hash = window.location.hash || '#dashboard';
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === hash.split('/')[0]);
  });
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); }

function showToast(msg, type = 'success') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `${type === 'success' ? ICONS.check : type === 'error' ? ICONS.x : ICONS.bell} <span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(40px)'; setTimeout(() => t.remove(), 300); }, 3000);
}

function showModal(title, bodyHtml, footerHtml = '') {
  document.getElementById('modalContainer').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal">
        <div class="modal-header"><h3>${title}</h3><button class="modal-close" onclick="closeModal()">${ICONS.x}</button></div>
        <div class="modal-body">${bodyHtml}</div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>
    </div>`;
}

function closeModal() { document.getElementById('modalContainer').innerHTML = ''; }

function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  if (panel.style.display === 'none') {
    renderNotifPanel();
    panel.style.display = 'block';
    document.addEventListener('click', closeNotifOnClick);
  } else {
    panel.style.display = 'none';
    document.removeEventListener('click', closeNotifOnClick);
  }
}

function closeNotifOnClick(e) {
  if (!e.target.closest('#notifPanel') && !e.target.closest('#notifBtn')) {
    document.getElementById('notifPanel').style.display = 'none';
    document.removeEventListener('click', closeNotifOnClick);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => { initApp(); });
