/* ПК-версия учёта раскроев: сайдбар + мастер-деталь. Данные общие с мобильной (сервер /api/state). */
window.addEventListener('error',e=>{
  const msg='Ошибка: '+(e.message||'unknown');
  try{ toast(msg); }catch{}
  try{
    let d=document.querySelector('#errBox');
    if(!d){ d=document.createElement('div'); d.id='errBox'; d.style.cssText='position:fixed;bottom:10px;left:10px;right:10px;background:#b3261e;color:#fff;padding:10px;border-radius:10px;z-index:999;font-size:12px'; document.body.appendChild(d); }
    d.textContent=msg;
  }catch{}
});
const $ = s => document.querySelector(s);
const uid = () => Math.random().toString(36).slice(2,9);
const todayISO = () => new Date().toISOString().slice(0,10);
const fmtDate = iso => { try{ const [y,m,d]=iso.split('-'); return `${d}.${m}.${y}`;}catch{return iso} };
const isToday = iso => iso===todayISO();
const isYesterday = iso => { const d=new Date(); d.setDate(d.getDate()-1); return iso===d.toISOString().slice(0,10); };
const esc = s => String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// статус материала: todo (не напилено) / work (не закончен) / done (напилено)
function mst(mt){ if(mt.st!=='done'&&mt.st!=='work'&&mt.st!=='todo') mt.st=mt.done?'done':'todo'; return mt.st; }
function stName(s){ return s==='done'?'Напилено':s==='work'?'Не закончен':'Не напилено'; }
function stPill(s){ return s==='done'?'ok':s==='work'?'mid':'no'; }
function cycleSt(mt){
  const me=curAcc().id, s=mst(mt);
  if(s==='todo'){ mt.st='work'; mt.done=false; mt.byStart=me; }
  else if(s==='work'){ mt.st='done'; mt.done=true; mt.by=me; if(!mt.byStart) mt.byStart=me; }
  else { mt.st='todo'; mt.done=false; mt.by=null; mt.byStart=null; }
}
function barHTML(act,slim){
  const n=act.length, d=act.filter(x=>mst(x)==='done').length, w=act.filter(x=>mst(x)==='work').length;
  const cls='progress'+(slim?' slim':'')+(n&&d===n?' blue':'');
  if(!n||d===n) return `<div class="${cls}"><i style="width:${n?100:0}%"></i></div>`;
  return `<div class="${cls} stack"><i style="width:${Math.round(d/n*100)}%"></i><em style="width:${Math.round(w/n*100)}%"></em></div>`;
}
function dotsHTML(act){
  return [...new Set(act.filter(x=>mst(x)==='done').map(x=>accColorFor(x)))].slice(0,6).map(c=>`<i class="pdot" style="background:${c}"></i>`).join('');
}
function noteHTML(r){
  const t=(r.note||'').trim().split('\n')[0].slice(0,60);
  return t?`<div class="card-note">📝 ${esc(t)}</div>`:'';
}

const PALETTE=['#1a9e54','#e8892b','#2f80ed','#9333ea','#e5484d','#0e9b8b','#d63384','#795548'];
function seed(){
  const t=todayISO();
  const y=(()=>{const d=new Date();d.setDate(d.getDate()-1);return d.toISOString().slice(0,10)})();
  const m=(n,size,qty,done,urgent,worker)=>({id:uid(),name:n,size:size||'',qty,unit:'л',done:!!done,urgent:!!urgent,skip:false,assignee:worker||''});
  return {
    raskroi:[
      {id:uid(),title:'Рек МКС 14.12НА',date:t,shop:'Цех 1',note:'',materials:[m('Белый приф','2750 × 1830',3.5,true,false,'Илья'),m('Зелёный приф','2750 × 1830',9,true,false,'Илья'),m('МДФ 22','2750 × 1830',2,true,false,''),m('Кашемир','2750 × 1830',5,true,false,'Сергей'),m('ДВПО бел','2750 × 1830',4,false,true,'Сергей'),m('Шифер ДСП','2750 × 1830',2,false,false,'Андрей'),m('Кр. табак','2750 × 1830',1,false,false,'Павел')]},
      {id:uid(),title:'Белый прай',date:t,shop:'Цех 1',note:'',materials:[m('Белый приф','2750 × 1830',16,true,false,'Илья'),m('Графит приф','2750 × 1830',8.5,true,false,''),m('ДВПО бел','2750 × 1830',22,true,false,''),m('Дуб Буратти','2750 × 1830',4.5,false,true,'Андрей'),m('Табак','',3,false,false,'Сергей')]},
      {id:uid(),title:'Стан 12.08',date:t,shop:'Цех 2',note:'',materials:[m('Белый приф','2750 × 1830',6,true,false,'Илья'),m('Кашемир приф','2750 × 1830',4,true,false,''),m('МДФ 16','2750 × 1830',2,true,false,''),m('МДФ 19','2750 × 1830',2.5,true,false,''),m('Орех 0729','2750 × 1830',0.5,true,false,''),m('Экспрессив песочный','2750 × 1830',2.5,true,false,''),m('Синий приф','2750 × 1830',1.5,true,false,'')]},
      {id:uid(),title:'ЛДСП 16мм',date:t,shop:'Цех 2',note:'',materials:[m('ЛДСП 16мм','2750 × 1830',3,false,true,'Илья'),m('Кромка ПВХ','19 × 0.4 мм',5,false,false,'Андрей'),m('Фурнитура','комплект',1,false,false,'Сергей')]},
      {id:uid(),title:'Солянка 30.09 + ДОП',date:y,shop:'Цех 1',note:'',materials:[m('Белый приф','2750 × 1830',4,true,false,''),m('Графит приф','2750 × 1830',3,true,false,''),m('Кашемир','2750 × 1830',5,true,false,''),m('МДФ 16','2750 × 1830',3,true,false,''),m('МДФ 19','2750 × 1830',2,true,false,''),m('Табак','2750 × 1830',2,false,false,'')]},
      {id:uid(),title:'ЧЛ Река',date:y,shop:'Цех 2',note:'',materials:[m('Кашемир приф','2750 × 1830',2,false,false,''),m('Красный приф','2750 × 1830',1,false,false,''),m('МДФ 16 двухстор','2750 × 1830',2,false,false,''),m('Синий приф','2750 × 1830',3,false,false,'')]},
    ],
    dirs:[],
    accounts:[
      {id:uid(),name:'Илья',color:PALETTE[0]},
      {id:uid(),name:'Сергей',color:PALETTE[1]},
      {id:uid(),name:'Андрей',color:PALETTE[2]},
      {id:uid(),name:'Павел',color:PALETTE[3]},
    ]
  };
}

const DB_KEY='raskroi_db_v2';
let DB=null;
try{ DB=JSON.parse(localStorage.getItem(DB_KEY))||null; }catch{ DB=null; }
if(!DB){
  try{ const old=JSON.parse(localStorage.getItem('raskroi_db_v1')); if(old&&old.raskroi) DB={raskroi:old.raskroi,dirs:[]}; }catch{}
  if(!DB) DB=seed();
}
function saveLocal(){ try{localStorage.setItem(DB_KEY, JSON.stringify(DB));}catch{} }
// ---------- аккаунты (активный — только на этом устройстве) ----------
function myId(){ try{ return localStorage.getItem('raskroi_me')||''; }catch{ return ''; } }
function setMyId(id){ try{ localStorage.setItem('raskroi_me', id); }catch{} }
function ensureAccounts(){
  if(!Array.isArray(DB.accounts)||!DB.accounts.length){
    DB.accounts=[
      {id:uid(),name:'Илья',color:PALETTE[0]},
      {id:uid(),name:'Сергей',color:PALETTE[1]},
      {id:uid(),name:'Андрей',color:PALETTE[2]},
      {id:uid(),name:'Павел',color:PALETTE[3]},
    ];
  }
  if(DB.currentAccountId) setMyId(DB.currentAccountId); // разовая миграция со старого формата
  delete DB.currentAccountId;
  if(!DB.accounts.some(a=>a.id===myId())) setMyId(DB.accounts[0].id);
}
ensureAccounts();
function dateVal(iso){ return Date.parse((iso||'')+'T00:00:00')||0; }
function ensureCreatedAt(){ DB.raskroi.forEach((r,i)=>{ if(typeof r.createdAt!=='number') r.createdAt=dateVal(r.date)-i; }); }
ensureCreatedAt();
function curAcc(){ return DB.accounts.find(a=>a.id===myId())||DB.accounts[0]; }
function accColorFor(mt){
  if(mt.by){ const a=DB.accounts.find(x=>x.id===mt.by); if(a) return a.color; }
  if(mt.assignee){ const a=DB.accounts.find(x=>x.name===mt.assignee); if(a) return a.color; }
  return '#1a9e54';
}
function accNameFor(mt){
  if(mt.by){ const a=DB.accounts.find(x=>x.id===mt.by); if(a) return a.name; }
  return mt.assignee||'';
}
function accStarterName(mt){
  if(mt.byStart){ const a=DB.accounts.find(x=>x.id===mt.byStart); if(a) return a.name; }
  return '';
}
function accColorById(id){
  const a=DB.accounts.find(x=>x.id===id); return a?a.color:'';
}

// ---------- синхронизация: облако Supabase (если настроено) или свой сервер ---
const CFG = window.APP_CONFIG || {};
const CLOUD = !!(CFG.SUPABASE_URL && CFG.SUPABASE_KEY);
const SYNC_ON = location.protocol.indexOf('http')===0;
let serverRev=0, pushT=null, synced=false;
function save(){ saveLocal(); if(!SYNC_ON||!synced) return; clearTimeout(pushT); pushT=setTimeout(pushNow,500); }
function sbHeaders(extra){
  return Object.assign({ apikey: CFG.SUPABASE_KEY, Authorization: 'Bearer ' + CFG.SUPABASE_KEY }, extra || {});
}
async function cloudGet(){
  try{
    const r=await fetch(CFG.SUPABASE_URL+'/rest/v1/app_state?id=eq.1&select=rev,data',{headers:sbHeaders(),cache:'no-store'});
    if(!r.ok) return null;
    const j=await r.json();
    return (j&&j[0])?j[0]:null;
  }catch{ return null; }
}
async function cloudRev(){
  // лёгкая проверка: только номер ревизии, без скачивания всей базы
  try{
    const r=await fetch(CFG.SUPABASE_URL+'/rest/v1/app_state?id=eq.1&select=rev',{headers:sbHeaders(),cache:'no-store'});
    cloudStatus=r.status;
    if(!r.ok) return null;
    const j=await r.json();
    return (j&&j[0]&&typeof j[0].rev==='number')?j[0].rev:null;
  }catch{ return null; }
}
async function cloudPut(){
  try{
    const cur=await cloudGet();
    const next=(cur&&typeof cur.rev==='number'?cur.rev:0)+1;
    if(cur){
      const pr=await fetch(CFG.SUPABASE_URL+'/rest/v1/app_state?id=eq.1',{method:'PATCH',headers:sbHeaders({'Content-Type':'application/json'}),body:JSON.stringify({rev:next,data:DB,updated_at:new Date().toISOString()})});
      if(!pr.ok) return null;
    } else {
      const ins=await fetch(CFG.SUPABASE_URL+'/rest/v1/app_state',{method:'POST',headers:sbHeaders({'Content-Type':'application/json'}),body:JSON.stringify({id:1,rev:1,data:DB})});
      if(!ins.ok) return null;
      return {rev:1};
    }
    return {rev:next};
  }catch{ return null; }
}
let cloudStatus=0, warned401=false;
async function pushNow(){
  if(!SYNC_ON) return;
  try{
    if(CLOUD){ const s=await cloudPut(); if(s){ serverRev=s.rev; markSync(); } return; }
    const r=await fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:DB})});
    const s=await r.json();
    if(s&&typeof s.rev==='number'){ serverRev=s.rev; markSync(); }
  }catch{}
}
async function pullState(){
  if(!SYNC_ON) return;
  try{
    if(CLOUD){
      const rv=await cloudRev();
      if(rv===null){
        if(cloudStatus===401&&!warned401){ warned401=true; toast('Облако: нет доступа (401) — обнови страницу, не поможет — перетащи папку на сайт заново'); }
        pushNow(); return;
      }
      if(rv>serverRev){
        const s=await cloudGet();
        if(s&&s.data&&Array.isArray(s.data.raskroi)){
          serverRev=s.rev; DB=s.data; ensureAccounts(); ensureCreatedAt(); saveLocal(); rerender(); markSync();
        }
      }
      return;
    }
    const r=await fetch('/api/state',{cache:'no-store'});
    if(r.status===204){ pushNow(); return; }
    const s=await r.json();
    if(s&&typeof s.rev==='number'&&s.rev>serverRev&&s.data&&Array.isArray(s.data.raskroi)){
      serverRev=s.rev; DB=s.data; ensureAccounts(); ensureCreatedAt(); saveLocal(); rerender(); markSync();
    }
  }catch{} finally{ synced=true; }
}
function markSync(){
  const d=$('#syncDot'), t=$('#syncTxt');
  if(d) d.classList.add('on');
  if(t) t.textContent='синхронизировано ' + new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
}
function rerender(){ renderMe(); renderList(); renderDir(); if(curPage==='acc') renderAcc(); if(currentId) renderDetail(); }
function renderMe(){
  const me=curAcc();
  const b=$('#pMe');
  if(b) b.innerHTML=`<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${me.color};margin-right:6px;vertical-align:baseline"></span>Я — ${esc(me.name)}`;
}
$('#pMe').onclick=()=>{
  document.querySelectorAll('.snav-btn').forEach(x=>x.classList.toggle('active',x.dataset.p==='acc'));
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  curPage='acc'; $('#pg-acc').classList.add('active'); renderAcc();
};

function statusOf(r){
  const act=r.materials.filter(x=>!x.skip);
  const d=act.filter(x=>x.done).length;
  if(!act.length||!d) return 'new';
  if(d===act.length) return 'done';
  return 'work';
}
const statusName={work:'В работе',done:'Готов',new:'Не начат'};

let curPage='list', q='', matQ='', monthOff=0;
function shownMonthKey(){ const d=new Date(); d.setDate(1); d.setMonth(d.getMonth()+monthOff); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); }
function shownMonthName(){ const d=new Date(); d.setDate(1); d.setMonth(d.getMonth()+monthOff); const s=d.toLocaleDateString('ru-RU',{month:'long',year:'numeric'}); return s.charAt(0).toUpperCase()+s.slice(1); }
let currentId=null, formMats=[];

// ---------- навигация ----------
document.querySelectorAll('.snav-btn').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.snav-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active');
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  curPage=b.dataset.p;
  $({list:'#pg-list',mats:'#pg-mats',acc:'#pg-acc'}[curPage]).classList.add('active');
  if(curPage==='mats') renderDir();
  if(curPage==='acc') renderAcc();
});

// ---------- список: текущий месяц, сначала новые ----------
function filtered(){
  const month=shownMonthKey();
  let arr=[...DB.raskroi]
    .filter(r=>(r.date||'').slice(0,7)===month)
    .sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  return arr;
}
function renderList(){
  const arr=filtered();
  $('#pListTitle').textContent=`Раскрои · ${shownMonthName()}`;
  const box=$('#pCards'); box.innerHTML='';
  if(!arr.length){ box.innerHTML='<div class="card"><b>📋 В этом месяце пока пусто</b><div class="card-mat">Нажми «+ Новый раскрой».</div></div>'; }
  arr.forEach(r=>{
    const act=r.materials.filter(x=>!x.skip);
    const el=document.createElement('div');
    el.className='card'+(r.id===currentId?' sel':'');
    el.innerHTML=`<div class="card-top"><b>${esc(r.title)}</b><span class="badge ${statusOf(r)}">${statusName[statusOf(r)]}</span></div>
      ${barHTML(act,false)}
      <div class="card-mat">📄 ${act.length} материалов</div><span class="frac"><span class="cdots">${dotsHTML(act)}</span> ${act.filter(x=>x.done).length}/${act.length}</span>
      ${noteHTML(r)}`;
    el.onclick=()=>{ currentId=r.id; renderList(); renderDetail(); };
    box.appendChild(el);
  });
  const hasSel = currentId && DB.raskroi.some(r=>r.id===currentId);
  if(!hasSel) currentId=null;
  $('#pDetailBody').classList.toggle('hidden', !hasSel);
  $('#pDetailEmpty').classList.toggle('hidden', hasSel);
}
function monthNameFor(off){ const d=new Date(); d.setDate(1); d.setMonth(d.getMonth()+off); const s=d.toLocaleDateString('ru-RU',{month:'long',year:'numeric'}); return s.charAt(0).toUpperCase()+s.slice(1); }
function monthKeyFor(off){ const d=new Date(); d.setDate(1); d.setMonth(d.getMonth()+off); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); }
function openMonthMenu(){
  const menu=$('#pMonthMenu');
  const items=[];
  for(let k=-11;k<=1;k++){
    const key=monthKeyFor(k);
    items.push({key,name:monthNameFor(k),off:k,count:DB.raskroi.filter(r=>(r.date||'').slice(0,7)===key).length});
  }
  items.reverse();
  menu.innerHTML='';
  items.forEach(it=>{
    const b=document.createElement('button'); b.type='button';
    b.className='mm-item'+(shownMonthKey()===it.key?' sel':'');
    b.innerHTML=`<span>${it.name}</span><span class="mm-count">${it.count}</span>`;
    b.onclick=()=>{ monthOff=it.off; menu.classList.add('hidden'); renderList(); };
    menu.appendChild(b);
  });
  menu.classList.remove('hidden');
}
$('#pMonthBtn').onclick=e=>{ e.stopPropagation(); const m=$('#pMonthMenu'); m.classList.contains('hidden')?openMonthMenu():m.classList.add('hidden'); };
document.addEventListener('click',e=>{ if(!e.target.closest('.month-pick')) $('#pMonthMenu').classList.add('hidden'); });
$('#pSearch').oninput=e=>{ q=e.target.value; renderSearchDrop(); };
function monthOffFor(key){ const p=(key||'').split('-'); const y=+p[0], m=+p[1]; if(!y||!m) return 0; const n=new Date(); return (y-n.getFullYear())*12+((m-1)-n.getMonth()); }
function monthNameOf(key){ const p=(key||'').split('-'); const y=+p[0], m=+p[1]; if(!y||!m) return ''; const s=new Date(y,m-1,1).toLocaleDateString('ru-RU',{month:'long',year:'numeric'}); return s.charAt(0).toUpperCase()+s.slice(1); }
function renderSearchDrop(){
  const box=$('#pSearchDrop');
  const query=(q||'').trim().toLowerCase();
  if(!query){ box.classList.add('hidden'); box.innerHTML=''; return; }
  const hits=[...DB.raskroi].filter(r=>r.title.toLowerCase().includes(query)).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8);
  if(!hits.length){ box.classList.add('hidden'); box.innerHTML=''; return; }
  box.innerHTML='';
  hits.forEach(r=>{
    const act=r.materials.filter(x=>!x.skip), d=act.filter(x=>x.done).length;
    const st=statusOf(r), pct=act.length?Math.round(d/act.length*100):0;
    const b=document.createElement('button'); b.type='button'; b.className='sr-card';
    b.innerHTML=`<div class="card-top"><b>${esc(r.title)}</b><span class="badge ${st}">${statusName[st]}</span></div>
      <div class="progress slim"><i style="width:${pct}%"></i></div>
      <div class="sr-meta"><span>${fmtDate(r.date)} · ${monthNameOf((r.date||'').slice(0,7))}</span><span>${d}/${act.length}</span></div>`;
    b.onmousedown=e=>{ e.preventDefault(); monthOff=monthOffFor((r.date||'').slice(0,7)); q=''; $('#pSearch').value=''; box.classList.add('hidden'); currentId=r.id; renderList(); renderDetail(); };
    box.appendChild(b);
  });
  box.classList.remove('hidden');
}
document.addEventListener('click',e=>{ if(!e.target.closest('.tsearch-wrap')) $('#pSearchDrop').classList.add('hidden'); });
$('#pMPrev').onclick=()=>{ monthOff--; renderList(); };
$('#pMNext').onclick=()=>{ monthOff++; renderList(); };

// ---------- деталь ----------
const cur=()=>DB.raskroi.find(r=>r.id===currentId);
function renderDetail(){
  const r=cur(); if(!r){ currentId=null; renderList(); return; }
  $('#pdTitle').textContent=r.title;
  const pn=$('#pdNote');
  if(r.note&&r.note.trim()){ pn.textContent=r.note; pn.classList.remove('hidden'); }
  else { pn.textContent=''; pn.classList.add('hidden'); }
  const act=r.materials.filter(x=>!x.skip), d=act.filter(x=>x.done).length;
  $('#pdCount').textContent=` ${act.length} материалов `; $('#pdFrac').textContent=`${d}/${act.length}`;
  $('#pdBarBox').innerHTML=barHTML(act,false);
  const box=$('#pdMats'); box.innerHTML='';
  r.materials.forEach(mt=>{
    const s=mst(mt);
    const col=s==='done'?accColorFor(mt):'';
    const byName=s==='done'?accNameFor(mt):'';
    const starter=accStarterName(mt);
    const scol=(s==='done'&&starter&&mt.byStart!==mt.by)?accColorById(mt.byStart):'';
    const el=document.createElement('div');
    el.className='mat'+(s==='done'?' done':'')+(s==='work'?' work':'')+(mt.skip?' skip':'');
    const pillHtml=s==='done'
      ? `<span class="pill ok" style="background:${col};color:#fff">Напилено${byName?' · '+esc(byName):''}</span>`
      : s==='work'
      ? `<span class="pill mid">Не закончен${starter?' · '+esc(starter):''}</span>`
      : `<span class="pill ${stPill(s)}">${stName(s)}</span>`;
    const startedLine=(s==='done'&&starter&&mt.byStart!==mt.by)?`<span class="started">начинал: ${esc(starter)}</span>`:'';
    const rowInner=`<div><b>${esc(mt.name)}</b>${mt.size?`<small>${esc(mt.size)}</small><br>`:''}
      ${mt.skip?'<span class="pill no">Пропуск</span>':pillHtml+startedLine}
      ${mt.assignee?`<span class="worker">👤 ${esc(mt.assignee)}</span>`:''}</div>
      <div class="mat-x"><button title="Удалить из раскроя">×</button></div>`;
    if(col&&scol){
      el.setAttribute('style',`border:0;padding:2px;background:linear-gradient(to right,${scol} 50%,${col} 50%)`);
      el.innerHTML=`<div class="mat-in" style="background-image:linear-gradient(to right,${scol}22 50%,${col}22 50%),linear-gradient(var(--surface),var(--surface))">${rowInner}</div>`;
    } else {
      if(col) el.setAttribute('style',`border-color:${col};background:${col}22`);
      el.innerHTML=rowInner;
    }
    el.onclick=()=>{ if(!mt.skip){ cycleSt(mt); save(); renderDetail(); renderList(); } };
    el.querySelector('.mat-x button').onclick=e=>{
      e.stopPropagation();
      r.materials=r.materials.filter(m=>m.id!==mt.id);
      save(); renderDetail(); renderList();
    };
    box.appendChild(el);
  });
}
$('#pdClose').onclick=()=>{ currentId=null; renderList(); };
$('#pdRename').onclick=async()=>{
  const r=cur(); if(!r) return;
  const a=await appPrompt('Переименовать раскрой', r.title);
  if(a&&a.trim()){ r.title=a.trim(); save(); renderDetail(); renderList(); }
};
$('#pdAdd').onclick=async()=>{
  const r=cur(); if(!r) return;
  const name=await appPrompt('Новый материал','',true);
  if(!name||!name.trim()) return;
  const t=name.trim();
  if(!DB.dirs.includes(t)) DB.dirs.unshift(t);
  r.materials.push({id:uid(),name:t,size:'',qty:1,unit:'л',done:false,urgent:false,skip:false,assignee:''});
  save(); renderDetail(); renderList();
};
function dupRaskroy(){
  const r=cur(); if(!r) return null;
  const c={id:uid(),title:r.title,date:todayISO(),shop:r.shop||'Цех 1',note:r.note||'',createdAt:Date.now(),
    materials:r.materials.map(m=>({id:uid(),name:m.name,size:m.size||'',qty:m.qty||1,unit:m.unit||'л',done:false,st:'todo',urgent:false,skip:!!m.skip,assignee:m.assignee||''}))};
  DB.raskroi.unshift(c); save(); return c;
}
$('#pdDup').onclick=()=>{ const c=dupRaskroy(); if(!c) return; monthOff=0; currentId=c.id; save(); renderList(); renderDetail(); toast('Копия создана в текущем месяце'); };
$('#pdDelete').onclick=async()=>{
  if(await appConfirm('Удалить раскрой?','Действие нельзя отменить.','Удалить')){
    DB.raskroi=DB.raskroi.filter(r=>r.id!==currentId); currentId=null; save(); renderList();
  }
};
// ---------- новый раскрой ----------
function closeSuggest(){ document.querySelectorAll('.suggest').forEach(s=>s.remove()); }
document.addEventListener('click',e=>{ if(!e.target.closest('.fmat')) closeSuggest(); });
function showSuggest(input){
  closeSuggest();
  const i=+input.dataset.i;
  const qq=(input.value||'').toLowerCase();
  const items=DB.dirs.filter(n=>n.toLowerCase().includes(qq)).sort((a,b)=>a.localeCompare(b,'ru')).slice(0,8);
  if(!items.length) return;
  const box=document.createElement('div'); box.className='suggest';
  items.forEach(n=>{
    const b=document.createElement('button'); b.type='button'; b.textContent=n;
    b.onmousedown=e=>{ e.preventDefault(); formMats[i].name=n; input.value=n; closeSuggest(); };
    box.appendChild(b);
  });
  input.closest('.fmat').appendChild(box);
}
function renderFormMats(){
  closeSuggest();
  const box=$('#pnMats'); box.innerHTML='';
  if(!formMats.length){ box.innerHTML='<p class="subtitle">Материалов пока нет — нажми «+ Добавить материал».</p>'; return; }
  formMats.forEach((m,i)=>{
    const d=document.createElement('div'); d.className='fmat';
    d.innerHTML=`<div class="r"><input data-i="${i}" class="fm-n" placeholder="Название материала" value="${esc(m.name)}" autocomplete="off"><button data-i="${i}" class="fm-x btn">×</button></div>`;
    box.appendChild(d);
  });
  box.querySelectorAll('.fm-n').forEach(s=>{
    s.oninput=e=>{ formMats[+e.target.dataset.i].name=e.target.value; showSuggest(e.target); };
    s.onfocus=e=>showSuggest(e.target);
    s.onchange=e=>{ formMats[+e.target.dataset.i].name=e.target.value; };
    s.onblur=()=>setTimeout(closeSuggest,150);
  });
  box.querySelectorAll('.fm-x').forEach(b=>b.onclick=e=>{ formMats.splice(+e.target.dataset.i,1); renderFormMats(); });
}
$('#pFab').onclick=()=>{ formMats=[]; $('#pnTitle').value=''; $('#pnNote').value=''; renderFormMats(); $('#pNewModal').classList.remove('hidden'); setTimeout(()=>$('#pnTitle').focus(),80); };
$('#pnCancel').onclick=()=>$('#pNewModal').classList.add('hidden');
$('#pnAdd').onclick=()=>{ formMats.push({name:''}); renderFormMats(); const l=document.querySelectorAll('#pnMats .fm-n'); if(l.length) l[l.length-1].focus(); };
$('#pnSave').onclick=()=>{
  const title=$('#pnTitle').value.trim()||'Новый раскрой';
  const clean=formMats.map(m=>({name:(m.name||'').trim()})).filter(m=>m.name);
  if(!clean.length){ toast('Добавь хотя бы один материал'); return; }
  clean.forEach(m=>{ if(!DB.dirs.includes(m.name)) DB.dirs.unshift(m.name); });
  const shownKey=shownMonthKey();
  const rDate = shownKey===todayISO().slice(0,7) ? todayISO() : shownKey+'-01';
  const r={id:uid(),title,date:rDate,shop:'Цех 1',note:$('#pnNote').value,createdAt:Date.now(),
    materials:clean.map(m=>({id:uid(),name:m.name,size:'',qty:1,unit:m.name.includes('Кромка')?'м.п.':m.name.includes('Фурнитура')?'компл.':'л',done:false,urgent:false,skip:false,assignee:''}))};
  DB.raskroi.unshift(r); save();
  $('#pNewModal').classList.add('hidden');
  currentId=r.id; renderList(); renderDetail();
};

// ---------- справочник ----------
function renderDir(){
  const box=$('#pMatDir'); box.innerHTML='';
  const list=DB.dirs.filter(n=>n.toLowerCase().includes(matQ.toLowerCase())).sort((a,b)=>a.localeCompare(b,'ru'));
  if(!list.length){ box.innerHTML='<div class="card">Справочник пуст. Добавь материал через поле выше — или он появится сам при сохранении раскроя.</div>'; return; }
  list.forEach(n=>{
    const d=document.createElement('div'); d.className='dir-row';
    d.innerHTML=`<div><b>${esc(n)}</b></div><div class="mat-x"><button title="Удалить из справочника">×</button></div>`;
    d.querySelector('button').onclick=()=>{ DB.dirs=DB.dirs.filter(x=>x!==n); save(); renderDir(); };
    box.appendChild(d);
  });
}
$('#pMatSearch').oninput=e=>{ matQ=e.target.value; renderDir(); };
$('#pNewMatBtn').onclick=()=>{ const v=$('#pNewMat').value.trim(); if(!v) return; if(!DB.dirs.includes(v)) DB.dirs.unshift(v); $('#pNewMat').value=''; save(); renderDir(); };

// ---------- аккаунты ----------
function renderAcc(){
  const box=$('#pAccList'); box.innerHTML='';
  const me=curAcc();
  DB.accounts.forEach(a=>{
    const d=document.createElement('div'); d.className='card';
    d.innerHTML=`<div class="card-top"><div style="display:flex;align-items:center;gap:10px"><span class="acc-dot" style="background:${a.color}" title="Сменить цвет"></span><b>${esc(a.name)}</b>${a.id===me.id?'<span class="me-badge">Я</span>':''}</div><div style="display:flex;align-items:center;gap:6px"><button class="btn acc-edit" title="Редактировать">✏️</button><span class="mat-x"><button class="acc-del" title="Удалить">×</button></span></div></div>
      ${a.desc?`<div class="acc-desc">${esc(a.desc)}</div>`:''}`;
    d.querySelector('.acc-dot').onclick=e=>{
      e.stopPropagation();
      const i=PALETTE.indexOf(a.color);
      a.color=PALETTE[(i+1)%PALETTE.length]; save(); rerender();
    };
    d.querySelector('.acc-edit').onclick=e=>{ e.stopPropagation(); openAccEdit(a.id); };
    d.querySelector('.acc-del').onclick=e=>{
      e.stopPropagation();
      if(DB.accounts.length<=1){ toast('Должен остаться хотя бы один'); return; }
      DB.accounts=DB.accounts.filter(x=>x.id!==a.id);
      if(myId()===a.id) setMyId(DB.accounts[0].id);
      save(); rerender();
    };
    d.onclick=()=>{ setMyId(a.id); rerender(); toast('Пилишь как '+a.name); };
    box.appendChild(d);
  });
}
let editAccId=null;
function openAccEdit(id){
  const a=DB.accounts.find(x=>x.id===id); if(!a) return;
  editAccId=id;
  $('#pAccName').value=a.name; $('#pAccDesc').value=a.desc||'';
  $('#pAccModal').classList.remove('hidden');
  setTimeout(()=>$('#pAccName').focus(),120);
}
$('#pAccCancel').onclick=()=>$('#pAccModal').classList.add('hidden');
$('#pAccSave').onclick=()=>{
  const a=DB.accounts.find(x=>x.id===editAccId); if(!a) return;
  const n=$('#pAccName').value.trim();
  if(!n){ toast('Введи имя'); return; }
  a.name=n; a.desc=$('#pAccDesc').value.trim();
  save(); $('#pAccModal').classList.add('hidden'); rerender();
};
$('#pNewAccBtn').onclick=()=>{
  const v=$('#pNewAcc').value.trim();
  if(!v){ toast('Введи имя аккаунта'); $('#pNewAcc').focus(); return; }
  const used=DB.accounts.map(a=>a.color);
  const color=PALETTE.find(c=>!used.includes(c))||PALETTE[DB.accounts.length%PALETTE.length];
  DB.accounts.push({id:uid(),name:v,desc:'',color});
  setMyId(DB.accounts[DB.accounts.length-1].id);
  $('#pNewAcc').value=''; save(); rerender();
};

// ---------- фирменные попапы ----------
let paResolve=null;
function amShow({title,text,input,value,okText,suggest}){
  return new Promise(res=>{
    paResolve=res;
    $('#paTitle').textContent=title||'';
    $('#paText').textContent=text||'';
    $('#paText').classList.toggle('hidden',!text);
    const inp=$('#paInput');
    if(input){ inp.classList.remove('hidden'); inp.value=value||''; inp.oninput=suggest?renderPromptSuggest:null; inp.onfocus=suggest?renderPromptSuggest:null; }
    else inp.classList.add('hidden');
    $('#paCancel').classList.toggle('hidden',!input&&!text);
    $('#paOk').textContent=okText||'ОК';
    $('#pAppModal').classList.remove('hidden');
    if(input){ $('#paSuggest').innerHTML=''; if(suggest) renderPromptSuggest(); setTimeout(()=>inp.focus(),120); }
  });
}
$('#paCancel').onclick=()=>{ $('#pAppModal').classList.add('hidden'); if(paResolve){paResolve(null);paResolve=null;} };
$('#paOk').onclick=()=>{ const inp=$('#paInput'); const v=inp.classList.contains('hidden')?true:inp.value; $('#pAppModal').classList.add('hidden'); if(paResolve){paResolve(v);paResolve=null;} };
$('#pAppModal').addEventListener('click',e=>{ if(e.target.id==='pAppModal'){ $('#pAppModal').classList.add('hidden'); if(paResolve){paResolve(null);paResolve=null;} } });
const appConfirm=(title,text,okText)=>amShow({title,text,okText}).then(v=>v===true);
const appPrompt=(title,def,suggest)=>amShow({title,input:true,value:def,suggest});
function renderPromptSuggest(){
  const box=$('#paSuggest'); if(!box) return;
  const inp=$('#paInput');
  const q=(inp.value||'').toLowerCase();
  const items=DB.dirs.filter(n=>n.toLowerCase().includes(q)).sort((a,b)=>a.localeCompare(b,'ru')).slice(0,7);
  box.innerHTML='';
  items.forEach(n=>{
    const b=document.createElement('button'); b.type='button'; b.textContent=n;
    b.onmousedown=e=>{ e.preventDefault(); inp.value=n; box.innerHTML=''; inp.focus(); };
    box.appendChild(b);
  });
}
let toastT=null;
function toast(msg){ const t=$('#pToast'); t.textContent=msg; t.classList.remove('hidden'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.add('hidden'),2200); }

// ---------- тема ----------
function applyTheme(t){
  const dark=t==='dark';
  document.body.classList.toggle('dark',dark);
  $('#pTheme').textContent=dark?'☀️ Светлая тема':'🌙 Тёмная тема';
  try{localStorage.setItem('raskroi_theme',t);}catch{}
}
$('#pTheme').onclick=()=>applyTheme(document.body.classList.contains('dark')?'light':'dark');

// init
saveLocal(); renderMe(); renderList(); renderDir();
applyTheme(localStorage.getItem('raskroi_theme')||'light');
pullState(); setInterval(()=>{ if(!document.hidden) pullState(); }, CLOUD?5000:3000);
if('serviceWorker' in navigator){
  const updSW=()=>{ try{ navigator.serviceWorker.getRegistration().then(r=>{ if(r) r.update().catch(()=>{}); }); }catch{} };
  setInterval(updSW, 60*60*1000);
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden) updSW(); });
}
