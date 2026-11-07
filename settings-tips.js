/* settings-tips.js - Settings screen and the tips. Loaded by index.html in a fixed order; do not reorder. */
/* --- settings screen --- */
let SO={acct:true,app:true,gaps:true,plans:false,tips:false,bk:false,rst:false};
const setT=k=>{SO[k]=!SO[k];window._sgNew=SO[k]?k:'';renderSet()};
const sg=(k,ic,title,body)=>{const n=window._sgNew===k;return `<section class="card sgrp" data-sec="${k}"><button class="sgh" onclick="setT('${k}')" aria-expanded="${!!SO[k]}">${I(ic,18)}<b>${title}</b><span>${SO[k]?I('down',16):I('right',16)}</span></button>${SO[k]?'<div class="sgb'+(n?' new':'')+'">'+body+'</div>':''}</section>`};
const sr=(ic,t,c,h)=>`<div class="srow">${I(ic,18)}<div class="st"><span>${t}</span>${h?'<small>'+h+'</small>':''}</div>${c}</div>`;
function renderSet(){const el=document.getElementById('v-set');if(!el)return;const sf=!!localStorage.getItem('im_bnb_safety');
 const html=`<div class="sethead"><button class="btn" onclick="show('ov')">${I('left',16)} Overview</button><h2>Settings</h2></div>`
 +sg('acct','user','Account',sr('mail','Signed in as',`<span class="mail">${escH(window._email||'')}</span>`))
 +sg('app','palette','Appearance',sr('cal','Date picker',`<button class="btn" onclick="setDp()">${cfg.dp==='app'?'In-app calendar':'iOS native'}</button>`,'iOS native or the built-in calendar')+sr('layers','Liquid glass',`<button class="btn" onclick="setGlass()">${cfg.glass===false?'Off':'On'}</button>`)+sr('film','Animations',`<button class="btn" onclick="setAnim()">${cfg.anim===false?'Off':'On'}</button>`))
 +sg('gaps','clock','Review gaps',sr('repeat','First review after',`<span class="gi"><input type="number" min="1" value="${cfg.r1}" onchange="setCfg('r1',this.value)"> days</span>`)+sr('repeat','Second review after',`<span class="gi"><input type="number" min="1" value="${cfg.r2}" onchange="setCfg('r2',this.value)"> days</span>`)+sr('star','Rating-based gaps',`<button class="btn" onclick="setSmart()">${cfg.smart===false?'Off':'On'}</button>`,'Use your confident / shaky / weak rating to set the gap'))
 +sg('cal','cal','Calendar',sr('cal','Calendar app',calProvSel(),'Used when you add your plans to a calendar')+sr('cal','Export plans',`<button class="btn" onclick="openCal()">Export…</button>`,'Times, length and reminders are set there')) +sg('plans','list','Plan tools',plansBody())
 +sg('tips','bulb','Tips and guidance',sr('eye','Show tips',`<button class="btn" onclick="toggleTips()">${cfg.tipsOff?'Off':'On'}</button>`,'Short pointers to features and gestures (like swiping between screens) you have not used yet')+sr('repeat','Show tips again',`<button class="btn" onclick="resetTips()">Reset</button>`))
 +sg('bk','save','Backup',sr('file','Backup file',`<span style="display:flex;gap:6px"><button class="btn" onclick="exportData()">Export</button><button class="btn" onclick="importPick()">Import</button></span><input type="file" id="impF" accept="application/json,.json" hidden onchange="importData(this)">`)+sr('undo','Safety copy',sf?'<button class="btn" onclick="restoreSafety()">Restore</button>':'<button class="btn" disabled>Restore</button>',sf?'Saved before your last import':'None yet. One is saved automatically before each import.'))
 +sg('rst','trash','Reset progress',sr('alert','Erase progress',`<button class="btn" style="color:#d9534f" onclick="askReset()">Reset…</button>`,'Asks you to type IM, BB or PEDS first'))
 +`<div class="card" style="margin:12px 0">${sr('print','Print / Save as PDF','<button class="btn" onclick="window.print()">Print</button>').replace('border-top:1px solid var(--card-border)','')}</div>`;
 el.innerHTML=html;window._sgNew=''}
function toggleTips(){cfg.tipsOff=!cfg.tipsOff;saveKey('tipsOff')}
function resetTips(){cfg.tipsSeen={};cfg.tipsOff=false;if(docRef)docRef.set({settings:{tipsSeen:firebase.firestore.FieldValue.delete(),tipsOff:false}},{merge:true}).catch(()=>{});hideTip();renderAll();toast('Tips will show again');schedTip()}
/* --- tips --- */
const TIPS=[
{id:'search',v:'*',sel:'#topbar [aria-label="Search topics"]',t:'Search',x:'Find any lecture or video. Typos and abbreviations like MI or COPD work.'},
{id:'swipe',v:'ov',m:1,sel:'.dbtn',t:'Menu and swiping',x:'Tap this arrow, or swipe right, for Settings and Sign out. Swipe left and right to move between Overview, IM and B&B.'},
{id:'streak',v:'*',sel:'#topbar .streak',t:'Your streak',x:'Study something each day to build your streak.'},
{id:'freeze',v:'*',sel:'#topbar .snow',t:'Freeze a day',x:'Need a day off? Freeze it to keep your streak alive.',u:()=>(cfg.rest||[]).length>0},
{id:'pace',v:'ov',sel:'[data-tip=pace]',t:'Exam pace',x:'Set your exam date to see your daily pace, then use Auto-plan to fill your calendar.',u:()=>!!cfg.exam},
{id:'ai',v:'ov',sel:'[data-tip=ai]',t:'Plan with AI',x:'Export your topics, let an AI build a plan, and import it back.'},
{id:'goal',v:'ov',sel:'[data-tip=goal]',t:'Weekly goal',x:'Aim for a number of study days each week. You can change it with − and ＋.'},
{id:'heat',v:'ov',sel:'[data-sec=heat]',t:'Heatmap',x:'See what you finished each day. Tap a day for details, and use the arrows to go back in time.'},
{id:'menu',v:'im',sel:'#v-im .rm',t:'More actions',x:'Tap ⋯ to add a topic to your plan or pause it.',u:()=>Object.keys(plans).length>0||Object.keys(sp).length>0},
{id:'date',v:'im',sel:'#v-im .c-date',t:'Date studied',x:'Add the day you studied it. Your reviews are scheduled from this date.',u:()=>Object.values(state).some(x=>x&&x.date)},
{id:'rating',v:'im',sel:'#v-im .c-rate',t:'Rate it',x:'Green = confident, yellow = shaky, red = weak. Weaker topics come back sooner.',u:()=>Object.values(state).some(x=>x&&x.rating)},
{id:'reviews',v:'im',sel:'#v-im .c-r1',t:'Reviews',x:'Tick R1 and R2 when you have done your reviews.',u:()=>Object.values(state).some(x=>x&&x.r1)},
{id:'move',v:'im',sel:'#v-im .sc button',t:'Move a system',x:'Use ⋯ on a system to move it to the top or bottom, or pause the whole system.',u:()=>Object.keys(ord).length>0},
{id:'pause',v:'im',sel:'#v-im .pzb',t:'Pause a list',x:'Not studying IM right now? Pause the whole list. Your own pauses come back when you resume.',u:()=>!!(cfg.pz&&(cfg.pz.im||cfg.pz.bb))},
{id:'gaps',v:'set',sel:'[data-sec=gaps]',t:'Review gaps',x:'Choose how many days until your first and second review.'},
{id:'look',v:'set',sel:'[data-sec=app]',t:'Appearance',x:'Choose the date picker, liquid glass and animations.',u:()=>!!cfg.dp||cfg.glass===false||cfg.anim===false},
{id:'backup',v:'set',sel:'[data-sec=bk]',t:'Backup',x:'Export a backup file, or restore one. A safety copy is kept before every import.'}];
let _tipT=0,_tipEl=null,_tipId='',_lastAct=0;
['pointerdown','keydown','touchmove','scroll'].forEach(ev=>addEventListener(ev,()=>{_lastAct=Date.now();if(_tipEl&&ev==='scroll')tipPos()},{passive:true,capture:true}));
const tipBusy=()=>{const a=document.activeElement;return !!(window._lay||document.querySelector('[data-modal],#sov,#rmenu,#drawer.open')||(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&a.type!=='checkbox'))};
const tipVis=el=>{if(!el)return false;const r=el.getBoundingClientRect(),b=innerWidth<1000?96:8;return r.width>0&&r.top>2&&r.bottom<innerHeight-b&&r.left>=0&&r.right<=innerWidth};
function schedTip(){clearTimeout(_tipT);_tipT=setTimeout(maybeTip,1500)}
function maybeTip(){if(_tipEl||cfg.tipsOff||!docRef||!document.body.classList.contains('authed'))return;if(Date.now()-_lastAct<900||tipBusy()){schedTip();return}
 const seen=Object.assign({},cfg.tipsSeen||{});let q=false;let pick=null;
 for(const T of TIPS){if(seen[T.id])continue;if(T.v!=='*'&&T.v!==cur&&!(T.v==='im'&&cur==='pd'))continue;if(T.m&&innerWidth>=1000)continue;if(T.u&&T.u()){seen[T.id]=1;q=true;continue}const el=document.querySelector(cur==='pd'?T.sel.replace('#v-im','#v-pd'):T.sel);if(!tipVis(el))continue;pick=[T,el];break}
 if(q){cfg.tipsSeen=seen;try{docRef.set({settings:{tipsSeen:seen}},{merge:true})}catch(e){}}
 if(pick)showTip(pick[0],pick[1])}
function showTip(T,el){hideTip(true);const d=document.createElement('div');d.id='tip';d.setAttribute('role','status');d.innerHTML=`<b>${T.t}</b><p>${T.x}</p><div class="tb"><button class="tg" onclick="tipGot()">Got it</button><button class="tg alt" onclick="tipSkip()">Skip all tips</button></div><i class="tc"></i>`;document.body.appendChild(d);_tipEl=d;_tipId=T.id;d._T=T;tipPos();requestAnimationFrame(()=>d.classList.add('in'))}
function tipPos(){const d=_tipEl;if(!d)return;const el=document.querySelector(d._T.sel);if(!tipVis(el)){hideTip();return}const r=el.getBoundingClientRect(),w=Math.min(290,innerWidth-16);d.style.width=w+'px';const h=d.offsetHeight,below=r.bottom+h+14<innerHeight-(innerWidth<1000?96:8),top=below?r.bottom+12:r.top-h-12;let left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2));if(top<8){hideTip();return}d.style.top=top+'px';d.style.left=left+'px';d.dataset.pos=below?'b':'a';d.style.setProperty('--cx',Math.max(14,Math.min(w-14,r.left+r.width/2-left))+'px')}
function hideTip(now){const d=_tipEl;_tipEl=null;if(!d)return;if(now||document.documentElement.classList.contains('anim-off')){d.remove();return}d.classList.remove('in');setTimeout(()=>d.remove(),200)}
function tipGot(){const id=_tipId;hideTip();cfg.tipsSeen=Object.assign({},cfg.tipsSeen||{},{[id]:1});if(docRef)docRef.set({settings:{tipsSeen:cfg.tipsSeen}},{merge:true}).catch(()=>{});schedTip()}
function tipSkip(){hideTip();cfg.tipsOff=true;saveKey('tipsOff')}
setInterval(()=>{if(_tipEl&&(tipBusy()||!tipVis(document.querySelector(_tipEl._T.sel))))hideTip()},700);
const _rt3=renderTop;renderTop=function(){_rt3();try{const e=document.getElementById('navEmail');if(e)e.textContent=window._email||'';if(window._ping){window._ping=0;const b=document.querySelector('#topbar .snow.on');if(b&&!document.documentElement.classList.contains('anim-off')){b.classList.add('ping')}}schedTip()}catch(x){}};
