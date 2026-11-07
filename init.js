/* init.js - start-up, password reset, Firebase start, offline registration. Loaded by index.html in a fixed order; do not reorder. */
setupNav();
try{show((t=>['ov','im','bb','pd'].includes(t)?t:'ov')(localStorage.getItem('tab')))}catch(e){show('ov')}

(()=>{const q=new URLSearchParams(location.search);if(q.get('mode')==='resetPassword'&&q.get('oobCode'))window._reset={code:q.get('oobCode')}})();
const PWRULE='At least 8 characters, with a letter and a number.';
async function showReset(){document.body.classList.remove('authed');setSync('');const box=document.getElementById('systems');if(window._resetOK){drawReset();return}box.innerHTML='<div class="state-msg">Checking your reset link…</div>';
 try{window._resetEmail=await auth.verifyPasswordResetCode(window._reset.code);window._resetOK=1;drawReset()}catch(e){const c=e&&e.code;box.innerHTML='<div class="login"><div class="appname">📋 Study Checklist<small>IM · Pediatrics · Boards &amp; Beyond</small></div><div><b>Reset link problem</b></div><div class="msg">'+(c==='auth/expired-action-code'?'This reset link has expired. Request a new one with “Forgot password?”.':c==='auth/invalid-action-code'?'This reset link was already used or is not valid. Request a new one with “Forgot password?”.':authErr(c))+'</div><button onclick="leaveReset()">Back to sign in</button></div>'}}
function drawReset(){document.getElementById('systems').innerHTML=`<form class="login" onsubmit="return doReset(event)" novalidate><div class="appname">📋 Study Checklist<small>IM · Pediatrics · Boards &amp; Beyond</small></div><div><b>Choose a new password</b></div><div class="hint">for ${escH(window._resetEmail)}</div><input type="text" name="username" autocomplete="username" value="${escH(window._resetEmail)}" hidden><div class="pw"><input id="rp1" type="password" placeholder="New password" autocomplete="new-password"><button type="button" onclick="togglePw()" aria-label="Show or hide password">👁</button></div><input id="rp2" type="password" placeholder="Confirm new password" autocomplete="new-password"><div class="hint">${PWRULE}</div><button id="rpBtn" type="submit">Save new password</button><div class="msg" id="rpMsg" role="status"></div></form>`}
async function doReset(ev){if(ev)ev.preventDefault();const a=document.getElementById('rp1').value,b=document.getElementById('rp2').value,m=document.getElementById('rpMsg'),btn=document.getElementById('rpBtn');if(btn.disabled)return false;
 if(a.length<8||!/[A-Za-z]/.test(a)||!/\d/.test(a)){m.textContent='Use at least 8 characters with a letter and a number.';return false}if(a!==b){m.textContent="The two passwords don't match.";return false}
 btn.disabled=true;btn.textContent='Please wait…';m.textContent='';
 try{await auth.confirmPasswordReset(window._reset.code,a);window._flash='Password changed ✓ Sign in with your new password.';try{await auth.signOut()}catch(e){}leaveReset(window._flash)}
 catch(e){const c=e&&e.code;btn.disabled=false;btn.textContent='Save new password';if(c==='auth/expired-action-code'||c==='auth/invalid-action-code'){window._resetOK=0;showReset();return false}m.textContent=authErr(c)}return false}
function leaveReset(msg){window._reset=null;window._resetOK=0;try{history.replaceState(null,'',location.pathname)}catch(e){}AM='in';showLogin(msg)}
function showChecking(){document.body.classList.remove('authed');const b=document.getElementById('systems');if(b)b.innerHTML='<div class="state-msg" id="chk">Checking sign-in…</div>'}
function slowCheck(){const b=document.getElementById('systems');if(!b||document.body.classList.contains('authed'))return;b.innerHTML='<div class="login"><div class="appname">📋 Study Checklist</div><div class="msg">Still checking your sign-in. This can take a moment on a slow connection or when the phone is waking up. You have not been signed out.</div><button onclick="showChecking();clearTimeout(window._chkT);window._chkT=setTimeout(slowCheck,8000)">Keep waiting</button><a href="#" onclick="return goSignIn()">Go to sign-in</a></div>'}
function goSignIn(){clearTimeout(window._chkT);showLogin();return false}
function doSignedOut(){const lost=!window._explicit&&(()=>{try{return localStorage.getItem('wasSignedIn')==='1'}catch(e){return false}})();window._explicit=0;try{localStorage.removeItem('wasSignedIn')}catch(e){}wipeLocal();window._email='';window._uid='';AM='in';window._em='';showLogin(lost?'Your saved sign-in was not found on this device. The browser may have cleared its storage. Please sign in again.':'')}
const remPref=()=>{try{return localStorage.getItem('rememberMe')!=='0'}catch(e){return true}};
function initFB(){
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  try{ db.enablePersistence({ synchronizeTabs:true }).catch(()=>{}); }catch(e){}   // offline queue
  let first=true;
  window._chkT=setTimeout(slowCheck,8000);
  auth.onAuthStateChanged(user=>{
    clearTimeout(window._chkT);clearTimeout(window._grace);stopSync();if(window._reset){showReset();return}
    if(user){first=false;try{if(localStorage.getItem('rememberMe')!=='0')localStorage.setItem('wasSignedIn','1')}catch(e){}startSync(user);return}
    if(first){first=false;showChecking();window._grace=setTimeout(doSignedOut,1500);return}
    doSignedOut()});
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
}
if(window.firebase)initFB();else{addEventListener("fbready",initFB,{once:true});setTimeout(()=>{if(!window.firebase)showFatal("Couldn't load Firebase. Check your connection.")},12000)}
if('serviceWorker' in navigator)addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})});
