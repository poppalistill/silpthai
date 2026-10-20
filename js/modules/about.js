/* บริการที่ 23: เกี่ยวกับแอปและผู้จัดทำ — รายชื่อสมาชิกแก้ได้ที่ js/config.js */
App.register({
  id: 'about',
  no: 23,
  title: 'เกี่ยวกับ & ผู้จัดทำ',
  short: 'เกี่ยวกับ',
  icon: 'ℹ️',
  group: 'account',
  color: '#8b1e1e',
  desc: 'วัตถุประสงค์ ผู้ใช้เป้าหมาย รายการบริการ และผู้จัดทำ',
  render(el) {
    const c = App.cfg;
    const mods = App.modules.filter((m) => m.no).sort((a, b) => a.no - b.no);
    el.innerHTML = App.ui.pageHead(this) + `
      <div class="grid cols-2">
        <div class="panel"><h3>วัตถุประสงค์</h3>
          <p><b>${c.appName} (${c.appNameEn})</b> เวอร์ชัน ${c.version} — ${c.tagline}</p>
          <ul><li>รวบรวมความรู้ศิลปวัฒนธรรมไทยให้เข้าถึงง่ายในที่เดียว</li><li>เรียนรู้ผ่านการลงมือทำ: ฝึกเขียน ระบายสี เล่นดนตรี ทำแบบทดสอบ</li>
          <li>เชื่อมผู้คนเข้ากับกิจกรรมสืบสานวัฒนธรรมจริง</li><li>รองรับทุกวัย ทั้งโหมดตัวอักษรใหญ่และเสียงอ่าน</li></ul>
        </div>
        <div class="panel"><h3>ผู้ใช้เป้าหมาย</h3>
          <ul>${App.MEMBER_ROLES.concat('guest').map((r) => `<li><b>${App.ROLES[r].label}</b> — ${App.ROLES[r].desc}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="panel"><h3>บริการทั้งหมด ${mods.length} บริการ</h3>
        <div class="tbl-wrap"><table class="tbl"><tr><th>ลำดับ</th><th>บริการ</th><th>รายละเอียด</th></tr>
          ${mods.map((m) => `<tr><td>${App.toThaiDigits(m.no)}</td><td><a href="#/${m.id}">${m.title}</a></td><td>${m.desc}</td></tr>`).join('')}
          <tr><td>${App.toThaiDigits(mods.length + 1)}</td><td>อ่านออกเสียง (TTS)</td><td>ปุ่มอ่านออกเสียงในทุกหน้ารายละเอียด</td></tr>
          <tr><td>${App.toThaiDigits(mods.length + 2)}</td><td>ใช้งานออฟไลน์ (PWA)</td><td>ติดตั้งลงมือถือและเปิดใช้ได้แม้ไม่มีอินเทอร์เน็ต</td></tr>
        </table></div>
      </div>
      <div class="panel"><h3>ผู้จัดทำ</h3>
        <p class="muted">${c.course}</p>
        <div class="tbl-wrap"><table class="tbl"><tr><th>ชื่อ-นามสกุล</th><th>รหัสนักศึกษา</th><th>หน้าที่</th></tr>
          ${c.members.map((p) => `<tr><td>${App.esc(p.name)}</td><td>${App.esc(p.studentId)}</td><td>${App.esc(p.duty)}</td></tr>`).join('')}</table></div>
      </div>
      <div class="panel"><h3>หมายเหตุ</h3>
        <p class="muted">เนื้อหาเรียบเรียงเพื่อการศึกษา หากพบข้อมูลคลาดเคลื่อนสามารถแก้ไขได้ในไฟล์ <code>js/modules/</code> ของแต่ละบริการ ·
        ข้อมูลผู้ใช้ทั้งหมดเก็บในเครื่องของผู้ใช้ (localStorage) ไม่มีการส่งไปยังเซิร์ฟเวอร์</p>
      </div>`;
  }
});
