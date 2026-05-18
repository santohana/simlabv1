/* ===== Jadwal (Schedule) Module ===== */
let calYear, calMonth;

function renderJadwal(container, session) {
  const now = new Date();
  calYear = now.getFullYear();
  calMonth = now.getMonth();
  const canAdd = ['admin', 'laboran', 'guru'].includes(session.role);

  container.innerHTML = `
    <div class="flex-between mb-2">
      <div class="btn-group">
        <button class="btn btn-secondary btn-sm tab-jadwal active" onclick="switchJadwalView('calendar',this)">📅 Kalender</button>
        <button class="btn btn-secondary btn-sm tab-jadwal" onclick="switchJadwalView('list',this)">📋 Daftar</button>
      </div>
      ${canAdd ? `<button class="btn btn-primary btn-sm" onclick="showAddJadwal()">${ICONS.plus} Ajukan Jadwal</button>` : ''}
    </div>
    <div id="jadwalCalendarView">${buildCalendar()}</div>
    <div id="jadwalListView" style="display:none"></div>`;
}

function switchJadwalView(view, btn) {
  document.querySelectorAll('.tab-jadwal').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('jadwalCalendarView').style.display = view === 'calendar' ? 'block' : 'none';
  const listEl = document.getElementById('jadwalListView');
  listEl.style.display = view === 'list' ? 'block' : 'none';
  if (view === 'list') renderJadwalList(listEl);
}

function buildCalendar() {
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const days = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrev = new Date(calYear, calMonth, 0).getDate();
  const today = new Date();
  const jadwal = DB.getAll('jadwal');

  let cells = '';
  // Previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    cells += `<div class="calendar-day other-month"><span class="day-num">${daysInPrev - i}</span></div>`;
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
    const dayJadwal = jadwal.filter(j => j.tanggal === dateStr);
    cells += `<div class="calendar-day ${isToday ? 'today' : ''}" onclick="showDayDetail('${dateStr}')">
      <span class="day-num">${d}</span>
      ${dayJadwal.slice(0, 2).map(j => `<div class="calendar-event ${j.status}" title="${j.kegiatan}">${j.jam_mulai} ${j.kegiatan}</div>`).join('')}
      ${dayJadwal.length > 2 ? `<div style="font-size:.6rem;color:var(--text-muted);padding:0 .35rem">+${dayJadwal.length - 2} lainnya</div>` : ''}
    </div>`;
  }
  // Next month fill
  const totalCells = firstDay + daysInMonth;
  const remaining = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    cells += `<div class="calendar-day other-month"><span class="day-num">${i}</span></div>`;
  }

  return `<div class="calendar">
    <div class="calendar-header">
      <h3>${months[calMonth]} ${calYear}</h3>
      <div class="calendar-nav">
        <button onclick="changeCalMonth(-1)">${ICONS.chevLeft}</button>
        <button onclick="changeCalMonth(1)">${ICONS.chevRight}</button>
      </div>
    </div>
    <div class="calendar-grid">
      ${days.map(d => `<div class="calendar-day-name">${d}</div>`).join('')}
      ${cells}
    </div>
  </div>`;
}

function changeCalMonth(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0) { calMonth = 11; calYear--; }
  document.getElementById('jadwalCalendarView').innerHTML = buildCalendar();
}

function showDayDetail(dateStr) {
  const jadwal = DB.getAll('jadwal').filter(j => j.tanggal === dateStr);
  const session = DB.getSession();
  showModal(`Jadwal — ${formatDate(dateStr)}`,
    jadwal.length === 0 ? '<div class="empty-state"><h4>Tidak ada jadwal</h4></div>' :
    jadwal.map(j => `
      <div style="padding:.75rem;background:var(--bg-hover);border-radius:8px;margin-bottom:.5rem">
        <div class="flex-between" style="margin-bottom:.5rem">
          <strong style="font-size:.95rem">${j.kegiatan}</strong>
          <span class="badge ${STATUS_BADGE_JADWAL[j.status]}">${STATUS_LABEL_JADWAL[j.status]}</span>
        </div>
        <div style="font-size:.8rem;color:var(--text-secondary);display:grid;grid-template-columns:1fr 1fr;gap:.25rem">
          <span>⏰ ${j.jam_mulai} - ${j.jam_selesai}</span>
          <span>🏫 ${getLabName(j.laboratorium_id)}</span>
          <span>👨‍🏫 ${getUserName(j.guru_id)}</span>
          <span>📚 ${j.mata_pelajaran} — ${j.kelas}</span>
        </div>
        ${['admin','laboran'].includes(session.role) && j.status === 'pending' ? `
        <div class="btn-group" style="margin-top:.5rem">
          <button class="btn btn-success btn-sm" onclick="approveJadwal('${j.id}')">${ICONS.check} Setujui</button>
          <button class="btn btn-danger btn-sm" onclick="rejectJadwal('${j.id}')">${ICONS.x} Tolak</button>
        </div>` : ''}
      </div>`).join('')
  );
}

function renderJadwalList(container) {
  const jadwal = DB.getAll('jadwal').sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const session = DB.getSession();
  container.innerHTML = `
    <div class="filters-bar">
      <div class="search-box">${ICONS.search}<input type="text" placeholder="Cari kegiatan..." oninput="filterJadwalList(this.value)"></div>
      <select onchange="filterJadwalStatus(this.value)"><option value="">Semua Status</option><option value="approved">Disetujui</option><option value="pending">Menunggu</option><option value="rejected">Ditolak</option></select>
    </div>
    <div class="card">
      <div class="table-wrapper"><table><thead><tr><th>Tanggal</th><th>Waktu</th><th>Kegiatan</th><th>Lab</th><th>Guru</th><th>Kelas</th><th>Status</th>${['admin','laboran'].includes(session.role)?'<th>Aksi</th>':''}</tr></thead>
      <tbody id="jadwalTableBody">
      ${jadwal.map(j => jadwalRow(j, session)).join('')}
      </tbody></table></div>
    </div>`;
}

function jadwalRow(j, session) {
  return `<tr data-kegiatan="${j.kegiatan.toLowerCase()}" data-status="${j.status}">
    <td>${formatDate(j.tanggal)}</td><td>${j.jam_mulai}-${j.jam_selesai}</td>
    <td>${j.kegiatan}</td><td>${getLabName(j.laboratorium_id)}</td>
    <td>${getUserName(j.guru_id)}</td><td>${j.kelas}</td>
    <td><span class="badge ${STATUS_BADGE_JADWAL[j.status]}">${STATUS_LABEL_JADWAL[j.status]}</span></td>
    ${['admin','laboran'].includes(session.role) ? `<td><div class="table-actions">
      ${j.status==='pending'?`<button class="btn btn-success btn-sm" onclick="approveJadwal('${j.id}')" title="Setujui">${ICONS.check}</button><button class="btn btn-danger btn-sm" onclick="rejectJadwal('${j.id}')" title="Tolak">${ICONS.x}</button>`:''}
      <button class="btn btn-secondary btn-sm" onclick="deleteJadwal('${j.id}')" title="Hapus">${ICONS.trash}</button>
    </div></td>` : ''}
  </tr>`;
}

function filterJadwalList(q) {
  document.querySelectorAll('#jadwalTableBody tr').forEach(r => {
    r.style.display = r.dataset.kegiatan.includes(q.toLowerCase()) ? '' : 'none';
  });
}
function filterJadwalStatus(s) {
  document.querySelectorAll('#jadwalTableBody tr').forEach(r => {
    r.style.display = !s || r.dataset.status === s ? '' : 'none';
  });
}

function showAddJadwal() {
  const labs = DB.getAll('labs');
  const session = DB.getSession();
  showModal('Ajukan Jadwal Baru', `
    <form id="addJadwalForm" onsubmit="submitJadwal(event)">
      <div class="form-group"><label>Kegiatan</label><input type="text" id="jKegiatan" required placeholder="Nama kegiatan praktikum"></div>
      <div class="grid-2">
        <div class="form-group"><label>Mata Pelajaran</label><select id="jMapel" required><option value="">Pilih</option><option>Fisika</option><option>Kimia</option><option>Biologi</option></select></div>
        <div class="form-group"><label>Kelas</label><input type="text" id="jKelas" required placeholder="cth: XII IPA 1"></div>
      </div>
      <div class="form-group"><label>Laboratorium</label><select id="jLab" required><option value="">Pilih Lab</option>${labs.map(l => `<option value="${l.id}">${l.nama_lab} (${l.lokasi})</option>`).join('')}</select></div>
      <div class="form-group"><label>Tanggal</label><input type="date" id="jTanggal" required></div>
      <div class="grid-2">
        <div class="form-group"><label>Jam Mulai</label><input type="time" id="jMulai" required></div>
        <div class="form-group"><label>Jam Selesai</label><input type="time" id="jSelesai" required></div>
      </div>
      <div id="jadwalConflict" style="color:var(--danger);font-size:.85rem;display:none;margin-bottom:.75rem"></div>
      <button type="submit" class="btn btn-primary btn-block">Ajukan Jadwal</button>
    </form>`);
}

async function submitJadwal(e) {
  e.preventDefault();
  const session = DB.getSession();
  const lab = document.getElementById('jLab').value;
  const tanggal = document.getElementById('jTanggal').value;
  const mulai = document.getElementById('jMulai').value;
  const selesai = document.getElementById('jSelesai').value;

  // Conflict check
  const existing = DB.getAll('jadwal').filter(j => j.laboratorium_id === lab && j.tanggal === tanggal && j.status !== 'rejected');
  const conflict = existing.find(j => (mulai < j.jam_selesai && selesai > j.jam_mulai));
  if (conflict) {
    const el = document.getElementById('jadwalConflict');
    el.textContent = `⚠️ Jadwal bentrok dengan "${conflict.kegiatan}" (${conflict.jam_mulai}-${conflict.jam_selesai})`;
    el.style.display = 'block';
    return;
  }

  const guru_id = session.role === 'guru' ? session.id : session.id;
  await DB.add('jadwal', {
    laboratorium_id: lab, guru_id, mata_pelajaran: document.getElementById('jMapel').value,
    kelas: document.getElementById('jKelas').value, tanggal, jam_mulai: mulai, jam_selesai: selesai,
    status: ['admin', 'laboran'].includes(session.role) ? 'approved' : 'pending',
    kegiatan: document.getElementById('jKegiatan').value
  });

  if (session.role === 'guru') {
    await DB.add('notifikasi', { user_id: 'u2', pesan: `Pengajuan jadwal baru dari ${session.nama} — ${document.getElementById('jKegiatan').value}`, tipe: 'jadwal', read: false, created_at: new Date().toISOString() });
  }

  closeModal();
  showToast('Jadwal berhasil diajukan!');
  handleRoute();
}

async function approveJadwal(id) {
  await DB.update('jadwal', id, { status: 'approved' });
  const j = DB.getById('jadwal', id);
  if (j) await DB.add('notifikasi', { user_id: j.guru_id, pesan: `Jadwal "${j.kegiatan}" telah disetujui`, tipe: 'jadwal', read: false, created_at: new Date().toISOString() });
  showToast('Jadwal disetujui');
  closeModal();
  handleRoute();
}

async function rejectJadwal(id) {
  await DB.update('jadwal', id, { status: 'rejected' });
  const j = DB.getById('jadwal', id);
  if (j) await DB.add('notifikasi', { user_id: j.guru_id, pesan: `Jadwal "${j.kegiatan}" ditolak`, tipe: 'jadwal', read: false, created_at: new Date().toISOString() });
  showToast('Jadwal ditolak', 'error');
  closeModal();
  handleRoute();
}

async function deleteJadwal(id) {
  if (confirm('Hapus jadwal ini?')) {
    await DB.remove('jadwal', id);
    showToast('Jadwal dihapus');
    handleRoute();
  }
}
