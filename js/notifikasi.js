/* ===== Notifikasi Module ===== */
function renderNotifPanel() {
  const session = DB.getSession();
  if (!session) return;
  const notifs = DB.getAll('notifikasi').filter(n => n.user_id === session.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const panel = document.getElementById('notifPanel');
  panel.innerHTML = `
    <div class="notif-panel-header">
      <span>Notifikasi</span>
      ${notifs.some(n => !n.read) ? `<button class="btn btn-sm" style="font-size:.7rem;padding:.2rem .5rem" onclick="markAllRead()">Tandai semua dibaca</button>` : ''}
    </div>
    <div class="notif-panel-body">
      ${notifs.length === 0 ? '<div class="notif-empty">Tidak ada notifikasi</div>' :
      notifs.slice(0, 8).map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotifRead('${n.id}')">
          <div class="notif-icon" style="background:${n.tipe==='jadwal'?'rgba(6,182,212,.15)':n.tipe==='peminjaman'?'rgba(139,92,246,.15)':n.tipe==='alat'?'rgba(239,68,68,.15)':'rgba(245,158,11,.15)'}">
            ${n.tipe==='jadwal'?'📅':n.tipe==='peminjaman'?'📋':n.tipe==='alat'?'🔧':'📦'}
          </div>
          <div>
            <div class="notif-text">${n.pesan}</div>
            <div class="notif-time">${formatDateTime(n.created_at)}</div>
          </div>
        </div>`).join('')}
    </div>`;
}

async function markNotifRead(id) {
  await DB.update('notifikasi', id, { read: true });
  renderNotifPanel();
  updateNotifBadge();
}

async function markAllRead() {
  const session = DB.getSession();
  const unread = DB.getAll('notifikasi').filter(n => n.user_id === session.id && !n.read);
  for (const n of unread) {
    await DB.update('notifikasi', n.id, { read: true });
  }
  renderNotifPanel();
  updateNotifBadge();
}

function updateNotifBadge() {
  const session = DB.getSession();
  if (!session) return;
  const count = DB.getAll('notifikasi').filter(n => n.user_id === session.id && !n.read).length;
  const badge = document.querySelector('.notif-count');
  if (badge) {
    if (count > 0) { badge.textContent = count; badge.style.display = 'flex'; }
    else { badge.style.display = 'none'; }
  } else if (count > 0) {
    const btn = document.getElementById('notifBtn');
    if (btn) { const s = document.createElement('span'); s.className = 'notif-count'; s.textContent = count; btn.appendChild(s); }
  }
}
