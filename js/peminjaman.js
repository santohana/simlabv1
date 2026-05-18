/* ===== Peminjaman Module ===== */
function renderPeminjaman(container, session) {
  const peminjaman = DB.getAll('peminjaman');
  const isLaboran = ['admin','laboran'].includes(session.role);
  const filtered = isLaboran ? peminjaman : peminjaman.filter(p => p.user_id === session.id);

  container.innerHTML = `
    <div class="flex-between mb-2">
      <div class="filters-bar" style="margin-bottom:0">
        <select id="pinjamFilter" onchange="filterPinjam()"><option value="">Semua Status</option><option>Menunggu</option><option>Dipinjam</option><option>Dikembalikan</option><option>Terlambat</option><option>Ditolak</option></select>
      </div>
      ${session.role !== 'siswa' ? `<button class="btn btn-primary btn-sm" onclick="showAddPeminjaman()">${ICONS.plus} Ajukan Peminjaman</button>` : ''}
    </div>
    <div class="card">
      <div class="table-wrapper"><table><thead><tr><th>No</th>${isLaboran?'<th>Peminjam</th>':''}<th>Tgl Pinjam</th><th>Tgl Kembali</th><th>Alat</th><th>Status</th><th>Aksi</th></tr></thead>
      <tbody id="pinjamTableBody">
      ${filtered.sort((a,b)=>b.tanggal_pinjam.localeCompare(a.tanggal_pinjam)).map((p,i) => {
        const details = DB.getAll('detail_peminjaman').filter(d => d.peminjaman_id === p.id);
        const alatList = details.map(d => `${getAlatName(d.alat_id)} (${d.jumlah})`).join(', ');
        return `<tr data-status="${p.status}">
          <td>${i+1}</td>${isLaboran?`<td>${getUserName(p.user_id)}</td>`:''}
          <td>${formatDate(p.tanggal_pinjam)}</td><td>${formatDate(p.tanggal_kembali)}</td>
          <td style="font-size:.8rem;max-width:200px">${alatList || '-'}</td>
          <td><span class="badge ${STATUS_BADGE_PINJAM[p.status]}">${p.status}</span></td>
          <td><div class="table-actions">
            <button class="btn btn-secondary btn-sm" onclick="showPinjamDetail('${p.id}')">${ICONS.eye}</button>
            ${isLaboran && p.status==='Menunggu'?`<button class="btn btn-success btn-sm" onclick="approvePinjam('${p.id}')">${ICONS.check}</button><button class="btn btn-danger btn-sm" onclick="rejectPinjam('${p.id}')">${ICONS.x}</button>`:''}
            ${isLaboran && p.status==='Dipinjam'?`<button class="btn btn-warning btn-sm" onclick="returnPinjam('${p.id}')" title="Kembalikan">↩</button>`:''}
          </div></td></tr>`;
      }).join('')}
      </tbody></table></div>
    </div>`;
}

function filterPinjam() {
  const s = document.getElementById('pinjamFilter').value;
  document.querySelectorAll('#pinjamTableBody tr').forEach(r => {
    r.style.display = !s || r.dataset.status === s ? '' : 'none';
  });
}

function showPinjamDetail(id) {
  const p = DB.getById('peminjaman', id);
  if (!p) return;
  const details = DB.getAll('detail_peminjaman').filter(d => d.peminjaman_id === id);
  showModal('Detail Peminjaman', `
    <div class="detail-row"><span class="label">Peminjam</span><span class="value">${getUserName(p.user_id)}</span></div>
    <div class="detail-row"><span class="label">Tgl Pinjam</span><span class="value">${formatDate(p.tanggal_pinjam)}</span></div>
    <div class="detail-row"><span class="label">Tgl Kembali</span><span class="value">${formatDate(p.tanggal_kembali)}</span></div>
    <div class="detail-row"><span class="label">Status</span><span class="value"><span class="badge ${STATUS_BADGE_PINJAM[p.status]}">${p.status}</span></span></div>
    <div class="detail-row"><span class="label">Catatan</span><span class="value">${p.catatan || '-'}</span></div>
    <h4 style="margin:1rem 0 .5rem;font-size:.9rem">Daftar Alat:</h4>
    <div class="table-wrapper"><table><thead><tr><th>Alat</th><th>Jumlah</th></tr></thead><tbody>
    ${details.map(d => `<tr><td>${getAlatName(d.alat_id)}</td><td>${d.jumlah}</td></tr>`).join('')}
    </tbody></table></div>`);
}

function showAddPeminjaman() {
  const alat = DB.getAll('alat').filter(a => a.kondisi === 'Baik' && a.jumlah > 0);
  showModal('Ajukan Peminjaman', `
    <form id="addPinjamForm" onsubmit="submitPinjam(event)">
      <div class="grid-2">
        <div class="form-group"><label>Tanggal Pinjam</label><input type="date" id="pTglPinjam" required></div>
        <div class="form-group"><label>Tanggal Kembali</label><input type="date" id="pTglKembali" required></div>
      </div>
      <div class="form-group"><label>Catatan</label><textarea id="pCatatan" placeholder="Tujuan peminjaman"></textarea></div>
      <h4 style="margin:.75rem 0 .5rem;font-size:.85rem">Pilih Alat:</h4>
      <div id="alatPicker" style="max-height:200px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:.5rem">
        ${alat.map(a => `
          <div style="display:flex;align-items:center;gap:.5rem;padding:.4rem;border-bottom:1px solid var(--border)">
            <input type="checkbox" class="alat-cb" value="${a.id}" data-max="${a.jumlah}" onchange="toggleAlatQty(this)">
            <span style="flex:1;font-size:.85rem">${KATEGORI_EMOJI[a.kategori]||'🔧'} ${a.nama_alat} <span style="color:var(--text-muted)">(stok: ${a.jumlah})</span></span>
            <input type="number" class="alat-qty" data-id="${a.id}" min="1" max="${a.jumlah}" value="1" style="width:60px;padding:.3rem;background:var(--bg-hover);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);font-size:.8rem;display:none">
          </div>`).join('')}
      </div>
      <button type="submit" class="btn btn-primary btn-block mt-1">Ajukan</button>
    </form>`);
}

function toggleAlatQty(cb) {
  const qty = cb.parentElement.querySelector('.alat-qty');
  qty.style.display = cb.checked ? 'block' : 'none';
}

async function submitPinjam(e) {
  e.preventDefault();
  const session = DB.getSession();
  const checked = document.querySelectorAll('.alat-cb:checked');
  if (checked.length === 0) { showToast('Pilih minimal 1 alat', 'error'); return; }

  const pinjam = await DB.add('peminjaman', {
    user_id: session.id, tanggal_pinjam: document.getElementById('pTglPinjam').value,
    tanggal_kembali: document.getElementById('pTglKembali').value, status: 'Menunggu',
    catatan: document.getElementById('pCatatan').value
  });

  for (const cb of checked) {
    const qty = parseInt(document.querySelector(`.alat-qty[data-id="${cb.value}"]`).value) || 1;
    await DB.add('detail_peminjaman', { peminjaman_id: pinjam.id, alat_id: cb.value, jumlah: qty });
  }

  await DB.add('notifikasi', { user_id: 'u2', pesan: `Pengajuan peminjaman alat dari ${session.nama}`, tipe: 'peminjaman', read: false, created_at: new Date().toISOString() });
  closeModal(); showToast('Peminjaman berhasil diajukan!'); handleRoute();
}

async function approvePinjam(id) {
  const p = DB.getById('peminjaman', id);
  await DB.update('peminjaman', id, { status: 'Dipinjam' });
  // Reduce stock
  const details = DB.getAll('detail_peminjaman').filter(d => d.peminjaman_id === id);
  for (const d of details) {
    const alat = DB.getById('alat', d.alat_id);
    if (alat) await DB.update('alat', d.alat_id, { jumlah: Math.max(0, alat.jumlah - d.jumlah) });
  }
  if (p) await DB.add('notifikasi', { user_id: p.user_id, pesan: 'Peminjaman alat Anda telah disetujui', tipe: 'peminjaman', read: false, created_at: new Date().toISOString() });
  showToast('Peminjaman disetujui, stok dikurangi'); handleRoute();
}

async function rejectPinjam(id) {
  const p = DB.getById('peminjaman', id);
  await DB.update('peminjaman', id, { status: 'Ditolak' });
  if (p) await DB.add('notifikasi', { user_id: p.user_id, pesan: 'Peminjaman alat Anda ditolak', tipe: 'peminjaman', read: false, created_at: new Date().toISOString() });
  showToast('Peminjaman ditolak', 'error'); handleRoute();
}

async function returnPinjam(id) {
  await DB.update('peminjaman', id, { status: 'Dikembalikan' });
  // Restore stock
  const details = DB.getAll('detail_peminjaman').filter(d => d.peminjaman_id === id);
  for (const d of details) {
    const alat = DB.getById('alat', d.alat_id);
    if (alat) await DB.update('alat', d.alat_id, { jumlah: alat.jumlah + d.jumlah });
  }
  showToast('Alat berhasil dikembalikan, stok dipulihkan'); handleRoute();
}
