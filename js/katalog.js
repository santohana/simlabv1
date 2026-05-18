/* ===== Katalog Alat Module ===== */
function renderKatalog(container, session) {
  const alat = DB.getAll('alat');
  const kategoris = ['Semua', ...new Set(alat.map(a => a.kategori))];
  const kondisis = ['Semua', ...new Set(alat.map(a => a.kondisi))];

  container.innerHTML = `
    <div class="filters-bar">
      <div class="search-box">${ICONS.search}<input type="text" id="katalogSearch" placeholder="Cari alat..." oninput="filterKatalog()"></div>
      <select id="katalogKategori" onchange="filterKatalog()">${kategoris.map(k => `<option>${k}</option>`).join('')}</select>
      <select id="katalogKondisi" onchange="filterKatalog()">${kondisis.map(k => `<option>${k}</option>`).join('')}</select>
    </div>
    <div class="catalog-grid" id="katalogGrid">
      ${alat.map(a => katalogCard(a)).join('')}
    </div>`;
}

function katalogCard(a) {
  return `<div class="catalog-card" onclick="showAlatDetail('${a.id}')" data-nama="${a.nama_alat.toLowerCase()}" data-kategori="${a.kategori}" data-kondisi="${a.kondisi}">
    <div class="card-img" style="${a.foto?'padding:0;overflow:hidden':''}">${a.foto ? `<img src="${a.foto}" style="width:100%;height:100%;object-fit:cover;border-radius:8px 8px 0 0;">` : `<span>${KATEGORI_EMOJI[a.kategori] || '🔧'}</span>`}</div>
    <div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:.25rem">
        <h4>${a.nama_alat}</h4>
        <span class="badge badge-secondary" style="font-size:.65rem">${a.kode_alat}</span>
      </div>
      <p>${a.kategori} • ${a.lokasi}</p>
      <div class="card-footer">
        <span class="badge ${KONDISI_BADGE[a.kondisi]}">${a.kondisi}</span>
        <span style="font-size:.8rem;color:var(--text-secondary)">Stok: <strong style="color:var(--text-primary)">${a.jumlah}</strong></span>
      </div>
    </div>
  </div>`;
}

function filterKatalog() {
  const q = (document.getElementById('katalogSearch').value || '').toLowerCase();
  const kat = document.getElementById('katalogKategori').value;
  const kon = document.getElementById('katalogKondisi').value;
  document.querySelectorAll('.catalog-card').forEach(card => {
    const matchNama = card.dataset.nama.includes(q);
    const matchKat = kat === 'Semua' || card.dataset.kategori === kat;
    const matchKon = kon === 'Semua' || card.dataset.kondisi === kon;
    card.style.display = matchNama && matchKat && matchKon ? '' : 'none';
  });
}

function showAlatDetail(id) {
  const a = DB.getById('alat', id);
  if (!a) return;
  showModal(`Detail Alat — ${a.nama_alat}`, `
    <div style="text-align:center;padding:${a.foto?'0':'2rem'};background:linear-gradient(135deg,rgba(6,182,212,.08),rgba(139,92,246,.08));border-radius:12px;margin-bottom:1.25rem;overflow:hidden;display:flex;justify-content:center;align-items:center;min-height:150px;">
      ${a.foto ? `<img src="${a.foto}" style="width:100%;max-height:300px;object-fit:contain;background:var(--bg-secondary);">` : `<span style="font-size:4rem">${KATEGORI_EMOJI[a.kategori] || '🔧'}</span>`}
    </div>
    <div class="detail-row"><span class="label">Kode Alat</span><span class="value">${a.kode_alat}</span></div>
    <div class="detail-row"><span class="label">Nama Alat</span><span class="value">${a.nama_alat}</span></div>
    <div class="detail-row"><span class="label">Kategori</span><span class="value">${a.kategori}</span></div>
    <div class="detail-row"><span class="label">Spesifikasi</span><span class="value">${a.spesifikasi || '-'}</span></div>
    <div class="detail-row"><span class="label">Jumlah</span><span class="value"><strong>${a.jumlah}</strong> unit</span></div>
    <div class="detail-row"><span class="label">Kondisi</span><span class="value"><span class="badge ${KONDISI_BADGE[a.kondisi]}">${a.kondisi}</span></span></div>
    <div class="detail-row"><span class="label">Lokasi</span><span class="value">${a.lokasi}</span></div>
  `);
}
