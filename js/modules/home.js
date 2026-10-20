/* บริการที่ 2: หน้าหลัก — จัดแบบ "หน้าปกและสารบัญ" ของหนังสือ
 * ปก (ชื่อแอป วันที่ คำทักทาย) → เรื่องประจำวัน 3 คอลัมน์ → ตัวเลขสรุป → สารบัญบริการทั้งหมด */
App.register({
  id: 'home',
  no: 2,
  title: 'หน้าหลัก',
  icon: '🏠',
  group: 'main',
  color: '#8b1e1e',
  desc: 'หน้าปก เรื่องประจำวัน และสารบัญบริการทั้งหมด',
  render(el) {
    const T = App.toThaiDigits;
    const u = App.user();
    const now = new Date();
    const DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const h = now.getHours();
    const greet = h < 12 ? 'อรุณสวัสดิ์' : h < 17 ? 'สวัสดียามบ่าย' : 'สวัสดียามเย็น';
    const month = now.getMonth() + 1;
    const fest = (App.byId.festivals ? App.byId.festivals.items : []).filter((f) => f.month === month);
    const idiom = App.byId.idioms ? App.byId.idioms.today() : null;
    const next = App.events ? App.events.list().filter((e) => new Date(e.date + 'T23:59') >= now).sort((a, b) => a.date.localeCompare(b.date))[0] : null;
    const services = App.modules.filter((m) => m.no);
    const s = App.stats();
    const lv = App.level();

    const GROUPS = [['learn', 'คลังความรู้'], ['play', 'ลงมือทำ'], ['main', 'ผู้ช่วยและการค้นหา'], ['service', 'บริการ'], ['account', 'บัญชีและระบบ']];
    const row = (m) => `<a class="toc-row" href="#/${m.id}">
      <span class="n">${T(String(m.no).padStart(2, '0'))}</span><b>${m.title}</b><small>${m.desc || ''}</small></a>`;

    el.innerHTML = `
      <section class="cover">
        <div class="cover-date">วัน${DAYS[now.getDay()]}ที่ ${App.thaiDate(now)}</div>
        <h1>ศิลป์<span>ไทย</span></h1>
        <p class="lede">${App.cfg.tagline} — สมุดความรู้ ${T(services.length)} หมวด สำหรับนักเรียน ครู นักท่องเที่ยว และทุกคนที่รักวัฒนธรรมไทย</p>
        <p class="greet">${greet}${u ? ` คุณ${App.esc(u.name)} · ระดับ ${T(lv.index)} ${lv.name}` : ''}</p>
        <div class="btn-row">
          ${u ? '<a class="btn" href="#/profile">ดูความก้าวหน้า</a>' : '<a class="btn primary" href="#/profile">เข้าสู่ระบบ / สมัครสมาชิก</a>'}
          <a class="btn" href="#/chatbot">ถามน้องมาลัย</a>
        </div>
        <div class="band"></div>
      </section>

      <div class="today">
        <div><h3>ประเพณีเดือน${App.THAI_MONTHS[month - 1]}</h3>
          ${fest.length ? fest.slice(0, 3).map((f) => `<a class="big" href="#/festivals/${f.id}">${f.title}</a><p style="margin-bottom:8px">${f.sub}</p>`).join('')
            : '<p>ไม่มีประเพณีในเดือนนี้ — <a href="#/festivals">ดูปฏิทินทั้งปี</a></p>'}</div>
        <div><h3>สำนวนวันนี้</h3>
          ${idiom ? `<span class="big">“${idiom.title}”</span><p>${idiom.sub}</p>` : ''}</div>
        <div><h3>กิจกรรมถัดไป</h3>
          ${next ? `<a class="big" href="#/events">${App.esc(next.title)}</a><p>${App.thaiDate(next.date)} · ${App.esc(next.place)}</p>`
            : '<p>ยังไม่มีกิจกรรมใหม่</p>'}</div>
      </div>

      <div class="ledger">
        ${u ? `
          <span><b>${T(App.points())}</b>คะแนนสะสม</span>
          <span><b>${T((s.viewed || []).length)}</b>เรื่องที่อ่านแล้ว</span>
          <span><b>${T(App.earnedBadges().length)}/${T(App.BADGES.length)}</b>เหรียญรางวัล</span>
          <span><b>${T(App.favs().length)}</b>เรื่องโปรด</span>`
        : `
          <span><b>${T(App.allItems().length)}</b>เรื่องให้อ่าน</span>
          <span><b>${T(services.length)}</b>หมวดบริการ</span>
          <span><b>${T(4)}</b>ภาควัฒนธรรม</span>
          <span><b>${T(App.BADGES.length)}</b>เหรียญให้สะสม</span>`}
      </div>

      <section class="toc">
        <h2>สารบัญ</h2>
        ${GROUPS.map(([g, label]) => {
          const mods = App.modules.filter((m) => m.group === g && m.id !== 'home' && App.canSee(m)).sort((a, b) => (a.no || 99) - (b.no || 99));
          return mods.length ? `<div class="toc-group"><h3>${label}</h3><div class="toc-list">${mods.map(row).join('')}</div></div>` : '';
        }).join('')}
      </section>`;
  }
});
