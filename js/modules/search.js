/* บริการที่ 3: ค้นหาอัจฉริยะ — ค้นหาข้ามทุกบริการ (ข้อความ / แท็ก / ค้นหาด้วยเสียง) */
App.register({
  id: 'search',
  no: 3,
  title: 'ค้นหา',
  icon: '🔍',
  group: 'main',
  color: '#24396b',
  desc: 'ค้นหาเนื้อหาจากทุกบริการ พิมพ์หรือพูดก็ได้',
  render(el, param) {
    const popular = ['โขน', 'สงกรานต์', 'ต้มยำกุ้ง', 'ระนาด', 'ยูเนสโก', 'เชียงใหม่', 'สุนทรภู่', 'ไหว้', 'ผ้าไหม', 'ลอยกระทง'];
    const canVoice = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    el.innerHTML = App.ui.pageHead(this) + `
      <form class="toolbar" id="sForm" style="flex-direction:row">
        <input class="input" id="sIn" type="search" placeholder="พิมพ์คำค้นหา เช่น ผีตาโขน, ชุดไทย, แคน" value="${App.esc(param || '')}" autofocus>
        ${canVoice ? '<button class="btn" type="button" id="sMic" title="ค้นหาด้วยเสียง">พูด</button>' : ''}
        <button class="btn primary" type="submit">ค้นหา</button>
      </form>
      <div class="chips" style="margin-bottom:16px"><span class="muted" style="align-self:center">ยอดนิยม:</span>
        ${popular.map((p) => `<button class="chip" data-q="${p}">${p}</button>`).join('')}</div>
      <div id="sOut"></div>`;
    const input = App.$('#sIn', el);
    const out = App.$('#sOut', el);
    const run = (q) => {
      q = q.trim();
      history.replaceState(null, '', '#/search' + (q ? '/' + encodeURIComponent(q) : ''));
      if (!q) { out.innerHTML = '<p class="empty">พิมพ์คำที่ต้องการค้นหา</p>'; return; }
      const res = App.search(q);
      out.innerHTML = `<p class="muted">พบ ${res.length} รายการสำหรับ "<b>${App.esc(q)}</b>"</p>` +
        (res.length ? `<div class="grid cards">${res.map((it) => App.ui.card(Object.assign({}, it, { id: it.mod.id + '|' + it.id, cat: it.mod.title }), it.mod)).join('')}</div>`
          : '<p class="empty">ไม่พบผลลัพธ์ ลองใช้คำอื่น หรือถามน้องมาลัยดูนะ </p>');
    };
    App.$('#sForm', el).onsubmit = (e) => { e.preventDefault(); run(input.value); };
    App.$('.chips', el).addEventListener('click', (e) => { const b = e.target.closest('[data-q]'); if (b) { input.value = b.dataset.q; run(b.dataset.q); } });
    out.addEventListener('click', (e) => {
      const c = e.target.closest('.card'); if (!c) return;
      const [mod, id] = c.dataset.id.split('|');
      App.go(mod, id);
    });
    const mic = App.$('#sMic', el);
    if (mic) mic.onclick = () => {
      const R = window.SpeechRecognition || window.webkitSpeechRecognition;
      const r = new R(); r.lang = 'th-TH'; r.interimResults = false;
      mic.textContent = 'กำลังฟัง…'; App.ui.toast('กำลังฟัง... พูดคำค้นหาได้เลย');
      r.onresult = (ev) => { input.value = ev.results[0][0].transcript; run(input.value); };
      r.onend = () => { mic.textContent = 'พูด'; };
      r.onerror = () => App.ui.toast('ไม่สามารถใช้ไมโครโฟนได้', 'warn');
      r.start();
    };
    run(param || '');
  }
});
