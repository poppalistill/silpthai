/* บริการที่ 17: ระบายสีลายไทย — เลือกแม่ลาย คลิกพื้นที่เพื่อเทสี บันทึกเป็นรูปภาพ PNG */
(function () {
  const P = (d, rot) => `<path class="fill" d="${d}" transform="rotate(${rot} 200 200)"/>`;
  const DESIGNS = {
    prajamyam: {
      name: 'ลายประจำยาม', view: '0 0 400 400',
      svg: () => `<rect class="fill" x="0" y="0" width="400" height="400"/>
        <rect class="fill" x="14" y="14" width="372" height="372"/>
        ${[[14, 14, 'h70 a70,70 0 0 1 -70,70z'], [386, 14, 'v70 a70,70 0 0 1 -70,-70z'], [386, 386, 'h-70 a70,70 0 0 1 70,-70z'], [14, 386, 'v-70 a70,70 0 0 1 70,70z']]
          .map(([x, y, d]) => `<path class="fill" d="M${x},${y} ${d}"/>`).join('')}
        <polygon class="fill" points="200,28 372,200 200,372 28,200"/>
        ${[45, 135, 225, 315].map((r) => P('M200,200 C182,178 182,136 200,108 C218,136 218,178 200,200Z', r)).join('')}
        ${[0, 90, 180, 270].map((r) => P('M200,200 C160,160 165,92 200,44 C235,92 240,160 200,200Z', r)).join('')}
        ${[0, 90, 180, 270].map((r) => P('M200,170 C190,150 190,120 200,100 C210,120 210,150 200,170Z', r)).join('')}
        <circle class="fill" cx="200" cy="200" r="40"/><circle class="fill" cx="200" cy="200" r="20"/>`
    },
    pikul: {
      name: 'ลายดอกพิกุล', view: '0 0 400 400',
      svg: () => `<rect class="fill" x="0" y="0" width="400" height="400"/>
        <circle class="fill" cx="200" cy="200" r="190"/><circle class="fill" cx="200" cy="200" r="172"/>
        ${Array.from({ length: 8 }, (_, i) => P('M200,200 C150,160 165,46 200,34 C235,46 250,160 200,200Z', i * 45)).join('')}
        ${Array.from({ length: 8 }, (_, i) => P('M200,200 C182,172 184,112 200,92 C216,112 218,172 200,200Z', i * 45 + 22.5)).join('')}
        ${Array.from({ length: 8 }, (_, i) => `<circle class="fill" cx="200" cy="58" r="9" transform="rotate(${i * 45 + 22.5} 200 200)"/>`).join('')}
        <circle class="fill" cx="200" cy="200" r="30"/><circle class="fill" cx="200" cy="200" r="14"/>`
    },
    krajang: {
      name: 'ลายกระจังตาอ้อย', view: '0 0 500 260',
      svg: () => `<rect class="fill" x="0" y="0" width="500" height="260"/>
        <rect class="fill" x="0" y="0" width="500" height="34"/><rect class="fill" x="0" y="222" width="500" height="38"/>
        ${Array.from({ length: 10 }, (_, i) => `<circle class="fill" cx="${25 + i * 50}" cy="17" r="9"/>`).join('')}
        ${Array.from({ length: 5 }, (_, i) => {
          const c = 50 + i * 100;
          return `<path class="fill" d="M${c - 46},222 C${c - 52},150 ${c - 28},108 ${c},44 C${c + 28},108 ${c + 52},150 ${c + 46},222Z"/>
            <path class="fill" d="M${c - 28},214 C${c - 30},166 ${c - 16},134 ${c},92 C${c + 16},134 ${c + 30},166 ${c + 28},214Z"/>
            <circle class="fill" cx="${c}" cy="186" r="11"/>`;
        }).join('')}
        ${Array.from({ length: 4 }, (_, i) => { const x = 100 + i * 100; return `<path class="fill" d="M${x - 10},222 L${x},170 L${x + 10},222Z"/>`; }).join('')}`
    }
  };
  const PALETTE = [
    ['#b8312f', 'แดงชาด'], ['#e46a6a', 'ชมพู'], ['#e98a2a', 'ส้ม'], ['#f2c12e', 'เหลืองรง'],
    ['#c99a2e', 'ทอง'], ['#2e7d4f', 'เขียวตั้งแช'], ['#7bb662', 'เขียวอ่อน'], ['#5aa9d6', 'ฟ้า'],
    ['#24396b', 'คราม'], ['#7b3fa0', 'ม่วง'], ['#6b4226', 'น้ำตาล'], ['#1f1a17', 'ดำ'],
    ['#ffffff', 'ขาว'], ['#f4e3c1', 'งาช้าง'], ['#9e9e9e', 'เทา'], ['#f7c6d0', 'ชมพูอ่อน']
  ];

  App.register({
    id: 'coloring',
    no: 17,
    title: 'ระบายสีลายไทย',
    short: 'ระบายสี',
    icon: '🎨',
    group: 'play',
    color: '#c26a12',
    desc: 'เลือกแม่ลายไทย แตะเพื่อระบายสี แล้วบันทึกเป็นภาพ',
    render(el) {
      let key = 'prajamyam';
      let color = PALETTE[0][0];
      el.innerHTML = App.ui.pageHead(this) + `
        <div class="board">
          <div><div class="svg-box" id="svgBox"></div></div>
          <div class="panel">
            <h3>เลือกแม่ลาย</h3>
            <div class="chips" style="margin-bottom:14px">${Object.entries(DESIGNS).map(([k, d]) => `<button class="chip ${k === key ? 'on' : ''}" data-d="${k}">${d.name}</button>`).join('')}</div>
            <h3>จานสีไทย</h3>
            <div class="palette">${PALETTE.map(([c, n], i) => `<button class="swatch ${i === 0 ? 'on' : ''} ${['#ffffff', '#f4e3c1', '#f7c6d0'].includes(c) ? 'light' : ''}" data-c="${c}" style="background:${c}" title="${n}">${n}</button>`).join('')}</div>
            <div class="btn-row" style="margin-top:14px">
              <button class="btn sm" id="cRandom">🎲 สุ่มสี</button>
              <button class="btn sm" id="cReset">🧽 เริ่มใหม่</button>
              <button class="btn sm primary" id="cSave">💾 บันทึกภาพ</button>
            </div>
            <h3 style="margin-top:16px">🖼️ แกลเลอรีของฉัน</h3>
            <div class="gallery" id="gallery"></div>
          </div>
        </div>`;
      const box = App.$('#svgBox', el);
      const draw = () => {
        const d = DESIGNS[key];
        box.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${d.view}" stroke="#5a3412" stroke-width="2.2" fill="#ffffff">${d.svg()}</svg>`;
      };
      const drawGallery = () => {
        const g = App.udata('gallery', []);
        App.$('#gallery', el).innerHTML = !App.isMember() ? '<p class="muted" style="font-size:.85rem">เข้าสู่ระบบเพื่อเก็บผลงานในแกลเลอรี</p>'
          : g.length ? g.map((src) => `<img src="${src}" alt="ผลงานระบายสี">`).join('') : '<p class="muted" style="font-size:.85rem">ยังไม่มีผลงาน</p>';
      };
      box.addEventListener('click', (e) => { if (e.target.classList.contains('fill')) e.target.setAttribute('fill', color); });
      App.$('.palette', el).addEventListener('click', (e) => {
        const s = e.target.closest('.swatch'); if (!s) return;
        App.$$('.swatch', el).forEach((x) => x.classList.toggle('on', x === s)); color = s.dataset.c;
      });
      App.$$('[data-d]', el).forEach((b) => b.onclick = () => {
        App.$$('[data-d]', el).forEach((x) => x.classList.toggle('on', x === b)); key = b.dataset.d; draw();
      });
      App.$('#cReset', el).onclick = draw;
      App.$('#cRandom', el).onclick = () => App.$$('.fill', box).forEach((f) => f.setAttribute('fill', PALETTE[Math.floor(Math.random() * 12)][0]));
      App.$('#cSave', el).onclick = () => {
        const svg = App.$('svg', box);
        const [, , w, h] = DESIGNS[key].view.split(' ').map(Number);
        const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
        const img = new Image();
        img.onload = () => {
          const scale = 2;
          const c = document.createElement('canvas'); c.width = w * scale; c.height = h * scale;
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          URL.revokeObjectURL(url);
          const a = document.createElement('a');
          a.href = c.toDataURL('image/png');
          a.download = `ลายไทย-${DESIGNS[key].name}-${Date.now()}.png`;
          a.click();
          if (App.isMember()) {
            const t = document.createElement('canvas'); t.width = 160; t.height = Math.round(160 * h / w);
            t.getContext('2d').drawImage(img, 0, 0, t.width, t.height);
            App.usave('gallery', [t.toDataURL('image/jpeg', 0.8)].concat(App.udata('gallery', [])).slice(0, 12));
            App.bump('drawings');
            App.addPoints(5, 'สร้างผลงานศิลปะ');
            drawGallery();
          } else App.ui.toast('ดาวน์โหลดภาพแล้ว · เข้าสู่ระบบเพื่อเก็บในแกลเลอรีและรับคะแนน');
        };
        img.src = url;
      };
      draw(); drawGallery();
    }
  });
})();
