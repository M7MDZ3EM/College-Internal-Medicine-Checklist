/* list-views.js - the IM, Peds and B&B list screens. Loaded by index.html in a fixed order; do not reorder. */
function ratingButtons(id, current){
  const opts = [["g","Confident"],["y","Shaky"],["r","Weak"]];
  return opts.map(([c,lab],i)=>{
    const active = current === (i+1) ? "active" : "";
    return `<button class="rd ${c} ${active}" onclick="setTopicState('${id}', {rating: ${current===(i+1)?0:(i+1)}})" title="${lab}" aria-label="Rate: ${lab}"><i></i></button>`;
  }).join("");
}

function renderAll(){
  const container = document.getElementById("systems");
  container.innerHTML = "";
  let totalDone = 0, totalCount = 0;

  ordered(DATA,'im').forEach(sys=>{
    const rows = sys.topics.map((t,i)=>{
      const id = `${sys.key}-${i}`;
      const st = getTopicState(id);
      if(!isOff('im:'+id)){ if(st.done) totalDone++; totalCount++; }
      const pillClass = t[1] === "Seminar" ? "pill seminar" : "pill";
      return `
        <tr data-tk="im:${id}" class="${st.done?'done':''} ${isOff('im:'+id)?'sp':''}">
          <td class="c-chk"><input type="checkbox" class="chk" aria-label="Mark done" ${st.done?'checked':''} onchange="setTopicState('${id}', {done:this.checked})"></td>
          <td class="topic-cell"><span class="tn">${t[0]}${planTag('im:'+id)}</span>${rowAct('im:'+id)}</td>
          <td class="c-type"><span class="${pillClass}">${t[1]}</span></td>
          <td class="c-date"><input type="date" aria-label="First pass date" max="${today()}" value="${st.date||''}" onchange="rowDate(this,'im','${id}')"></td>
          <td class="c-r1"><label class="rchip"><input type="checkbox" class="round-chk" ${st.r1?'checked':''} onchange="setTopicState('${id}', {r1:this.checked})" title="Round 1 review"><span>R1</span></label></td>
          <td class="c-r2"><label class="rchip"><input type="checkbox" class="round-chk" ${st.r2?'checked':''} onchange="setTopicState('${id}', {r2:this.checked})" title="Round 2 review"><span>R2</span></label></td>
          <td class="c-rate"><div class="rating">${ratingButtons(id, st.rating||0)}</div></td>
        </tr>`;
    }).join("");

    const act = sys.topics.map((t,i)=>i).filter(i=>!isOff('im:'+sys.key+'-'+i));
    const doneInSys = act.filter(i=>getTopicState(`${sys.key}-${i}`).done).length;
    const pct = act.length ? Math.round((doneInSys / act.length) * 100) : 0;

    container.innerHTML += `
      <section class="system-card ${isCol('im',sys.key)?'col':''} ${act.length?'':'sp'}" data-k="im:${sys.key}">
        <div class="system-head" style="background:${sys.pastel}">
          <div class="system-emoji">${sys.emoji}</div>
          <div class="system-title">
            <h2>${sys.name}</h2>
            <div class="sub">${[['Lecture','lectures'],['Seminar','seminars']].map(([y,w])=>sys.topics.filter((t,i)=>t[1]===y&&getTopicState(sys.key+'-'+i).done).length+'/'+sys.topics.filter(t=>t[1]===y).length+' '+w).join(' · ')}</div>
          </div>
          ${sysCtl('im',sys.key)}<div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${sys.accent}"></div></div>
          <div class="badge" style="background:${sys.accent}22; color:${sys.accent}">${doneInSys}/${act.length}${act.length<sys.topics.length?` <i class="of">(of ${sys.topics.length})</i>`:''} · ${pct}%</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:36px"></th>
              <th>Topic</th>
              <th style="width:90px">Type</th>
              <th style="width:150px">${I('cal',14)} First pass</th>
              <th style="width:60px; text-align:center">R1</th>
              <th style="width:60px; text-align:center">R2</th>
              <th style="width:100px">Rating</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>`;
  });

  {const A=DATA.reduce((a,x)=>a+x.topics.length,0);document.getElementById("overallNum").innerHTML = `${totalDone}/${totalCount}`+(totalCount<A?` <i class="of">(of ${A})</i>`:'');}
  const overallPct = totalCount ? Math.round((totalDone/totalCount)*100) : 0;
  document.getElementById("overallPct").textContent = `${overallPct}% complete`;
  document.getElementById("overallBar").style.width = `${overallPct}%`;
}
function renderPD(){const _sl=[...document.querySelectorAll('#pdSystems .jump')].map(e=>e.scrollLeft);
  const container = document.getElementById("pdSystems");
  container.innerHTML = pdChips();
  let totalDone = 0, totalCount = 0;

  ordered(PDATA,'pd').forEach(sys=>{
    const rows = sys.topics.map((t,i)=>{
      const id = `${sys.key}-${i}`;
      const st = getTopicState(id);
      if(!isOff('pd:'+id)){ if(st.done) totalDone++; totalCount++; }
      if((PDF.length&&!PDF.includes(docOf(t,id)))||!inY(t,PDY)) return '';
      const pillClass = t[1] === "Seminar" ? "pill seminar" : "pill";
      return `
        <tr data-tk="pd:${id}" class="${st.done?'done':''} ${isOff('pd:'+id)?'sp':''}">
          <td class="c-chk"><input type="checkbox" class="chk" aria-label="Mark done" ${st.done?'checked':''} onchange="setTopicState('${id}', {done:this.checked})"></td>
          <td class="topic-cell"><span class="tn">${t[0]}<span class="tags"><button class="dtag" onclick="pdDoc(${window._dl.indexOf(docOf(t,id))})" title="Filter by this doctor">${escH(docOf(t,id))}</button><button class="dtag" onclick="pdYear('${(t[3]||'56')==='6'?'6only':'56'}')" title="Year plan">${YL[t[3]||'56']}</button></span>${planTag('pd:'+id)}</span>${rowAct('pd:'+id)}</td>
          <td class="c-type"><span class="${pillClass}">${t[1]}</span></td>
          <td class="c-date"><input type="date" aria-label="First pass date" max="${today()}" value="${st.date||''}" onchange="rowDate(this,'im','${id}')"></td>
          <td class="c-r1"><label class="rchip"><input type="checkbox" class="round-chk" ${st.r1?'checked':''} onchange="setTopicState('${id}', {r1:this.checked})" title="Round 1 review"><span>R1</span></label></td>
          <td class="c-r2"><label class="rchip"><input type="checkbox" class="round-chk" ${st.r2?'checked':''} onchange="setTopicState('${id}', {r2:this.checked})" title="Round 2 review"><span>R2</span></label></td>
          <td class="c-rate"><div class="rating">${ratingButtons(id, st.rating||0)}</div></td>
        </tr>`;
    }).join("");
    if((PDF.length||PDY)&&!rows) return;

    const act = sys.topics.map((t,i)=>i).filter(i=>!isOff('pd:'+sys.key+'-'+i));
    const doneInSys = act.filter(i=>getTopicState(`${sys.key}-${i}`).done).length;
    const pct = act.length ? Math.round((doneInSys / act.length) * 100) : 0;

    container.innerHTML += `
      <section class="system-card ${isCol('pd',sys.key)?'col':''} ${act.length?'':'sp'}" data-k="pd:${sys.key}">
        <div class="system-head" style="background:${sys.pastel}">
          <div class="system-emoji">${sys.emoji}</div>
          <div class="system-title">
            <h2>${sys.name}</h2>
            <div class="sub">${[['Lecture','lectures'],['Seminar','seminars']].map(([y,w])=>sys.topics.filter((t,i)=>t[1]===y&&getTopicState(sys.key+'-'+i).done).length+'/'+sys.topics.filter(t=>t[1]===y).length+' '+w).join(' · ')}</div>
          </div>
          ${sysCtl('pd',sys.key)}<div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${sys.accent}"></div></div>
          <div class="badge" style="background:${sys.accent}22; color:${sys.accent}">${doneInSys}/${act.length}${act.length<sys.topics.length?` <i class="of">(of ${sys.topics.length})</i>`:''} · ${pct}%</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:36px"></th>
              <th>Topic</th>
              <th style="width:90px">Type</th>
              <th style="width:150px">${I('cal',14)} First pass</th>
              <th style="width:60px; text-align:center">R1</th>
              <th style="width:60px; text-align:center">R2</th>
              <th style="width:100px">Rating</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>`;
  });

  {const A=PDATA.reduce((a,x)=>a+x.topics.length,0);document.getElementById("pdNum").innerHTML = `${totalDone}/${totalCount}`+(totalCount<A?` <i class="of">(of ${A})</i>`:'');}
  const pdPct = totalCount ? Math.round((totalDone/totalCount)*100) : 0;
  document.getElementById("pdPct").textContent = `${pdPct}% complete`;
  document.getElementById("pdBar").style.width = `${pdPct}%`;
  document.querySelectorAll('#pdSystems .jump').forEach((e,i)=>{e.scrollLeft=_sl[i]||0});
}
function pdChips(){const L=window._dl=docList(),n=d=>PDATA.reduce((a,x)=>a+x.topics.filter((t,i)=>docOf(t,x.key+'-'+i)===d).length,0),c=(on,js,txt)=>`<button class="jt${on?' sel':''}" aria-pressed="${!!on}" onclick="${js}">${txt}</button>`;return '<div class="jump" style="margin:0 0 6px">'+[['','All years',''],['56','5th·6th year','56'],['6only','6th year only','6']].map(([v,l,y])=>c(PDY===v,`pdYear('${v}')`,`${l} · ${PDATA.reduce((a,x)=>a+x.topics.filter(t=>!y||(t[3]||'56')===y).length,0)}`)).join('')+'</div><div class="jump" style="margin:0 0 12px">'+c(!PDF.length,'pdDoc(-1)','All doctors')+L.map((d,i)=>c(PDF.includes(d),`pdDoc(${i})`,`${d==='Unknown'?'Unknown':'Dr. '+escH(normDoc(d))} · ${n(d)}`)).join('')+'<button class="jt" onclick="pdEditDocs(event)">✎ Edit doctors</button></div>'}
function pdYear(y){PDY=PDY===y?'':y;renderPD()}
function pdDoc(i){const d=(window._dl||[])[i];PDF=i<0||!d?[]:PDF.includes(d)?PDF.filter(x=>x!==d):[...PDF,d];renderPD()}
function pdSetDoc(ev,k,anc){ev.stopPropagation();const L=docList().filter(d=>d!=='Unknown');menuAt(anc||ev.currentTarget,'<div style="max-height:50vh;overflow:auto">'+L.map((d,i)=>`<button class="mi" onclick="pdApply('${k}',window._dl2[${i}])">${escH(d)}</button>`).join('')+'<button class="mi" onclick="pdNew(\''+k+'\')">New name…</button><button class="mi" onclick="pdApply(\''+k+'\',\'\')">Clear (Unknown)</button></div>');window._dl2=L;document.getElementById('rmenu').classList.add('solid')}
function pdEditDocs(ev){ev.stopPropagation();const L=window._dl2=docList().filter(d=>d!=='Unknown');menuAt(ev.currentTarget,'<div style="max-height:50vh;overflow:auto">'+L.map((d,i)=>`<button class="mi" onclick="pdRename(${i})">Rename ${escH(d)}…</button>`).join('')+'</div>');document.getElementById('rmenu').classList.add('solid')}
function pdRename(i){closeMenu();const old=window._dl2[i],v=prompt('New name for '+old,old);if(v===null)return;const nn=normDoc(v).slice(0,40);if(!nn||dk(nn)===dk(old))return;const k=dk(old);cfg.pdn=Object.assign({},cfg.pdn||{},{[k]:nn});PDF=PDF.filter(d=>d!==old);renderPD();setSync('saving');docRef.set({settings:{pdn:{[k]:nn}}},{merge:true}).catch(()=>setSync('error'))}
function pdNew(k){closeMenu();const v=prompt('Doctor name');if(v!==null)pdApply(k,v)}
function pdApply(k,v){closeMenu();const id=TI[k].id,nm=v?canon(v):'';if(nm==='Unknown')return pdApply(k,'');cfg.pdoc=Object.assign({},cfg.pdoc||{});if(nm)cfg.pdoc[id]=nm.slice(0,40);else delete cfg.pdoc[id];PDF=PDF.filter(d=>docList().includes(d));renderPD();setSync('saving');docRef.set({settings:{pdoc:{[id]:nm?nm.slice(0,40):firebase.firestore.FieldValue.delete()}}},{merge:true}).catch(()=>setSync('error'))}
function fmtMin(m){
  m = Math.round(m);
  const h = Math.floor(m/60), r = m%60;
  if(h && r) return h+"h "+r+"m";
  if(h) return h+"h";
  return r+"m";
}

function renderBB(){
  const container = document.getElementById("bbSystems");
  container.innerHTML = "";
  let watchedCount=0, notesCount=0, ankiCount=0, totalCount=0;
  let watchedMin=0, totalMin=0, allCount=0;

  ordered(BBDATA,'bb').forEach(sys=>{
    let rowsHtml = "";
    let sysAll = 0, sysTopicCount = 0, sysWatched = 0, sysMin = 0, sysWatchedMin = 0;

    sys.subsystems.forEach((sub, si)=>{
      const subAct = sub.topics.map((t,ti)=>ti).filter(ti=>!isOff('bb:'+sys.key+'-'+si+'-'+ti));
      const subWatched = subAct.filter(ti=>bbGet(`${sys.key}-${si}-${ti}`).watch).length;
      rowsHtml += `<tr class="sub-head"><td colspan="6">${sub.name}<span class="scount">${subWatched}/${subAct.length}</span><span class="ra"><button onclick="suspSub('${sys.key}',${si})" title="Suspend / resume this section">⏸</button></span></td></tr>`;
      sub.topics.forEach((t, ti)=>{
        const id = `${sys.key}-${si}-${ti}`;
        const st = bbGet(id);
        allCount++; sysAll++;
        if(!isOff('bb:'+id)){
        sysTopicCount++; totalCount++;
        sysMin += t.minutes; totalMin += t.minutes;
        if(st.watch){ sysWatched++; watchedCount++; sysWatchedMin += t.minutes; watchedMin += t.minutes; }
        if(st.notes){ notesCount++; }
        if(st.anki){ ankiCount++; }
        }
        rowsHtml += `
          <tr data-tk="bb:${id}" class="${st.watch?'done':''} ${isOff('bb:'+id)?'sp':''}">
            <td><input type="checkbox" class="chk" ${st.watch?'checked':''} onchange="bbSet('${id}', {watch:this.checked})" title="Watched"></td>
            <td class="topic-cell"><span class="tn">${t.name}${planTag('bb:'+id)}</span>${rowAct('bb:'+id)}</td>
            <td class="mins">${fmtMin(t.minutes)}</td>
            <td class="c-date"><input type="date" max="${today()}" value="${st.wd||''}" aria-label="Date watched" onchange="rowDate(this,'bb','${id}')"></td>
            <td style="text-align:center"><label class="rchip"><input type="checkbox" class="chk" ${st.notes?'checked':''} onchange="bbSet('${id}', {notes:this.checked})" title="Notes taken"><span>Notes</span></label></td>
            <td style="text-align:center"><label class="rchip"><input type="checkbox" class="chk" ${st.anki?'checked':''} onchange="bbSet('${id}', {anki:this.checked})" title="Anki cards made"><span>Anki</span></label></td>
          </tr>`;
      });
    });

    const pct = sysTopicCount ? Math.round(sysWatched/sysTopicCount*100) : 0;
    container.innerHTML += `
      <section class="system-card ${isCol('bb',sys.key)?'col':''} ${sysTopicCount?'':'sp'}" data-k="bb:${sys.key}">
        <div class="system-head" style="background:${sys.pastel}">
          <div class="system-emoji">${sys.emoji}</div>
          <div class="system-title">
            <h2>${sys.name}</h2>
            <div class="sub">${sysTopicCount} videos · ${fmtMin(sysMin)} total</div>
          </div>
          ${sysCtl('bb',sys.key)}<div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${sys.accent}"></div></div>
          <div class="badge" style="background:${sys.accent}22; color:${sys.accent}">${sysWatched}/${sysTopicCount}${sysAll>sysTopicCount?` <i class="of">(of ${sysAll})</i>`:''} · ${pct}%</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:34px">Watch</th>
              <th>Topic</th>
              <th style="width:70px">Length</th>
              <th style="width:140px">${I('cal',14)} Date</th>
              <th style="width:60px; text-align:center">Notes</th>
              <th style="width:60px; text-align:center">Anki</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </section>`;
  });

  document.getElementById("watchNum").innerHTML = `${watchedCount}/${totalCount}`+(totalCount<allCount?` <i class="of">(of ${allCount})</i>`:'');
  document.getElementById("watchBar").style.width = `${totalCount ? Math.round(watchedCount/totalCount*100):0}%`;
  document.getElementById("timeNum").textContent = `${fmtMin(watchedMin)} / ${fmtMin(totalMin)}`;
  document.getElementById("timeBar").style.width = `${totalMin ? Math.round(watchedMin/totalMin*100):0}%`;
  document.getElementById("notesNum").innerHTML = `${notesCount}/${totalCount}`+(totalCount<allCount?` <i class="of">(of ${allCount})</i>`:'');
  document.getElementById("notesBar").style.width = `${totalCount ? Math.round(notesCount/totalCount*100):0}%`;
  document.getElementById("ankiNum").innerHTML = `${ankiCount}/${totalCount}`+(totalCount<allCount?` <i class="of">(of ${allCount})</i>`:'');
  document.getElementById("ankiBar").style.width = `${totalCount ? Math.round(ankiCount/totalCount*100):0}%`;
}
