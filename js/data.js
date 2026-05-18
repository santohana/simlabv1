/* ===== SIM-LAB IPA — Data Layer (API Connected) ===== */
const DB = {
  cache: {},

  // Inisialisasi: Load seluruh data dari backend
  async init() {
    try {
      const res = await fetch('api/init.php');
      const json = await res.json();
      if (json.status === 'success') {
        this.cache = json.data;
      } else {
        console.error('Failed to load data:', json.message);
      }
    } catch(err) {
      console.error('Fetch error:', err);
    }
  },

  getAll(key) {
    return this.cache[key] || [];
  },

  getById(key, id) {
    return (this.cache[key] || []).find(i => i.id === id);
  },

  async add(key, item) {
    item.id = item.id || this.genId();
    try {
      const res = await fetch(`api/crud.php?table=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      const json = await res.json();
      if (json.status === 'success') {
        if (!this.cache[key]) this.cache[key] = [];
        this.cache[key].push(json.data);
        return json.data;
      } else {
        throw new Error(json.message);
      }
    } catch(err) {
      console.error('Add error:', err);
      return null;
    }
  },

  async update(key, id, updates) {
    try {
      const res = await fetch(`api/crud.php?table=${key}&id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      if (json.status === 'success') {
        const arr = this.cache[key];
        const idx = arr.findIndex(i => i.id === id);
        if (idx > -1) {
          arr[idx] = { ...arr[idx], ...json.data };
          return arr[idx];
        }
      } else {
        throw new Error(json.message);
      }
    } catch(err) {
      console.error('Update error:', err);
      return null;
    }
  },

  async remove(key, id) {
    try {
      const res = await fetch(`api/crud.php?table=${key}&id=${id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.status === 'success') {
        this.cache[key] = this.cache[key].filter(i => i.id !== id);
        return true;
      } else {
        throw new Error(json.message);
      }
    } catch(err) {
      console.error('Remove error:', err);
      return false;
    }
  },

  genId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); },
  
  getSession() { 
    try { return JSON.parse(localStorage.getItem('simlab_session')); } 
    catch { return null; } 
  },
  
  setSession(user) { 
    localStorage.setItem('simlab_session', JSON.stringify(user)); 
  },
  
  clearSession() { 
    localStorage.removeItem('simlab_session'); 
  }
};

// Icon helpers using Lucide icon names
const ICONS = {
  dashboard: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
  calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
  catalog: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="M3 8h8"/><path d="M3 12h5"/><path d="M3 16h3"/><path d="M3 4h13"/></svg>',
  inventory: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
  borrow: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>',
  users: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  report: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>',
  bell: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
  logout: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
  search: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  plus: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  edit: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
  trash: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
  eye: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  check: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  x: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  chevLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  chevRight: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  flask: '🧪', microscope: '🔬', magnet: '🧲', beaker: '⚗️', goggles: '🥽', ruler: '📏', thermometer: '🌡️', atom: '⚛️'
};

const KATEGORI_EMOJI = { 'Fisika': '🧲', 'Kimia': '⚗️', 'Biologi': '🔬', 'Keselamatan kerja': '🥽', 'Elektronik': '⚡', 'Gelas laboratorium': '🧪' };
const KONDISI_BADGE = { 'Baik': 'badge-success', 'Rusak ringan': 'badge-warning', 'Rusak berat': 'badge-danger', 'Dalam perbaikan': 'badge-info', 'Tidak tersedia': 'badge-secondary' };
const STATUS_BADGE_JADWAL = { 'approved': 'badge-success', 'pending': 'badge-warning', 'rejected': 'badge-danger' };
const STATUS_LABEL_JADWAL = { 'approved': 'Disetujui', 'pending': 'Menunggu', 'rejected': 'Ditolak' };
const STATUS_BADGE_PINJAM = { 'Menunggu': 'badge-warning', 'Dipinjam': 'badge-info', 'Dikembalikan': 'badge-success', 'Terlambat': 'badge-danger', 'Ditolak': 'badge-secondary' };

function getUserName(id) { const u = DB.getById('users', id); return u ? u.nama : '-'; }
function getLabName(id) { const l = DB.getById('labs', id); return l ? l.nama_lab : '-'; }
function getAlatName(id) { const a = DB.getById('alat', id); return a ? a.nama_alat : '-'; }
function formatDate(d) { if (!d) return '-'; const dt = new Date(d); return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); }
function formatDateTime(d) { if (!d) return '-'; const dt = new Date(d); return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function roleLabel(r) { return { admin: 'Administrator', laboran: 'Laboran', guru: 'Guru', siswa: 'Siswa' }[r] || r; }
