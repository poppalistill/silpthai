/* บริการที่ 4: แชทบอท "น้องมาลัย" — ผู้ช่วยตอบคำถามศิลปวัฒนธรรมไทย
 * ทำงานแบบออฟไลน์: จับคำสำคัญ (intent) + ค้นหาจากฐานข้อมูลเนื้อหาของทุกบริการ
 * เพิ่มคำตอบ: เพิ่ม object ใน INTENTS = { re: /คำที่ต้องจับ/, reply: () => 'ข้อความ' } */
(function () {
  const STOP = /(ครับ|ค่ะ|คะ|จ้า|จ้ะ|นะ|หน่อย|อะไร|คืออะไร|คือ|บอก|เล่า|ให้ฟัง|เกี่ยวกับ|อยากรู้|อยากทราบ|ช่วย|ไหม|มั้ย|หรือเปล่า|เรื่อง|ที่ไหน|อย่างไร|ยังไง|ทำไม|แบบไหน|ขอ|ข้อมูล|หน่อยสิ|รู้จัก|\?|？)/g;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const link = (mod, id, label) => `<a class="btn sm" href="#/${mod}${id ? '/' + id : ''}">${label}</a>`;

  const INTENTS = [
    { re: /^(สวัสดี|หวัดดี|ดีจ้า|hello|hi|ดีครับ|ดีค่ะ)/i, reply: () => pick(['สวัสดีค่ะ น้องมาลัยยินดีช่วยเรื่องศิลปวัฒนธรรมไทย ถามได้เลยค่ะ', 'สวัสดีค่ะ วันนี้อยากรู้เรื่องอะไรดีคะ ลองพิมพ์ "แนะนำ" ก็ได้นะคะ']) },
    { re: /(ขอบคุณ|ขอบใจ|thank)/i, reply: () => 'ด้วยความยินดีค่ะ มีอะไรถามน้องมาลัยได้อีกนะคะ' },
    { re: /(แนะนำ|ทำอะไรได้|ช่วยอะไร|เริ่มตรงไหน|help)/i, reply: () => `น้องมาลัยช่วยได้หลายอย่างค่ะ เช่น<br>• ถามเรื่องใดก็ได้ เช่น "โขนคืออะไร" "ข้าวซอย"<br>• "ประเพณีเดือนนี้"<br>• "สุ่มสำนวน"<br>• "กิจกรรม" เพื่อดูเวิร์กช็อปที่เปิดจอง<br>• "คะแนนของฉัน"
        <div class="links">${link('quiz', '', 'ทำแบบทดสอบ')}${link('music', '', 'ลองตีระนาด')}${link('regions', '', 'ท่อง 4 ภาค')}</div>` },
    { re: /(เดือนนี้|ตอนนี้มีงาน|เทศกาล.*เดือน|ประเพณี.*เดือน)/, reply: () => {
      const mth = new Date().getMonth() + 1;
      const list = App.byId.festivals.items.filter((f) => f.month === mth);
      return list.length ? `ประเพณีช่วงเดือน${App.THAI_MONTHS[mth - 1]} มีดังนี้ค่ะ<div class="links">${list.map((f) => link('festivals', f.id, f.title)).join('')}</div>`
        : `เดือน${App.THAI_MONTHS[mth - 1]}ยังไม่มีข้อมูลประเพณีค่ะ ลองดูปฏิทินทั้งปีนะคะ<div class="links">${link('festivals', '', 'ปฏิทินประเพณี')}</div>`;
    } },
    { re: /(สุ่มสำนวน|สำนวนวันนี้|ขอสำนวน|สุภาษิต)/, reply: () => {
      const it = pick(App.byId.idioms.items);
      return `<b>${it.title}</b><br>หมายถึง ${it.sub}<div class="links">${link('idioms', '', 'ดูสำนวนทั้งหมด')}</div>`;
    } },
    { re: /(จอง|กิจกรรม|เวิร์กช็อป|workshop)/i, reply: () => {
      const list = App.events.list().filter((e) => new Date(e.date + 'T23:59') >= new Date()).slice(0, 3);
      return list.length ? `กิจกรรมที่เปิดจองค่ะ <br>${list.map((e) => `• ${App.esc(e.title)} — ${App.thaiDate(e.date)}`).join('<br>')}<div class="links">${link('events', '', 'ไปหน้าจองกิจกรรม')}</div>`
        : 'ตอนนี้ยังไม่มีกิจกรรมเปิดจองค่ะ';
    } },
    { re: /(คะแนน|เหรียญ|ระดับ|เลเวล)/, reply: () => {
      if (!App.isMember()) return `ต้องเข้าสู่ระบบก่อนนะคะ ถึงจะสะสมคะแนนได้<div class="links">${link('profile', '', 'เข้าสู่ระบบ')}</div>`;
      const lv = App.level();
      return `ตอนนี้คุณมี <b>${App.points()} คะแนน</b> ระดับ ${lv.index} "${lv.name}" และได้เหรียญ ${App.earnedBadges().length}/${App.BADGES.length} เหรียญค่ะ <div class="links">${link('profile', '', 'ดูโปรไฟล์')}</div>`;
    } },
    { re: /(ชื่ออะไร|เป็นใคร|คุณคือ)/, reply: () => 'น้องมาลัยเป็นผู้ช่วยประจำแอปศิลป์ไทยค่ะ ชื่อมาจาก "มาลัย" ดอกไม้ร้อยที่คนไทยใช้แสดงความเคารพและความรัก' }
  ];

  function answer(text) {
    for (const it of INTENTS) if (it.re.test(text)) return it.reply();
    const q = text.replace(STOP, ' ').replace(/\s+/g, ' ').trim();
    let res = q ? App.search(q) : [];
    if (!res.length && q.includes(' ')) res = q.split(' ').flatMap((w) => (w.length > 1 ? App.search(w) : []));
    if (!res.length) {
      // ลองหาคำในชื่อเรื่องที่อยู่ในประโยค
      res = App.allItems().filter((it) => String(it.title).length > 1 && text.includes(String(it.title).split(' ')[0]));
    }
    res = res.filter((it, i, a) => a.findIndex((x) => x.mod.id === it.mod.id && x.id === it.id) === i).slice(0, 3);
    if (!res.length) return `ขอโทษค่ะ น้องมาลัยยังไม่มีข้อมูลเรื่องนี้ ลองถามใหม่ด้วยคำที่สั้นลง เช่น "โขน" "ลอยกระทง" "ซออู้" หรือพิมพ์ "แนะนำ" ค่ะ`;
    const top = res[0];
    const snippet = App.strip(top.body).slice(0, 220);
    return `<b>${top.title}</b> <small class="muted">· ${top.mod.title}</small>${top.sub ? ' — ' + top.sub : ''}<br>${snippet}${snippet.length >= 220 ? '…' : ''}
      <div class="links">${res.map((it) => link(it.mod.id, it.id, it.title)).join('')}</div>`;
  }

  App.register({
    id: 'chatbot',
    no: 4,
    title: 'น้องมาลัย (แชทบอท)',
    short: 'น้องมาลัย',
    icon: '💬',
    group: 'main',
    color: '#2f6b4f',
    desc: 'ผู้ช่วยตอบคำถามศิลปวัฒนธรรมไทย 24 ชั่วโมง',
    render(el) {
      const hello = { who: 'bot', html: `สวัสดีค่ะ น้องมาลัยเองค่ะ ถามเรื่องศิลปวัฒนธรรมไทยได้เลย เช่น "โขนคืออะไร" "ประเพณีเดือนนี้" หรือ "สุ่มสำนวน"` };
      const hist = App.store.get('chatSession', null) || [hello];
      const sugg = ['แนะนำ', 'ประเพณีเดือนนี้', 'โขนคืออะไร', 'ต้มยำกุ้ง', 'สุ่มสำนวน', 'กิจกรรม', 'ไหว้พระทำอย่างไร'];
      el.innerHTML = App.ui.pageHead(this) + `
        <div class="chat">
          <div class="chat-log" id="log"></div>
          <div class="chat-sugg">${sugg.map((s) => `<button class="chip" data-s="${s}">${s}</button>`).join('')}</div>
          <form class="chat-form" id="cf"><input class="input" id="ci" placeholder="พิมพ์คำถาม..." autocomplete="off">
            <button class="btn" type="button" id="cClear" title="ล้างแชท">ล้าง</button><button class="btn primary">ส่ง</button></form>
        </div>`;
      const log = App.$('#log', el);
      const render = () => {
        log.innerHTML = hist.map((h) => `<div class="msg ${h.who}">${h.who === 'bot' ? h.html : App.esc(h.text)}</div>`).join('');
        log.scrollTop = log.scrollHeight;
        App.store.set('chatSession', hist.slice(-40));
      };
      const send = (text) => {
        text = text.trim(); if (!text) return;
        hist.push({ who: 'me', text });
        render();
        App.bump('chats');
        setTimeout(() => { hist.push({ who: 'bot', html: answer(text) }); render(); }, 350);
      };
      App.$('#cf', el).onsubmit = (e) => { e.preventDefault(); const i = App.$('#ci', el); send(i.value); i.value = ''; };
      App.$('.chat-sugg', el).addEventListener('click', (e) => { const b = e.target.closest('[data-s]'); if (b) send(b.dataset.s); });
      App.$('#cClear', el).onclick = () => { hist.length = 0; hist.push(hello); render(); };
      render();
    }
  });
})();
