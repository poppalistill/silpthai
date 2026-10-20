/* บริการที่ 13: คลังสำนวน สุภาษิต คำพังเพย — พร้อม "สำนวนวันนี้" และบัตรคำพลิกทาย */
(function () {
  const DATA = [
    ['น้ำขึ้นให้รีบตัก', 'มีโอกาสดีต้องรีบทำ ไม่ปล่อยให้โอกาสผ่านไป'],
    ['ตีวัวกระทบคราด', 'โกรธคนหนึ่งแต่ไปแสดงอาการกับอีกคนหนึ่งหรือสิ่งของ'],
    ['ขี่ช้างจับตั๊กแตน', 'ลงทุนมากเกินกว่าผลที่ได้รับ'],
    ['ไก่งามเพราะขน คนงามเพราะแต่ง', 'การแต่งกายดีช่วยเสริมให้ดูดี'],
    ['น้ำร้อนปลาเป็น น้ำเย็นปลาตาย', 'คำพูดตรงแรงอาจไม่ทำร้าย แต่คำหวานอาจแฝงภัย'],
    ['ปิดทองหลังพระ', 'ทำความดีโดยไม่หวังให้ใครเห็นหรือยกย่อง'],
    ['เข้าเมืองตาหลิ่ว ต้องหลิ่วตาตาม', 'ไปอยู่ที่ใดก็ควรปฏิบัติตามธรรมเนียมของที่นั่น'],
    ['กบในกะลาครอบ', 'ผู้มีความรู้หรือประสบการณ์น้อย แต่คิดว่าตนรู้มาก'],
    ['ชักแม่น้ำทั้งห้า', 'พูดยกยอหว่านล้อมเพื่อให้ได้สิ่งที่ต้องการ'],
    ['ตำน้ำพริกละลายแม่น้ำ', 'ใช้ทรัพย์หรือแรงไปโดยเปล่าประโยชน์'],
    ['รักวัวให้ผูก รักลูกให้ตี', 'รักลูกต้องอบรมสั่งสอน ลงโทษเมื่อทำผิด'],
    ['สิบปากว่าไม่เท่าตาเห็น', 'ได้ยินคนอื่นเล่ามาก ก็ไม่แน่นอนเท่าเห็นด้วยตาตนเอง'],
    ['หนีเสือปะจระเข้', 'หนีอันตรายหนึ่งแล้วไปพบอีกอันตรายหนึ่ง'],
    ['ฝนทั่งให้เป็นเข็ม', 'มีความเพียรพยายามจนประสบความสำเร็จ'],
    ['น้ำซึมบ่อทราย', 'รายได้น้อยแต่ได้เรื่อย ๆ ไม่ขาด'],
    ['ช้า ๆ ได้พร้าเล่มงาม', 'ทำงานอย่างค่อยเป็นค่อยไปและรอบคอบย่อมได้ผลดี'],
    ['เกลือเป็นหนอน', 'คนในทรยศหรือคิดร้ายต่อพวกเดียวกัน'],
    ['คมในฝัก', 'ผู้ที่มีความสามารถแต่ไม่แสดงออกให้ใครเห็น'],
    ['วัวหายล้อมคอก', 'เกิดความเสียหายแล้วจึงคิดหาทางป้องกัน'],
    ['ไม้ล้มข้ามได้ คนล้มอย่าข้าม', 'อย่าดูถูกคนที่กำลังตกต่ำ เพราะเขาอาจกลับมาดีได้'],
    ['ปลาหมอตายเพราะปาก', 'คนที่ได้รับความเดือดร้อนเพราะพูดพล่อย'],
    ['หวานเป็นลม ขมเป็นยา', 'คำชมอาจทำให้หลงตัว คำติทำให้ปรับปรุงตัว'],
    ['เอามะพร้าวห้าวไปขายสวน', 'อวดรู้กับผู้ที่รู้ดีกว่า'],
    ['ผักชีโรยหน้า', 'ทำความดีแต่เพียงผิวเผินเพื่อให้ดูดี']
  ];
  const items = DATA.map(([t, m], i) => ({ id: 'i' + (i + 1), title: t, sub: m, body: `<p><b>ความหมาย:</b> ${m}</p>`, emoji: '💬', tags: ['สำนวน'] }));
  const dayIndex = () => Math.floor(Date.now() / 86400000) % items.length;

  App.register({
    id: 'idioms',
    no: 13,
    title: 'สำนวนไทย',
    icon: '💬',
    group: 'learn',
    color: '#3d5aa0',
    desc: 'สำนวน สุภาษิต คำพังเพย พร้อมความหมายและบัตรคำ',
    items,
    today() { return items[dayIndex()]; },
    render(el, param) {
      let idx = dayIndex();
      const before = `<div class="grid cols-2" style="margin-bottom:18px">
        <div class="panel"><h3>สำนวนวันนี้</h3><p style="font-size:1.3rem;font-family:var(--font-head);margin:0">${items[idx].title}</p>
          <p class="muted">${items[idx].sub}</p><button class="btn sm" id="sayToday">ฟังเสียง</button></div>
        <div class="panel"><h3>บัตรคำพลิกทาย</h3>
          <div class="flash" id="flash"><div class="flash-inner">
            <div class="flash-face flash-front" id="ffront"></div><div class="flash-face flash-back" id="fback"></div>
          </div></div>
          <div class="btn-row" style="margin-top:10px"><button class="btn sm" id="fPrev">ก่อนหน้า</button><button class="btn sm gold" id="fNext">สุ่มใบใหม่ </button></div>
          <p class="muted" style="font-size:.85rem;margin:6px 0 0">แตะที่บัตรเพื่อพลิกดูความหมาย</p>
        </div></div>`;
      App.ui.listPage(this, el, param, { before });
      let card = Math.floor(Math.random() * items.length);
      const flash = App.$('#flash', el);
      const show = () => {
        flash.classList.remove('flip');
        App.$('#ffront', el).textContent = items[card].title;
        App.$('#fback', el).textContent = items[card].sub;
      };
      show();
      flash.onclick = () => flash.classList.toggle('flip');
      App.$('#fNext', el).onclick = () => { card = Math.floor(Math.random() * items.length); show(); };
      App.$('#fPrev', el).onclick = () => { card = (card - 1 + items.length) % items.length; show(); };
      App.$('#sayToday', el).onclick = () => App.speak(items[idx].title + ' หมายถึง ' + items[idx].sub);
    }
  });
})();
