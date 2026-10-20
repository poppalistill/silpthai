/* บริการที่ 1: สมาชิกและบทบาทผู้ใช้ + บริการที่ 21: คะแนนสะสมและเหรียญรางวัล
 * บทบาท: ผู้เยี่ยมชม / นักเรียน / นักท่องเที่ยว / ประชาชนทั่วไป / ครู / ผู้ดูแลระบบ */
(function () {
  const AVATARS = ['🙂', '😊', '🧑‍🎓', '👩‍🎓', '🧳', '🧑‍🏫', '🛡️', '🐘', '🪷', '🌼', '👑', '🎭', '🐯', '🦚', '🐒', '🎐'];
  const PERMS = [
    ['อ่านเนื้อหา / ค้นหา / แชทบอท', 1, 1, 1, 1],
    ['ฝึกเขียน / ระบายสี / ระนาด / แบบทดสอบ', 1, 1, 1, 1],
    ['บันทึกรายการโปรด คะแนน เหรียญรางวัล', 0, 1, 1, 1],
    ['จองกิจกรรม / ดูตั๋วของฉัน', 0, 1, 1, 1],
    ['ดูผลคะแนนแบบทดสอบของทุกคน', 0, 0, 1, 1],
    ['จัดการกิจกรรม ผู้ใช้ และข้อมูลระบบ', 0, 0, 0, 1]
  ];

  App.register({
    id: 'profile',
    no: 1,
    title: 'สมาชิก & บทบาทผู้ใช้',
    short: 'ฉัน',
    icon: '👤',
    group: 'account',
    color: '#6b4226',
    desc: 'เข้าสู่ระบบ เลือกบทบาท ดูคะแนน ระดับ และเหรียญรางวัล',
    render(el) {
      const u = App.user();
      const permTable = `<div class="panel"><h3>🔐 สิทธิ์การใช้งานตามบทบาท</h3><div class="tbl-wrap"><table class="tbl">
        <tr><th>บริการ</th><th>👀 ผู้เยี่ยมชม</th><th>🎓🧳🙂 สมาชิก</th><th>🧑‍🏫 ครู</th><th>🛡️ ผู้ดูแล</th></tr>
        ${PERMS.map(([n, ...p]) => `<tr><td>${n}</td>${p.map((x) => `<td>${x ? '✅' : '—'}</td>`).join('')}</tr>`).join('')}
      </table></div></div>`;

      if (!u) {
        const others = App.users();
        el.innerHTML = App.ui.pageHead(this) + `
          <div class="grid cols-2">
            <div class="panel">
              <h3>✨ เข้าสู่ระบบ / สมัครสมาชิก</h3>
              <p class="muted">พิมพ์ชื่อและเลือกบทบาท หากยังไม่เคยใช้ ระบบจะสร้างบัญชีใหม่ให้อัตโนมัติ (ข้อมูลเก็บในเครื่องนี้เท่านั้น)</p>
              <form id="loginForm">
                <label class="field"><span>ชื่อที่ใช้แสดง *</span><input class="input" name="name" required maxlength="30" placeholder="เช่น น้องฟ้า"></label>
                <span class="muted" style="font-size:.9rem">เลือกบทบาทผู้ใช้</span>
                <div class="role-pick" style="margin:6px 0 12px">
                  ${App.MEMBER_ROLES.map((r, i) => `<label><input type="radio" name="role" value="${r}" ${i === 0 ? 'checked' : ''}>
                    <b>${App.ROLES[r].icon} ${App.ROLES[r].label}</b><small>${App.ROLES[r].desc}</small></label>`).join('')}
                </div>
                <label class="field" id="codeField" hidden><span>รหัสยืนยันบทบาท (สาธิต: ดูในไฟล์ README)</span><input class="input" name="code" type="password" autocomplete="off"></label>
                <button class="btn primary" type="submit">เข้าสู่ระบบ</button>
              </form>
            </div>
            <div class="panel">
              <h3>👥 บัญชีที่เคยใช้ในเครื่องนี้</h3>
              ${others.length ? others.map((o) => `<button class="btn" style="width:100%;justify-content:flex-start;margin-bottom:6px" data-uid="${o.id}">
                <span class="avatar" style="width:34px;height:34px;font-size:1.1rem">${App.esc(o.avatar)}</span>${App.esc(o.name)} <small class="muted">· ${App.ROLES[o.role].label}</small></button>`).join('')
                : '<p class="muted">ยังไม่มีบัญชี</p>'}
              <p class="muted" style="font-size:.85rem">👀 หากยังไม่เข้าสู่ระบบ คุณจะใช้งานในฐานะ "ผู้เยี่ยมชม" ซึ่งอ่านเนื้อหาได้ทั้งหมด</p>
            </div>
          </div>${permTable}`;
        const f = App.$('#loginForm', el);
        const codeField = App.$('#codeField', el);
        f.addEventListener('change', () => { codeField.hidden = !App.ROLES[f.role.value].code; });
        f.onsubmit = (e) => {
          e.preventDefault();
          const role = f.role.value;
          if (App.ROLES[role].code && f.code.value !== App.cfg.roleCodes[role]) { App.ui.toast('รหัสยืนยันบทบาทไม่ถูกต้อง', 'warn'); return; }
          const nu = App.login(f.name.value, role);
          App.ui.toast(`ยินดีต้อนรับ คุณ${nu.name} 🙏`, 'ok');
          App.checkBadges();
        };
        App.$$('[data-uid]', el).forEach((b) => b.onclick = () => {
          const o = App.users().find((x) => x.id === b.dataset.uid);
          if (App.ROLES[o.role].code) {
            const code = prompt(`กรอกรหัสยืนยันบทบาท "${App.ROLES[o.role].label}"`);
            if (code !== App.cfg.roleCodes[o.role]) { App.ui.toast('รหัสไม่ถูกต้อง', 'warn'); return; }
          }
          App.login(o.name, o.role);
        });
        return;
      }

      const s = App.stats();
      const lv = App.level();
      const earned = App.earnedBadges();
      el.innerHTML = App.ui.pageHead(this) + `
        <div class="grid cols-2">
          <div class="panel">
            <div style="display:flex;gap:14px;align-items:center">
              <span class="avatar" style="width:72px;height:72px;font-size:2.4rem">${App.esc(u.avatar)}</span>
              <div><h2 style="margin:0">${App.esc(u.name)}</h2>
                <span class="chip sm">${App.ROLES[u.role].icon} ${App.ROLES[u.role].label}</span>
                <p class="muted" style="margin:4px 0 0;font-size:.85rem">สมาชิกตั้งแต่ ${App.thaiDate(u.created)}</p></div>
            </div>
            <h3 style="margin-top:16px">🏅 ระดับ ${lv.index}: ${lv.name}</h3>
            <div class="progress"><i style="width:${lv.progress * 100}%"></i></div>
            <p class="muted" style="font-size:.85rem">${App.points()} คะแนน · อีก ${lv.next - App.points()} คะแนนถึงระดับถัดไป</p>
            <h3>เปลี่ยนรูปประจำตัว</h3>
            <div class="avatars">${AVATARS.map((a) => `<button class="${a === u.avatar ? 'on' : ''}" data-av="${a}">${a}</button>`).join('')}</div>
            <div class="btn-row" style="margin-top:14px">
              <button class="btn" id="rename">✏️ เปลี่ยนชื่อ</button>
              <button class="btn danger" id="logout">🚪 ออกจากระบบ</button>
            </div>
          </div>
          <div class="panel">
            <h3>📊 สถิติการเรียนรู้</h3>
            <div class="stat-row" style="grid-template-columns:repeat(2,1fr)">
              <div class="stat"><b>${(s.viewed || []).length}</b><small>เรื่องที่อ่าน</small></div>
              <div class="stat"><b>${s.quizBest || 0}/10</b><small>คะแนนแบบทดสอบสูงสุด</small></div>
              <div class="stat"><b>${s.writing || 0}</b><small>ตัวอักษรที่เขียนผ่าน</small></div>
              <div class="stat"><b>${s.notes || 0}</b><small>โน้ตระนาด</small></div>
              <div class="stat"><b>${s.drawings || 0}</b><small>ผลงานระบายสี</small></div>
              <div class="stat"><b>${s.bookings || 0}</b><small>กิจกรรมที่จอง</small></div>
            </div>
            <p class="muted" style="font-size:.85rem">💡 วิธีได้คะแนน: อ่านเรื่องใหม่ +2 · ตอบแบบทดสอบถูก +2/ข้อ · ฝึกเขียนผ่าน +3 · ระบายสี +5 · จองกิจกรรม +10</p>
          </div>
        </div>
        <div class="panel"><h3>🎖️ เหรียญรางวัล (${earned.length}/${App.BADGES.length})</h3>
          <div class="badges">${App.BADGES.map((b) => `<div class="bdg ${earned.includes(b.id) ? '' : 'lock'}"><div class="i">${b.icon}</div><b>${b.name}</b><small>${b.desc}</small></div>`).join('')}</div>
        </div>${permTable}`;
      App.$('.avatars', el).addEventListener('click', (e) => { const b = e.target.closest('[data-av]'); if (b) App.updateUser({ avatar: b.dataset.av }); });
      App.$('#logout', el).onclick = () => { App.logout(); App.ui.toast('ออกจากระบบแล้ว'); };
      App.$('#rename', el).onclick = () => {
        const n = prompt('ชื่อใหม่', u.name);
        if (n && n.trim()) App.updateUser({ name: n.trim().slice(0, 30) });
      };
    }
  });
})();
