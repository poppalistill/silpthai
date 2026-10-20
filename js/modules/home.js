/* บริการที่ 2: หน้าหลัก — จัดแบบ "หน้าปกและสารบัญ" ของหนังสือ
 * ปก (ชื่อแอป วันที่ คำทักทาย) → เรื่องประจำวัน 3 คอลัมน์ → ตัวเลขสรุป → สารบัญบริการทั้งหมด */
(function () {
  // ภาพลายเส้นหน้าบันโบสถ์ (ช่อฟ้า ใบระกา หางหงส์) วาดด้วย SVG — ใบระกาคำนวณตามแนวโค้งหลังคา
  const MOTIF = 'M10 .8C14 4.6 13.6 7.8 10 10C6.4 7.8 6 4.6 10 .8ZM19.2 10C15.4 14 12.2 13.6 10 10C12.2 6.4 15.4 6 19.2 10ZM10 19.2C6 15.4 6.4 12.2 10 10C13.6 12.2 14 15.4 10 19.2ZM.8 10C4.6 6 7.8 6.4 10 10C7.8 13.6 4.6 14 .8 10Z';
  function gable() {
    const q = (a, b, c, t) => [0, 1].map((k) => (1 - t) ** 2 * a[k] + 2 * (1 - t) * t * b[k] + t * t * c[k]);
    const d = (a, b, c, t) => [0, 1].map((k) => 2 * (1 - t) * (b[k] - a[k]) + 2 * t * (c[k] - b[k]));
    const sides = [[[40, 250], [150, 175], [240, 72]], [[440, 250], [330, 175], [240, 72]]];
    let teeth = '';
    sides.forEach(([a, b, c]) => {
      for (let t = 0.07; t < 0.88; t += 0.065) {
        const [x, y] = q(a, b, c, t);
        const [dx, dy] = d(a, b, c, t);
        const L = Math.hypot(dx, dy), tx = dx / L, ty = dy / L;
        let nx = -ty, ny = tx;
        if (ny > 0) { nx = -nx; ny = -ny; }
        const f = (v) => v.toFixed(1);
        teeth += `M${f(x - tx * 5)} ${f(y - ty * 5)}Q${f(x + nx * 10)} ${f(y + ny * 10)} ${f(x + nx * 15 + tx * 6)} ${f(y + ny * 15 + ty * 6)}Q${f(x + nx * 6 + tx * 4)} ${f(y + ny * 6 + ty * 4)} ${f(x + tx * 5)} ${f(y + ty * 5)}Z`;
      }
    });
    return `<svg class="cover-art" viewBox="0 0 480 300" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
      <path d="${teeth}" fill="currentColor" stroke-width="1" opacity=".9"/>
      <path d="M40 250Q150 175 240 72Q330 175 440 250"/>
      <path d="M64 250Q162 184 240 96Q318 184 416 250" opacity=".7"/>
      <path d="M240 72C236 52 246 34 266 30C256 40 254 50 259 58" stroke-width="3"/>
      <path d="M40 250C22 250 14 236 22 224C27 233 33 238 44 238"/><path d="M440 250C458 250 466 236 458 224C453 233 447 238 436 238"/>
      <circle cx="240" cy="196" r="38" opacity=".8"/><circle cx="240" cy="196" r="30" stroke-dasharray="2 5"/>
      <path d="${MOTIF}" transform="translate(240 196) scale(2.4) translate(-10 -10)" fill="currentColor" stroke="none"/>
      <path d="M100 236Q170 196 200 166M380 236Q310 196 280 166" stroke-dasharray="1 7" opacity=".7"/>
      <path d="M28 258H452M36 268H444" /><path d="M80 268V300M160 268V300M320 268V300M400 268V300" opacity=".75"/>
    </svg>`;
  }

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
    const row = (m) => `<a class="toc-row" href="#/${m.id}" style="--c:${m.color || 'var(--red)'}">
      <span class="n">${T(String(m.no).padStart(2, '0'))}</span><b>${m.title}</b><small>${m.desc || ''}</small></a>`;

    el.innerHTML = `
      <section class="cover">
        ${gable()}
        <div class="cover-text">
        <div class="cover-date">วัน${DAYS[now.getDay()]}ที่ ${App.thaiDate(now)}</div>
        <h1>ศิลป์<span>ไทย</span></h1>
        <p class="lede">${App.cfg.tagline} — สมุดความรู้ ${T(services.length)} หมวด สำหรับนักเรียน ครู นักท่องเที่ยว และทุกคนที่รักวัฒนธรรมไทย</p>
        <p class="greet">${greet}${u ? ` คุณ${App.esc(u.name)} · ระดับ ${T(lv.index)} ${lv.name}` : ''}</p>
        <div class="btn-row">
          ${u ? '<a class="btn gold" href="#/profile">ดูความก้าวหน้า</a>' : '<a class="btn gold" href="#/profile">เข้าสู่ระบบ / สมัครสมาชิก</a>'}
          <a class="btn ghost" href="#/chatbot">ถามน้องมาลัย</a>
        </div>
        </div>
      </section>

      <div class="today">
        <div style="--c:${App.byId.festivals.color}"><h3>ประเพณีเดือน${App.THAI_MONTHS[month - 1]}</h3>
          ${fest.length ? fest.slice(0, 2).map((f) => `<a class="big" href="#/festivals/${f.id}">${f.title}</a><p style="margin-bottom:8px">${f.sub}</p>`).join('')
            : '<p>ไม่มีประเพณีในเดือนนี้ — <a href="#/festivals">ดูปฏิทินทั้งปี</a></p>'}</div>
        <div style="--c:${App.byId.idioms.color}"><h3>สำนวนวันนี้</h3>
          ${idiom ? `<span class="big">“${idiom.title}”</span><p>${idiom.sub}</p>` : ''}</div>
        <div style="--c:${App.byId.events.color}"><h3>กิจกรรมถัดไป</h3>
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
})();
