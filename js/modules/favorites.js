/* บริการที่ 20: รายการโปรด — รวมเรื่องที่กด ❤️ ไว้จากทุกบริการ */
App.register({
  id: 'favorites',
  no: 20,
  title: 'รายการโปรด',
  short: 'โปรด',
  icon: '❤️',
  group: 'service',
  color: '#b3261e',
  desc: 'เก็บเรื่องที่ชอบไว้อ่านภายหลัง',
  render(el) {
    const draw = () => {
      if (!App.isMember()) {
        el.innerHTML = App.ui.pageHead(this) + '<div class="locked"><div class="big">❤️</div><h2>เข้าสู่ระบบเพื่อใช้รายการโปรด</h2><a class="btn primary" href="#/profile">เข้าสู่ระบบ</a></div>';
        return;
      }
      const favs = App.favs();
      const groups = {};
      favs.forEach((f) => { (groups[f.modTitle] = groups[f.modTitle] || []).push(f); });
      el.innerHTML = App.ui.pageHead(this) + (favs.length
        ? Object.entries(groups).map(([g, list]) => `<h3>${g} <span class="badge-num">${list.length}</span></h3>
          <div class="grid cards" style="margin-bottom:18px">${list.map((f) => `<div class="card" style="--c:var(--red);cursor:default">
            <span class="card-emoji">${f.emoji}</span>
            <span class="card-body"><a class="card-title" href="#/${f.mod}/${encodeURIComponent(f.id)}">${f.title}</a>
            <span class="card-sub">บันทึกเมื่อ ${App.thaiDate(f.added)}</span>
            <button class="btn sm danger" style="margin-top:6px;align-self:flex-start" data-rm="${f.key}">นำออก</button></span></div>`).join('')}</div>`).join('')
        : '<p class="empty">ยังไม่มีรายการโปรด — กดปุ่ม 🤍 ในหน้ารายละเอียดของแต่ละเรื่องเพื่อบันทึก</p>');
      App.$$('[data-rm]', el).forEach((b) => b.onclick = () => {
        const f = App.favs().find((x) => x.key === b.dataset.rm);
        App.toggleFav(f); draw();
      });
    };
    draw();
  }
});
