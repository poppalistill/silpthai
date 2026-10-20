/* ============================================================
 * core.js — แกนกลางของแอป
 *   App.register(module)   ลงทะเบียนบริการ (ทุกไฟล์ใน js/modules/ เรียกใช้)
 *   App.go(id, param)      เปลี่ยนหน้า (#/id/param)
 *   App.store              อ่าน/เขียน localStorage
 *   App.user() / role()    ผู้ใช้ปัจจุบันและบทบาท
 *   App.addPoints / bump   คะแนนและสถิติ (ใช้คำนวณเหรียญรางวัล)
 *   App.ui.*               ตัวช่วยสร้างหน้าจอ (การ์ด, modal, toast, หน้ารายการ)
 * ============================================================ */
(function () {
  'use strict';

  const CFG = window.APP_CONFIG;
  const PREFIX = 'silpthai:';

  /* ---------- Storage ---------- */
  const store = {
    get(key, def) {
      try {
        const v = localStorage.getItem(PREFIX + key);
        return v == null ? def : JSON.parse(v);
      } catch (e) { return def; }
    },
    set(key, val) {
      try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch (e) { /* storage เต็มหรือถูกปิด */ }
    },
    remove(key) {
      try { localStorage.removeItem(PREFIX + key); } catch (e) { /* ignore */ }
    },
    keys() {
      const out = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k.startsWith(PREFIX)) out.push(k.slice(PREFIX.length));
        }
      } catch (e) { /* ignore */ }
      return out;
    }
  };

  /* ---------- Helpers ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const strip = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const THAI_DIGITS = '๐๑๒๓๔๕๖๗๘๙';
  const toThaiDigits = (s) => String(s).replace(/\d/g, (d) => THAI_DIGITS[d]);
  const thaiDate = (iso) => {
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return toThaiDigits(`${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`);
  };

  /* ---------- บทบาทผู้ใช้ (Role) และสิทธิ์ ---------- */
  const ROLES = {
    guest:   { label: 'ผู้เยี่ยมชม',        icon: '👀', desc: 'ดูเนื้อหาได้ทั้งหมด แต่ยังบันทึกรายการโปรด คะแนน และจองกิจกรรมไม่ได้' },
    student: { label: 'นักเรียน/นักศึกษา',  icon: '🎓', desc: 'เรียนรู้ ทำแบบทดสอบ สะสมคะแนนและเหรียญรางวัล' },
    tourist: { label: 'นักท่องเที่ยว',       icon: '🧳', desc: 'ค้นหาเทศกาล อาหาร และจองเวิร์กช็อปวัฒนธรรม' },
    public:  { label: 'ประชาชนทั่วไป',      icon: '🙂', desc: 'ใช้บริการทุกอย่างของสมาชิก' },
    teacher: { label: 'ครู/อาจารย์',        icon: '🧑‍🏫', desc: 'ดูผลคะแนนแบบทดสอบของผู้เรียนทุกคนในเครื่อง', code: true },
    admin:   { label: 'ผู้ดูแลระบบ',        icon: '🛡️', desc: 'จัดการกิจกรรม ผู้ใช้ การจอง และข้อมูลทั้งหมด', code: true }
  };
  const MEMBER_ROLES = ['student', 'tourist', 'public', 'teacher', 'admin'];

  /* ---------- เหรียญรางวัล ---------- */
  const BADGES = [
    { id: 'first',    icon: '🌱', name: 'ก้าวแรก',          desc: 'สมัครสมาชิกสำเร็จ',             test: () => true },
    { id: 'reader',   icon: '📚', name: 'นักเรียนรู้',       desc: 'อ่านเนื้อหาครบ 10 เรื่อง',        test: (s) => (s.viewed || []).length >= 10 },
    { id: 'scholar',  icon: '🏛️', name: 'ปราชญ์น้อย',       desc: 'อ่านเนื้อหาครบ 30 เรื่อง',        test: (s) => (s.viewed || []).length >= 30 },
    { id: 'quiz',     icon: '🏆', name: 'ยอดนักตอบ',        desc: 'ได้คะแนนแบบทดสอบ 8/10 ขึ้นไป',  test: (s) => (s.quizBest || 0) >= 8 },
    { id: 'music',    icon: '🎵', name: 'นักดนตรีไทย',      desc: 'บรรเลงระนาดครบ 50 โน้ต',         test: (s) => (s.notes || 0) >= 50 },
    { id: 'artist',   icon: '🎨', name: 'ศิลปินลายไทย',     desc: 'บันทึกภาพระบายสีลายไทย',        test: (s) => (s.drawings || 0) >= 1 },
    { id: 'writer',   icon: '✍️', name: 'นักคัดลายมือ',      desc: 'ฝึกเขียนผ่านเกณฑ์ 5 ตัวอักษร',   test: (s) => (s.writing || 0) >= 5 },
    { id: 'event',    icon: '🎟️', name: 'ผู้สืบสานประเพณี', desc: 'จองกิจกรรมวัฒนธรรม 1 ครั้ง',     test: (s) => (s.bookings || 0) >= 1 },
    { id: 'fav',      icon: '❤️', name: 'คนรักวัฒนธรรม',    desc: 'มีรายการโปรด 5 รายการ',          test: (s, u) => (App.udata('favs', []).length) >= 5 },
    { id: 'chat',     icon: '💬', name: 'ช่างซักถาม',       desc: 'คุยกับน้องมาลัย 5 ข้อความ',       test: (s) => (s.chats || 0) >= 5 }
  ];
  const GROUP_LABELS = { main: 'ผู้ช่วย', learn: 'คลังความรู้', play: 'ลงมือทำ', service: 'บริการ', account: 'บัญชีและระบบ' };
  const favLabel = (key) => (App.isFav(key) ? 'อยู่ในเรื่องโปรดแล้ว' : 'บันทึกเป็นเรื่องโปรด');
  const LEVELS = ['ผู้เริ่มต้น', 'ผู้ฝึกหัด', 'ผู้รู้', 'ผู้ชำนาญ', 'ผู้เชี่ยวชาญ', 'ปราชญ์ศิลป์ไทย'];

  const App = window.App = {
    cfg: CFG, store, esc, strip, uid, $, $$, THAI_MONTHS, toThaiDigits, thaiDate, GROUP_LABELS,
    initial: (name) => (String(name || '').trim().match(/[ก-ฮA-Za-z0-9]/) || ['?'])[0],
    ROLES, MEMBER_ROLES, BADGES,
    modules: [],
    byId: {},

    /* ลงทะเบียนบริการ
     * module = { id, title, icon, group, desc, color, items?, roles?, nav?, render(el, param) } */
    register(m) {
      if (this.byId[m.id]) { console.warn('module ซ้ำ:', m.id); return; }
      m.group = m.group || 'learn';
      this.modules.push(m);
      this.byId[m.id] = m;
    },

    go(id, param) {
      location.hash = '#/' + id + (param != null && param !== '' ? '/' + encodeURIComponent(param) : '');
    },

    /* ---------- ผู้ใช้ ---------- */
    users() { return store.get('users', []); },
    saveUsers(list) { store.set('users', list); },
    user() {
      const id = store.get('currentUser', null);
      return id ? this.users().find((u) => u.id === id) || null : null;
    },
    role() { const u = this.user(); return u ? u.role : 'guest'; },
    isMember() { return !!this.user(); },
    isStaff() { return ['teacher', 'admin'].includes(this.role()); },
    login(name, role) {
      name = String(name || '').trim();
      const users = this.users();
      let u = users.find((x) => x.name === name && x.role === role);
      if (!u) {
        u = { id: uid(), name, role, created: new Date().toISOString() };
        users.push(u);
        this.saveUsers(users);
      }
      store.set('currentUser', u.id);
      this.emit('user');
      return u;
    },
    logout() { store.remove('currentUser'); this.emit('user'); },
    updateUser(patch) {
      const u = this.user(); if (!u) return;
      const users = this.users().map((x) => (x.id === u.id ? Object.assign({}, x, patch) : x));
      this.saveUsers(users);
      this.emit('user');
    },
    requireMember(action) {
      if (this.isMember()) return true;
      this.ui.toast(`กรุณาเข้าสู่ระบบก่อน${action ? action : ''}`, 'warn');
      setTimeout(() => this.go('profile'), 600);
      return false;
    },

    /* ข้อมูลส่วนตัวของผู้ใช้แต่ละคน */
    udata(key, def) { const u = this.user(); return u ? store.get(`u:${u.id}:${key}`, def) : def; },
    usave(key, val) { const u = this.user(); if (u) store.set(`u:${u.id}:${key}`, val); },
    stats() { return this.udata('stats', {}); },
    bump(stat, n) {
      if (!this.isMember()) return;
      const s = this.stats();
      s[stat] = (s[stat] || 0) + (n == null ? 1 : n);
      this.usave('stats', s);
      this.checkBadges();
    },
    setStat(stat, val) {
      if (!this.isMember()) return;
      const s = this.stats(); s[stat] = val; this.usave('stats', s); this.checkBadges();
    },
    points() { return this.udata('points', 0); },
    addPoints(n, reason) {
      if (!this.isMember()) return;
      this.usave('points', this.points() + n);
      this.ui.toast(`+${n} คะแนน${reason ? ' · ' + reason : ''}`, 'ok');
      this.emit('points');
    },
    level(p) {
      p = p == null ? this.points() : p;
      const i = Math.min(LEVELS.length - 1, Math.floor(p / 60));
      return { index: i + 1, name: LEVELS[i], next: (i + 1) * 60, progress: (p % 60) / 60 };
    },
    markViewed(key) {
      if (!this.isMember()) return;
      const s = this.stats();
      s.viewed = s.viewed || [];
      if (s.viewed.includes(key)) return;
      s.viewed.push(key);
      this.usave('stats', s);
      this.addPoints(2, 'เรียนรู้เรื่องใหม่');
      this.checkBadges();
    },
    earnedBadges() {
      if (!this.isMember()) return [];
      const s = this.stats(); const u = this.user();
      return BADGES.filter((b) => b.test(s, u)).map((b) => b.id);
    },
    checkBadges() {
      if (!this.isMember()) return;
      const known = this.udata('badges', []);
      const now = this.earnedBadges();
      const fresh = now.filter((id) => !known.includes(id));
      if (fresh.length) {
        this.usave('badges', now);
        fresh.forEach((id, i) => {
          const b = BADGES.find((x) => x.id === id);
          setTimeout(() => this.ui.toast(`ได้รับเหรียญ "${b.name}"`, 'badge'), 900 * (i + 1));
        });
      }
    },

    /* ---------- รายการโปรด ---------- */
    favs() { return this.udata('favs', []); },
    isFav(key) { return this.favs().some((f) => f.key === key); },
    toggleFav(fav) {
      if (!this.requireMember('เพื่อบันทึกรายการโปรด')) return false;
      let list = this.favs();
      if (list.some((f) => f.key === fav.key)) {
        list = list.filter((f) => f.key !== fav.key);
        this.usave('favs', list);
        this.ui.toast('นำออกจากรายการโปรดแล้ว');
      } else {
        list.unshift(Object.assign({ added: new Date().toISOString() }, fav));
        this.usave('favs', list);
        this.ui.toast('บันทึกเป็นเรื่องโปรดแล้ว', 'ok');
        this.checkBadges();
      }
      this.emit('favs');
      return true;
    },

    /* ---------- อ่านออกเสียง (Text-to-Speech) ---------- */
    /* การอ่านให้เป็นธรรมชาติ:
     * 1) เลือกเสียงที่ดีที่สุด: เสียง Natural (Edge) > Google ไทย (Chrome) > เสียงเก่าของ Windows
     *    หรือเสียงที่ผู้ใช้เลือกเองในหน้า "ตั้งค่า"
     * 2) แบ่งอ่านทีละประโยค (ตามย่อหน้า/รายการ/ช่องว่าง) ไม่ตัดกลางวลี
     * 3) แปลงคำย่อให้อ่านถูก เช่น พ.ศ. → พุทธศักราช, จ. → จังหวัด */
    speaking: false,
    _ttsRun: 0,
    thaiVoices() {
      const rank = (v) => (/natural|neural/i.test(v.name) ? 3 : /online|google/i.test(v.name) ? 2 : 1);
      return speechSynthesis.getVoices()
        .filter((v) => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith('th'))
        .sort((a, b) => rank(b) - rank(a));
    },
    thaiVoice() {
      const list = this.thaiVoices();
      const chosen = store.get('ttsVoice', '');
      return list.find((v) => v.name === chosen) || list[0] || null;
    },
    ttsNormalize(t) {
      const MONTHS = { 'ม.ค.': 'มกราคม', 'ก.พ.': 'กุมภาพันธ์', 'มี.ค.': 'มีนาคม', 'เม.ย.': 'เมษายน', 'พ.ค.': 'พฤษภาคม', 'มิ.ย.': 'มิถุนายน',
        'ก.ค.': 'กรกฎาคม', 'ส.ค.': 'สิงหาคม', 'ก.ย.': 'กันยายน', 'ต.ค.': 'ตุลาคม', 'พ.ย.': 'พฤศจิกายน', 'ธ.ค.': 'ธันวาคม' };
      Object.entries(MONTHS).forEach(([k, v]) => { t = t.split(k).join(v + ' '); });
      return t
        .replace(/พ\.ศ\./g, 'พุทธศักราช ').replace(/ค\.ศ\./g, 'คริสต์ศักราช ')
        .replace(/(^|[\s(])จ\.(?=\s?[ก-๏])/g, '$1จังหวัด').replace(/(^|[\s(])อ\.(?=\s?[ก-๏])/g, '$1อำเภอ')
        .replace(/(^|[\s(])ต\.(?=\s?[ก-๏])/g, '$1ตำบล')
        .replace(/ฯลฯ/g, 'และอื่น ๆ').replace(/\s*–\s*/g, ' ถึง ').replace(/(\S)\/(\S)/g, '$1 หรือ $2')
        .replace(/[“”"()]/g, ' ');
    },
    ttsChunks(html, max) {
      max = max || 220;
      // ขึ้นบรรทัดใหม่ทุกครั้งที่จบย่อหน้า/รายการ/หัวข้อ → ใช้เป็นจุดหยุดหายใจ
      const text = String(html || '')
        .replace(/<\/(p|li|h\d|div)>|<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
      const out = [];
      let lastShort = false;
      this.ttsNormalize(text).split(/\n|\s[—·•]\s|\s\.\s/).forEach((line) => {
        line = line.replace(/\s+/g, ' ').trim();
        if (!line) return;
        // รายการสั้น ๆ ต่อกัน (เช่น พระ / นาง / ยักษ์ / ลิง) รวมอ่านในประโยคเดียว ไม่ให้หยุดทีละคำ
        if (line.length < 30 && lastShort && out.length && out[out.length - 1].length + line.length < max) {
          out[out.length - 1] += ' ' + line; return;
        }
        lastShort = line.length < 30;
        if (line.length <= max) { out.push(line); return; }
        // ประโยคยาว: แบ่งตรงช่องว่าง (ภาษาไทยเว้นวรรคระหว่างวลี) ให้แต่ละท่อนยาวใกล้เคียงกัน
        const parts = Math.ceil(line.length / max);
        const target = line.length / parts;
        let cur = '';
        line.split(' ').forEach((w) => {
          if (cur && cur.length + w.length + 1 > target) { out.push(cur); cur = w; }
          else cur = cur ? cur + ' ' + w : w;
        });
        if (cur) out.push(cur);
      });
      return out;
    },
    speak(text, onEnd) {
      if (!('speechSynthesis' in window)) { this.ui.toast('เบราว์เซอร์นี้ไม่รองรับการอ่านออกเสียง', 'warn'); return; }
      const run = ++this._ttsRun;
      speechSynthesis.cancel();
      const voice = this.thaiVoice();
      if (!voice && speechSynthesis.getVoices().length) this.ui.toast('ไม่พบเสียงภาษาไทยในเครื่อง อาจอ่านไม่ชัด', 'warn');
      const chunks = this.ttsChunks(text);
      const rate = store.get('ttsRate', 1);
      let i = 0;
      const finish = () => { if (run !== this._ttsRun) return; this.speaking = false; if (onEnd) onEnd(); };
      const next = () => {
        if (run !== this._ttsRun) return;           // ถูกหยุดหรือเริ่มอ่านเรื่องใหม่แล้ว
        if (i >= chunks.length) { finish(); return; }
        const u = new SpeechSynthesisUtterance(chunks[i++]);
        u.lang = 'th-TH';
        u.rate = rate;
        if (voice) u.voice = voice;
        u.onend = next;
        u.onerror = (e) => { if (e.error !== 'interrupted' && e.error !== 'canceled') next(); };
        speechSynthesis.speak(u);
      };
      this.speaking = true;
      setTimeout(next, 120); // เว้นจังหวะหลัง cancel() ป้องกันเสียงสะดุดใน Chrome
    },
    stopSpeak() {
      this._ttsRun++;
      if ('speechSynthesis' in window) speechSynthesis.cancel();
      this.speaking = false;
    },

    /* ---------- ค้นหาข้อมูลรวมจากทุกบริการ ---------- */
    allItems() {
      const out = [];
      this.modules.forEach((m) => {
        const items = typeof m.getItems === 'function' ? m.getItems() : (m.items || []);
        items.forEach((it) => out.push(Object.assign({ mod: m }, it)));
      });
      return out;
    },
    search(q) {
      q = String(q || '').trim().toLowerCase();
      if (!q) return [];
      return this.allItems().map((it) => {
        const title = String(it.title).toLowerCase();
        const tags = (it.tags || []).join(' ').toLowerCase();
        const body = strip(it.body).toLowerCase() + ' ' + String(it.sub || '').toLowerCase();
        let score = 0;
        if (title === q) score += 20;
        if (title.includes(q)) score += 10;
        if (q.includes(title) && title.length > 1) score += 8;
        if (tags.includes(q)) score += 5;
        if (body.includes(q)) score += 2;
        return { it, score };
      }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).map((x) => x.it);
    },

    /* ---------- Event bus เล็ก ๆ ---------- */
    _ev: {},
    on(name, fn) { (this._ev[name] = this._ev[name] || []).push(fn); },
    emit(name, data) { (this._ev[name] || []).forEach((fn) => fn(data)); }
  };

  /* ============================================================
   * UI helpers
   * ============================================================ */
  App.ui = {
    toast(msg, type) {
      const box = $('#toasts');
      if (!box) return;
      const t = document.createElement('div');
      t.className = 'toast ' + (type || '');
      t.textContent = msg;
      box.appendChild(t);
      setTimeout(() => t.classList.add('show'), 10);
      setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2600);
    },

    modal(html, opts) {
      opts = opts || {};
      App.ui.closeModal();
      const wrap = document.createElement('div');
      wrap.className = 'modal-wrap';
      wrap.innerHTML = `<div class="modal ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true">
          <button class="modal-x" aria-label="ปิด">ปิด</button>${html}</div>`;
      document.body.appendChild(wrap);
      document.body.classList.add('no-scroll');
      const close = () => {
        App.stopSpeak();
        wrap.remove();
        document.body.classList.remove('no-scroll');
        document.removeEventListener('keydown', onKey);
        if (opts.onClose) opts.onClose();
      };
      const onKey = (e) => { if (e.key === 'Escape') close(); };
      wrap._close = close;
      wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
      $('.modal-x', wrap).onclick = close;
      document.addEventListener('keydown', onKey);
      return wrap;
    },
    closeModal() { const m = $('.modal-wrap'); if (m && m._close) m._close(); },

    confirm(msg) { return window.confirm(msg); },

    /* หัวเรื่องของแต่ละหน้า: "หมวด ๐๕ · คลังความรู้" + ชื่อ + คำอธิบาย + ลายประจำยาม */
    pageHead(m, extra) {
      const no = m.no ? `หมวด ${toThaiDigits(String(m.no).padStart(2, '0'))} · ` : '';
      return `<header class="page-head" style="--c:${m.color || 'var(--red)'}">
        ${m.no ? `<span class="big-no" aria-hidden="true">${toThaiDigits(String(m.no).padStart(2, '0'))}</span>` : ''}
        <div class="kicker">${no}${GROUP_LABELS[m.group] || ''}</div>
        <h1>${m.title}</h1>
        ${m.desc ? `<p class="lede">${m.desc}</p>` : ''}
        ${extra || ''}
        <div class="ornament"><i></i></div>
      </header>`;
    },

    /* แถวรายการแบบสารบัญหนังสือ (i = ลำดับ ถ้ามี) */
    card(it, m, i) {
      return `<button class="card" data-id="${esc(it.id)}" style="--c:${it.color || m.color || 'var(--red)'}">
        ${i != null ? `<span class="card-no">${toThaiDigits(String(i + 1).padStart(2, '0'))}</span>` : ''}
        <span class="card-body">
          ${it.cat ? `<span class="card-cat">${it.cat}</span>` : ''}
          <span class="card-title">${it.title}</span>
          ${it.sub ? `<span class="card-sub">${it.sub}</span>` : ''}
        </span>
        ${App.isFav(m.id + ':' + it.id) ? '<span class="card-fav">เรื่องโปรด</span>' : ''}
      </button>`;
    },

    /* หน้ารายการมาตรฐาน: ค้นหา + กรองหมวด + การ์ด + หน้ารายละเอียด */
    listPage(m, el, param, opts) {
      opts = opts || {};
      const items = m.items || [];
      const cats = [...new Set(items.map((i) => i.cat).filter(Boolean))];
      el.innerHTML = App.ui.pageHead(m) + (opts.before || '') + `
        <div class="toolbar">
          <input class="input search-in" type="search" placeholder="ค้นหาใน${m.title}..." aria-label="ค้นหา">
          ${cats.length ? `<div class="chips"><button class="chip on" data-cat="">ทั้งหมด</button>${cats.map((c) => `<button class="chip" data-cat="${esc(c)}">${c}</button>`).join('')}</div>` : ''}
        </div>
        <div class="grid cards"></div>` + (opts.after || '');
      const grid = $('.cards', el);
      let cat = '', q = '';
      const draw = () => {
        const list = items.filter((i) => (!cat || i.cat === cat) &&
          (!q || (i.title + ' ' + (i.sub || '') + ' ' + strip(i.body) + ' ' + (i.tags || []).join(' ')).toLowerCase().includes(q)));
        grid.innerHTML = list.length ? list.map((i, n) => App.ui.card(i, m, n)).join('') : '<p class="empty">ไม่พบข้อมูลที่ค้นหา</p>';
      };
      draw();
      $('.search-in', el).addEventListener('input', (e) => { q = e.target.value.trim().toLowerCase(); draw(); });
      $$('.chips .chip', el).forEach((b) => b.addEventListener('click', () => {
        $$('.chips .chip', el).forEach((x) => x.classList.remove('on'));
        b.classList.add('on'); cat = b.dataset.cat; draw();
      }));
      grid.addEventListener('click', (e) => {
        const c = e.target.closest('.card'); if (!c) return;
        history.replaceState(null, '', `#/${m.id}/${encodeURIComponent(c.dataset.id)}`);
        App.ui.detail(m, items.find((i) => String(i.id) === c.dataset.id), draw);
      });
      if (param) {
        const it = items.find((i) => String(i.id) === String(param));
        if (it) App.ui.detail(m, it, draw);
      }
    },

    /* หน้ารายละเอียดของแต่ละเรื่อง */
    detail(m, it, onClose) {
      if (!it) return;
      const key = m.id + ':' + it.id;
      const html = `
        <header class="sheet-head" style="--c:${it.color || m.color || 'var(--red)'}">
          <div class="kicker">${m.title}${it.cat ? ' · ' + it.cat : ''}</div>
          <h2>${it.title}</h2>
          ${it.sub ? `<p class="lede">${it.sub}</p>` : ''}
        </header>
        <article class="sheet-body">
          <div class="detail-actions">
            <button class="btn sm fav-btn">${favLabel(key)}</button>
            <button class="btn sm tts-btn">ฟังเสียงอ่าน</button>
            <button class="btn sm share-btn">แชร์ลิงก์</button>
          </div>
          <div class="detail-body prose">${it.body || ''}</div>
          ${it.tags && it.tags.length ? `<div class="tags">คำค้น: ${it.tags.join(', ')}</div>` : ''}
        </article>`;
      const w = App.ui.modal(html, {
        onClose: () => { history.replaceState(null, '', '#/' + m.id); if (onClose) onClose(); }
      });
      const favBtn = $('.fav-btn', w);
      favBtn.onclick = () => {
        if (App.toggleFav({ key, mod: m.id, id: it.id, title: it.title, modTitle: m.title })) {
          favBtn.textContent = favLabel(key);
        }
      };
      const ttsBtn = $('.tts-btn', w);
      ttsBtn.onclick = () => {
        if (App.speaking) { App.stopSpeak(); ttsBtn.textContent = 'ฟังเสียงอ่าน'; return; }
        ttsBtn.textContent = 'หยุดอ่าน';
        App.speak(`${it.title}
${it.sub || ''}
${it.body || ''}`, () => { ttsBtn.textContent = 'ฟังเสียงอ่าน'; });
      };
      $('.share-btn', w).onclick = async () => {
        const url = location.href.split('#')[0] + `#/${m.id}/${encodeURIComponent(it.id)}`;
        try {
          if (navigator.share) await navigator.share({ title: it.title, text: `${it.title} — ${CFG.appName}`, url });
          else { await navigator.clipboard.writeText(url); App.ui.toast('คัดลอกลิงก์แล้ว', 'ok'); }
        } catch (e) { /* ผู้ใช้ยกเลิก */ }
      };
      App.markViewed(key);
    }
  };
})();
