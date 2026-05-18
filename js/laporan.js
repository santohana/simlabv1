/* ===== Laporan (Reports) Module ===== */
function renderLaporan(container) {
  container.innerHTML = `
    <div class="filters-bar">
      <select id="reportType" onchange="generateReport()">
        <option value="usage">📊 Laporan Penggunaan Lab</option>
        <option value="inventory">📦 Laporan Inventaris</option>
        <option value="broken">⚠️ Laporan Alat Rusak</option>
        <option value="borrowing">📋 Laporan Peminjaman</option>
        <option value="schedule">📅 Laporan Jadwal</option>
      </select>
      <button class="btn btn-secondary btn-sm" onclick="exportCSV()">📥 Export CSV</button>
      <button class="btn btn-secondary btn-sm" onclick="window.print()">🖨️ Print</button>
    </div>
    <div id="reportContent"></div>`;
  generateReport();
}

function generateReport() {
  const type = document.getElementById('reportType').value;
  const el = document.getElementById('reportContent');
  switch(type) {
    case 'usage': reportUsage(el); break;
    case 'inventory': reportInventory(el); break;
    case 'broken': reportBroken(el); break;
    case 'borrowing': reportBorrowing(el); break;
    case 'schedule': reportSchedule(el); break;
  }
}

function reportUsage(el) {
  const labs = DB.getAll('labs');
  const jadwal = DB.getAll('jadwal').filter(j => j.status === 'approved');
  el.innerHTML = `
    <div class="stat-grid">
      ${labs.map(l => {
        const count = jadwal.filter(j => j.laboratorium_id === l.id).length;
        return `<div class="stat-card"><div class="stat-icon cyan">${ICONS.calendar}</div><div class="stat-info"><h4>${count}</h4><span>${l.nama_lab}</span></div></div>`;
      }).join('')}
    </div>
    <div class="card mt-1">
      <div class="card-header"><h3>Detail Penggunaan Laboratorium</h3></div>
      <div class="chart-container"><canvas id="usageChart"></canvas></div>
    </div>
    <div class="card mt-1"><div class="card-header"><h3>Riwayat Penggunaan</h3></div>
      <div class="table-wrapper"><table><thead><tr><th>Lab</th><th>Kegiatan</th><th>Tanggal</th><th>Waktu</th><th>Guru</th><th>Kelas</th></tr></thead><tbody>
      ${jadwal.sort((a,b)=>b.tanggal.localeCompare(a.tanggal)).map(j => `<tr><td>${getLabName(j.laboratorium_id)}</td><td>${j.kegiatan}</td><td>${formatDate(j.tanggal)}</td><td>${j.jam_mulai}-${j.jam_selesai}</td><td>${getUserName(j.guru_id)}</td><td>${j.kelas}</td></tr>`).join('')}
      </tbody></table></div>
    </div>`;
  if (typeof Chart !== 'undefined') {
    const ctx = document.getElementById('usageChart');
    if (ctx) new Chart(ctx, { type:'bar', data:{ labels:labs.map(l=>l.nama_lab), datasets:[{label:'Jumlah Penggunaan', data:labs.map(l=>jadwal.filter(j=>j.laboratorium_id===l.id).length), backgroundColor:['rgba(6,182,212,.6)','rgba(59,130,246,.6)','rgba(139,92,246,.6)'], borderRadius:6}] }, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{color:'#94a3b8',stepSize:1},grid:{color:'rgba(148,163,184,.1)'}},x:{ticks:{color:'#94a3b8'},grid:{display:false}}}} });
  }
}

function reportInventory(el) {
  const alat = DB.getAll('alat');
  const total = alat.reduce((s,a) => s+a.jumlah, 0);
  const cats = [...new Set(alat.map(a => a.kategori))];
  el.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-icon blue">${ICONS.inventory}</div><div class="stat-info"><h4>${alat.length}</h4><span>Jenis Alat</span></div></div>
      <div class="stat-card"><div class="stat-icon cyan">${ICONS.catalog}</div><div class="stat-info"><h4>${total}</h4><span>Total Unit</span></div></div>
      <div class="stat-card"><div class="stat-icon green">${ICONS.check}</div><div class="stat-info"><h4>${alat.filter(a=>a.kondisi==='Baik').length}</h4><span>Kondisi Baik</span></div></div>
      <div class="stat-card"><div class="stat-icon red">${ICONS.x}</div><div class="stat-info"><h4>${alat.filter(a=>a.kondisi.includes('Rusak')).length}</h4><span>Rusak</span></div></div>
    </div>
    <div class="card mt-1"><div class="card-header"><h3>Inventaris Lengkap</h3></div>
    <div class="table-wrapper" id="reportTable"><table><thead><tr><th>Kode</th><th>Nama</th><th>Kategori</th><th>Jumlah</th><th>Kondisi</th><th>Lokasi</th></tr></thead><tbody>
    ${alat.map(a => `<tr><td>${a.kode_alat}</td><td>${a.nama_alat}</td><td>${a.kategori}</td><td>${a.jumlah}</td><td>${a.kondisi}</td><td>${a.lokasi}</td></tr>`).join('')}
    </tbody></table></div></div>`;
}

function reportBroken(el) {
  const broken = DB.getAll('alat').filter(a => a.kondisi !== 'Baik');
  el.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-icon yellow">${ICONS.catalog}</div><div class="stat-info"><h4>${broken.filter(a=>a.kondisi==='Rusak ringan').length}</h4><span>Rusak Ringan</span></div></div>
      <div class="stat-card"><div class="stat-icon red">${ICONS.x}</div><div class="stat-info"><h4>${broken.filter(a=>a.kondisi==='Rusak berat').length}</h4><span>Rusak Berat</span></div></div>
      <div class="stat-card"><div class="stat-icon blue">${ICONS.inventory}</div><div class="stat-info"><h4>${broken.filter(a=>a.kondisi==='Dalam perbaikan').length}</h4><span>Dalam Perbaikan</span></div></div>
    </div>
    <div class="card mt-1"><div class="card-header"><h3>Daftar Alat Rusak/Bermasalah</h3></div>
    <div class="table-wrapper" id="reportTable"><table><thead><tr><th>Kode</th><th>Nama</th><th>Kategori</th><th>Kondisi</th><th>Lokasi</th></tr></thead><tbody>
    ${broken.length === 0 ? '<tr><td colspan="5" class="text-center" style="padding:2rem;color:var(--text-muted)">Semua alat dalam kondisi baik ✅</td></tr>' :
    broken.map(a => `<tr><td>${a.kode_alat}</td><td>${a.nama_alat}</td><td>${a.kategori}</td><td><span class="badge ${KONDISI_BADGE[a.kondisi]}">${a.kondisi}</span></td><td>${a.lokasi}</td></tr>`).join('')}
    </tbody></table></div></div>`;
}

function reportBorrowing(el) {
  const pinjam = DB.getAll('peminjaman').sort((a,b)=>b.tanggal_pinjam.localeCompare(a.tanggal_pinjam));
  el.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-icon blue">${ICONS.borrow}</div><div class="stat-info"><h4>${pinjam.length}</h4><span>Total Peminjaman</span></div></div>
      <div class="stat-card"><div class="stat-icon cyan">${ICONS.catalog}</div><div class="stat-info"><h4>${pinjam.filter(p=>p.status==='Dipinjam').length}</h4><span>Sedang Dipinjam</span></div></div>
      <div class="stat-card"><div class="stat-icon green">${ICONS.check}</div><div class="stat-info"><h4>${pinjam.filter(p=>p.status==='Dikembalikan').length}</h4><span>Dikembalikan</span></div></div>
    </div>
    <div class="card mt-1"><div class="card-header"><h3>Riwayat Peminjaman</h3></div>
    <div class="table-wrapper" id="reportTable"><table><thead><tr><th>Peminjam</th><th>Tgl Pinjam</th><th>Tgl Kembali</th><th>Alat</th><th>Status</th></tr></thead><tbody>
    ${pinjam.map(p => {
      const det = DB.getAll('detail_peminjaman').filter(d=>d.peminjaman_id===p.id).map(d=>`${getAlatName(d.alat_id)} (${d.jumlah})`).join(', ');
      return `<tr><td>${getUserName(p.user_id)}</td><td>${formatDate(p.tanggal_pinjam)}</td><td>${formatDate(p.tanggal_kembali)}</td><td style="font-size:.8rem">${det||'-'}</td><td><span class="badge ${STATUS_BADGE_PINJAM[p.status]}">${p.status}</span></td></tr>`;
    }).join('')}
    </tbody></table></div></div>`;
}

function reportSchedule(el) {
  const jadwal = DB.getAll('jadwal').sort((a,b)=>b.tanggal.localeCompare(a.tanggal));
  el.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-icon blue">${ICONS.calendar}</div><div class="stat-info"><h4>${jadwal.length}</h4><span>Total Jadwal</span></div></div>
      <div class="stat-card"><div class="stat-icon green">${ICONS.check}</div><div class="stat-info"><h4>${jadwal.filter(j=>j.status==='approved').length}</h4><span>Disetujui</span></div></div>
      <div class="stat-card"><div class="stat-icon yellow">${ICONS.bell}</div><div class="stat-info"><h4>${jadwal.filter(j=>j.status==='pending').length}</h4><span>Menunggu</span></div></div>
    </div>
    <div class="card mt-1"><div class="card-header"><h3>Semua Jadwal</h3></div>
    <div class="table-wrapper" id="reportTable"><table><thead><tr><th>Tanggal</th><th>Waktu</th><th>Kegiatan</th><th>Lab</th><th>Guru</th><th>Kelas</th><th>Status</th></tr></thead><tbody>
    ${jadwal.map(j => `<tr><td>${formatDate(j.tanggal)}</td><td>${j.jam_mulai}-${j.jam_selesai}</td><td>${j.kegiatan}</td><td>${getLabName(j.laboratorium_id)}</td><td>${getUserName(j.guru_id)}</td><td>${j.kelas}</td><td><span class="badge ${STATUS_BADGE_JADWAL[j.status]}">${STATUS_LABEL_JADWAL[j.status]}</span></td></tr>`).join('')}
    </tbody></table></div></div>`;
}

function exportCSV() {
  const table = document.querySelector('#reportTable table');
  if (!table) { showToast('Tidak ada data untuk diexport', 'error'); return; }
  let csv = '';
  table.querySelectorAll('tr').forEach(row => {
    const cols = [];
    row.querySelectorAll('th, td').forEach(cell => cols.push('"' + cell.textContent.trim().replace(/"/g, '""') + '"'));
    csv += cols.join(',') + '\n';
  });
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `laporan_${document.getElementById('reportType').value}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  showToast('File CSV berhasil didownload!');
}
