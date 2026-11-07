/* state.js - settings, saving and loading your data, sign-in, per-topic state. Loaded by index.html in a fixed order; do not reorder. */
const normDoc=n=>String(n||'').replace(/[‘’`´']/g,'’').replace(/^\s*dr\.?\s+/i,'').replace(/\s+/g,' ').trim(),dk=n=>normDoc(n).toLowerCase().replace(/[’.]/g,''),_cn={};PDATA.forEach(x=>x.topics.forEach(t=>{const k=dk(t[2]);if(!_cn[k])_cn[k]=normDoc(t[2])}));
/* old names still resolve to the new doctors; 'hadeel' is deliberately NOT an alias of Samah Al-Jabour */
const ALIAS={'samah':'Samah Al-Jabour','abd al-hadi':'Abd Al-Hadi Al-Zaben','amjad tar':'Areej','mohammad':'Hadeel'},LEG={'areej':'amjad tar','hadeel':'mohammad'};
const canon=n=>{n=normDoc(n);if(!n)return'Unknown';let k=dk(n);const al=(cfg.pdn&&(cfg.pdn[k]||cfg.pdn[LEG[k]]))||ALIAS[k];if(al){n=normDoc(al);k=dk(n)}return _cn[k]||(_cn[k]=n)},docOf=(t,id)=>canon((cfg.pdoc&&cfg.pdoc[id])||t[2]),docList=()=>{const o=[];PDATA.forEach(x=>x.topics.forEach((t,i)=>{const d=docOf(t,x.key+'-'+i);if(!o.includes(d))o.push(d)}));const c={};PDATA.forEach(x=>x.topics.forEach((t,i)=>{const d=docOf(t,x.key+'-'+i);c[d]=(c[d]||0)+1}));return o.sort((a,b)=>a==='Unknown'?1:b==='Unknown'?-1:(c[b]-c[a])||a.localeCompare(b))};
const ALLIM = DATA.concat(PDATA);

const STORAGE_KEY = "im_checklist_state_v1";   // only used to import old local progress once

/* ------------------------------------------------------------------
   Firebase: email/password sign-in + one Firestore document per user
   (users/{uid}) holding { state: { "resp-0": {done,date,r1,r2,rating}, ... } }.
   Each topic is written on its own, so two devices editing different topics never
   overwrite each other, and onSnapshot keeps every signed-in device up to date.
------------------------------------------------------------------ */
const firebaseConfig = {
  apiKey: "AIzaSyByXD57Kv-PbWDRxyL-q1Y9IpOmdy2VmtA",
  authDomain: "my-checklist-3bf89.firebaseapp.com",
  projectId: "my-checklist-3bf89",
  storageBucket: "my-checklist-3bf89.firebasestorage.app",
  messagingSenderId: "353624106717",
  appId: "1:353624106717:web:f87c33dfb6f9e225ac1d34"
};

let state = {};
let auth = null, db = null, docRef = null, unsubscribe = null, firstSnapshot = true;

function cleanTopic(e){
  e = e || {};
  const r = Number(e.rating);
  return {
    done: e.done === true,
    date: (typeof e.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(e.date)) ? e.date : "",
    r1: e.r1 === true,
    r2: e.r2 === true,
    r1d: (typeof e.r1d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(e.r1d)) ? e.r1d : "",
    r2d: (typeof e.r2d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(e.r2d)) ? e.r2d : "",
    rating: (r === 1 || r === 2 || r === 3) ? r : 0
  };
}
function cleanState(raw){
  const out = {};
  if(!raw || typeof raw !== "object") return out;
  ALLIM.forEach(sys=>sys.topics.forEach((t,i)=>{
    const id = `${sys.key}-${i}`;
    if(raw[id]) out[id] = cleanTopic(raw[id]);
  }));
  return out;
}

function setSync(kind){
  if(kind==="saving" && navigator.onLine===false){ kind="offline"; window._offPend=true; } else if(kind==="synced"){ window._offPend=false; }
  const el = document.getElementById("syncStatus");
  const map = {
    synced:["☁️ Synced", false], saving:["☁️ Saving…", false],
    offline:["☁️ Offline — will sync when back online", false],
    error:["⚠️ Sync failed", true], "":["", false]
  };
  const m = map[kind] || map[""];
  el.textContent = m[0];
  el.classList.toggle("err", m[1]);
}

/* ---------- login screen ---------- */
let AM='in';
const escH=x=>String(x==null?'':x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function showLogin(msg){msg=msg||window._flash||'';document.body.classList.remove("authed");setSync("");drawAuth(msg)}
function setAM(m){const e=document.getElementById('loginEmail');window._em=e?e.value:window._em;AM=m;drawAuth();return false}
function drawAuth(msg){const up=AM==='up',fg=AM==='forgot';
 document.getElementById("systems").innerHTML=`<form class="login" id="authF" onsubmit="return doAuth(event)" novalidate><div class="appname">📋 Study Checklist<small>IM · Pediatrics · Boards &amp; Beyond</small></div><div><b>${fg?'Reset your password':up?'Create your account':'Sign in to open your checklist'}</b></div>
<input id="loginEmail" type="email" name="email" placeholder="Email" autocomplete="${up?'email':'username'}" autocapitalize="off" autocorrect="off" inputmode="email" value="${escH(window._em||(()=>{try{return localStorage.getItem('lastEmail')||''}catch(e){return ''}})())}">
${fg?'':`<div class="pw"><input id="loginPass" type="password" name="password" placeholder="Password" autocomplete="${up?'new-password':'current-password'}"><button type="button" onclick="togglePw()" aria-label="Show or hide password">👁</button></div>`}
${up?'<input id="loginPass2" type="password" name="password2" placeholder="Confirm password" autocomplete="new-password"><div class="hint">At least 8 characters, with a letter and a number. A new account starts empty.</div>':''}
${fg?'':`<label class="rem"><input type="checkbox" id="remMe" ${remPref()?'checked':''}> Remember me on this device</label>`}
<button id="loginBtn" type="submit">${fg?'Send reset email':up?'Create account':'Sign in'}</button>
${AM==='in'?'<a href="#" onclick="return setAM(\'forgot\')">Forgot password?</a>':''}
<a href="#" onclick="return setAM('${AM==='in'?'up':'in'}')">${AM==='in'?'No account? Sign up':'Back to sign in'}</a>
<div class="msg" id="loginMsg" role="status">${msg||''}</div></form>`}
function togglePw(){['loginPass','loginPass2','rp1','rp2'].forEach(i=>{const e=document.getElementById(i);if(e)e.type=e.type==='password'?'text':'password'})}
function authErr(c){return c==='auth/invalid-credential'||c==='auth/wrong-password'?'Wrong email or password.':c==='auth/user-not-found'?'No account found for that email.':c==='auth/email-already-in-use'?'That email already has an account. Try signing in.':c==='auth/weak-password'?'Password is too weak. Use at least 8 characters with a letter and a number.':c==='auth/invalid-email'?"That email address doesn't look right.":c==='auth/network-request-failed'?'No internet connection. Try again.':c==='auth/too-many-requests'?'Too many attempts. Wait a few minutes and try again.':c==='auth/operation-not-allowed'?'Creating accounts is switched off for this app.':'Something went wrong ('+(c||'unknown')+'). Try again.'}
async function doAuth(ev){if(ev)ev.preventDefault();window._flash='';const email=document.getElementById('loginEmail').value.trim(),pe=document.getElementById('loginPass'),pw=pe?pe.value:'',p2=document.getElementById('loginPass2'),msg=document.getElementById('loginMsg'),btn=document.getElementById('loginBtn');window._em=email;
 if(btn.disabled)return false;if(!email||!/^\S+@\S+\.\S+$/.test(email)){msg.textContent="Enter a valid email address.";return false}
 if(AM!=='forgot'&&!pw){msg.textContent='Enter your password.';return false}
 if(AM==='up'){if(pw.length<8||!/[A-Za-z]/.test(pw)||!/\d/.test(pw)){msg.textContent='Use at least 8 characters with a letter and a number.';return false}if(pw!==p2.value){msg.textContent="The two passwords don't match.";return false}}
 const lab=btn.textContent;btn.disabled=true;btn.textContent='Please wait…';msg.textContent='';
 try{if(AM!=='forgot'){const rm=document.getElementById('remMe'),rem=rm?rm.checked:true;try{localStorage.setItem('rememberMe',rem?'1':'0')}catch(e){}try{await auth.setPersist(rem)}catch(e){}}
  if(AM==='in')await auth.signInWithEmailAndPassword(email,pw);else if(AM==='up')await auth.createUserWithEmailAndPassword(email,pw);
  else{try{await auth.sendPasswordResetEmail(email)}catch(e){if(e.code!=='auth/user-not-found')throw e}msg.innerHTML='If that email has an account, a reset email is on its way.<br><b>Check your junk or spam folder too.</b> If it is there, open it and tap “Not junk” (or “Mark as safe”) so the link works and future emails reach your inbox.';btn.disabled=false;btn.textContent=lab;return false}}
 catch(e){msg.textContent=authErr(e&&e.code);btn.disabled=false;btn.textContent=lab}try{if(AM!=='forgot')localStorage.setItem('lastEmail',email)}catch(e){}return false}
function wipeLocal(){state={};bb={};plans={};sp={};ord={};colm={};cfg={r1:3,r2:10};try{LAST=null}catch(e){}try{localStorage.removeItem('im_bnb_safety');localStorage.removeItem('tab');if(typeof STORAGE_KEY!=='undefined')localStorage.removeItem(STORAGE_KEY)}catch(e){}['v-ov','systems','bbSystems','pdSystems'].forEach(i=>{const e=document.getElementById(i);if(e)e.innerHTML=''});window._sig=''}
function showFatal(text){
  document.getElementById("systems").innerHTML =
    '<div class="state-msg">⚠️ ' + text + '<br><button onclick="location.reload()">Reload</button></div>';
}
async function signOut(){if(!auth||!confirm('Sign out of '+(window._email||'your account')+'?'))return;window._explicit=1;try{await auth.signOut();try{localStorage.removeItem('wasSignedIn')}catch(e){}}catch(e){window._explicit=0;toast('Could not sign out. Try again.')}}
/* ---------- sync ---------- */
function startSync(user){
  wipeLocal();window._email=user.email||'';window._uid=user.uid;
  firstSnapshot = true;
  docRef = db.collection("users").doc(user.uid);
  document.getElementById("systems").innerHTML = '<div class="state-msg">☁️ Loading your checklist…</div>';
  unsubscribe = docRef.onSnapshot(snap=>{
    const pending = snap.metadata.hasPendingWrites;
    // A not-yet-confirmed empty cache read is not "no data": wait for the server.
    if(!snap.exists && snap.metadata.fromCache && firstSnapshot) return;

    if(!snap.exists && firstSnapshot){
      // brand-new account: import any progress previously saved in this browser, once
      let old = {};
      
      if(Object.keys(old).length){
        state = old;
        docRef.set({ state: old }).catch(()=>setSync("error"));
      }
    }else{
      const remote = cleanState(snap.data() && snap.data().state);
      if(JSON.stringify(remote) !== JSON.stringify(state) || firstSnapshot) state = remote;
    }
    const D=snap.data()||{}; bb=D.bb||{}; sp=D.sp||{}; migrateSp(); ord=D.ord||{}; colm=D.col||{}; plans=D.plans||{};{const st=Object.keys(plans).filter(id=>!(plans[id]&&TI[plans[id].t]));if(st.length){st.forEach(id=>delete plans[id]);if(!window._stPurged&&docRef){window._stPurged=1;const F=firebase.firestore.FieldValue,u={};st.forEach(id=>u[id]=F.delete());docRef.set({plans:u},{merge:true}).catch(()=>{})}}}; cfg=Object.assign({r1:3,r2:10},D.settings||{}); if(cfg.theme)applyTheme(cfg.theme);applyFx();
    firstSnapshot = false;
    document.body.classList.add("authed");
    {const sg=JSON.stringify([state,bb,plans,sp,ord,colm,cfg]);if(sg!==window._sig)renderAll()}
    setSync(pending ? "saving" : (snap.metadata.fromCache && !navigator.onLine ? "offline" : "synced"));
  }, err=>{
    if(firstSnapshot) showFatal("Couldn't load your checklist. Check your connection and Firestore rules.");
    setSync("error");
  });
}
function stopSync(){window._sig='';
  if(unsubscribe){ unsubscribe(); unsubscribe = null; }
  docRef = null; state = {};
}

window.addEventListener("offline", ()=>{ if(docRef) setSync("offline"); });
window.addEventListener("online",  ()=>{ if(docRef) setSync(window._offPend ? "saving" : "synced"); });

function getTopicState(id){
  return state[id] || { done:false, date:"", r1:false, r2:false, rating:0 };
}
function setTopicState(id, patch){
  if(!docRef) return;const cur=getTopicState(id);
  if(patch.date===''&&cur.done&&patch.done!==false){toast('A finished topic needs a date. Untick it first, or pick another date.');renderAll();return}
  if(patch.done===false)patch.date='';
  if(patch.done===true&&!cur.date&&!patch.date)patch.date=today();
  if(patch.r1===true&&!cur.r1)patch.r1d=today();if(patch.r1===false)patch.r1d='';
  if(patch.r2===true&&!cur.r2)patch.r2d=today();if(patch.r2===false)patch.r2d='';
  const ask=patch.done===true&&!cur.done?'d':patch.r1===true&&!cur.r1?'r1':patch.r2===true&&!cur.r2?'r2':'';
  state[id] = Object.assign(cur, patch);if(ask)dateToast('im',id,ask);
  renderAll();
  setSync("saving");
  docRef.set({ state: { [id]: cleanTopic(state[id]) } }, { merge:true })
    .catch(()=>setSync("error"));
}
