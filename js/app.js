/* ============================================================
 * app.js — โครงหน้าจอหลัก: เมนู, Router, การตั้งค่าธีม
 * (โหลดเป็นไฟล์สุดท้าย หลังจาก modules ทั้งหมดลงทะเบียนแล้ว)
 * ============================================================ */
(function () {
  'use strict';
  const { $, $$, esc } = App;

  const GROUPS = [
    ['main', 'เมนูหลัก'],
    ['learn', 'คลังความรู้'],
    ['play', 'ลงมือทำ & เกม'],
    ['service', 'บริการ'],
    ['account', 'บัญชีและระบบ']
  ];
  const BOTTOM = ['home', 'search', 'chatbot', 'favorites', 'profile'];
  // ไอคอนเส้นสำหรับเมนูล่างบนมือถือ
  const SVG = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICONS = {
    home: SVG('<path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>'),
    search: SVG('<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>'),
    chatbot: SVG('<path d="M5 5h14v10H10l-4 4v-4H5z"/>'),
    favorites: SVG('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
    profile: SVG('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>')
  };

  App.canSee = (m) => !m.roles || m.roles.includes(App.role());

  function buildNav() {
    const nav = $('#sidenav');
    nav.innerHTML = GROUPS.map(([g, label]) => {
      const mods = App.modules.filter((m) => m.group === g && m.nav !== false && App.canSee(m));
      if (!mods.length) return '';
      return `<div class="nav-group"><div class="nav-label">${label}</div>
        ${mods.map((m) => `<a href="#/${m.id}" data-id="${m.id}" class="nav-item"><span class="n">${m.no ? App.toThaiDigits(String(m.no).padStart(2, '0')) : ''}</span>${m.title}</a>`).join('')}
      </div>`;
    }).join('');
    $('#bottomnav').innerHTML = BOTTOM.map((id) => App.byId[id]).filter(Boolean).map((m) =>
      `<a href="#/${m.id}" data-id="${m.id}">${ICONS[m.id] || ''}<small>${m.short || m.title}</small></a>`).join('');
  }

  function updateUserChip() {
    const u = App.user();
    $('#userChip').innerHTML = u
      ? `<span class="uc-text"><b>${esc(u.name)}</b><small>${App.ROLES[u.role].label} · ${App.toThaiDigits(App.points())} คะแนน</small></span><span class="avatar">${esc(App.initial(u.name))}</span>`
      : `<span class="uc-text"><b>เข้าสู่ระบบ</b><small>ผู้เยี่ยมชม</small></span><span class="avatar guest">?</span>`;
  }

  function setActive(id) {
    $$('#sidenav .nav-item, #bottomnav a').forEach((a) => a.classList.toggle('active', a.dataset.id === id));
  }

  function route() {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    const id = parts[0] || 'home';
    const param = parts[1] ? decodeURIComponent(parts[1]) : '';
    const m = App.byId[id] || App.byId.home;
    const main = $('#main');
    App.stopSpeak();
    App.ui.closeModal();
    document.body.classList.remove('nav-open');
    if (m.cleanup) { try { m.cleanup(); } catch (e) { /* ignore */ } }
    App.current = m;
    setActive(m.id);
    document.title = `${m.title} · ${App.cfg.appName}`;
    main.innerHTML = '';
    const page = document.createElement('section');
    page.className = 'page page-' + m.id;
    main.appendChild(page);
    if (!App.canSee(m)) {
      page.innerHTML = `<div class="locked"><h2>หน้านี้สำหรับ${m.roles.map((r) => App.ROLES[r].label).join(' / ')}</h2>
        <p>กรุณาเข้าสู่ระบบด้วยบทบาทที่มีสิทธิ์</p><a class="btn primary" href="#/profile">ไปหน้าเข้าสู่ระบบ</a></div>`;
      return;
    }
    try { m.render(page, param); }
    catch (err) {
      console.error(err);
      page.innerHTML = `<div class="locked"><h2>เกิดข้อผิดพลาดในบริการ "${m.title}"</h2><pre>${esc(err.message)}</pre></div>`;
    }
    window.scrollTo(0, 0);
  }

  /* ---------- การตั้งค่า (ธีม / ขนาดตัวอักษร) ---------- */
  App.applySettings = function () {
    const theme = App.store.get('theme', 'auto');
    const dark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.style.fontSize = (App.store.get('fontScale', 1) * 16) + 'px';
  };

  function boot() {
    $('#brandName').textContent = App.cfg.appName;
    $('#brandTag').textContent = App.cfg.tagline;
    App.applySettings();
    buildNav();
    updateUserChip();
    $('#menuBtn').onclick = () => document.body.classList.toggle('nav-open');
    $('#scrim').onclick = () => document.body.classList.remove('nav-open');
    $('#userChip').onclick = () => App.go('profile');
    $('#quickSearch').addEventListener('submit', (e) => {
      e.preventDefault();
      const q = $('#quickSearchIn').value.trim();
      if (q) App.go('search', q);
    });
    App.on('user', () => { buildNav(); updateUserChip(); route(); });
    App.on('points', updateUserChip);
    window.addEventListener('hashchange', route);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', App.applySettings);
    if ('speechSynthesis' in window) speechSynthesis.getVoices();
    route();

    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* offline ไม่พร้อมใช้ */ });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
