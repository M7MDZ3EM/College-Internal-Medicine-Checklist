/* nav.js - bottom bar and side menu, pill, swipe between tabs, sheets. Loaded by index.html in a fixed order; do not reorder. */
function setupNav(){IC.baby='<circle cx="12" cy="7" r="3.5"/><path d="M5 21c.8-4.5 3.6-7 7-7s6.2 2.5 7 7"/>';const nav=document.querySelector('.tabs');if(!nav||nav.dataset.ok)return;nav.dataset.ok=1;
 const lab={'t-ov':['home','Overview'],'t-im':['book','IM'],'t-bb':['vid','B&B'],'t-pd':['baby','Peds'],'t-s':['search','Search']};
 nav.querySelectorAll('button').forEach(b=>{const l=lab[b.id];if(l){b.innerHTML='<span class="ti">'+I(l[0],20)+'</span><span class="tl">'+l[1]+'</span>';if(b.id==='t-s'){b.style.minWidth='0'}}});
 nav.querySelectorAll('#t-s .tl').forEach(e=>e.classList.add('tls'));
 ['ov','im','bb','pd'].forEach(v=>{const b=document.getElementById('t-'+v);if(b){b.removeAttribute('onclick');b.addEventListener('click',()=>tabTap(v))}});nav.insertAdjacentHTML('beforeend','<span class="pill" aria-hidden="true"></span>');
 nav.insertAdjacentHTML('afterbegin','<button class="wo navtoggle" id="navTog" onclick="toggleNav()" aria-label="Collapse side navigation" title="Collapse"></button>');
 nav.insertAdjacentHTML('beforeend','<div class="wo sep"></div><button class="wo" id="t-set" onclick="show(\'set\')"><span class="ti">'+I('gear',20)+'</span><span class="tl">Settings</span></button><button class="wo" onclick="signOut()"><span class="ti">'+I('logout',20)+'</span><span class="tl">Sign out</span></button><div class="wo navemail" id="navEmail"></div>');
 document.body.insertAdjacentHTML('beforeend','<div id="drawerBg" onclick="closeDrawer()"></div><aside id="drawer" role="dialog" aria-label="Menu" aria-hidden="true"><div class="dh"><b>Menu</b><button id="drawerX" aria-label="Close menu">'+I('x',18)+'</button></div><div class="de" id="drawerEmail"></div><button class="di" type="button" aria-label="Open Settings" onclick="goSettings()">'+I('gear',18)+' Settings</button><button class="di" type="button" aria-label="Sign out of your account" onclick="closeDrawer();signOut()">'+I('logout',18)+' Sign out</button></aside>');
 let c=false;try{c=localStorage.getItem('navc')==='1'}catch(e){}document.documentElement.classList.toggle('navc',c);navArrow()}
function navArrow(){const b=document.getElementById('navTog');if(b)b.innerHTML=I(document.documentElement.classList.contains('navc')?'right':'left',18)}
function toggleNav(){const h=document.documentElement;h.classList.toggle('navc');try{localStorage.setItem('navc',h.classList.contains('navc')?'1':'0')}catch(e){}navArrow()}
const goSettings=()=>{closeDrawer();show('set')};
(()=>{
const $=id=>document.getElementById(id),ORDER=['ov','im','bb','pd'],D=()=>$('drawer'),BG=()=>$('drawerBg');
let lay=null,x=0,vx=0,raf=0,open=false,st=null,noclick=0,pend=null,kk=320;
const anim=()=>!document.documentElement.classList.contains('anim-off'),authed=()=>document.body.classList.contains('authed'),DW=()=>Math.min(innerWidth*.75,340);
const PS=window._PS={};Object.defineProperty(window,'_lay',{get:()=>lay,configurable:true});
addEventListener('scroll',()=>{if(!lay&&!window._pgq)PS[cur]=scrollY},{passive:true});
const renderView=v=>{if(v==='im'){_ri();fillJump('im')}else if(v==='pd'){renderPD();fillJump('pd')}else if(v==='bb'){renderBB();fillJump('bb')}else if(v==='set')renderSet();else renderOV()};
const rgb=c=>(c.match(/[\d.]+/g)||[0,0,0]).slice(0,3).map(Number),mix=(a,b,t)=>'rgb('+a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',')+')';
/* layers: the current page and its neighbour become fixed layers that are moved only with transform */
const clip=(el,top)=>{el.style.clipPath='inset('+Math.max(0,lay.stage-top)+'px 0 0 0)'};
const fix=(el,top)=>{const s=el.style;el.classList.add('pg');s.position='fixed';s.top=top+'px';s.left=lay.left+'px';s.width=lay.w+'px';s.margin='0';s.zIndex='5';s.willChange='transform';clip(el,top)};
const unfix=el=>{if(!el)return;el.classList.remove('pg');const s=el.style;['position','top','left','width','margin','zIndex','willChange','transform','clipPath'].forEach(k=>s[k]='')};
function engage(){if(lay)return;const A=$('v-'+cur),r=A.getBoundingClientRect(),Y=scrollY;PS[cur]=Y;lay={A,Y,top:r.top,left:r.left,w:r.width,stage:Math.max(0,r.top),B:null,Bv:'',Bs:0,mh:document.body.style.minHeight,drawer:false,pill:null};
 document.body.style.minHeight=document.documentElement.scrollHeight+'px';fix(A,r.top);document.documentElement.classList.add('dragging');if(window.hideTip)hideTip(true);pillOn()}
const sigNow=()=>JSON.stringify([state,bb,plans,sp,ord,colm,cfg]),fresh=v=>(window._vs||{})[v]===sigNow(),mark=v=>{(window._vs=window._vs||{})[v]=sigNow()};
let pt=0;window._schedPre=()=>{clearTimeout(pt);pt=setTimeout(function f(){if(lay||st||raf||Date.now()-_lastAct<700){pt=setTimeout(f,900);return}if(innerWidth>=1000||!authed())return;const c=[neighbor(1),neighbor(-1)].filter(v=>v&&!fresh(v));if(!c.length)return;renderView(c[0]);mark(c[0]);pt=setTimeout(f,500)},2000)};
function attachTo(v){if(lay.Bv===v)return;detachB();const B=$('v-'+v);if(!fresh(v)){renderView(v);mark(v)}fix(B,0);const docTop=lay.top+lay.Y,pad=parseFloat(getComputedStyle(document.body).paddingBottom)||96,maxS=Math.max(0,docTop+B.offsetHeight+pad-innerHeight),Sb=Math.min(PS[v]||0,maxS),top=docTop-Sb;B.style.top=top+'px';clip(B,top);lay.B=B;lay.Bv=v;lay.Bs=Sb;if(lay.pill)lay.pill.b1=$('t-'+v)}
function detachB(){if(!lay||!lay.B)return;unfix(lay.B);lay.B=null;lay.Bv='';if(lay.pill)lay.pill.b1=null}
const neighbor=sign=>{const i=ORDER.indexOf(cur);if(cur==='set')return sign>0?'ov':'';const j=i-sign;return j>=0&&j<ORDER.length?ORDER[j]:''};
const rb=d=>{const W=lay.w,a=Math.abs(d);return Math.sign(d)*(1-1/(a/(W*.6)+1))*W*.3};
/* bottom bar pill that travels with the finger */
function pillOn(){const T=document.querySelector('.tabs');if(!T||innerWidth>=1000)return;const p=T.querySelector('.pill'),b=$('t-'+cur);if(!p||!b)return;const cs=getComputedStyle(b),btns=ORDER.map(v=>$('t-'+v)),off=btns.find(e=>e!==b),bg=cs.backgroundColor,bd=cs.border,sh=cs.boxShadow,br=cs.borderRadius,c0=rgb(cs.color),c1=off?rgb(getComputedStyle(off).color):c0;
 p.style.cssText='display:block;left:'+b.offsetLeft+'px;top:'+b.offsetTop+'px;width:'+b.offsetWidth+'px;height:'+b.offsetHeight+'px;background:'+bg+';border:'+bd+';box-shadow:'+sh+';border-radius:'+br;
 const tr=T.getBoundingClientRect().left,labs=btns.map(e=>{const lb=e&&e.querySelector('.tl');if(!lb)return null;const r=lb.getBoundingClientRect();return {lb,lL:r.left-tr,lw:r.width}});
 lay.pill={p,T,btns,labs,b0:b,b1:null,c0,c1,l0:b.offsetLeft,w0:b.offsetWidth};T.classList.add('pgd')}
function pillProg(pr){const P=lay&&lay.pill;if(!P)return;const bt=P.b1||P.b0,l=P.l0+(bt.offsetLeft-P.l0)*pr,w=P.w0+(bt.offsetWidth-P.w0)*pr,r=l+w;P.p.style.left=l+'px';P.p.style.width=w+'px';
 const on='rgb('+P.c0.join(',')+')',off='rgb('+P.c1.join(',')+')';P.labs.forEach(q=>{if(!q)return;const a=Math.max(0,Math.min(q.lw,l-q.lL)),z=Math.max(a,Math.min(q.lw,r-q.lL)),st=q.lb.style;st.backgroundImage='linear-gradient(90deg,'+off+' 0,'+off+' '+a+'px,'+on+' '+a+'px,'+on+' '+z+'px,'+off+' '+z+'px,'+off+' 100%)';st.webkitBackgroundClip='text';st.backgroundClip='text';st.webkitTextFillColor='transparent';st.color='transparent'})}
function pillOff(L){const P=L&&L.pill;if(!P)return;const T=P.T;T.classList.add('nt');T.classList.remove('pgd');P.p.style.cssText='';P.labs.forEach(q=>{if(!q)return;const st=q.lb.style;st.backgroundImage='';st.webkitBackgroundClip='';st.backgroundClip='';st.webkitTextFillColor='';st.color=''});void T.offsetWidth;requestAnimationFrame(()=>requestAnimationFrame(()=>T.classList.remove('nt')))}
/* side menu */
function drawerPos(vis){const d=D(),b=BG();if(!d)return;const W=DW();d.classList.add('open');document.documentElement.classList.toggle('menu-open',vis>2);d.style.transition='none';b.style.transition='none';d.style.transform='translateX('+(vis-W)+'px)';const pr=Math.max(0,Math.min(1,vis/W));b.style.opacity=pr;b.style.pointerEvents=pr>.02?'auto':'none'}
function hideDrawer(){const d=D(),b=BG();if(!d)return;document.documentElement.classList.remove('menu-open');d.classList.remove('open','drag');d.style.transform='translateX(-110%)';d.setAttribute('aria-hidden','true');b.style.opacity=0;b.style.pointerEvents='none'}
function apply(){if(!lay)return;const W=lay.w;if(lay.drawer){const vis=Math.max(0,Math.min(DW(),x));lay.A.style.transform='translateX('+vis+'px)';drawerPos(vis);return}
 let ax=x;if(lay.B)lay.B.style.transform='translateX('+(x+(x<0?W:-W))+'px)';else ax=rb(x);lay.A.style.transform='translateX('+ax+'px)';pillProg(Math.min(1,Math.abs(x)/W))}
function unlay(){if(!lay)return;const L=lay;lay=null;pillOff(L);unfix(L.B);unfix(L.A);document.body.style.minHeight=L.mh;document.documentElement.classList.remove('dragging');x=0;vx=0;kk=320;window.scrollTo(0,L.Y)}
function flushPend(){const q=pend;pend=null;kk=320;if(q&&q!==cur&&!lay)tabTap(q)}
const endCancel=()=>{unlay();flushPend()};
function finishTo(v){const L=lay;lay=null;pillOff(L);unfix(L.A);unfix(L.B);document.body.style.minHeight=L.mh;document.documentElement.classList.remove('dragging');x=0;vx=0;window._pgq=1;try{show(v)}finally{window._pgq=0}window.scrollTo(0,L.Bs);PS[v]=L.Bs;kk=320;flushPend()}
function closedDrawer(){open=false;hideDrawer();unlay()}
function openedDrawer(){open=true;const d=D();d.setAttribute('aria-hidden','false');const e=$('drawerEmail');if(e)e.textContent=window._email||''}
function run(target,v0,done){cancelAnimationFrame(raf);raf=0;vx=v0||0;if(!anim()){x=target;apply();if(done)done();return}let last=performance.now();const step=t=>{const dt=Math.min(.032,(t-last)/1000);last=t;const k=kk,c=2*Math.sqrt(k);vx+=(-k*(x-target)-c*vx)*dt;x+=vx*dt;apply();if(Math.abs(x-target)<.4&&Math.abs(vx)<10){x=target;apply();raf=0;if(done)done();return}raf=requestAnimationFrame(step)};raf=requestAnimationFrame(step)}
window._abortLay=()=>{cancelAnimationFrame(raf);raf=0;st=null;pend=null;kk=320;if(!lay)return;if(open||lay.drawer){closedDrawer()}else unlay()};
window.openDrawer=()=>{if(!authed()||innerWidth>=1000)return;if(open&&lay&&lay.drawer)return;if(lay&&!lay.drawer)return;engage();lay.drawer=true;x=0;apply();run(DW(),0,openedDrawer)};
window.closeDrawer=q=>{if(!open&&!(lay&&lay.drawer))return;if(q||!anim()){cancelAnimationFrame(raf);raf=0;closedDrawer();return}open=false;run(0,0,closedDrawer)};
window.toggleDrawer=()=>(open&&!raf)?closeDrawer():openDrawer();
window.tabTap=v=>{
 if(lay&&!lay.drawer&&raf&&!st){const dest=lay.goal==='commit'?lay.Bv:cur;if(v===dest){pend=null;return}
  if(v===cur&&lay.goal==='commit'){pend=null;lay.goal='cancel';run(0,vx,endCancel);return}
  pend=v;kk=640;return}
 if(lay||!authed()||innerWidth>=1000||!anim()||v===cur||ORDER.indexOf(cur)<0||ORDER.indexOf(v)<0){show(v);return}
 engage();attachTo(v);x=0;apply();lay.goal='commit';const dirn=ORDER.indexOf(v)>ORDER.indexOf(cur)?-1:1;run(dirn*lay.w,0,()=>finishTo(v))};
/* where a swipe may start */
const blocked=t=>{if(!t||!t.closest)return true;if(t.closest('textarea,select,[contenteditable],[data-modal],#sov,#rmenu,#tip,.tabs,#toTop,.jump,.sc,.rm,[data-sec=heat],.cal,[type=range],.sheet'))return true;const inp=t.closest('input');if(inp){const ty=(inp.type||'text').toLowerCase();if(!/^(checkbox|radio|date|button|submit)$/.test(ty)||document.activeElement===inp)return true}for(let e=t;e&&e!==document.body;e=e.parentElement){const cs=getComputedStyle(e);if((cs.overflowX==='auto'||cs.overflowX==='scroll')&&e.scrollWidth>e.clientWidth+2)return true}return false};
const selActive=()=>{try{return String(getSelection()).length>0}catch(e){return false}},kbdUp=()=>{const a=document.activeElement;return !!((a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&!/^(checkbox|button|radio)$/.test(a.type))||(window.visualViewport&&visualViewport.height<innerHeight*.75))};
const vel=h=>h.length>1?(h[h.length-1][0]-h[0][0])/Math.max(1,h[h.length-1][1]-h[0][1])*1000:0;
const gStart=(px,py,t)=>{if(st||innerWidth>=1000||!authed()||!t||!t.closest)return;
 if(raf&&lay){if(t.closest('.tabs'))return;pend=null;kk=320;cancelAnimationFrame(raf);raf=0;st={x:px,y:py,mode:'drag',base:x,take:true,dx:0,dy:0,h:[[px,performance.now()]]};return}
 if(open){if(!(t.closest('#drawer')||t.id==='drawerBg'))return}else if(blocked(t)||selActive()||kbdUp())return;
 st={x:px,y:py,mode:'',base:open?x:0,dx:0,dy:0,h:[[px,performance.now()]]}};
function neighborFor(){if(lay.drawer&&open)return;const sign=x<0?-1:1;if(Math.abs(x)<1)return;const v=neighbor(sign);if(v){if(lay.drawer){lay.drawer=false;hideDrawer()}attachTo(v)}else{detachB();if(cur==='ov'&&sign>0){lay.drawer=true}else if(lay.drawer){lay.drawer=false;hideDrawer()}}}
const gMove=(px,py,e)=>{if(!st)return;const dx=px-st.x,dy=py-st.y;st.dx=dx;st.dy=dy;
 if(!st.mode){if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)*1.5){if(open&&dx>0){st=null;return}st.mode='drag';engage();if(open)lay.drawer=true;st.base=open?x:0}else if(Math.abs(dy)>10){st=null;return}}
 if(st&&st.mode==='drag'){x=st.base+dx;neighborFor();apply();st.h.push([px,performance.now()]);if(st.h.length>6)st.h.shift();if(e&&e.cancelable)e.preventDefault()}};
function releaseTo(v){if(!lay)return;const W=lay.w;
 if(lay.drawer){const DWf=DW(),vis=Math.max(0,Math.min(DWf,x)),o=(vis>DWf*.5&&v>-500)||v>500;run(o?DWf:0,v,o?()=>{lay.drawer=true;openedDrawer()}:closedDrawer);return}
 if(lay.B){const dirn=x<0?-1:1,mv=Math.abs(x),same=Math.sign(v)===dirn,far=(mv>W*.35&&(Math.abs(v)<300||same))||(Math.abs(v)>500&&same&&mv>24),Bv=lay.Bv;if(far){lay.goal='commit';run(dirn*W,v,()=>finishTo(Bv));return}}
 lay.goal='cancel';run(0,v,endCancel)}
function settle(ab){if(!st)return;const s2=st;st=null;if(s2.mode!=='drag'||!lay)return;if(ab===true&&!s2.take){if(s2.base>0){if(lay.drawer)run(DW(),0,()=>{openedDrawer()});else unlay()}else if(lay.drawer){run(0,0,closedDrawer)}else{lay.goal='cancel';run(0,0,endCancel)}return}
 noclick=Date.now();releaseTo(ab===true?0:vel(s2.h))}
window._drawerSettle=()=>settle(true);
document.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;gStart(e.clientX,e.clientY,e.target)},true);
document.addEventListener('pointermove',e=>gMove(e.clientX,e.clientY,e),true);
document.addEventListener('pointerup',()=>settle(false),true);document.addEventListener('pointercancel',()=>settle(true),true);
document.addEventListener('touchstart',e=>{const t=e.touches[0];if(t)gStart(t.clientX,t.clientY,e.target)},{capture:true,passive:true});
document.addEventListener('touchmove',e=>{const t=e.touches[0];if(t)gMove(t.clientX,t.clientY,e)},{capture:true,passive:false});
document.addEventListener('touchend',()=>settle(false),{capture:true,passive:true});document.addEventListener('touchcancel',()=>settle(true),{capture:true,passive:true});
['blur','pagehide','orientationchange'].forEach(n=>addEventListener(n,()=>settle(true)));document.addEventListener('visibilitychange',()=>{if(document.hidden)settle(true)});
document.addEventListener('click',e=>{if(Date.now()-noclick<150){e.stopPropagation();e.preventDefault();return}const t=e.target;if(t.closest&&t.closest('#drawerX'))closeDrawer()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
addEventListener('resize',()=>{settle(true);if(lay&&!st&&!raf)window._abortLay();if(innerWidth>=1000)closeDrawer(true)});
setTimeout(hideDrawer,0)})();
/* --- freeze (rest days) --- */
const snowBtn=()=>`<button class="tt snow${restSet().has(today())?' on':''}" onclick="openFreeze()" aria-label="Freeze days" title="Freeze days (rest days)">${I('snow',18)}</button>`;
function frzBody(){const t=today(),m=t.slice(0,7),left=REST_MAX-restIn(m),on=restSet().has(t),done=!on&&!!studyCounts()[t],up=(cfg.rest||[]).filter(d=>d>=addDays(t,-7));
 return `<p style="margin:0 0 10px;font-size:.88rem;line-height:1.5">A frozen day is a rest day: it keeps your streak alive without you studying, and it does not add to the streak. You get <b>${REST_MAX} freezes per month</b> (you have <b>${left}</b> left this month). You can freeze today or a day ahead, but not a day you already studied or a day that has passed.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" ${done?'disabled':''} onclick="toggleRest()">${I('snow',15)} ${on?'Undo freeze today':'Freeze today'}</button><label class="btn">${I('cal',15)} Freeze another day<input type="date" onchange="toggleRest(this.value)"></label></div>${done?'<div style="margin-top:10px;font-size:.82rem;color:#3fa06a">You already studied today, so today counts and your streak is safe. No freeze is needed.</div>':''}${up.length?'<div style="margin-top:12px;font-size:.78rem;opacity:.7">Your recent and upcoming freezes</div><div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">'+up.map(d=>`<button class="btn" onclick="toggleRest('${d}')" title="Remove this freeze">${fmtD(d)} ${I('x',12)}</button>`).join('')+'</div>':'<div style="margin-top:10px;font-size:.78rem;opacity:.6">No freezes set yet.</div>'}`}
function sheet(id,title,body,small){closeSheet(id);const w=document.createElement('div');w.id=id;w.className='sheetbg';w.setAttribute('data-modal','');w.innerHTML=`<div class="sheet${small?' small':''}" role="dialog" aria-label="${title}"><div class="sh2"><b>${title}</b><button class="rm" aria-label="Close" data-x>${I('x',16)}</button></div><div class="sb2">${body}</div></div>`;w.addEventListener('click',e=>{if(e.target===w||e.target.closest('[data-x]'))closeSheet(id)});document.body.appendChild(w);const k=e=>{if(e.key==='Escape'){closeSheet(id);document.removeEventListener('keydown',k)}};document.addEventListener('keydown',k)}
function closeSheet(id){const w=document.getElementById(id);if(!w)return;if(document.documentElement.classList.contains('anim-off')){w.remove();return}w.classList.add('out');setTimeout(()=>w.remove(),180)}
const openFreeze=()=>sheet('frzSheet','Freeze days',frzBody(),true);
function frzRefresh(){const w=document.querySelector('#frzSheet .sb2');if(w)w.innerHTML=frzBody()}
const openAI=()=>sheet('aiSheet','Plan with AI',aiBody());
