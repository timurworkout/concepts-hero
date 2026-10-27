const variant=document.body.dataset.variant;
const arrow=variant === 'c' ? '<svg class="arrival-icon" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 15 15 5M5 5h10v10" stroke="currentColor" stroke-width="1.2"/></svg>' : '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const cars={tank:{name:'TANK 300',image:'details/tank-300/02-exterior.webp',kind:'Внедорожник',price:'11 600',trunk:'400 л',clearance:'224 мм',drive:'полный',seats:'5',note:'Полный привод и клиренс 224 мм — для горных дорог. Пять мест и багажник 400 л — для вещей в поездке.',diff:''},bmw:{name:'BMW X3 IV',image:'details/bmw-x3/01-exterior.webp',kind:'Кроссовер',price:'12 100',trunk:'570 л',clearance:'216 мм',drive:'полный',seats:'5',note:'Полный привод и клиренс 216 мм подходят для поездки в горы. Багажник 570 л — больше места для вещей.',diff:'Багажник +170 л · на 500 ₽ в сутки дороже'},niva:{name:'LADA Niva Legend Sport',image:'details/niva-legend-sport/01-exterior.webp',kind:'Внедорожник',price:'6 100',trunk:'нет данных',clearance:'220 мм',drive:'полный',seats:'4',note:'Полный привод и высокий клиренс подходят для горных дорог. Компактная машина на четыре места.',diff:'На 5 500 ₽ в сутки дешевле · багажник: нет данных'}};
const gallery='/concepts-hero/cars/tbank/';let current='tank';let previous='tank';let selected='В горы';
const suggestions='<section class="suggest"><h2>Что для тебя важнее?</h2><p>Поездку учтём и покажем, что изменится</p><div class="tags"><button class="tag" data-car="bmw">Багажник больше <span>+500 ₽</span> '+arrow+'</button><button class="tag" data-car="niva">Дешевле <span>−5 500 ₽</span> '+arrow+'</button></div></section>';
document.body.innerHTML=`<div class="previewbar">Превью · <a href="a.html">Вариант 1</a><a href="b.html">Вариант 2</a><a href="c.html">Вариант 3</a> · <button id="single-demo" style="border:0;background:transparent;text-decoration:underline">Показать, когда подходит одна машина</button></div><header><div class="logo"><b>ON</b> MOVE</div><div class="nav"><span>♡ Избранное</span><span>Профиль</span></div></header><main><button class="back" type="button">← На главную</button><button class="trip" id="edit-trip"><span class="triptext"><small>${variant==='a'?'УЧЛИ В ПОДБОРЕ':'ТВОЯ ПОЕЗДКА'}</small><strong id="trip-value">В горы · Абхазия, озеро Рица</strong></span><span class="edit">Изменить ${arrow}</span></button><div class="layout"><div><div class="sub" id="kind">Под твои параметры · Внедорожник</div><h1 id="model">TANK 300</h1><p class="reason" id="reason"></p><div id="delta" class="delta" hidden></div>${variant!=='a'?suggestions:''}<img id="photo" class="photo" alt="Подобранная машина"><div class="thumbs"><img src="${gallery}details/tank-300/02-exterior.webp" alt=""><img src="${gallery}details/tank-300/03-exterior.webp" alt=""><img src="${gallery}details/tank-300/04-exterior.webp" alt=""></div><section class="section"><h2>О машине</h2><div class="specs"><div class="spec"><small>Привод</small><strong id="drive"></strong></div><div class="spec"><small>Клиренс</small><strong id="clearance"></strong></div><div class="spec"><small>Мест</small><strong id="seats"></strong></div><div class="spec"><small>Багажник</small><strong id="trunk"></strong></div></div></section>${variant==='a'?suggestions:''}</div><aside><div class="details"><div class="cell"><small>Где забрать</small><b>Выбери место　›</b></div><div class="cell"><small>Когда</small><b>Даты не выбраны　›</b></div><div class="price"><span id="price"></span> ₽</div><div class="sub">за 1 сутки, с допами</div><button class="book">Подобрать допы</button><p class="note">✓ Бесплатная отмена за 48 ч</p></div><section class="why"><h3>Почему эта машина</h3><p>Подходит для горной поездки. Из 34 машин по выбранным условиям подошли 3.</p><p class="muted">Для поездки в Абхазию понадобится доверенность на выезд.</p></section></aside></div></main><dialog id="dialog"><div class="dialog-head"><h2>Расскажи о поездке</h2><button class="close" aria-label="Закрыть">×</button></div><p>Что в планах?</p><div class="choices"><button class="choice active">В горы</button><button class="choice">По городу</button><button class="choice">На море</button></div><p class="muted">Превью: выбор меняет подпись в верхней строке. Реальный подбор останется в приложении.</p><button class="apply">Готово</button></dialog>`;
function render(){const c=cars[current];document.querySelector('#model').textContent=c.name;document.querySelector('#kind').textContent='Под твои параметры · '+c.kind;document.querySelector('#reason').textContent=c.note;document.querySelector('#photo').src=gallery+c.image;document.querySelector('#photo').alt=c.name;for(const key of ['drive','clearance','trunk','price','seats'])document.querySelector('#'+key).textContent=c[key];const diff=document.querySelector('#delta');diff.hidden=!c.diff;diff.textContent=c.diff && previous==='tank' ? c.diff : (current===previous?'':'Машина заменена. Сравни характеристики ниже.');diff.hidden=variant==='c'||current===previous;document.querySelector('.thumbs').hidden=current!=='tank';document.querySelectorAll('[data-car]').forEach(b=>{b.hidden=b.dataset.car===current;const amount={tank:11600,bmw:12100,niva:6100};const delta=amount[b.dataset.car]-amount[current];b.querySelector('span').textContent=(delta<0?'−':'+')+Math.abs(delta).toLocaleString('ru-RU')+' ₽'})}
document.querySelector('#single-demo').onclick=()=>{document.querySelectorAll('.suggest').forEach(el=>{el.innerHTML='<h2>Это лучшая машина под твою задачу</h2><p>Если изменить приоритет, можно поискать другие варианты</p><div class="tags"><button class="tag" data-fallback>Поискать дешевле '+arrow+'</button><button class="tag" data-fallback>Багажник больше '+arrow+'</button></div><p class="muted fallback-note" hidden>Варианты зависят от доступных машин и условий поездки.</p>';el.querySelectorAll('[data-fallback]').forEach(b=>b.onclick=()=>el.querySelector('.fallback-note').hidden=false)});document.querySelector('#single-demo').textContent='Состояние: подходит одна машина'};document.querySelectorAll('[data-car]').forEach(b=>b.addEventListener('click',()=>{previous=current;current=b.dataset.car;render();window.scrollTo({top:0,behavior:'smooth'})}));document.querySelector('#edit-trip').onclick=()=>document.querySelector('#dialog').showModal();document.querySelector('.close').onclick=()=>document.querySelector('#dialog').close();document.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{document.querySelectorAll('.choice').forEach(x=>x.classList.remove('active'));b.classList.add('active');selected=b.textContent});document.querySelector('.apply').onclick=()=>{document.querySelector('#trip-value').textContent=selected+' · Абхазия, озеро Рица';document.querySelector('#dialog').close()};render();

if (variant === 'c') {
  const panel = document.querySelector('.details');
  document.querySelector('.why').remove();
  const routeNote = document.createElement('p');
  routeNote.className = 'route-note';
  routeNote.textContent = 'Для выезда в Абхазию оформим доверенность.';
  document.querySelector('#reason').after(routeNote);
  document.querySelector('#dialog .apply').addEventListener('click', () => { routeNote.hidden = selected !== 'В горы'; });
  const trip = document.querySelector('#edit-trip');
  trip.querySelector('small').textContent = 'Параметры поездки';
  trip.querySelector('.edit').innerHTML = arrow;
  panel.prepend(trip);
  document.querySelector('#dialog .muted').textContent = 'Параметры помогают подобрать машину точнее. Их можно изменить или пропустить.';
  const rows = panel.querySelectorAll('.cell');
  rows[0].outerHTML = '<button type="button" class="cell cell-action missing" id="location-row"><span><small>Где забрать</small><b id="location-value">Выбери место</b></span><span class="cell-link" aria-hidden="true"></span></button>';
  rows[1].outerHTML = '<button type="button" class="cell cell-action missing" id="dates-row"><span><small>Когда</small><b id="dates-value">Даты не выбраны</b></span><span class="cell-link" aria-hidden="true"></span></button>';
  const picker = document.createElement('dialog');
  picker.id = 'required-dialog';
  document.body.append(picker);
  const values = { location: '', dates: '' };
  const plus = '<svg class="arrival-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 3v14M3 10h14" stroke="currentColor" stroke-width="1.2"/></svg>';
  document.querySelectorAll('.cell-link').forEach(icon => icon.innerHTML = plus);
  let pendingNext = false;
  function updateRows() {
    for (const [key, id, label] of [['location', 'location-row', 'Выбери место'], ['dates', 'dates-row', 'Даты не выбраны']]) {
      const row = document.getElementById(id);
      row.classList.toggle('missing', !values[key]);
      row.querySelector('b').textContent = values[key] || label;
      row.querySelector('.cell-link').innerHTML = values[key] ? arrow : plus;
    }
  }
  function showRequired(key) {
    const isLocation = key === 'location';
    const title = isLocation ? 'Где заберёшь машину?' : 'Когда и надолго ли?';
    const hint = isLocation ? 'Выбери место получения в Сочи' : 'Выбери даты поездки';
    const options = isLocation ? ['Аэропорт Сочи', 'Вокзал Сочи', 'В центре города'] : ['12–14 ноября', '19–21 ноября', '26–28 ноября'];
    picker.innerHTML = `<div class="dialog-head"><h2>${title}</h2><button class="close" aria-label="Закрыть">×</button></div><p>${hint}</p><div class="required-options">${options.map(option => `<button type="button" class="required-option">${option}<span>${arrow}</span></button>`).join('')}</div>`;
    picker.querySelector('.close').onclick = () => { pendingNext = false; picker.close(); };
    picker.querySelectorAll('.required-option').forEach(button => button.onclick = () => {
      values[key] = button.firstChild.textContent;
      picker.close();
      updateRows();
      if (pendingNext && !values.location) showRequired('location');
      else if (pendingNext && !values.dates) showRequired('dates');
      else if (pendingNext) { pendingNext = false; document.querySelector('.preview-result').hidden = false; }
    });
    picker.showModal();
  }
  document.querySelector('#location-row').onclick = () => { pendingNext = false; showRequired('location'); };
  document.querySelector('#dates-row').onclick = () => { pendingNext = false; showRequired('dates'); };
  panel.insertAdjacentHTML('beforeend', '<p class="preview-result" hidden>Данные заполнены. В приложении здесь откроется выбор допов.</p>');
  document.querySelector('.book').onclick = () => {
    pendingNext = true;
    if (!values.location) showRequired('location');
    else if (!values.dates) showRequired('dates');
    else { pendingNext = false; document.querySelector('.preview-result').hidden = false; }
  };
}
