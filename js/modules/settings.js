/* บริการที่ 21: ตั้งค่าและการเข้าถึง — โหมดมืด ขนาดตัวอักษร ความเร็วเสียงอ่าน ติดตั้งแอป */
App.register({
  id: 'settings',
  no: 21,
  title: 'ตั้งค่า & การเข้าถึง',
  short: 'ตั้งค่า',
  icon: '⚙️',
  group: 'account',
  color: '#4a4550',
  desc: 'โหมดมืด ขนาดตัวอักษร เสียงอ่าน และติดตั้งแอปบนมือถือ',
  render(el) {
    const st = App.store;
    const theme = st.get('theme', 'auto');
    const fs = st.get('fontScale', 1);
    const rate = st.get('ttsRate', 1);
    el.innerHTML = App.ui.pageHead(this) + `
      <div class="grid cols-2">
        <div class="panel"><h3>ธีมสี</h3>
          <div class="chips">${[['auto', 'ตามระบบ'], ['light', 'สว่าง'], ['dark', 'มืด']].map(([v, l]) => `<button class="chip ${theme === v ? 'on' : ''}" data-theme="${v}">${l}</button>`).join('')}</div>
        </div>
        <div class="panel"><h3>ขนาดตัวอักษร</h3>
          <div class="chips">${[[0.9, 'เล็ก'], [1, 'ปกติ'], [1.15, 'ใหญ่'], [1.3, 'ใหญ่มาก']].map(([v, l]) => `<button class="chip ${fs === v ? 'on' : ''}" data-fs="${v}">${l}</button>`).join('')}</div>
          <p class="muted" style="font-size:.85rem">เหมาะสำหรับผู้สูงอายุและผู้มีปัญหาด้านสายตา</p>
        </div>
        <div class="panel"><h3>เสียงอ่านภาษาไทย</h3>
          <label class="field"><span>ความเร็ว: <b id="rv">${rate}x</b></span><input type="range" id="rate" min="0.6" max="1.6" step="0.1" value="${rate}" style="width:100%"></label>
          <button class="btn sm" id="ttsTest">ทดสอบเสียง</button>
          <p class="muted" style="font-size:.85rem">ใช้เสียงอ่านของระบบปฏิบัติการ หากไม่มีเสียงภาษาไทย ให้ติดตั้ง Thai voice ในการตั้งค่าเครื่อง</p>
        </div>
        <div class="panel"><h3>ติดตั้งเป็นแอปบนมือถือ</h3>
          <p>แอปนี้เป็น <b>PWA</b> ติดตั้งลงหน้าจอโฮมได้ และใช้งานออฟไลน์ได้หลังเปิดครั้งแรก</p>
          <ul class="muted" style="font-size:.9rem"><li><b>Android (Chrome):</b> เมนู ⋮ "ติดตั้งแอป" / "เพิ่มลงในหน้าจอหลัก"</li>
          <li><b>iPhone (Safari):</b> ปุ่มแชร์ "เพิ่มไปยังหน้าจอโฮม"</li></ul>
          <button class="btn sm gold" id="install" hidden>ติดตั้งตอนนี้</button>
        </div>
        <div class="panel"><h3>ข้อมูลของฉัน</h3>
          <p class="muted">ข้อมูลทั้งหมดเก็บในเบราว์เซอร์ของเครื่องนี้เท่านั้น ไม่ถูกส่งไปที่ใด</p>
          <button class="btn sm danger" id="clearMine" ${App.isMember() ? '' : 'disabled'}>ล้างคะแนนและความก้าวหน้าของฉัน</button>
        </div>
      </div>`;
    App.$$('[data-theme]', el).forEach((b) => b.onclick = () => { st.set('theme', b.dataset.theme); App.applySettings(); this.render(el); });
    App.$$('[data-fs]', el).forEach((b) => b.onclick = () => { st.set('fontScale', +b.dataset.fs); App.applySettings(); this.render(el); });
    App.$('#rate', el).oninput = (e) => { st.set('ttsRate', +e.target.value); App.$('#rv', el).textContent = e.target.value + 'x'; };
    App.$('#ttsTest', el).onclick = () => App.speak('สวัสดีค่ะ ยินดีต้อนรับสู่แอปศิลป์ไทย เรียนรู้ อนุรักษ์ และสืบสานศิลปวัฒนธรรมไทย');
    App.$('#clearMine', el).onclick = () => {
      if (!App.ui.confirm('ล้างคะแนน สถิติ เหรียญ รายการโปรด และแกลเลอรีของคุณ?')) return;
      ['points', 'stats', 'badges', 'favs', 'gallery', 'writingDone'].forEach((k) => App.usave(k, k === 'points' ? 0 : k === 'stats' ? {} : []));
      App.emit('points'); App.ui.toast('ล้างข้อมูลแล้ว');
    };
    const ins = App.$('#install', el);
    if (window.__installPrompt) { ins.hidden = false; ins.onclick = () => window.__installPrompt.prompt(); }
  }
});
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.__installPrompt = e; });
