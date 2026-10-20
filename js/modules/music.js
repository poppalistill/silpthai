/* บริการที่ 7: ดนตรีไทย — เครื่องดนตรี ดีด สี ตี เป่า + ระนาดเอกเสมือนจริง (Web Audio)
 * เสียงระนาดสังเคราะห์ด้วยระบบเสียงไทย 7 เสียงเต็ม (แบ่งช่วงทบเสียงเท่ากัน 7 ส่วน) */
(function () {
  const NOTE_NAMES = ['ด', 'ร', 'ม', 'ฟ', 'ซ', 'ล', 'ท'];
  const KEYS = 'zxcvbnmasdfghjqwertyu';
  const BASE = 196; // ความถี่ลูกต่ำสุด (Hz)
  let ctx = null;

  function audio() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, gainVal, type, t0) {
    const a = audio();
    const t = t0 || a.currentTime;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gainVal, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function strike(i) {
    const f = BASE * Math.pow(2, i / 7);
    tone(f, 1.1, 0.5, 'sine');
    tone(f * 3.95, 0.18, 0.12, 'sine');
    tone(f * 2, 0.4, 0.08, 'triangle');
  }
  function ching(closed) {
    if (closed) { tone(2600, 0.07, 0.25, 'square'); tone(3900, 0.05, 0.1, 'square'); }
    else { tone(2217, 1.6, 0.18, 'sine'); tone(3326, 1.2, 0.1, 'sine'); tone(5120, 0.6, 0.05, 'sine'); }
  }

  const ranatHTML = `
    <div class="panel">
      <h3>🎹 ระนาดเอกเสมือนจริง (21 ลูก)</h3>
      <p class="muted">คลิก/แตะที่ลูกระนาด หรือกดแป้นพิมพ์ <kbd>Z–M</kbd> (เสียงต่ำ) <kbd>A–J</kbd> (กลาง) <kbd>Q–U</kbd> (สูง) — ใช้ระบบเสียงดนตรีไทย 7 เสียงเต็ม</p>
      <div class="ranat-wrap"><div class="ranat">
        ${Array.from({ length: 21 }, (_, i) => `<button class="bar" data-i="${i}" style="height:${172 - i * 3}px">
          ${NOTE_NAMES[i % 7]}<kbd>${KEYS[i].toUpperCase()}</kbd></button>`).join('')}
      </div></div>
      <div class="btn-row" style="margin-top:12px">
        <button class="btn gold" id="runScale">▶️ ไล่เสียงขึ้น-ลง</button>
        <button class="btn" id="chingOpen">🔔 ฉิ่ง</button>
        <button class="btn" id="chingClosed">🔕 ฉับ</button>
        <span class="muted" id="noteCount" style="align-self:center"></span>
      </div>
    </div>
    <h2 style="margin:22px 0 10px">เครื่องดนตรีไทย</h2>`;

  App.register({
    id: 'music',
    no: 7,
    title: 'ดนตรีไทย',
    icon: '🎶',
    group: 'learn',
    color: '#6b4226',
    desc: 'เรียนรู้เครื่องดนตรี ดีด สี ตี เป่า และลองบรรเลงระนาดเอก',
    items: [
      { id: 'ranat-ek', cat: 'เครื่องตี', emoji: '🎹', title: 'ระนาดเอก', sub: 'ผู้นำวงปี่พาทย์', tags: ['ระนาด', 'ปี่พาทย์'],
        body: `<p>ระนาดเอกเป็นเครื่องตีที่ทำหน้าที่ <b>นำวง</b> ในวงปี่พาทย์ ประกอบด้วยลูกระนาด <b>21 ลูก</b> ร้อยเชือกแขวนบนรางรูปเรือ
        ลูกระนาดทำจากไม้ไผ่บงหรือไม้เนื้อแข็ง เช่น ไม้ชิงชัน ไม้พะยูง ใช้ไม้ตี 2 อัน</p>
        <p>ไม้ตีมี 2 ชนิด คือ <b>ไม้แข็ง</b> ให้เสียงดังกร้าว และ <b>ไม้นวม</b> ให้เสียงนุ่มนวล</p>` },
      { id: 'khong-wong', cat: 'เครื่องตี', emoji: '🥁', title: 'ฆ้องวงใหญ่', sub: 'หลักของวงปี่พาทย์', tags: ['ฆ้อง'],
        body: `<p>ฆ้องวงใหญ่ประกอบด้วยลูกฆ้อง <b>16 ลูก</b> แขวนบนร้านไม้หวายรูปวงกลม ผู้บรรเลงนั่งตรงกลาง
        ทำหน้าที่บรรเลง <b>ทำนองหลัก</b> ของเพลง เป็นหลักให้เครื่องดนตรีอื่นแปรทำนองตาม</p>` },
      { id: 'ching', cat: 'เครื่องตี', emoji: '🔔', title: 'ฉิ่ง', sub: 'ผู้คุมจังหวะของวง', tags: ['จังหวะ'],
        body: `<p>ฉิ่งเป็นเครื่องตีขนาดเล็ก ทำจากโลหะ 2 ฝาร้อยเชือกถึงกัน ตีกระทบให้เกิดเสียง <b>"ฉิ่ง"</b> (เปิด) และ <b>"ฉับ"</b> (ปิด)
        ทำหน้าที่ <b>คุมจังหวะ</b> ให้ทั้งวง ถือเป็นเครื่องดนตรีสำคัญที่ใช้ในเกือบทุกวง</p>` },
      { id: 'jakhe', cat: 'เครื่องดีด', emoji: '🐊', title: 'จะเข้', sub: 'เครื่องดีดรูปร่างคล้ายจระเข้', tags: ['เครื่องสาย'],
        body: `<p>จะเข้เป็นเครื่องดีดที่วางราบกับพื้น ลำตัวคล้ายจระเข้ จึงได้ชื่อว่า "จะเข้" มี <b>3 สาย</b>
        ดีดด้วยไม้ดีดที่พันติดกับนิ้วชี้ ใช้บรรเลงในวงเครื่องสายและวงมโหรี</p>` },
      { id: 'saw-duang', cat: 'เครื่องสี', emoji: '🎻', title: 'ซอด้วง', sub: 'ซอเสียงแหลม', tags: ['ซอ'],
        body: `<p>ซอด้วงมี 2 สาย กระบอกเสียงทำจากไม้หรืองาช้าง ขึงหน้าด้วยหนังงู ให้เสียง <b>แหลม ดังกังวาน</b>
        ทำหน้าที่ <b>ผู้นำวง</b> ในวงเครื่องสาย</p>` },
      { id: 'saw-u', cat: 'เครื่องสี', emoji: '🥥', title: 'ซออู้', sub: 'ซอเสียงทุ้มนุ่ม', tags: ['ซอ', 'มะพร้าว'],
        body: `<p>ซออู้มี 2 สาย กะโหลกทำจาก <b>กะลามะพร้าว</b> ขึงหน้าด้วยหนังวัว ให้เสียง <b>ทุ้ม นุ่มนวล</b>
        มักบรรเลงหยอกล้อกับซอด้วงในวงเครื่องสาย</p>` },
      { id: 'saw-sam-sai', cat: 'เครื่องสี', emoji: '🪕', title: 'ซอสามสาย', sub: 'ซอชั้นสูงของราชสำนัก', tags: ['ซอ'],
        body: `<p>ซอสามสายเป็นซอที่งดงามที่สุดของไทย ใช้กะลามะพร้าวพันธุ์พิเศษที่มี "สามปุ่ม" ทำเป็นกะโหลก
        มีเสียงไพเราะนุ่มนวล ใช้บรรเลงในวงมโหรีและพระราชพิธี</p>` },
      { id: 'khlui', cat: 'เครื่องเป่า', emoji: '🎋', title: 'ขลุ่ย', sub: 'เครื่องเป่าไม้ไผ่', tags: ['ขลุ่ยเพียงออ'],
        body: `<p>ขลุ่ยทำจากไม้ไผ่ มีรูนิ้ว 7 รู มีหลายขนาด ได้แก่ <b>ขลุ่ยหลีบ</b> (เล็ก เสียงสูง) <b>ขลุ่ยเพียงออ</b> (กลาง) และ <b>ขลุ่ยอู้</b> (ใหญ่ เสียงต่ำ)
        ให้เสียงหวานไพเราะ</p>` },
      { id: 'pi-nai', cat: 'เครื่องเป่า', emoji: '🎺', title: 'ปี่ใน', sub: 'เครื่องเป่าในวงปี่พาทย์', tags: ['ปี่'],
        body: `<p>ปี่ในทำจากไม้เนื้อแข็ง มีรูนิ้ว 6 รู ใช้ลิ้นปี่ทำจากใบตาล ผู้เป่าใช้เทคนิค <b>"ระบายลม"</b>
        ให้เป่าได้ต่อเนื่อง ไม่ขาดเสียง</p>` },
      { id: 'khaen', cat: 'เครื่องเป่า', emoji: '🎍', title: 'แคน', sub: 'หัวใจดนตรีอีสาน', tags: ['อีสาน', 'หมอลำ'],
        body: `<p>แคนทำจาก <b>ไม้ไผ่ซาง (ไม้กู่แคน)</b> หลายลำมัดเรียงเป็นแพ เจาะรูใส่ลิ้นโลหะ เป่าได้ทั้งลมเข้าและลมออก
        ใช้ประกอบหมอลำและการแสดงพื้นบ้านอีสาน</p>` },
      { id: 'phin', cat: 'เครื่องดีด', emoji: '🎸', title: 'พิณและซึง', sub: 'เครื่องดีดพื้นบ้าน', tags: ['อีสาน', 'เหนือ'],
        body: `<p><b>พิณ</b> เป็นเครื่องดีดของภาคอีสาน มีจังหวะสนุกสนาน ส่วน <b>ซึง</b> เป็นเครื่องดีดของภาคเหนือ
        มักบรรเลงร่วมกับสะล้อและขลุ่ยในวง "สะล้อ ซอ ซึง"</p>` },
      { id: 'bands', cat: 'วงดนตรี', emoji: '🎼', title: 'วงดนตรีไทย 3 ประเภท', sub: 'ปี่พาทย์ เครื่องสาย มโหรี', tags: ['วงดนตรี'],
        body: `<ul><li><b>วงปี่พาทย์</b> — เครื่องตีและเครื่องเป่าเป็นหลัก ใช้ในงานพิธี โขน ละคร</li>
        <li><b>วงเครื่องสาย</b> — เครื่องสีและเครื่องดีดเป็นหลัก เสียงนุ่มนวล บรรเลงในบ้านเรือน</li>
        <li><b>วงมโหรี</b> — รวมเครื่องดีด สี ตี เป่า ใช้บรรเลงขับกล่อม</li></ul>` }
    ],
    render(el, param) {
      App.ui.listPage(this, el, param, { before: ranatHTML });
      let played = 0;
      const counter = App.$('#noteCount', el);
      const hit = (i) => {
        strike(i);
        const b = App.$(`.bar[data-i="${i}"]`, el);
        if (b) { b.classList.add('hit'); setTimeout(() => b.classList.remove('hit'), 120); }
        played++;
        counter.textContent = `บรรเลงแล้ว ${played} โน้ต`;
        if (played % 10 === 0) App.bump('notes', 10);
        if (played === 30) App.addPoints(5, 'นักดนตรีฝึกหัด');
      };
      App.$('.ranat', el).addEventListener('pointerdown', (e) => {
        const b = e.target.closest('.bar'); if (b) { e.preventDefault(); hit(+b.dataset.i); }
      });
      this._key = (e) => {
        if (e.target.matches('input, textarea') || e.repeat || e.ctrlKey || e.metaKey) return;
        const i = KEYS.indexOf(e.key.toLowerCase());
        if (i >= 0) hit(i);
      };
      document.addEventListener('keydown', this._key);
      App.$('#runScale', el).onclick = () => {
        const seq = [...Array(21).keys(), ...Array.from({ length: 20 }, (_, i) => 19 - i)];
        seq.forEach((n, k) => setTimeout(() => hit(n), k * 110));
      };
      App.$('#chingOpen', el).onclick = () => ching(false);
      App.$('#chingClosed', el).onclick = () => ching(true);
    },
    cleanup() { if (this._key) document.removeEventListener('keydown', this._key); }
  });
})();
