/* practice.js - Mini-OSCE practice screen. Numbers only: no questions are stored in the app.
   Data (sessions, totals, reviewed marks) lives in the Firebase field "qb" and its helpers are in core.js.
   Peds groups come from QBG in data-pd.js. IM groups are the data block just below. */

/* ---- IM groups: add one line per group, nothing else to change. ----
   id = lowercase letters/digits, unique across Peds and IM, never change it once saved
   n = name shown   t = number of questions in the qbank (editable later in the app)
   topics = exact names of IM topics from data-im.js (one name, or two+ to share one practice record)
   Example: {id:'imcard',n:'Cardiology',t:40,topics:['Heart failure']}, */
const QBG_IM=[
];
QBG_IM.forEach(g=>{g.w='im';g.keys=[];g.topics.forEach(nm=>{let f='';DATA.forEach(s=>s.topics.forEach((t,i)=>{if(!f&&t[0]===nm)f='im:'+s.key+'-'+i}));if(f&&!QBMAP[f]){g.keys.push(f);QBMAP[f]=g}else console.warn('qbank map (IM): topic missing or already mapped:',nm)});if(QBGK[g.id])console.warn('qbank map: duplicate group id',g.id);else QBGK[g.id]=g});
const QBALL=()=>QBG.concat(QBG_IM),qbGroups=w=>QBALL().filter(g=>g.w===w&&g.keys.length);
const qbHidden=()=>{try{return localStorage.getItem('qb_hide')==='1'}catch(e){return false}};
let _qs=null,_qw='pd',_qm='g',_qq=null,_qqG='';

(function(){const s=document.createElement('style');s.textContent=`
#qbs{position:fixed;inset:0;z-index:8900;background:var(--paper);color:var(--ink);overflow-y:auto;-webkit-overflow-scrolling:touch}
.qbi{max-width:560px;margin:0 auto;padding:0 12px calc(env(safe-area-inset-bottom,0px) + 28px)}
.qbh{position:sticky;top:0;z-index:1;background:var(--paper);padding:calc(env(safe-area-inset-top,0px) + 10px) 0 8px}
.qbt{display:flex;justify-content:space-between;align-items:center;font-size:1.05rem}
.qbx2{font:inherit;border:0;background:transparent;color:inherit;min-width:40px;min-height:40px;cursor:pointer;font-size:1rem;opacity:.7}
.qbc{display:flex;gap:8px;align-items:center;justify-content:space-between;margin-top:2px}
.qbseg{display:flex;border:1px solid var(--card-border);border-radius:99px;overflow:hidden}
.qbseg button,.qbrv{font:inherit;font-size:.8rem;font-weight:600;border:0;background:transparent;color:inherit;padding:8px 14px;min-height:36px;cursor:pointer;touch-action:manipulation}
.qbseg button.on{background:#2aa7c9;color:#fff}
.qbrv{border:1px solid var(--card-border);border-radius:99px}
.qbs{font-size:.78rem;opacity:.7;margin-top:8px}
.qbr{display:block;width:100%;text-align:left;font:inherit;color:inherit;background:transparent;border:0;border-bottom:1px solid var(--card-border);padding:9px 0;cursor:pointer;touch-action:manipulation}
.qbr1{display:flex;align-items:center;justify-content:space-between;gap:10px}
.qbn{font-size:.9rem;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.qbl2{flex:none;font-size:.76rem;font-weight:700;color:#fff;background:#c9895e;border-radius:99px;padding:7px 13px;min-height:32px;display:inline-flex;align-items:center}
.qbr2{display:flex;gap:10px;font-size:.72rem;opacity:.75;margin-top:3px;flex-wrap:wrap}
.qbr2 .w{color:#d2675a;font-weight:700;opacity:1}
.qbf{margin-top:16px;font-size:.7rem;opacity:.65;line-height:1.5}
.qbf button{font:inherit;font-size:.74rem;background:transparent;border:1px solid var(--card-border);border-radius:99px;color:inherit;padding:7px 12px;min-height:34px;cursor:pointer;margin-bottom:8px}
.qbem{padding:26px 0;text-align:center;font-size:.84rem;opacity:.65}
#qbq{position:fixed;inset:0;z-index:9100;background:rgba(0,0,0,.45);display:flex;align-items:flex-start;justify-content:center;padding:calc(env(safe-area-inset-top,0px) + 8px) 10px 10px}
.qbc2{background:var(--paper);color:var(--ink);border:1px solid var(--card-border);border-radius:18px;padding:12px 14px;width:min(400px,100%);display:flex;flex-direction:column;gap:8px}
.qbq1{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
.qbm2{font-size:.72rem;opacity:.7;margin-top:1px}
.qbm2 button{font:inherit;font-size:.72rem;background:transparent;border:0;color:#d2675a;cursor:pointer;padding:4px 2px;text-decoration:underline}
.qbin{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.qbin label{font-size:.72rem;opacity:.9}
.qbin input{display:block;width:100%;box-sizing:border-box;margin-top:3px;font:inherit;font-size:20px;font-weight:700;text-align:center;padding:8px;border-radius:12px;border:1px solid var(--card-border);background:transparent;color:inherit}
.qbcalc{font-size:.8rem;min-height:1.2em}
.qbsave{font:inherit;font-weight:700;border:0;border-radius:12px;background:#c9895e;color:#fff;min-height:46px;cursor:pointer;font-size:.95rem}
.qbfoot{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:.72rem;opacity:.8}
.qbfoot button{font:inherit;font-size:.72rem;background:transparent;border:0;color:inherit;text-decoration:underline;cursor:pointer;padding:6px 2px}
.qbfoot input{width:70px;font:inherit;font-size:16px;padding:4px 6px;border-radius:8px;border:1px solid var(--card-border);background:transparent;color:inherit}
.qbx{position:relative;display:inline-block;text-decoration:underline;cursor:pointer}
.qbx input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
.rcw{display:flex;flex-direction:column;gap:8px;min-width:0}
.qbm{border:1px solid var(--card-border);border-radius:16px;padding:8px 6px;text-align:center}
.qbmb{display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer}
.qbmb svg{width:38px;height:38px;flex:none}
.qbmb b{display:block;font-size:.78rem}
.qbmb span{display:block;font-size:.64rem;opacity:.75;line-height:1.35}
.qbmh{font:inherit;font-size:.62rem;background:transparent;border:0;color:inherit;opacity:.55;text-decoration:underline;cursor:pointer;padding:4px 8px;min-height:26px}
@media (min-width:600px){.qbmb{flex-direction:row;text-align:left;gap:10px;padding:0 6px}.qbm{text-align:left}.qbmb span{font-size:.72rem}.qbmb b{font-size:.9rem}}
`;document.head.appendChild(s)})();

const qbPct=(c,n)=>n?Math.round(c/n*100):null;
/* weakest first; a group needs at least 5 questions done before it counts as weak (sorted and flagged) */
function qbRows(w){const R=qbGroups(w).map((g,i)=>{const s=qbStat(g);return{g,s,i,rev:qbRev(g),pc:qbPct(s.c,s.n),ok:s.n>=5}});
 return R.sort((a,b)=>(b.ok-a.ok)||(a.ok&&b.ok?(a.pc-b.pc)||a.i-b.i:(b.s.n>0)-(a.s.n>0)||a.i-b.i))}
function qbChip(k){const g=QBMAP[k];if(!g)return'';const s=qbStat(g);return `<button class="dtag qtag" onclick="qbQuick('${g.id}')" title="Mini-OSCE · ${escH(g.n)}. Tap to log a session">Q ${s.n}/${s.tot}</button>`}
function qbTagW(k){const c=qbChip(k);return c?'<span class="tags">'+c+'</span>':''}

/* ---------- the practice screen ---------- */
function qbOpenScreen(w){closeMenu();hideT();qbClose();_qw=w==='im'?'im':'pd';_qm='g';const S=document.createElement('div');S.id='qbs';S.setAttribute('data-modal','');document.body.appendChild(S);_qs=S;qbPaint();S.scrollTop=0}
function qbClose(){qbQClose();if(_qs){_qs.remove();_qs=null}}
function qbSw(w){_qw=w;_qm='g';qbPaint()}
function qbMode(){_qm=_qm==='g'?'r':'g';qbPaint();if(_qs)_qs.scrollTop=0}
function qbPaint(){const S=_qs;if(!S)return;const R=qbRows(_qw);let done=0,cor=0,rev=0;R.forEach(r=>{done+=r.s.n;cor+=r.s.c;rev+=r.rev});const keep=S.scrollTop;
 const rowHtml=r=>`<button class="qbr" onclick="qbQuick('${r.g.id}')"><div class="qbr1"><span class="qbn">${escH(r.g.n)}</span><span class="qbl2">+ Log</span></div><div class="qbr2"><span>${r.s.n>r.s.tot?'↺ ':''}${r.s.n}/${r.s.tot}</span><span${r.ok&&r.pc<60?' class="w"':''}>${r.pc===null?'–':r.pc+'%'}</span>${r.rev?`<span>${r.rev} to review</span>`:''}</div></button>`;
 const revHtml=r=>`<div class="qbr" style="cursor:default"><div class="qbr1"><span class="qbn">${escH(r.g.n)}</span><button class="qbl2" style="border:0;font-family:inherit" onclick="qbMark('${r.g.id}')">Mark reviewed</button></div><div class="qbr2"><span><b>${r.rev}</b> wrong to review</span></div></div>`;
 let body;if(!R.length)body=`<div class="qbem">No ${WL(_qw)} question groups yet.${_qw==='im'?'<br>Add them in the IM data block at the top of practice.js.':''}</div>`;
 else if(_qm==='r'){const L=R.filter(r=>r.rev).sort((a,b)=>b.rev-a.rev);body=L.length?L.map(revHtml).join(''):'<div class="qbem">Nothing to review.</div>'}
 else body=R.map(rowHtml).join('');
 const sum=_qm==='r'?`<b>${rev}</b> wrong ${rev===1?'answer':'answers'} still to review`:`${done}/${R.reduce((a,r)=>a+r.s.tot,0)} done${done?` · ${qbPct(cor,done)}% correct`:''}${rev?` · ${rev} to review`:''}`;
 S.innerHTML=`<div class="qbi"><div class="qbh"><div class="qbt"><b>Mini-OSCE</b><button class="qbx2" onclick="qbClose()" aria-label="Close">✕</button></div>
<div class="qbc"><div class="qbseg"><button class="${_qw==='pd'?'on':''}" onclick="qbSw('pd')">Peds</button><button class="${_qw==='im'?'on':''}" onclick="qbSw('im')">IM</button></div><button class="qbrv" onclick="qbMode()">${_qm==='r'?'← Groups':'Review'+(rev?' · '+rev:'')}</button></div><div class="qbs">${sum}</div></div>
${body}<div class="qbf">${_qm==='r'?'Marking reviewed only clears this list. Your accuracy and ratings do not change.<br>':''}<button onclick="qbHideOv()">${qbHidden()?'Show on Overview':'Hide on Overview'}</button><br>Practice does not count toward your streak, weekly goal, finished counts or daily pace. Weak = under 60% with at least 5 done.</div></div>`;S.scrollTop=keep}

/* ---------- quick-log sheet ---------- */
function qbQuick(gid){const g=QBGK[gid];if(!g)return;qbQClose();_qqG=gid;const W=document.createElement('div');W.id='qbq';W.setAttribute('data-modal','');W.onclick=e=>{if(e.target===W)qbQClose()};const t=today();
 W.innerHTML=`<div class="qbc2"><div class="qbq1"><div style="min-width:0"><b>${escH(g.n)}</b><div class="qbm2" id="qqS"></div></div><button class="qbx2" onclick="qbQClose()" aria-label="Close">✕</button></div>
<div class="qbin"><label>Done<input id="qqN" type="number" inputmode="numeric" pattern="[0-9]*" min="1" max="9999" enterkeyhint="next" oninput="qbQCalc()" onkeydown="if(event.key==='Enter'){event.preventDefault();const w=document.getElementById('qqW');w.focus();w.select()}"></label><label>Wrong<input id="qqW" type="number" inputmode="numeric" pattern="[0-9]*" min="0" max="9999" value="0" enterkeyhint="done" oninput="qbQCalc()" onfocus="this.select()" onkeydown="if(event.key==='Enter'){event.preventDefault();qbQSave()}"></label></div>
<div class="qbcalc" id="qqC"></div><button class="qbsave" onclick="qbQSave()">Save</button>
<div class="qbfoot"><label class="qbx"><span id="qqDl">Today</span><input id="qqD" type="date" max="${t}" value="${t}" onchange="qbQDate(this)"></label><span id="qqT"></span></div></div>`;
 document.body.appendChild(W);_qq=W;qbQInfo();qbQCalc();const n=W.querySelector('#qqN');if(n)n.focus()}
function qbQClose(){if(_qq){_qq.remove();_qq=null}}
function qbQInfo(){const g=QBGK[_qqG];if(!g||!_qq)return;const s=qbStat(g),last=s.L[s.L.length-1];
 _qq.querySelector('#qqS').innerHTML=`${s.n>s.tot?'↺ ':''}${s.n}/${s.tot} done${s.n?` · ${qbPct(s.c,s.n)}% correct`:''}${last?`<br>Last: ${qbDate(last.d)}, ${last.c}/${last.n} <button onclick="qbQUndoLast('${last.id}')">Remove</button>`:''}`;
 _qq.querySelector('#qqT').innerHTML=`Qbank total <b>${s.tot}</b> <button onclick="qbQTot()">Edit</button>`}
function qbQCalc(){if(!_qq)return;const n=_qq.querySelector('#qqN').value.trim(),w=_qq.querySelector('#qqW').value.trim(),e=_qq.querySelector('#qqC');
 if(!/^\d{1,4}$/.test(n)||+n<1){e.textContent='';return}
 if(!/^\d{1,4}$/.test(w||'0')){e.textContent='';return}
 const c=+n-(+w||0);e.innerHTML=c<0?'<span style="color:#d2675a">Wrong can’t be more than done</span>':`Correct <b>${c}</b> · ${qbPct(c,+n)}%`}
function qbQDate(el){el.defaultValue=el.value;const l=_qq&&_qq.querySelector('#qqDl');if(l)l.textContent=el.value===today()?'Today':qbDate(el.value)}
function qbQTot(){const g=QBGK[_qqG];if(!g||!_qq)return;const e=_qq.querySelector('#qqT');e.innerHTML=`Qbank total <input id="qqTi" type="number" inputmode="numeric" min="1" max="9999" value="${qbTot(g)}" onchange="qbQTotSet(this.value)">`;const i=e.querySelector('input');i.focus();i.select()}
function qbQTotSet(v){if(qbSetTot(_qqG,v))qbQInfo();else{const i=_qq&&_qq.querySelector('#qqTi');if(i)i.value=qbTot(QBGK[_qqG])}}
function qbQUndoLast(id){qbDel(id);qbQInfo()}
function qbQSave(){const g=QBGK[_qqG];if(!g||!_qq)return;const n=_qq.querySelector('#qqN').value.trim(),w=(_qq.querySelector('#qqW').value.trim()||'0'),d=_qq.querySelector('#qqD').value||today();
 if(!/^\d{1,4}$/.test(n)||+n<1){toast('Enter how many you did');return}
 if(!/^\d{1,4}$/.test(w)){toast('Wrong must be a number');return}
 if(+w>+n){toast('Wrong can’t be more than done');return}
 if(!RXD.test(d)){toast('Pick a valid date');return}
 if(d>today()){toast('A session can’t be in the future');return}
 const gid=g.id;qbQClose();qbAdd(gid,d,+n,+n-+w)}

/* ---------- Overview: small Mini-OSCE circle under each progress circle ---------- */
function qbHideOv(){try{localStorage.setItem('qb_hide',qbHidden()?'0':'1')}catch(e){}window._vs={};renderAll();qbPaint()}
function qbRc(w,x){const m=qbMini(w);return m?'<div class="rcw">'+x+m+'</div>':x}
function qbMini(w){if(qbHidden())return'';const G=qbGroups(w);if(!G.length)return'';let tot=0,done=0,cap=0,cor=0,rev=0,rem=0;
 G.forEach(g=>{const s=qbStat(g);tot+=s.tot;done+=s.n;cap+=Math.min(s.n,s.tot);cor+=s.c;rev+=qbRev(g);rem+=Math.max(0,s.tot-s.n)});
 const p=tot?Math.min(100,Math.round(cap/tot*100)):0,t=today();let pace;
 if(!cfg.exam)pace=`<label class="qbx" onclick="event.stopPropagation()">Set exam date<input type="date" onchange="setExam(this.value)"></label>`;
 else if(!rem)pace='All done';
 else if(cfg.exam<=t)pace=cfg.exam===t?'Exam today':'Exam date passed';
 else{let d=0;const R=restSet();for(let x=t;x<cfg.exam&&d<2000;x=addDays(x,1))if(!R.has(x))d++;pace=d?Math.ceil(rem/d)+' q/day':'No free days'}
 return `<div class="qbm"><div class="qbmb" onclick="qbOpenScreen('${w}')" role="button" aria-label="Open Mini-OSCE practice"><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15" fill="none" stroke="#8883" stroke-width="4"/><circle cx="18" cy="18" r="15" fill="none" stroke="#2aa7c9" stroke-width="4" stroke-linecap="round" stroke-dasharray="${(p*.9425).toFixed(1)} 94.25" transform="rotate(-90 18 18)"/></svg><div><b>${done}/${tot}</b><span>Mini-OSCE</span><span>${done?qbPct(cor,done)+'% correct':'no sessions yet'}</span><span>${pace}</span><span>${rev} to review</span></div></div><button class="qbmh" onclick="qbHideOv()">Hide</button></div>`}

/* undo for every practice change */
qbAdd=withU(qbAdd,'Practice logged');qbDel=withU(qbDel,'Session removed');qbSetTot=withU(qbSetTot,'Total updated');qbMark=withU(qbMark,'Marked as reviewed');
/* keep an open screen and the row chips in step with the data */
{const _r=renderAll;renderAll=function(){const r=_r.apply(this,arguments);try{if(_qs)qbPaint()}catch(e){console.warn(e)}return r}}
