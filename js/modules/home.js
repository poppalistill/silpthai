/* บริการที่ 2: หน้าหลัก (แดชบอร์ด) — ทักทาย สรุปความก้าวหน้า เรื่องเด่นวันนี้ และเมนูบริการทั้งหมด */
App.register({
  id: 'home',
  no: 2,
  title: 'หน้าหลัก',
  icon: '🏠',
  group: 'main',
  color: '#8b1e1e',
  desc: 'แดชบอร์ดสรุปและเมนูบริการทั้งหมด',
  render(el) {
    const u = App.user();
    const h = new Date().getHours();
    const greet = h < 12 ? 'อรุณสวัสดิ์' : h < 17 ? 'สวัสดียามบ่าย' : 'สวัสดียามเย็น';
    const month = new Date().getMonth() + 1;
    const fest = (App.byId.festivals ? App.byId.festivals.items : []).filter((f) => f.month === month);
    const idiom = App.byId.idioms ? App.byId.idioms.today() : null;
    const next = App.events ? App.events.list().filter((e) => new Date(e.date + 'T23:59') >= new Date()).sort((a, b) => a.date.localeCompare(b.date))[0] : null;
    const contentCount = App.allItems().length;
    const s = App.stats();
    const lv = App.level();

    const GROUPS = [['learn', '📚 คลังความรู้'], ['play', '🎮 ลงมือทำ & เกม'], ['main', '🧭 ผู้ช่วยและการค้นหา'], ['service', '🎟️ บริการ'], ['account', '👤 บัญชีและระบบ']];
    const svc = (m) => `<a class="svc" href="#/${m.id}" style="--c:${m.color || 'var(--gold)'}">
      ${m.no ? `<span class="no">${App.toThaiDigits(m.no)}</span>` : ''}<span class="ic">${m.icon}</span><b>${m.title}</b><small>${m.desc || ''}</small></a>`;

    el.innerHTML = `
      <section class="hero">
        <img class="deco" src="assets/icon.svg" alt="">
        <h1>${greet}${u ? ' คุณ' + App.esc(u.name) : ''} 🙏</h1>
        <p>${App.cfg.appName} — ${App.cfg.tagline} รวม ${App.modules.filter((m) => m.no).length} บริการ และเนื้อหากว่า ${contentCount} เรื่อง</p>
        <div class="btn-row">
          ${u ? `<a class="btn gold" href="#/profile">🏅 ระดับ ${lv.index}: ${lv.name}</a>` : '<a class="btn gold" href="#/profile">✨ สมัครสมาชิก / เข้าสู่ระบบ</a>'}
          <a class="btn" href="#/chatbot">💬 ถามน้องมาลัย</a>
        </div>
      </section>

      <div class="stat-row">
        ${u ? `
          <div class="stat"><b>${App.points()}</b><small>คะแนนสะสม</small></div>
          <div class="stat"><b>${(s.viewed || []).length}</b><small>เรื่องที่เรียนรู้แล้ว</small></div>
          <div class="stat"><b>${App.earnedBadges().length}/${App.BADGES.length}</b><small>เหรียญรางวัล</small></div>
          <div class="stat"><b>${App.favs().length}</b><small>รายการโปรด</small></div>`
        : `
          <div class="stat"><b>${contentCount}</b><small>เรื่องให้เรียนรู้</small></div>
          <div class="stat"><b>${App.modules.filter((m) => m.no).length}</b><small>บริการในแอป</small></div>
          <div class="stat"><b>4</b><small>ภาควัฒนธรรม</small></div>
          <div class="stat"><b>${App.BADGES.length}</b><small>เหรียญให้สะสม</small></div>`}
      </div>

      <div class="grid cols-3">
        <div class="panel"><h3>📅 ประเพณีเดือน${App.THAI_MONTHS[month - 1]}</h3>
          ${fest.length ? fest.map((f) => `<p style="margin:4px 0"><a href="#/festivals/${f.id}">${f.emoji} ${f.title}</a> <small class="muted">${f.region}</small></p>`).join('')
            : '<p class="muted">ไม่มีประเพณีในเดือนนี้ <a href="#/festivals">ดูปฏิทินทั้งปี</a></p>'}</div>
        <div class="panel"><h3>💬 สำนวนวันนี้</h3>
          ${idiom ? `<p style="font-family:var(--font-head);font-size:1.15rem;margin:0">${idiom.title}</p><p class="muted" style="margin:4px 0 0">${idiom.sub}</p>` : ''}</div>
        <div class="panel"><h3>🎟️ กิจกรรมถัดไป</h3>
          ${next ? `<p style="margin:0"><b>${next.emoji} ${App.esc(next.title)}</b><br><small class="muted">${App.thaiDate(next.date)} · ${App.esc(next.place)}</small></p>
            <a class="btn sm primary" style="margin-top:8px" href="#/events">จองเลย</a>` : '<p class="muted">ยังไม่มีกิจกรรมใหม่</p>'}</div>
      </div>

      ${GROUPS.map(([g, label]) => {
        const mods = App.modules.filter((m) => m.group === g && m.id !== 'home' && App.canSee(m)).sort((a, b) => (a.no || 99) - (b.no || 99));
        return mods.length ? `<div class="svc-group"><h2>${label}</h2><div class="svc-grid">${mods.map(svc).join('')}</div></div>` : '';
      }).join('')}`;
  }
});
