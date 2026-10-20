/* บริการที่ 18: แบบทดสอบความรู้ — สุ่ม 10 ข้อ จับเวลา บันทึกคะแนน และตารางอันดับ
 * ครู/ผู้ดูแลระบบ ดูผลคะแนนของผู้เรียนทุกคนได้
 * เพิ่มข้อสอบ: [คำถาม, [ตัวเลือก...], indexคำตอบที่ถูก (เริ่มที่ 0), คำอธิบาย] */
(function () {
  const BANK = [
    ['ยูเนสโกขึ้นทะเบียน "โขน" เป็นมรดกทางวัฒนธรรมที่จับต้องไม่ได้ในปี พ.ศ. ใด', ['2559', '2561', '2564', '2566'], 1, 'โขนในประเทศไทยได้รับการขึ้นทะเบียนเมื่อ พ.ศ. 2561'],
    ['ระนาดเอกมีลูกระนาดกี่ลูก', ['16 ลูก', '18 ลูก', '21 ลูก', '24 ลูก'], 2, 'ระนาดเอกมาตรฐานมี 21 ลูก'],
    ['เครื่องดนตรีใดเป็นประเภท "เครื่องดีด"', ['ซออู้', 'จะเข้', 'ขลุ่ย', 'ฉิ่ง'], 1, 'จะเข้เป็นเครื่องดีด มี 3 สาย'],
    ['ชุดไทยพระราชนิยมมีทั้งหมดกี่แบบ', ['5 แบบ', '6 แบบ', '8 แบบ', '10 แบบ'], 2, 'มี 8 แบบ เช่น เรือนต้น จิตรลดา จักรี'],
    ['ประเพณีผีตาโขนจัดขึ้นที่จังหวัดใด', ['เลย', 'ยโสธร', 'นครพนม', 'อุบลราชธานี'], 0, 'ผีตาโขนอยู่ในงานบุญหลวง อ.ด่านซ้าย จ.เลย'],
    ['ผู้แต่งเรื่อง "พระอภัยมณี" คือใคร', ['รัชกาลที่ 2', 'เจ้าพระยาพระคลัง (หน)', 'สุนทรภู่', 'ศรีปราชญ์'], 2, 'สุนทรภู่ กวีเอกแห่งกรุงรัตนโกสินทร์'],
    ['การไหว้พระ นิ้วหัวแม่มือควรจรดที่ใด', ['ปลายคาง', 'ปลายจมูก', 'ระหว่างคิ้ว', 'หน้าอก'], 2, 'ไหว้พระ นิ้วหัวแม่มือจรดระหว่างคิ้ว'],
    ['การกราบเบญจางคประดิษฐ์ ใช้อวัยวะจรดพื้นกี่ส่วน', ['3 ส่วน', '4 ส่วน', '5 ส่วน', '6 ส่วน'], 2, 'หน้าผาก ฝ่ามือ 2 และเข่า 2 รวม 5 ส่วน'],
    ['"ข้าวซอย" เป็นอาหารขึ้นชื่อของภาคใด', ['ภาคเหนือ', 'ภาคอีสาน', 'ภาคกลาง', 'ภาคใต้'], 0, 'ข้าวซอยขึ้นชื่อของเชียงใหม่ ภาคเหนือ'],
    ['สำนวน "ปิดทองหลังพระ" หมายถึงอะไร', ['ทำงานไม่เสร็จ', 'ทำดีโดยไม่หวังให้ใครเห็น', 'ทำบุญที่วัด', 'อวดความร่ำรวย'], 1, 'ทำความดีโดยไม่หวังคำยกย่อง'],
    ['"ฟ้อนเล็บ" เป็นการแสดงของภาคใด', ['ภาคใต้', 'ภาคอีสาน', 'ภาคเหนือ', 'ภาคกลาง'], 2, 'ฟ้อนเล็บเป็นการฟ้อนของล้านนา'],
    ['"โนรา" เป็นศิลปะการแสดงของภาคใด', ['ภาคเหนือ', 'ภาคใต้', 'ภาคอีสาน', 'ภาคตะวันออก'], 1, 'โนราเป็นการแสดงของภาคใต้ ยูเนสโกขึ้นทะเบียน พ.ศ. 2564'],
    ['วันลอยกระทงตรงกับวันใด', ['ขึ้น 15 ค่ำ เดือน 12', 'แรม 15 ค่ำ เดือน 10', 'ขึ้น 15 ค่ำ เดือน 3', '13 เมษายน'], 0, 'คืนวันเพ็ญเดือนสิบสอง'],
    ['เครื่องปั้นดินเผาด่านเกวียนอยู่ที่จังหวัดใด', ['นนทบุรี', 'นครราชสีมา', 'ลำปาง', 'ราชบุรี'], 1, 'ต.ด่านเกวียน อ.โชคชัย จ.นครราชสีมา'],
    ['วรรณคดีเรื่องใดได้รับยกย่องว่าเป็น "ยอดของกลอนบทละครรำ"', ['รามเกียรติ์', 'อิเหนา', 'ขุนช้างขุนแผน', 'สามก๊ก'], 1, 'อิเหนา พระราชนิพนธ์ในรัชกาลที่ 2'],
    ['พระปรางค์ที่มีชื่อเสียงริมแม่น้ำเจ้าพระยาอยู่ที่วัดใด', ['วัดอรุณราชวราราม', 'วัดสุทัศน์', 'วัดเบญจมบพิตร', 'วัดสระเกศ'], 0, 'พระปรางค์วัดอรุณฯ ได้รับอิทธิพลจากปราสาทขอม'],
    ['กะโหลกของ "ซออู้" ทำจากวัสดุใด', ['ไม้ไผ่', 'งาช้าง', 'กะลามะพร้าว', 'ทองเหลือง'], 2, 'ซออู้ใช้กะลามะพร้าวทำกะโหลก ให้เสียงทุ้ม'],
    ['แห่เทียนพรรษาที่มีชื่อเสียงที่สุดอยู่ที่จังหวัดใด', ['อุบลราชธานี', 'ขอนแก่น', 'เชียงใหม่', 'สุโขทัย'], 0, 'จ.อุบลราชธานี มีต้นเทียนแกะสลักงดงาม'],
    ['ข้อความ "ในน้ำมีปลา ในนามีข้าว" มาจากหลักฐานสมัยใด', ['อยุธยา', 'ธนบุรี', 'สุโขทัย', 'รัตนโกสินทร์'], 2, 'ศิลาจารึกพ่อขุนรามคำแหง สมัยสุโขทัย'],
    ['เลขไทย "๗" คือเลขใด', ['3', '5', '7', '9'], 2, '๗ = เจ็ด'],
    ['ขนมไทยใดได้รับอิทธิพลจากโปรตุเกสผ่านท้าวทองกีบม้า', ['ขนมชั้น', 'ฝอยทอง', 'ขนมครก', 'ข้าวต้มมัด'], 1, 'ขนมตระกูลทอง เช่น ทองหยิบ ทองหยอด ฝอยทอง'],
    ['ยูเนสโกขึ้นทะเบียน "สงกรานต์ในประเทศไทย" ในปี พ.ศ. ใด', ['2562', '2564', '2566', '2567'], 2, 'ขึ้นทะเบียนเมื่อ พ.ศ. 2566'],
    ['"หรอย" ในภาษาใต้ แปลว่าอะไร', ['สวย', 'อร่อย', 'เหนื่อย', 'ร้อน'], 1, 'หรอย = อร่อย'],
    ['ร่มบ่อสร้างเป็นหัตถกรรมของจังหวัดใด', ['เชียงราย', 'ลำพูน', 'เชียงใหม่', 'น่าน'], 2, 'บ้านบ่อสร้าง อ.สันกำแพง จ.เชียงใหม่'],
    ['ส่วนใดของหลังคาโบสถ์อยู่ปลายยอดจั่วด้านบน', ['หางหงส์', 'ใบระกา', 'ช่อฟ้า', 'หน้าบัน'], 2, 'ช่อฟ้าอยู่ปลายยอดจั่วด้านบน']
  ];
  const N = 10, SEC = 20;
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  App.register({
    id: 'quiz',
    no: 18,
    title: 'แบบทดสอบความรู้',
    short: 'แบบทดสอบ',
    icon: '🏆',
    group: 'play',
    color: '#c99a2e',
    desc: `สุ่ม ${N} ข้อ ข้อละ ${SEC} วินาที สะสมคะแนนและติดอันดับ`,
    results() { return App.store.get('quizResults', []); },
    render(el) {
      const m = this;
      let timer = null;
      const stop = () => clearInterval(timer);
      m.cleanup = stop;

      const home = () => {
        stop();
        const res = m.results();
        const best = {};
        res.forEach((r) => { if (!best[r.userId] || r.score > best[r.userId].score) best[r.userId] = r; });
        const board = Object.values(best).sort((a, b) => b.score - a.score || a.time - b.time).slice(0, 10);
        const staff = App.isStaff();
        el.innerHTML = App.ui.pageHead(m) + `
          <div class="grid cols-2">
            <div class="panel">
              <h3>📝 พร้อมทดสอบหรือยัง?</h3>
              <p>คลังข้อสอบ ${BANK.length} ข้อ ครอบคลุมนาฏศิลป์ ดนตรี ประเพณี อาหาร วรรณคดี และมารยาทไทย</p>
              <ul class="muted"><li>สุ่ม ${N} ข้อ ข้อละ ${SEC} วินาที</li><li>ตอบถูกได้ 1 คะแนน + เฉลยทันที</li><li>สมาชิกได้รับคะแนนสะสม ข้อละ 2 คะแนน</li></ul>
              ${App.isMember() ? '' : '<p class="muted">⚠️ ผู้เยี่ยมชมทำได้ แต่ระบบจะไม่บันทึกคะแนน</p>'}
              <button class="btn primary" id="qStart">▶️ เริ่มทำแบบทดสอบ</button>
            </div>
            <div class="panel">
              <h3>🥇 ตารางอันดับ (ในเครื่องนี้)</h3>
              ${board.length ? `<table class="tbl"><tr><th>#</th><th>ชื่อ</th><th>คะแนน</th></tr>
                ${board.map((r, i) => `<tr><td>${['🥇', '🥈', '🥉'][i] || i + 1}</td><td>${App.esc(r.name)}</td><td>${r.score}/${N}</td></tr>`).join('')}</table>`
                : '<p class="muted">ยังไม่มีผู้ทำแบบทดสอบ</p>'}
            </div>
          </div>
          ${staff ? `<div class="panel"><h3>🧑‍🏫 ผลคะแนนทั้งหมด (สำหรับครู/ผู้ดูแล)</h3>
            ${res.length ? `<div class="tbl-wrap"><table class="tbl"><tr><th>วันที่</th><th>ชื่อ</th><th>บทบาท</th><th>คะแนน</th><th>เวลา (วินาที)</th></tr>
            ${res.slice().reverse().map((r) => `<tr><td>${new Date(r.date).toLocaleString('th-TH')}</td><td>${App.esc(r.name)}</td><td>${App.ROLES[r.role] ? App.ROLES[r.role].label : r.role}</td><td>${r.score}/${N}</td><td>${r.time}</td></tr>`).join('')}
            </table></div><div class="btn-row" style="margin-top:10px"><button class="btn sm" id="qCsv">⬇️ ดาวน์โหลด CSV</button></div>` : '<p class="muted">ยังไม่มีข้อมูล</p>'}</div>` : ''}`;
        App.$('#qStart', el).onclick = start;
        const csv = App.$('#qCsv', el);
        if (csv) csv.onclick = () => {
          const rows = [['date', 'name', 'role', 'score', 'seconds']].concat(res.map((r) => [r.date, r.name, r.role, r.score, r.time]));
          const blob = new Blob(['﻿' + rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' });
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'quiz-results.csv'; a.click();
        };
      };

      const start = () => {
        const qs = shuffle(BANK).slice(0, N).map((q) => {
          const order = shuffle(q[1].map((_, i) => i));
          return { q: q[0], opts: order.map((i) => q[1][i]), ans: order.indexOf(q[2]), why: q[3] };
        });
        let i = 0, score = 0;
        const t0 = Date.now();
        const show = () => {
          stop();
          const q = qs[i];
          let left = SEC;
          el.innerHTML = App.ui.pageHead(m) + `<div class="panel">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><b>ข้อ ${i + 1} / ${N}</b>
              <span>คะแนน <span class="badge-num">${score}</span> · ⏱️ <b id="qLeft">${left}</b> วิ</span></div>
            <div class="progress" style="margin:10px 0"><i style="width:${(i / N) * 100}%"></i></div>
            <p class="quiz-q">${q.q}</p>
            <div class="quiz-opts">${q.opts.map((o, k) => `<button class="quiz-opt" data-k="${k}">${'กขคง'[k]}. ${o}</button>`).join('')}</div>
            <div id="qWhy" style="margin-top:12px"></div></div>`;
          const answer = (k) => {
            stop();
            App.$$('.quiz-opt', el).forEach((b) => {
              b.disabled = true;
              if (+b.dataset.k === q.ans) b.classList.add('right');
              else if (+b.dataset.k === k) b.classList.add('wrong');
            });
            const ok = k === q.ans;
            if (ok) score++;
            App.$('#qWhy', el).innerHTML = `<p>${ok ? '✅ ถูกต้อง!' : k < 0 ? '⌛ หมดเวลา' : '❌ ยังไม่ถูก'} — ${q.why}</p>
              <button class="btn primary" id="qNext">${i + 1 < N ? 'ข้อต่อไป ▶' : 'ดูผลคะแนน 🏁'}</button>`;
            App.$('#qNext', el).onclick = () => { i++; i < N ? show() : finish(); };
          };
          App.$('.quiz-opts', el).addEventListener('click', (e) => { const b = e.target.closest('.quiz-opt'); if (b && !b.disabled) answer(+b.dataset.k); });
          timer = setInterval(() => { left--; const l = App.$('#qLeft', el); if (l) l.textContent = left; if (left <= 0) answer(-1); }, 1000);
        };
        const finish = () => {
          const time = Math.round((Date.now() - t0) / 1000);
          const u = App.user();
          if (u) {
            const res = m.results(); res.push({ userId: u.id, name: u.name, role: u.role, score, time, date: new Date().toISOString() });
            App.store.set('quizResults', res.slice(-500));
            if (score > (App.stats().quizBest || 0)) App.setStat('quizBest', score);
            if (score) App.addPoints(score * 2, 'แบบทดสอบ');
          }
          const msg = score >= 9 ? 'ยอดเยี่ยม! คุณคือปราชญ์ศิลป์ไทย 🏆' : score >= 7 ? 'เก่งมาก! 🎉' : score >= 5 ? 'ดีแล้ว ลองอ่านเพิ่มอีกนิด 📚' : 'ไม่เป็นไร ลองเรียนรู้แล้วกลับมาใหม่ 💪';
          el.innerHTML = App.ui.pageHead(m) + `<div class="panel" style="text-align:center">
            <div style="font-size:4rem">${score >= 7 ? '🏆' : score >= 5 ? '🎖️' : '📚'}</div>
            <h2>ได้ ${score} / ${N} คะแนน</h2><p>${msg}</p><p class="muted">ใช้เวลา ${time} วินาที</p>
            <div class="btn-row" style="justify-content:center"><button class="btn primary" id="qAgain">🔁 ทำอีกครั้ง</button><button class="btn" id="qHome">📊 ดูตารางอันดับ</button></div></div>`;
          App.$('#qAgain', el).onclick = start;
          App.$('#qHome', el).onclick = home;
        };
        show();
      };
      home();
    }
  });
})();
