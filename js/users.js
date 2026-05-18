/* ===== User Management Module (Admin Only) ===== */
function renderUsers(container) {
  const users = DB.getAll('users');
  container.innerHTML = `
    <div class="flex-between mb-2">
      <div class="filters-bar" style="margin-bottom:0">
        <div class="search-box">${ICONS.search}<input type="text" placeholder="Cari pengguna..." oninput="filterUsers(this.value)"></div>
        <select onchange="filterUserRole(this.value)"><option value="">Semua Role</option><option value="admin">Administrator</option><option value="laboran">Laboran</option><option value="guru">Guru</option><option value="siswa">Siswa</option></select>
      </div>
      <button class="btn btn-primary btn-sm" onclick="showAddUser()">${ICONS.plus} Tambah Pengguna</button>
    </div>
    <div class="card"><div class="table-wrapper"><table><thead><tr><th>Nama</th><th>Username</th><th>Email</th><th>Role</th><th>Terdaftar</th><th>Aksi</th></tr></thead>
    <tbody id="usersTableBody">${users.map(u => userRow(u)).join('')}</tbody></table></div></div>`;
}

function userRow(u) {
  const roleBadges = { admin: 'badge-danger', laboran: 'badge-info', guru: 'badge-purple', siswa: 'badge-success' };
  return `<tr data-nama="${u.nama.toLowerCase()}" data-role="${u.role}">
    <td><div style="display:flex;align-items:center;gap:.5rem"><div class="avatar" style="width:32px;height:32px;font-size:.75rem;border-radius:8px;background:var(--gradient);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;flex-shrink:0">${u.nama.charAt(0)}</div>${u.nama}</div></td>
    <td>${u.username}</td><td style="font-size:.8rem">${u.email}</td>
    <td><span class="badge ${roleBadges[u.role]}">${roleLabel(u.role)}</span></td>
    <td style="font-size:.8rem">${formatDate(u.created_at)}</td>
    <td><div class="table-actions">
      <button class="btn btn-secondary btn-sm" onclick="showEditUser('${u.id}')">${ICONS.edit}</button>
      <button class="btn btn-danger btn-sm" onclick="deleteUser('${u.id}')">${ICONS.trash}</button>
    </div></td></tr>`;
}

function filterUsers(q) { document.querySelectorAll('#usersTableBody tr').forEach(r => { r.style.display = r.dataset.nama.includes(q.toLowerCase()) ? '' : 'none'; }); }
function filterUserRole(role) { document.querySelectorAll('#usersTableBody tr').forEach(r => { r.style.display = !role || r.dataset.role === role ? '' : 'none'; }); }

function userFormHtml(u) {
  return `
    <div class="form-group"><label>Nama Lengkap</label><input type="text" id="uNama" value="${u?u.nama:''}" required></div>
    <div class="grid-2">
      <div class="form-group"><label>Username</label><input type="text" id="uUsername" value="${u?u.username:''}" required></div>
      <div class="form-group"><label>Password</label><input type="password" id="uPassword" value="${u?u.password:''}" required placeholder="${u?'Kosongkan jika tidak diubah':''}"></div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Email</label><input type="email" id="uEmail" value="${u?u.email:''}" required></div>
      <div class="form-group"><label>Role</label><select id="uRole" required>
        <option value="admin" ${u&&u.role==='admin'?'selected':''}>Administrator</option>
        <option value="laboran" ${u&&u.role==='laboran'?'selected':''}>Laboran</option>
        <option value="guru" ${u&&u.role==='guru'?'selected':''}>Guru</option>
        <option value="siswa" ${u&&u.role==='siswa'?'selected':''}>Siswa</option>
      </select></div>
    </div>`;
}

function showAddUser() {
  showModal('Tambah Pengguna', `<form onsubmit="submitAddUser(event)">${userFormHtml(null)}<button type="submit" class="btn btn-primary btn-block mt-1">Simpan</button></form>`);
}

async function submitAddUser(e) {
  e.preventDefault();
  await DB.add('users', { nama:document.getElementById('uNama').value, username:document.getElementById('uUsername').value, password:document.getElementById('uPassword').value, email:document.getElementById('uEmail').value, role:document.getElementById('uRole').value, created_at:new Date().toISOString().split('T')[0] });
  closeModal(); showToast('Pengguna berhasil ditambahkan!'); handleRoute();
}

function showEditUser(id) {
  const u = DB.getById('users', id);
  if (!u) return;
  showModal('Edit Pengguna', `<form onsubmit="submitEditUser(event,'${id}')">${userFormHtml(u)}<button type="submit" class="btn btn-primary btn-block mt-1">Update</button></form>`);
}

async function submitEditUser(e, id) {
  e.preventDefault();
  await DB.update('users', id, { nama:document.getElementById('uNama').value, username:document.getElementById('uUsername').value, password:document.getElementById('uPassword').value, email:document.getElementById('uEmail').value, role:document.getElementById('uRole').value });
  closeModal(); showToast('Pengguna berhasil diupdate!'); handleRoute();
}

async function deleteUser(id) {
  const session = DB.getSession();
  if (id === session.id) { showToast('Tidak dapat menghapus akun sendiri', 'error'); return; }
  if (confirm('Hapus pengguna ini?')) { await DB.remove('users', id); showToast('Pengguna dihapus'); handleRoute(); }
}
