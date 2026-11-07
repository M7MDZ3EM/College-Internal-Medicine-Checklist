import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,initializeAuth,indexedDBLocalPersistence,browserLocalPersistence,browserSessionPersistence,setPersistence,onAuthStateChanged,signInWithEmailAndPassword,signOut,createUserWithEmailAndPassword,sendPasswordResetEmail,verifyPasswordResetCode,confirmPasswordReset} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {initializeFirestore,persistentLocalCache,persistentMultipleTabManager,doc,onSnapshot,setDoc,updateDoc,deleteField} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
let app,db;
window.firebase={
  initializeApp:c=>{app=initializeApp(c)},
  auth:()=>{let a;try{a=initializeAuth(app,{persistence:[indexedDBLocalPersistence,browserLocalPersistence,browserSessionPersistence]})}catch(e){a=getAuth(app)}
  const LONG=[indexedDBLocalPersistence,browserLocalPersistence,browserSessionPersistence];
  return{setPersist:async(remember)=>{let err;for(const q of (remember?LONG:[browserSessionPersistence])){try{await setPersistence(a,q);return}catch(e){err=e}}throw err},currentUser:()=>a.currentUser,onAuthStateChanged:f=>onAuthStateChanged(a,f),signInWithEmailAndPassword:(e,p)=>signInWithEmailAndPassword(a,e,p),signOut:()=>signOut(a),createUserWithEmailAndPassword:(e,p)=>createUserWithEmailAndPassword(a,e,p),sendPasswordResetEmail:e=>sendPasswordResetEmail(a,e),verifyPasswordResetCode:c=>verifyPasswordResetCode(a,c),confirmPasswordReset:(c,p)=>confirmPasswordReset(a,c,p)}},
  firestore:Object.assign(()=>{db=db||initializeFirestore(app,{localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})});
    return{enablePersistence:()=>Promise.resolve(),collection:c=>({doc:id=>{const r=doc(db,c,id);return{
      onSnapshot:(ok,er)=>onSnapshot(r,{includeMetadataChanges:true},sn=>ok({exists:sn.exists(),data:()=>sn.data(),metadata:sn.metadata}),er),
      set:(x,o)=>setDoc(r,x,o||{}),update:x=>updateDoc(r,x)}}})}},{FieldValue:{delete:deleteField}})};
window.dispatchEvent(new Event('fbready'));
