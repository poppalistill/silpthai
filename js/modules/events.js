/* บริการที่ 19: กิจกรรมและจองเวิร์กช็อป — สมาชิกจอง/ยกเลิกได้ ผู้ดูแลระบบเพิ่ม/ลบกิจกรรมได้ (หน้า admin)
 * ข้อมูลเก็บใน localStorage: events (รายการกิจกรรม), bookings (การจองทั้งหมด) */
(function () {
  const SEED = [
    { id: 'ev1', emoji: '🪷', title: 'เวิร์กช็อปประดิษฐ์กระทงใบตอง', cat: 'งานประดิษฐ์', date: '2026-11-21', time: '13:00–16:00', place: 'ศูนย์วัฒนธรรมของมหาวิทยาลัย', price: 0, capacity: 30,
      desc: 'เรียนพับกลีบกระทงจากใบตองและประดับดอกไม้ ใช้วัสดุธรรมชาติ 100% พร้อมรับกระทงกลับบ้าน' },
    { id: 'ev2', emoji: '🌼', title: 'ร้อยมาลัยดอกมะลิ', cat: 'งานประดิษฐ์', date: '2026-12-05', time: '09:30–12:00', place: 'ห้องกิจกรรม อาคารศิลปะ', price: 150, capacity: 20,
      desc: 'ฝึกร้อยมาลัยกลมและมาลัยข้อพวงสำหรับไหว้พระและมอบผู้ใหญ่ มีวิทยากรสอนทีละขั้น' },
    { id: 'ev3', emoji: '🎹', title: 'ทดลองตีระนาดเบื้องต้น', cat: 'ดนตรี', date: '2026-12-12', time: '14:00–16:00', place: 'ห้องดนตรีไทย', price: 0, capacity: 15,
      desc: 'จับไม้ตีระนาด ฝึกท่านั่ง และบรรเลงเพลงสั้น ๆ ไม่ต้องมีพื้นฐาน' },
    { id: 'ev4', emoji: '💃', title: 'ฝึกรำวงมาตรฐาน', cat: 'นาฏศิลป์', date: '2027-01-09', time: '16:00–18:00', place: 'ลานกิจกรรมกลาง', price: 0, capacity: 50,
      desc: 'เรียนท่ารำพื้นฐาน จีบ ตั้งวง และรำเพลงงามแสงเดือน ชาวไทย เหมาะกับทุกวัย' },
    { id: 'ev5', emoji: '🍰', title: 'ทำขนมชั้นและลูกชุบ', cat: 'อาหาร', date: '2027-01-23', time: '10:00–14:00', place: 'ครัวสาธิต คณะคหกรรม', price: 250, capacity: 16,
      desc: 'ลงมือทำขนมมงคลสองชนิด พร้อมเรียนรู้ความหมายของขนมไทยในงานพิธี' },
    { id: 'ev6', emoji: '🎨', title: 'วาดลายไทยเบื้องต้น', cat: 'ศิลปะ', date: '2027-02-06', time: '13:00–16:00', place: 'สตูดิโอศิลปะ', price: 100, capacity: 25,
      desc: 'ฝึกเขียนแม่ลายกนกสามตัวและลายประจำยามด้วยดินสอและพู่กัน' }
  ];
  const evs = () => { let e = App.store.get('events', null); if (!e) { e = SEED; App.store.set('events', e); } return e; };
  const bookings = () => App.store.get('bookings', []);
  const taken = (id) => bookings().filter((b) => b.eventId === id).reduce((s, b) => s + b.qty, 0);
  const isPast = (e) => new Date(e.date + 'T23:59:59') < new Date();

  App.events = { list: evs, bookings, taken, seed: SEED };

  App.register({
    id: 'events',
    no: 19,
    title: 'กิจกรรม & จองเวิร์กช็อป',
    short: 'กิจกรรม',
    icon: '🎟️',
    group: 'service',
    color: '#a3366b',
    desc: 'ค้นหากิจกรรมวัฒนธรรม จองที่นั่ง และดูตั๋วของฉัน',
    getItems() {
      return evs().map((e) => ({ id: e.id, title: e.title, emoji: e.emoji, sub: `${App.thaiDate(e.date)} · ${e.place}`, body: e.desc, tags: ['กิจกรรม', e.cat] }));
    },
    render(el, param) {
      const m = this;
      let tab = param === 'mine' ? 'mine' : 'all';
      const draw = () => {
        const list = evs().slice().sort((a, b) => a.date.localeCompare(b.date));
        const u = App.user();
        const mine = u ? bookings().filter((b) => b.userId === u.id) : [];
        el.innerHTML = App.ui.pageHead(m) + `
          <div class="chips" style="margin-bottom:14px">
            <button class="chip ${tab === 'all' ? 'on' : ''}" data-t="all">📋 กิจกรรมทั้งหมด (${list.length})</button>
            <button class="chip ${tab === 'mine' ? 'on' : ''}" data-t="mine">🎫 การจองของฉัน (${mine.length})</button>
            ${App.role() === 'admin' ? '<a class="chip" href="#/admin">🛡️ จัดการกิจกรรม</a>' : ''}
          </div>
          ${tab === 'all' ? `<div class="grid cols-3">${list.map((e) => {
            const left = e.capacity - taken(e.id);
            const past = isPast(e);
            return `<div class="panel event-card">
              <div style="font-size:2.4rem">${e.emoji || '🎉'}</div>
              <span class="chip sm">${App.esc(e.cat || 'กิจกรรม')}</span>
              <h3 style="margin:0">${App.esc(e.title)}</h3>
              <div class="when">📅 ${App.thaiDate(e.date)} · ⏰ ${App.esc(e.time)}</div>
              <div>📍 ${App.esc(e.place)}</div>
              <div>💰 ${+e.price ? e.price + ' บาท/คน' : 'ฟรี'}</div>
              <p class="muted" style="margin:0">${App.esc(e.desc)}</p>
              <div class="progress"><i style="width:${Math.min(100, (1 - left / e.capacity) * 100)}%"></i></div>
              <div class="seat">เหลือ ${Math.max(0, left)} / ${e.capacity} ที่นั่ง</div>
              <button class="btn ${left > 0 && !past ? 'primary' : ''}" data-book="${e.id}" ${left <= 0 || past ? 'disabled' : ''}>
                ${past ? 'สิ้นสุดแล้ว' : left <= 0 ? 'เต็มแล้ว' : '🎟️ จองเลย'}</button>
            </div>`;
          }).join('')}</div>`
          : !u ? '<div class="locked"><div class="big">🔐</div><p>เข้าสู่ระบบเพื่อดูการจองของคุณ</p><a class="btn primary" href="#/profile">เข้าสู่ระบบ</a></div>'
          : mine.length ? `<div class="grid cols-2">${mine.map((b) => {
            const e = list.find((x) => x.id === b.eventId) || { title: '(กิจกรรมถูกลบแล้ว)', date: '', time: '', place: '' };
            return `<div class="panel" style="border-left:6px solid var(--gold)">
              <small class="muted">รหัสการจอง</small><h3 style="margin:0;letter-spacing:.08em">${b.code}</h3>
              <p style="margin:6px 0"><b>${App.esc(e.title)}</b><br>📅 ${e.date ? App.thaiDate(e.date) : '-'} ${App.esc(e.time)}<br>📍 ${App.esc(e.place)}</p>
              <p class="muted" style="margin:0">ผู้จอง: ${App.esc(b.name)} · ${b.qty} ที่นั่ง · โทร ${App.esc(b.phone)}</p>
              <div class="btn-row" style="margin-top:10px"><button class="btn sm danger" data-cancel="${b.id}">ยกเลิกการจอง</button></div>
            </div>`;
          }).join('')}</div>` : '<p class="empty">ยังไม่มีการจอง — เลือกกิจกรรมที่สนใจได้ที่แท็บ "กิจกรรมทั้งหมด"</p>'}`;

        App.$$('[data-t]', el).forEach((b) => b.onclick = () => { tab = b.dataset.t; draw(); });
        App.$$('[data-book]', el).forEach((b) => b.onclick = () => book(list.find((e) => e.id === b.dataset.book)));
        App.$$('[data-cancel]', el).forEach((b) => b.onclick = () => {
          if (!App.ui.confirm('ยืนยันยกเลิกการจองนี้?')) return;
          App.store.set('bookings', bookings().filter((x) => x.id !== b.dataset.cancel));
          App.ui.toast('ยกเลิกการจองแล้ว'); draw();
        });
      };

      const book = (e) => {
        if (!App.requireMember('เพื่อจองกิจกรรม')) return;
        const u = App.user();
        const left = e.capacity - taken(e.id);
        const w = App.ui.modal(`<div class="modal-pad">
          <h2>🎟️ จอง: ${App.esc(e.title)}</h2>
          <p class="muted">📅 ${App.thaiDate(e.date)} ${App.esc(e.time)} · 📍 ${App.esc(e.place)} · เหลือ ${left} ที่นั่ง</p>
          <form id="bkForm">
            <label class="field"><span>ชื่อ-นามสกุลผู้จอง *</span><input class="input" name="name" required value="${App.esc(u.name)}"></label>
            <label class="field"><span>เบอร์โทรศัพท์ * (10 หลัก)</span><input class="input" name="phone" required pattern="0[0-9]{9}" inputmode="numeric" placeholder="08xxxxxxxx"></label>
            <label class="field"><span>จำนวนที่นั่ง</span><select class="input" name="qty">${Array.from({ length: Math.min(5, left) }, (_, i) => `<option>${i + 1}</option>`).join('')}</select></label>
            <label class="field"><span>หมายเหตุ (ถ้ามี)</span><textarea class="input" name="note" rows="2"></textarea></label>
            <p class="muted" style="font-size:.85rem">ค่าใช้จ่าย: <b id="bkPrice">${+e.price ? e.price + ' บาท' : 'ฟรี'}</b> (ชำระหน้างาน)</p>
            <button class="btn primary" type="submit">ยืนยันการจอง</button>
          </form></div>`);
        const f = App.$('#bkForm', w);
        f.qty.onchange = () => { App.$('#bkPrice', w).textContent = +e.price ? (e.price * f.qty.value) + ' บาท' : 'ฟรี'; };
        f.onsubmit = (ev) => {
          ev.preventDefault();
          const qty = +f.qty.value;
          if (qty > e.capacity - taken(e.id)) { App.ui.toast('ที่นั่งไม่พอ', 'warn'); return; }
          const b = { id: App.uid(), code: 'ST-' + Math.random().toString(36).slice(2, 7).toUpperCase(), eventId: e.id, userId: u.id,
            name: f.name.value.trim(), phone: f.phone.value.trim(), qty, note: f.note.value.trim(), created: new Date().toISOString() };
          App.store.set('bookings', bookings().concat(b));
          App.bump('bookings');
          App.addPoints(10, 'ร่วมสืบสานวัฒนธรรม');
          App.ui.modal(`<div class="modal-pad" style="text-align:center">
            <div style="font-size:4rem">🎉</div><h2>จองสำเร็จ!</h2>
            <p>รหัสการจองของคุณ</p><h1 style="letter-spacing:.12em;color:var(--red)">${b.code}</h1>
            <p class="muted">${App.esc(e.title)}<br>${App.thaiDate(e.date)} ${App.esc(e.time)}</p>
            <p class="muted" style="font-size:.85rem">แสดงรหัสนี้ที่จุดลงทะเบียนหน้างาน</p></div>`, { onClose: () => { tab = 'mine'; draw(); } });
        };
      };
      draw();
    }
  });
})();
