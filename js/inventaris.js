/* ===== Inventaris Module ===== */
function renderInventaris(container, session) {
  const alat = DB.getAll('alat');
  container.innerHTML = `
    <div class="flex-between mb-2">
      <div class="filters-bar" style="margin-bottom:0">
        <div class="search-box">${ICONS.search}<input type="text" id="invSearch" placeholder="Cari alat..." oninput="filterInv()"></div>
        <select id="invKondisi" onchange="filterInv()"><option value="">Semua Kondisi</option><option>Baik</option><option>Rusak ringan</option><option>Rusak berat</option><option>Dalam perbaikan</option></select>
      </div>
      <button class="btn btn-primary btn-sm" onclick="showAddAlat()">${ICONS.plus} Tambah Alat</button>
    </div>
    <div class="card">
      <div class="table-wrapper"><table><thead><tr><th>Kode</th><th>Nama Alat</th><th>Kategori</th><th>Jumlah</th><th>Kondisi</th><th>Lokasi</th><th>Aksi</th></tr></thead>
      <tbody id="invTableBody">${alat.map(a => invRow(a)).join('')}</tbody></table></div>
    </div>`;
}

function invRow(a) {
  return `<tr data-nama="${a.nama_alat.toLowerCase()}" data-kondisi="${a.kondisi}">
    <td><span class="badge badge-secondary">${a.kode_alat}</span></td>
    <td><div style="display:flex;align-items:center;gap:.5rem"><span>${KATEGORI_EMOJI[a.kategori]||'🔧'}</span>${a.nama_alat}</div></td>
    <td>${a.kategori}</td><td><strong>${a.jumlah}</strong></td>
    <td><span class="badge ${KONDISI_BADGE[a.kondisi]}">${a.kondisi}</span></td><td style="font-size:.8rem">${a.lokasi}</td>
    <td><div class="table-actions">
      <button class="btn btn-secondary btn-sm" onclick="showEditAlat('${a.id}')" title="Edit">${ICONS.edit}</button>
      <button class="btn btn-danger btn-sm" onclick="deleteAlat('${a.id}')" title="Hapus">${ICONS.trash}</button>
    </div></td></tr>`;
}

function filterInv() {
  const q = (document.getElementById('invSearch').value || '').toLowerCase();
  const k = document.getElementById('invKondisi').value;
  document.querySelectorAll('#invTableBody tr').forEach(r => {
    r.style.display = (r.dataset.nama.includes(q)) && (!k || r.dataset.kondisi === k) ? '' : 'none';
  });
}

function alatFormHtml(a) {
  const cats = ['Fisika','Kimia','Biologi','Keselamatan kerja','Elektronik','Gelas laboratorium'];
  const konds = ['Baik','Rusak ringan','Rusak berat','Dalam perbaikan','Tidak tersedia'];
  return `
    <div class="grid-2"><div class="form-group"><label>Kode Alat</label><input type="text" id="aKode" value="${a?a.kode_alat:''}" required placeholder="cth: FIS-006"></div>
    <div class="form-group"><label>Nama Alat</label><input type="text" id="aNama" value="${a?a.nama_alat:''}" required></div></div>
    <div class="grid-2"><div class="form-group"><label>Kategori</label><select id="aKat" required>${cats.map(c=>`<option ${a&&a.kategori===c?'selected':''}>${c}</option>`).join('')}</select></div>
    <div class="form-group"><label>Jumlah</label><input type="number" id="aJumlah" value="${a?a.jumlah:1}" min="0" required></div></div>
    <div class="grid-2"><div class="form-group"><label>Kondisi</label><select id="aKondisi" required>${konds.map(k=>`<option ${a&&a.kondisi===k?'selected':''}>${k}</option>`).join('')}</select></div>
    <div class="form-group"><label>Lokasi</label><input type="text" id="aLokasi" value="${a?a.lokasi:''}" required placeholder="cth: Lemari A1"></div></div>
    <div class="form-group"><label>Spesifikasi</label><textarea id="aSpek" placeholder="Detail spesifikasi alat">${a?a.spesifikasi||'':''}</textarea></div>
    <div class="form-group">
      <label>Foto Alat (Opsional)</label>
      <input type="file" id="aFotoFile" accept="image/*" onchange="const f=this.files[0];if(f){const r=new FileReader();r.onload=e=>{const p=document.getElementById('aFotoPreview');if(p){p.src=e.target.result;p.style.display='block';}};r.readAsDataURL(f);}">
      <img id="aFotoPreview" src="${a&&a.foto?a.foto:''}" style="max-height:100px;border-radius:6px;margin-top:0.5rem;display:${a&&a.foto?'block':'none'}">
      <input type="hidden" id="aFotoData" value="${a?a.foto||'':''}">
    </div>`;
}

function showAddAlat() {
  showModal('Tambah Alat Baru', `<form id="addAlatForm" onsubmit="submitAddAlat(event)">${alatFormHtml(null)}<button type="submit" class="btn btn-primary btn-block mt-1">Simpan</button></form>`);
}

async function uploadFoto(fileInputId) {
  const fileInput = document.getElementById(fileInputId);
  if (fileInput && fileInput.files && fileInput.files[0]) {
    const formData = new FormData();
    formData.append('foto', fileInput.files[0]);
    try {
      const res = await fetch('api/upload.php', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.status === 'success') {
        return json.url;
      } else {
        console.error('Upload error:', json.message);
        showToast('Gagal upload foto: ' + json.message, 'error');
      }
    } catch (err) {
      console.error('Upload catch error:', err);
    }
  }
  return null;
}

async function submitAddAlat(e) {
  e.preventDefault();
  let fotoUrl = await uploadFoto('aFotoFile');
  if (!fotoUrl) fotoUrl = document.getElementById('aFotoData').value;
  await DB.add('alat', { kode_alat:document.getElementById('aKode').value, nama_alat:document.getElementById('aNama').value, kategori:document.getElementById('aKat').value, jumlah:parseInt(document.getElementById('aJumlah').value), kondisi:document.getElementById('aKondisi').value, lokasi:document.getElementById('aLokasi').value, spesifikasi:document.getElementById('aSpek').value, foto:fotoUrl });
  closeModal(); showToast('Alat berhasil ditambahkan!'); handleRoute();
}

function showEditAlat(id) {
  const a = DB.getById('alat', id);
  if (!a) return;
  showModal('Edit Alat', `<form onsubmit="submitEditAlat(event,'${id}')">${alatFormHtml(a)}<button type="submit" class="btn btn-primary btn-block mt-1">Update</button></form>`);
}

async function submitEditAlat(e, id) {
  e.preventDefault();
  let fotoUrl = await uploadFoto('aFotoFile');
  if (!fotoUrl) fotoUrl = document.getElementById('aFotoData').value;
  await DB.update('alat', id, { kode_alat:document.getElementById('aKode').value, nama_alat:document.getElementById('aNama').value, kategori:document.getElementById('aKat').value, jumlah:parseInt(document.getElementById('aJumlah').value), kondisi:document.getElementById('aKondisi').value, lokasi:document.getElementById('aLokasi').value, spesifikasi:document.getElementById('aSpek').value, foto:fotoUrl });
  closeModal(); showToast('Alat berhasil diupdate!'); handleRoute();
}

async function deleteAlat(id) {
  if (confirm('Hapus alat ini?')) { await DB.remove('alat', id); showToast('Alat dihapus'); handleRoute(); }
}
