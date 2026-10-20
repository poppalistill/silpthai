/* บริการที่ 16: ฝึกเขียนพยัญชนะไทยและเลขไทย — ลากเส้นตามแบบ ระบบตรวจให้คะแนนอัตโนมัติ */
(function () {
  const CONSONANTS = ('ก ไก่,ข ไข่,ฃ ขวด,ค ควาย,ฅ คน,ฆ ระฆัง,ง งู,จ จาน,ฉ ฉิ่ง,ช ช้าง,ซ โซ่,ฌ เฌอ,ญ หญิง,ฎ ชฎา,ฏ ปฏัก,ฐ ฐาน,' +
    'ฑ มณโฑ,ฒ ผู้เฒ่า,ณ เณร,ด เด็ก,ต เต่า,ถ ถุง,ท ทหาร,ธ ธง,น หนู,บ ใบไม้,ป ปลา,ผ ผึ้ง,ฝ ฝา,พ พาน,ฟ ฟัน,ภ สำเภา,' +
    'ม ม้า,ย ยักษ์,ร เรือ,ล ลิง,ว แหวน,ศ ศาลา,ษ ฤๅษี,ส เสือ,ห หีบ,ฬ จุฬา,อ อ่าง,ฮ นกฮูก').split(',')
    .map((s) => ({ ch: s[0], name: s }));
  const NUMERALS = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
    .map((n, i) => ({ ch: '๐๑๒๓๔๕๖๗๘๙'[i], name: `เลข${n} (${i})`, say: n }));
  const SIZE = 500;
  const FONT = (px) => `600 ${px}px Sarabun, 'Leelawadee UI', Tahoma, sans-serif`;

  App.register({
    id: 'writing',
    no: 16,
    title: 'ฝึกเขียนอักษรไทย',
    short: 'ฝึกเขียน',
    icon: '✍️',
    group: 'play',
    color: '#24396b',
    desc: 'ลากเส้นตามพยัญชนะ 44 ตัว และเลขไทย ๐–๙ ระบบตรวจให้คะแนน',
    render(el) {
      let set = CONSONANTS;
      let idx = 0;
      const done = () => App.udata('writingDone', []);
      el.innerHTML = App.ui.pageHead(this) + `
        <div class="board">
          <div>
            <div class="canvas-box"><canvas id="guide" width="${SIZE}" height="${SIZE}"></canvas><canvas id="pad" width="${SIZE}" height="${SIZE}"></canvas></div>
          </div>
          <div class="panel">
            <div class="chips" style="margin-bottom:10px"><button class="chip on" data-set="c">พยัญชนะ 44 ตัว</button><button class="chip" data-set="n">เลขไทย</button></div>
            <h3 id="wName" style="font-size:1.5rem"></h3>
            <div class="btn-row" style="margin-bottom:10px">
              <button class="btn sm" id="wSay">🔊 ฟังเสียง</button>
              <button class="btn sm" id="wClear">🧽 ล้าง</button>
              <button class="btn sm primary" id="wCheck">✅ ตรวจ</button>
            </div>
            <div id="wResult" class="muted" style="min-height:52px">ลากนิ้วหรือเมาส์ตามเส้นตัวอักษรสีจาง แล้วกด "ตรวจ"</div>
            <div class="btn-row" style="margin:10px 0"><button class="btn sm" id="wPrev">◀ ตัวก่อน</button><button class="btn sm gold" id="wNext">ตัวถัดไป ▶</button></div>
            <div class="letter-strip" id="strip"></div>
          </div>
        </div>`;
      const guide = App.$('#guide', el).getContext('2d');
      const padEl = App.$('#pad', el);
      const pad = padEl.getContext('2d');
      const result = App.$('#wResult', el);

      const drawGuide = () => {
        const it = set[idx];
        guide.clearRect(0, 0, SIZE, SIZE);
        guide.strokeStyle = '#ead9b4'; guide.lineWidth = 1; guide.setLineDash([6, 6]);
        [SIZE * 0.25, SIZE * 0.5, SIZE * 0.75].forEach((y) => { guide.beginPath(); guide.moveTo(0, y); guide.lineTo(SIZE, y); guide.stroke(); });
        guide.setLineDash([]);
        guide.fillStyle = 'rgba(139, 30, 30, .16)';
        guide.font = FONT(340); guide.textAlign = 'center'; guide.textBaseline = 'middle';
        guide.fillText(it.ch, SIZE / 2, SIZE * 0.52);
        pad.clearRect(0, 0, SIZE, SIZE);
        App.$('#wName', el).textContent = it.name;
        result.innerHTML = 'ลากนิ้วหรือเมาส์ตามเส้นตัวอักษรสีจาง แล้วกด "ตรวจ"';
        const d = done();
        App.$('#strip', el).innerHTML = set.map((x, i) => `<button data-i="${i}" class="${i === idx ? 'on' : ''} ${d.includes(x.ch) ? 'done' : ''}">${x.ch}</button>`).join('');
      };

      // วาดเส้น
      let drawing = false, last = null;
      const pos = (e) => { const r = padEl.getBoundingClientRect(); return [(e.clientX - r.left) * SIZE / r.width, (e.clientY - r.top) * SIZE / r.height]; };
      padEl.addEventListener('pointerdown', (e) => { drawing = true; last = pos(e); padEl.setPointerCapture(e.pointerId); e.preventDefault(); });
      padEl.addEventListener('pointermove', (e) => {
        if (!drawing) return;
        const p = pos(e);
        pad.strokeStyle = '#8b1e1e'; pad.lineWidth = 20; pad.lineCap = 'round'; pad.lineJoin = 'round';
        pad.beginPath(); pad.moveTo(last[0], last[1]); pad.lineTo(p[0], p[1]); pad.stroke();
        last = p;
      });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => padEl.addEventListener(t, () => { drawing = false; }));

      // ตรวจคะแนน: เทียบพื้นที่ที่ลากทับตัวอักษร (coverage) และความแม่นยำ (precision)
      const mask = (extra) => {
        const c = document.createElement('canvas'); c.width = c.height = SIZE;
        const g = c.getContext('2d');
        g.font = FONT(340); g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillStyle = g.strokeStyle = '#000';
        g.fillText(set[idx].ch, SIZE / 2, SIZE * 0.52);
        if (extra) { g.lineWidth = extra; g.lineJoin = 'round'; g.strokeText(set[idx].ch, SIZE / 2, SIZE * 0.52); }
        return g.getImageData(0, 0, SIZE, SIZE).data;
      };
      App.$('#wCheck', el).onclick = () => {
        const letter = mask(0), tol = mask(26), ink = pad.getImageData(0, 0, SIZE, SIZE).data;
        let L = 0, I = 0, cover = 0, inside = 0;
        for (let i = 3; i < ink.length; i += 16) {
          const l = letter[i] > 0, k = ink[i] > 0;
          if (l) L++;
          if (k) { I++; if (tol[i] > 0) inside++; }
          if (l && k) cover++;
        }
        if (I < 30) { result.innerHTML = '✏️ ยังไม่ได้เขียน ลองลากเส้นตามตัวอักษรก่อนนะ'; return; }
        const c = cover / L, p = inside / I;
        const score = Math.round(100 * (2 * c * p) / (c + p || 1));
        const stars = score >= 80 ? '⭐⭐⭐' : score >= 60 ? '⭐⭐' : score >= 40 ? '⭐' : '';
        result.innerHTML = `<b style="font-size:1.4rem">${score} คะแนน</b> ${stars}<br>` +
          (score >= 60 ? '🎉 เยี่ยมมาก! เขียนได้สวยงาม' : 'ลองอีกครั้ง พยายามลากให้ทับเส้นสีจาง');
        if (score >= 60 && App.isMember() && !done().includes(set[idx].ch)) {
          App.usave('writingDone', done().concat(set[idx].ch));
          App.bump('writing');
          App.addPoints(3, 'ฝึกเขียน ' + set[idx].ch);
          App.$(`#strip button[data-i="${idx}"]`, el).classList.add('done');
        }
      };
      App.$('#wClear', el).onclick = () => pad.clearRect(0, 0, SIZE, SIZE);
      App.$('#wSay', el).onclick = () => App.speak(set[idx].say || set[idx].name);
      App.$('#wNext', el).onclick = () => { idx = (idx + 1) % set.length; drawGuide(); };
      App.$('#wPrev', el).onclick = () => { idx = (idx - 1 + set.length) % set.length; drawGuide(); };
      App.$('#strip', el).addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { idx = +b.dataset.i; drawGuide(); } });
      App.$$('[data-set]', el).forEach((b) => b.onclick = () => {
        App.$$('[data-set]', el).forEach((x) => x.classList.toggle('on', x === b));
        set = b.dataset.set === 'n' ? NUMERALS : CONSONANTS; idx = 0; drawGuide();
      });
      drawGuide();
      if (document.fonts) document.fonts.load(FONT(340), 'ก').then(drawGuide).catch(() => {});
    }
  });
})();
