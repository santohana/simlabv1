/* ===== Dashboard Module ===== */
function renderDashboard(container, session) {
  const role = session.role;
  if (role === 'admin') renderAdminDashboard(container);
  else if (role === 'laboran') renderLaboranDashboard(container);
  else if (role === 'guru') renderGuruDashboard(container, session);
  else renderSiswaDashboard(container);
}

function renderAdminDashboard(container) {
  const labs = DB.getAll('labs');
  const alat = DB.getAll('alat');
  const users = DB.getAll('users');
  const jadwal = DB.getAll('jadwal');
  const peminjaman = DB.getAll('peminjaman');
  const rusak = alat.filter(a => a.kondisi === 'Rusak berat' || a.kondisi === 'Rusak ringan');
  const totalAlat = alat.reduce((s, a) => s + a.jumlah, 0);
  const pinjamAktif = peminjaman.filter(p => p.status === 'Dipinjam').length;

  container.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-icon cyan">${ICONS.dashboard}</div><div class="stat-info"><h4>${labs.length}</h4><span>Laboratorium</span></div></div>
      <div class="stat-card"><div class="stat-icon blue">${ICONS.inventory}</div><div class="stat-info"><h4>${totalAlat}</h4><span>Total Alat</span></div></div>
      <div class="stat-card"><div class="stat-icon purple">${ICONS.users}</div><div class="stat-info"><h4>${users.length}</h4><span>Pengguna</span></div></div>
      <div class="stat-card"><div class="stat-icon red">${ICONS.catalog}</div><div class="stat-info"><h4>${rusak.length}</h4><span>Alat Rusak</span></div></div>
      <div class="stat-card"><div class="stat-icon green">${ICONS.borrow}</div><div class="stat-info"><h4>${pinjamAktif}</h4><span>Peminjaman Aktif</span></div></div>
      <div class="stat-card"><div class="stat-icon yellow">${ICONS.calendar}</div><div class="stat-info"><h4>${jadwal.filter(j=>j.status==='pending').length}</h4><span>Jadwal Pending</span></div></div>
    </div>
    <div class="grid-2 mb-2">
      <div class="card">
        <div class="card-header"><h3>📊 Statistik Peminjaman</h3></div>
        <div class="chart-container"><canvas id="borrowChart"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header"><h3>📦 Alat per Kategori</h3></div>
        <div class="chart-container"><canvas id="categoryChart"></canvas></div>
      </div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h3>📅 Jadwal Hari Ini</h3></div>
        ${renderTodaySchedule()}
      </div>
      <div class="card">
        <div class="card-header"><h3>🔔 Aktivitas Terbaru</h3></div>
        ${renderRecentActivity()}
      </div>
    </div>`;
  initDashboardCharts();
}

function renderLaboranDashboard(container) {
  const alat = DB.getAll('alat');
  const peminjaman = DB.getAll('peminjaman');
  const rusak = alat.filter(a => a.kondisi === 'Rusak berat' || a.kondisi === 'Rusak ringan');
  const pendingPinjam = peminjaman.filter(p => p.status === 'Menunggu').length;
  const totalAlat = alat.reduce((s, a) => s + a.jumlah, 0);

  container.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-icon cyan">${ICONS.calendar}</div><div class="stat-info"><h4>${DB.getAll('jadwal').filter(j=>j.status==='pending').length}</h4><span>Jadwal Menunggu</span></div></div>
      <div class="stat-card"><div class="stat-icon yellow">${ICONS.borrow}</div><div class="stat-info"><h4>${pendingPinjam}</h4><span>Peminjaman Menunggu</span></div></div>
      <div class="stat-card"><div class="stat-icon blue">${ICONS.inventory}</div><div class="stat-info"><h4>${totalAlat}</h4><span>Total Stok Alat</span></div></div>
      <div class="stat-card"><div class="stat-icon red">${ICONS.catalog}</div><div class="stat-info"><h4>${rusak.length}</h4><span>Alat Rusak</span></div></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h3>📅 Jadwal Hari Ini</h3></div>
        ${renderTodaySchedule()}
      </div>
      <div class="card">
        <div class="card-header"><h3>⚠️ Alat Perlu Perhatian</h3></div>
        ${rusak.length === 0 ? '<div class="empty-state"><h4>Semua alat dalam kondisi baik</h4></div>' :
        `<div style="max-height:280px;overflow-y:auto">${rusak.map(a => `
          <div style="display:flex;align-items:center;gap:.75rem;padding:.6rem 0;border-bottom:1px solid var(--border)">
            <span style="font-size:1.3rem">${KATEGORI_EMOJI[a.kategori] || '🔧'}</span>
            <div style="flex:1"><div style="font-size:.9rem;font-weight:500">${a.nama_alat}</div><div style="font-size:.75rem;color:var(--text-muted)">${a.kode_alat}</div></div>
            <span class="badge ${KONDISI_BADGE[a.kondisi]}">${a.kondisi}</span>
          </div>`).join('')}</div>`}
      </div>
    </div>`;
}

function renderGuruDashboard(container, session) {
  const jadwal = DB.getAll('jadwal').filter(j => j.guru_id === session.id);
  const peminjaman = DB.getAll('peminjaman').filter(p => p.user_id === session.id);
  const today = new Date().toISOString().split('T')[0];
  const upcoming = jadwal.filter(j => j.tanggal >= today).sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  container.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-icon cyan">${ICONS.calendar}</div><div class="stat-info"><h4>${upcoming.length}</h4><span>Jadwal Mendatang</span></div></div>
      <div class="stat-card"><div class="stat-icon yellow">${ICONS.calendar}</div><div class="stat-info"><h4>${jadwal.filter(j=>j.status==='pending').length}</h4><span>Menunggu Persetujuan</span></div></div>
      <div class="stat-card"><div class="stat-icon blue">${ICONS.borrow}</div><div class="stat-info"><h4>${peminjaman.filter(p=>p.status==='Dipinjam').length}</h4><span>Sedang Dipinjam</span></div></div>
      <div class="stat-card"><div class="stat-icon green">${ICONS.report}</div><div class="stat-info"><h4>${jadwal.filter(j=>j.status==='approved').length}</h4><span>Total Disetujui</span></div></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h3>📅 Jadwal Praktikum Mendatang</h3></div>
        ${upcoming.length === 0 ? '<div class="empty-state"><h4>Belum ada jadwal</h4></div>' :
        `<div style="max-height:300px;overflow-y:auto">${upcoming.slice(0, 5).map(j => `
          <div style="display:flex;align-items:center;gap:.75rem;padding:.65rem 0;border-bottom:1px solid var(--border)">
            <div style="text-align:center;background:var(--bg-hover);border-radius:8px;padding:.4rem .6rem;min-width:50px">
              <div style="font-size:1.1rem;font-weight:700">${new Date(j.tanggal).getDate()}</div>
              <div style="font-size:.65rem;color:var(--text-muted)">${new Date(j.tanggal).toLocaleDateString('id-ID',{month:'short'})}</div>
            </div>
            <div style="flex:1"><div style="font-size:.9rem;font-weight:500">${j.kegiatan}</div><div style="font-size:.75rem;color:var(--text-muted)">${getLabName(j.laboratorium_id)} • ${j.jam_mulai}-${j.jam_selesai}</div></div>
            <span class="badge ${STATUS_BADGE_JADWAL[j.status]}">${STATUS_LABEL_JADWAL[j.status]}</span>
          </div>`).join('')}</div>`}
      </div>
      <div class="card">
        <div class="card-header"><h3>📋 Status Peminjaman</h3></div>
        ${peminjaman.length === 0 ? '<div class="empty-state"><h4>Belum ada peminjaman</h4></div>' :
        `<div style="max-height:300px;overflow-y:auto">${peminjaman.map(p => {
          const details = DB.getAll('detail_peminjaman').filter(d => d.peminjaman_id === p.id);
          return `<div style="padding:.65rem 0;border-bottom:1px solid var(--border)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.25rem">
              <span style="font-size:.85rem;font-weight:500">${formatDate(p.tanggal_pinjam)}</span>
              <span class="badge ${STATUS_BADGE_PINJAM[p.status]}">${p.status}</span>
            </div>
            <div style="font-size:.75rem;color:var(--text-muted)">${details.map(d => getAlatName(d.alat_id) + ' ('+d.jumlah+')').join(', ')}</div>
          </div>`;}).join('')}</div>`}
      </div>
    </div>`;
}

function renderSiswaDashboard(container) {
  const jadwal = DB.getAll('jadwal').filter(j => j.status === 'approved');
  const today = new Date().toISOString().split('T')[0];
  const upcoming = jadwal.filter(j => j.tanggal >= today).sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  const alat = DB.getAll('alat');
  const kategoris = [...new Set(alat.map(a => a.kategori))];

  container.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-icon cyan">${ICONS.calendar}</div><div class="stat-info"><h4>${upcoming.length}</h4><span>Jadwal Mendatang</span></div></div>
      <div class="stat-card"><div class="stat-icon blue">${ICONS.inventory}</div><div class="stat-info"><h4>${alat.length}</h4><span>Jenis Alat</span></div></div>
      <div class="stat-card"><div class="stat-icon purple">${ICONS.catalog}</div><div class="stat-info"><h4>${kategoris.length}</h4><span>Kategori Alat</span></div></div>
      <div class="stat-card"><div class="stat-icon green">${ICONS.dashboard}</div><div class="stat-info"><h4>${DB.getAll('labs').length}</h4><span>Laboratorium</span></div></div>
    </div>
    <div class="card">
      <div class="card-header"><h3>📅 Jadwal Lab Mendatang</h3></div>
      ${upcoming.length === 0 ? '<div class="empty-state"><h4>Tidak ada jadwal mendatang</h4></div>' :
      `<div class="table-wrapper"><table><thead><tr><th>Tanggal</th><th>Waktu</th><th>Kegiatan</th><th>Lab</th><th>Guru</th><th>Kelas</th></tr></thead><tbody>
      ${upcoming.slice(0, 10).map(j => `<tr><td>${formatDate(j.tanggal)}</td><td>${j.jam_mulai}-${j.jam_selesai}</td><td>${j.kegiatan}</td><td>${getLabName(j.laboratorium_id)}</td><td>${getUserName(j.guru_id)}</td><td>${j.kelas}</td></tr>`).join('')}
      </tbody></table></div>`}
    </div>`;
}

// Helper: today's schedule list
function renderTodaySchedule() {
  const today = new Date().toISOString().split('T')[0];
  const todayJadwal = DB.getAll('jadwal').filter(j => j.tanggal === today && j.status === 'approved');
  if (todayJadwal.length === 0) return '<div class="empty-state"><h4>Tidak ada jadwal hari ini</h4></div>';
  return `<div style="max-height:280px;overflow-y:auto">${todayJadwal.map(j => `
    <div style="display:flex;align-items:center;gap:.75rem;padding:.6rem 0;border-bottom:1px solid var(--border)">
      <div style="background:rgba(6,182,212,.1);color:var(--accent);border-radius:8px;padding:.35rem .6rem;font-size:.8rem;font-weight:600;white-space:nowrap">${j.jam_mulai}-${j.jam_selesai}</div>
      <div style="flex:1"><div style="font-size:.9rem;font-weight:500">${j.kegiatan}</div><div style="font-size:.75rem;color:var(--text-muted)">${getLabName(j.laboratorium_id)} • ${j.kelas} • ${getUserName(j.guru_id)}</div></div>
    </div>`).join('')}</div>`;
}

function renderRecentActivity() {
  const notifs = DB.getAll('notifikasi').sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (notifs.length === 0) return '<div class="empty-state"><h4>Belum ada aktivitas</h4></div>';
  return `<div style="max-height:280px;overflow-y:auto">${notifs.slice(0, 6).map(n => `
    <div style="display:flex;align-items:flex-start;gap:.75rem;padding:.6rem 0;border-bottom:1px solid var(--border)">
      <div style="width:8px;height:8px;border-radius:50%;margin-top:6px;flex-shrink:0;background:${n.read ? 'var(--text-muted)' : 'var(--accent)'}"></div>
      <div><div style="font-size:.85rem;line-height:1.4">${n.pesan}</div><div style="font-size:.7rem;color:var(--text-muted);margin-top:.2rem">${formatDateTime(n.created_at)}</div></div>
    </div>`).join('')}</div>`;
}

// Charts
function initDashboardCharts() {
  if (typeof Chart === 'undefined') return;
  const peminjaman = DB.getAll('peminjaman');
  const ctx1 = document.getElementById('borrowChart');
  if (ctx1) {
    new Chart(ctx1, { type: 'bar', data: {
      labels: ['Menunggu', 'Dipinjam', 'Dikembalikan', 'Terlambat', 'Ditolak'],
      datasets: [{ label: 'Jumlah', data: ['Menunggu','Dipinjam','Dikembalikan','Terlambat','Ditolak'].map(s => peminjaman.filter(p => p.status === s).length),
        backgroundColor: ['rgba(245,158,11,.6)','rgba(6,182,212,.6)','rgba(16,185,129,.6)','rgba(239,68,68,.6)','rgba(100,116,139,.6)'],
        borderRadius: 6, borderSkipped: false }]
    }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: 'rgba(148,163,184,.1)' } }, x: { ticks: { color: '#94a3b8' }, grid: { display: false } } } } });
  }
  const alat = DB.getAll('alat');
  const cats = [...new Set(alat.map(a => a.kategori))];
  const ctx2 = document.getElementById('categoryChart');
  if (ctx2) {
    new Chart(ctx2, { type: 'doughnut', data: {
      labels: cats, datasets: [{ data: cats.map(c => alat.filter(a => a.kategori === c).reduce((s, a) => s + a.jumlah, 0)),
        backgroundColor: ['rgba(6,182,212,.7)','rgba(59,130,246,.7)','rgba(139,92,246,.7)','rgba(16,185,129,.7)','rgba(245,158,11,.7)','rgba(239,68,68,.7)'],
        borderWidth: 0 }]
    }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, font: { size: 11 } } } } } });
  }
}
