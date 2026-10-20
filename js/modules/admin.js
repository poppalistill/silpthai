/* บริการที่ 22: ระบบผู้ดูแล (Admin) — สถิติ จัดการกิจกรรม การจอง ผู้ใช้ และสำรองข้อมูล
 * เข้าได้เฉพาะบทบาท admin (roles: ['admin']) */
App.register({
  id: 'admin',
  no: 22,
  title: 'ระบบผู้ดูแล',
  icon: '🛡️',
  group: 'account',
  color: '#1f2a44',
  roles: ['admin'],
  desc: 'สถิติการใช้งาน จัดการกิจกรรม การจอง ผู้ใช้ และข้อมูล',
  render(el) {
    const draw = () => {
      const users = App.users();
      const evs = App.events.list();
      const bks = App.events.bookings();
      const quiz = App.store.get('quizResults', []);
      const me = App.user();
      const roleCount = App.MEMBER_ROLES.map((r) => [r, users.filter((u) => u.role === r).length]);
      el.innerHTML = App.ui.pageHead(this) + `
        <div class="stat-row">
          <div class="stat"><b>${users.length}</b><small>ผู้ใช้ทั้งหมด</small></div>
          <div class="stat"><b>${evs.length}</b><small>กิจกรรม</small></div>
          <div class="stat"><b>${bks.length}</b><small>การจอง (${bks.reduce((s, b) => s + b.qty, 0)} ที่นั่ง)</small></div>
          <div class="stat"><b>${quiz.length}</b><small>ครั้งที่ทำแบบทดสอบ</small></div>
          <div class="stat"><b>${App.allItems().length}</b><small>เนื้อหาในระบบ</small></div>
        </div>
        <div class="panel"><h3>ผู้ใช้แยกตามบทบาท</h3>
          ${roleCount.map(([r, n]) => `<div style="display:flex;align-items:center;gap:10px;margin:6px 0">
            <span style="width:150px">${App.ROLES[r].label}</span>
            <div class="progress" style="flex:1"><i style="width:${users.length ? (n / users.length) * 100 : 0}%"></i></div><b>${n}</b></div>`).join('')}
        </div>

        <div class="grid cols-2">
          <div class="panel"><h3>เพิ่มกิจกรรมใหม่</h3>
            <form id="evForm">
              <label class="field"><span>ชื่อกิจกรรม *</span><input class="input" name="title" required></label>
              <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">
                <label class="field"><span>วันที่ *</span><input class="input" type="date" name="date" required></label>
                <label class="field"><span>เวลา</span><input class="input" name="time" placeholder="13:00–16:00"></label>
                <label class="field"><span>จำนวนที่นั่ง *</span><input class="input" type="number" name="capacity" min="1" value="20" required></label>
                <label class="field"><span>ราคา (บาท)</span><input class="input" type="number" name="price" min="0" value="0"></label>
                <label class="field"><span>หมวด</span><input class="input" name="cat" placeholder="งานประดิษฐ์"></label>
              </div>
              <label class="field"><span>สถานที่ *</span><input class="input" name="place" required></label>
              <label class="field"><span>รายละเอียด</span><textarea class="input" name="desc" rows="2"></textarea></label>
              <button class="btn primary">บันทึกกิจกรรม</button>
            </form>
          </div>
          <div class="panel"><h3>กิจกรรมทั้งหมด</h3>
            <div class="tbl-wrap"><table class="tbl"><tr><th>กิจกรรม</th><th>วันที่</th><th>จอง</th><th></th></tr>
              ${evs.map((e) => `<tr><td>${App.esc(e.title)}</td><td>${App.thaiDate(e.date)}</td><td>${App.events.taken(e.id)}/${e.capacity}</td>
                <td><button class="btn sm danger" data-del-ev="${e.id}">ลบ</button></td></tr>`).join('')}
            </table></div>
            <button class="btn sm" id="seed" style="margin-top:10px">คืนค่ากิจกรรมตัวอย่าง</button>
          </div>
        </div>

        <div class="panel"><h3>รายการจองทั้งหมด</h3>
          ${bks.length ? `<div class="tbl-wrap"><table class="tbl"><tr><th>รหัส</th><th>กิจกรรม</th><th>ผู้จอง</th><th>โทร</th><th>ที่นั่ง</th><th>วันที่จอง</th></tr>
            ${bks.slice().reverse().map((b) => { const e = evs.find((x) => x.id === b.eventId); return `<tr><td>${b.code}</td><td>${e ? App.esc(e.title) : '-'}</td>
              <td>${App.esc(b.name)}</td><td>${App.esc(b.phone)}</td><td>${b.qty}</td><td>${App.thaiDate(b.created)}</td></tr>`; }).join('')}
          </table></div>` : '<p class="muted">ยังไม่มีการจอง</p>'}
        </div>

        <div class="panel"><h3>จัดการผู้ใช้</h3>
          <div class="tbl-wrap"><table class="tbl"><tr><th>ผู้ใช้</th><th>บทบาท</th><th>คะแนน</th><th>สมัครเมื่อ</th><th></th></tr>
            ${users.map((u) => `<tr><td>${App.esc(u.name)}${u.id === me.id ? ' <small class="muted">(คุณ)</small>' : ''}</td>
              <td><select class="input" style="padding:4px 8px" data-role="${u.id}" ${u.id === me.id ? 'disabled' : ''}>
                ${App.MEMBER_ROLES.map((r) => `<option value="${r}" ${u.role === r ? 'selected' : ''}>${App.ROLES[r].label}</option>`).join('')}</select></td>
              <td>${App.store.get(`u:${u.id}:points`, 0)}</td><td>${App.thaiDate(u.created)}</td>
              <td>${u.id === me.id ? '' : `<button class="btn sm danger" data-del-u="${u.id}">ลบ</button>`}</td></tr>`).join('')}
          </table></div>
        </div>

        <div class="panel"><h3>สำรองและรีเซ็ตข้อมูล</h3>
          <div class="btn-row">
            <button class="btn" id="export">ส่งออกข้อมูลทั้งหมด (JSON)</button>
            <label class="btn">นำเข้าข้อมูล<input type="file" id="import" accept="application/json" hidden></label>
            <button class="btn danger" id="resetAll">รีเซ็ตระบบทั้งหมด</button>
          </div>
        </div>`;

      const f = App.$('#evForm', el);
      f.onsubmit = (e) => {
        e.preventDefault();
        const ev = { id: 'ev' + App.uid(), title: f.title.value.trim(), date: f.date.value, time: f.time.value.trim() || '-', capacity: +f.capacity.value,
          price: +f.price.value || 0, cat: f.cat.value.trim() || 'กิจกรรม', place: f.place.value.trim(), desc: f.desc.value.trim() };
        App.store.set('events', evs.concat(ev));
        App.ui.toast('เพิ่มกิจกรรมแล้ว', 'ok'); draw();
      };
      App.$$('[data-del-ev]', el).forEach((b) => b.onclick = () => {
        if (!App.ui.confirm('ลบกิจกรรมนี้? (การจองที่เกี่ยวข้องจะถูกลบด้วย)')) return;
        App.store.set('events', evs.filter((x) => x.id !== b.dataset.delEv));
        App.store.set('bookings', bks.filter((x) => x.eventId !== b.dataset.delEv));
        draw();
      });
      App.$('#seed', el).onclick = () => { if (App.ui.confirm('แทนที่รายการกิจกรรมด้วยกิจกรรมตัวอย่าง?')) { App.store.set('events', App.events.seed); draw(); } };
      App.$$('[data-role]', el).forEach((s) => s.onchange = () => {
        App.saveUsers(App.users().map((u) => (u.id === s.dataset.role ? Object.assign({}, u, { role: s.value }) : u)));
        App.ui.toast('เปลี่ยนบทบาทแล้ว', 'ok');
      });
      App.$$('[data-del-u]', el).forEach((b) => b.onclick = () => {
        if (!App.ui.confirm('ลบผู้ใช้นี้และข้อมูลทั้งหมดของผู้ใช้?')) return;
        const id = b.dataset.delU;
        App.saveUsers(App.users().filter((u) => u.id !== id));
        App.store.keys().filter((k) => k.startsWith(`u:${id}:`)).forEach((k) => App.store.remove(k));
        draw();
      });
      App.$('#export', el).onclick = () => {
        const data = {};
        App.store.keys().forEach((k) => { data[k] = App.store.get(k); });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
        a.download = `silpthai-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
      };
      App.$('#import', el).onchange = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        try {
          const data = JSON.parse(await file.text());
          if (!App.ui.confirm(`นำเข้า ${Object.keys(data).length} รายการ? ข้อมูลเดิมที่ชื่อซ้ำจะถูกแทนที่`)) return;
          Object.entries(data).forEach(([k, v]) => App.store.set(k, v));
          App.ui.toast('นำเข้าข้อมูลแล้ว', 'ok'); App.emit('user');
        } catch (err) { App.ui.toast('ไฟล์ไม่ถูกต้อง', 'warn'); }
      };
      App.$('#resetAll', el).onclick = () => {
        if (!App.ui.confirm('ลบข้อมูลทั้งหมด (ผู้ใช้ คะแนน การจอง กิจกรรม) และเริ่มใหม่?')) return;
        App.store.keys().forEach((k) => App.store.remove(k));
        location.hash = '#/home'; location.reload();
      };
    };
    draw();
  }
});
