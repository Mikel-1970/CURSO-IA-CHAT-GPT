/* Curso IA — UX de revisión v20.1
   - Navegación fija para revisor/admin
   - Acceso directo a teoría, ejercicios, examen y notas desde modo revisión
   - Notas coherentes sobre Supabase con una única ruta CRUD
   - Sin modificar progreso ni reglas de usuarios normales
*/
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let notes=[];
let editingId=null;

function adminNow(){try{return !!(isAdmin||accessProfile?.role==='admin');}catch(e){return false;}}
function signedIn(){try{return !!(session?.user&&accessProfile?.active);}catch(e){return false;}}

function installCss(){
 if($('v201ReviewUxStyle'))return;
 const st=document.createElement('style');st.id='v201ReviewUxStyle';st.textContent=`
  #v201BottomNav{position:fixed;z-index:135;left:50%;transform:translateX(-50%);bottom:max(10px,env(safe-area-inset-bottom));display:flex;gap:6px;padding:7px;background:rgba(6,31,63,.94);border:1px solid rgba(110,204,255,.42);border-radius:18px;box-shadow:0 12px 32px rgba(0,0,0,.30);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
  #v201BottomNav.hidden{display:none!important} #v201BottomNav button{appearance:none;border:0;background:transparent;color:#dff4ff;min-width:64px;min-height:52px;border-radius:12px;padding:6px 8px;font-size:11px;font-weight:800;display:grid;place-items:center;gap:2px} #v201BottomNav button span:first-child{font-size:20px;line-height:1} #v201BottomNav button.active{background:#1e6fc5;color:#fff}
  #v20ReviewWorkspace .v20-body{padding-bottom:105px!important} #v20ReviewWorkspace .lesson-content,#v20ReviewTheory .lesson-content{max-height:none!important;height:auto!important;overflow:visible!important}
  #v20ReviewWorkspace .lesson-content a,#lesson .lesson-content a{color:#a8ecff!important;text-decoration:underline!important;text-underline-offset:2px;font-weight:700}
  #v201NotesPanel .v201-notes-head{display:flex;gap:10px;align-items:end;flex-wrap:wrap;margin-bottom:14px} #v201NotesPanel .v201-notes-head>div{flex:1;min-width:190px} #v201NotesPanel select{width:100%}
  #v201NotesList{display:grid;gap:12px}.v201-note{border:1px solid #d5e1ee;border-radius:14px;background:#fff;padding:14px}.v201-note h3{margin:0 0 6px}.v201-note-meta{font-size:.82rem;color:#64748b;margin-bottom:10px}.v201-note-body{white-space:pre-wrap;line-height:1.5}.v201-note-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.v201-note-actions .btn{min-width:92px}
  #v201NoteDialog{border:0;border-radius:16px;padding:0;max-width:560px;width:calc(100% - 28px);box-shadow:0 18px 60px rgba(0,0,0,.3)} #v201NoteDialog::backdrop{background:rgba(15,23,42,.48)} #v201NoteDialog .dialog-body{padding:20px} #v201NoteDialog input,#v201NoteDialog select,#v201NoteDialog textarea{width:100%} #v201NoteDialog .v201-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.v201-note-status{min-height:1.2em;margin-top:8px;color:#475569}
  #curso .notes-card .chapter-notes-head{display:grid!important;gap:12px!important} #curso .notes-card .chapter-notes-head .btnrow{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important;margin-top:0!important} #curso .notes-card .chapter-notes-head .btn{width:100%!important;min-height:46px!important;margin:0!important}
  #curso .chapter-notes-preview{display:grid!important;gap:8px!important;margin-top:12px!important}.chapter-note-preview{width:100%!important;text-align:left!important;padding:12px!important;border-radius:10px!important}
  .workspace,.workspace-body,#lesson,.lesson-content{max-height:none!important}
  @media(max-width:620px){#v201BottomNav{width:calc(100% - 16px);justify-content:space-between;gap:2px}#v201BottomNav button{min-width:0;flex:1;padding:5px 2px;font-size:10px}#v201NoteDialog .v201-grid{grid-template-columns:1fr}#curso .notes-card .chapter-notes-head .btnrow{grid-template-columns:1fr!important}}
 `;document.head.appendChild(st);
}

function ensureBottomNav(){
 if($('v201BottomNav'))return;
 const nav=document.createElement('nav');nav.id='v201BottomNav';nav.className='hidden';nav.setAttribute('aria-label','Navegación de revisión');
 nav.innerHTML=`
  <button type="button" data-v201-nav="home"><span>⌂</span><span>Inicio</span></button>
  <button type="button" data-v201-nav="theory"><span>▤</span><span>Teoría</span></button>
  <button type="button" data-v201-nav="exercises"><span>⌁</span><span>Ejercicios</span></button>
  <button type="button" data-v201-nav="exam"><span>✓</span><span>Examen</span></button>
  <button type="button" data-v201-nav="notes"><span>✎</span><span>Notas</span></button>`;
 document.body.appendChild(nav);
 nav.addEventListener('click',e=>{const b=e.target.closest('[data-v201-nav]');if(!b)return;navigate(b.dataset.v201Nav);});
}
function setActive(name){document.querySelectorAll('#v201BottomNav [data-v201-nav]').forEach(b=>b.classList.toggle('active',b.dataset.v201Nav===name));}
function showNav(){const n=$('v201BottomNav');if(!n)return;n.classList.toggle('hidden',!(adminNow()&&signedIn()));}

function openReviewTab(name){
 if(!adminNow())return;
 const btn=$('v20ReviewBtn');if(btn)btn.click();
 setTimeout(()=>{
  const map={theory:'theory',exercises:'exercises',exam:'exam',notes:'notes'};const tab=map[name];
  if(tab==='notes'){ensureNotesTab();activateNotes();return;}
  const t=document.querySelector(`#v20ReviewWorkspace [data-v20-tab="${tab}"]`);if(t)t.click();
  setActive(name);
 },40);
}
function goHome(){
 $('v20ReviewWorkspace')?.classList.add('hidden');document.body.classList.remove('v20-review-open');
 document.querySelectorAll('.workspace.open').forEach(w=>w.classList.remove('open'));
 document.body.style.overflow='';document.getElementById('homeMenu')?.scrollIntoView({block:'start'});setActive('home');
}
function navigate(name){if(name==='home')goHome();else openReviewTab(name);}

function interceptHomeCards(){
 document.addEventListener('click',e=>{
  if(!adminNow())return;const b=e.target.closest('[data-open-zone]');if(!b)return;const z=b.dataset.openZone;
  const map={curso:'theory',ejercicios:'exercises',practicas:'exam'};if(!map[z])return;
  e.preventDefault();e.stopImmediatePropagation();openReviewTab(map[z]);
 },true);
}

function ensureNotesTab(){
 const w=$('v20ReviewWorkspace');if(!w||$('v201NotesTab'))return;
 const tabs=w.querySelector('.v20-review-tabs');if(!tabs)return;
 const b=document.createElement('button');b.id='v201NotesTab';b.className='btn v20-review-tab';b.type='button';b.dataset.v20Tab='notes';b.textContent='Notas';tabs.appendChild(b);
 const panel=document.createElement('div');panel.id='v201NotesPanel';panel.className='v20-panel';panel.innerHTML=`<div class="card"><h2>Mis notas</h2><p>Notas reales del curso. Crear, editar o borrar aquí se refleja en Supabase y en el listado general.</p><div class="v201-notes-head"><div><label for="v201NotesChapter">Capítulo</label><select id="v201NotesChapter"></select></div><button id="v201NewNote" class="btn primary" type="button">＋ Añadir nota</button></div><div id="v201NotesStatus" class="v201-note-status"></div></div><div id="v201NotesList"></div>`;w.querySelector('.v20-body')?.appendChild(panel);
 b.addEventListener('click',activateNotes);$('v201NotesChapter')?.addEventListener('change',loadNotes);$('v201NewNote')?.addEventListener('click',()=>openEditor());fillChapterSelect();ensureNoteDialog();
}
function fillChapterSelect(){
 const s=$('v201NotesChapter');if(!s)return;const nums=Object.keys(courseContent||{}).map(Number).filter(n=>n>=1).sort((a,b)=>a-b);s.innerHTML='<option value="">Todos los capítulos</option>'+nums.map(n=>`<option value="${n}">${n}. ${esc(courseContent?.[n]?.title||'Capítulo '+n)}</option>`).join('');
 const currentReview=$('v20ReviewChapter')?.value||'';if(currentReview)s.value=currentReview;
}
function activateNotes(){
 ensureNotesTab();const w=$('v20ReviewWorkspace');if(!w)return;w.querySelectorAll('.v20-review-tab').forEach(x=>x.classList.toggle('active',x.id==='v201NotesTab'));w.querySelectorAll('.v20-panel').forEach(x=>x.classList.toggle('active',x.id==='v201NotesPanel'));fillChapterSelect();loadNotes();setActive('notes');
}
async function loadNotes(){
 if(!signedIn()||!sb)return;const status=$('v201NotesStatus');if(status)status.textContent='Cargando…';
 let q=sb.from('course_notes').select('id,chapter_number,note_type,title,body,created_at,updated_at').order('updated_at',{ascending:false});const ch=$('v201NotesChapter')?.value;if(ch)q=q.eq('chapter_number',Number(ch));
 const {data,error}=await q;if(error){if(status)status.textContent=error.message;return;}notes=data||[];if(status)status.textContent='';renderNotes();
}
function renderNotes(){
 const box=$('v201NotesList');if(!box)return;if(!notes.length){box.innerHTML='<div class="card">No hay notas para este filtro.</div>';return;}
 box.innerHTML=notes.map(n=>`<article class="v201-note"><h3>${esc(n.title||'Sin título')}</h3><div class="v201-note-meta">${n.chapter_number?`Capítulo ${n.chapter_number} · `:''}${esc(n.note_type||'nota')}</div><div class="v201-note-body">${esc(n.body||'')}</div><div class="v201-note-actions"><button class="btn" type="button" data-v201-edit="${n.id}">Editar</button><button class="btn danger" type="button" data-v201-delete="${n.id}">Borrar</button></div></article>`).join('');
 box.querySelectorAll('[data-v201-edit]').forEach(b=>b.addEventListener('click',()=>openEditor(notes.find(n=>String(n.id)===String(b.dataset.v201Edit)))));box.querySelectorAll('[data-v201-delete]').forEach(b=>b.addEventListener('click',()=>deleteNote(b.dataset.v201Delete)));
}
function ensureNoteDialog(){
 if($('v201NoteDialog'))return;const d=document.createElement('dialog');d.id='v201NoteDialog';d.innerHTML=`<div class="dialog-body"><h2 id="v201NoteHeading">Nueva nota</h2><div class="v201-grid"><div><label for="v201NoteChapter">Capítulo</label><select id="v201NoteChapter"></select></div><div><label for="v201NoteType">Tipo</label><select id="v201NoteType"><option value="note">Nota</option><option value="idea">Idea</option><option value="prompt">Prompt</option><option value="test">Prueba</option><option value="application">Aplicación</option><option value="task">Tarea pendiente</option></select></div></div><label for="v201NoteTitle">Título</label><input id="v201NoteTitle" type="text"><label for="v201NoteBody">Anotación</label><textarea id="v201NoteBody" rows="8"></textarea><div id="v201NoteMsg" class="v201-note-status"></div><div class="btnrow"><button id="v201SaveNote" class="btn primary" type="button">Guardar</button><button id="v201CancelNote" class="btn" type="button">Cancelar</button></div></div>`;document.body.appendChild(d);$('v201SaveNote').addEventListener('click',saveNote);$('v201CancelNote').addEventListener('click',()=>d.close());
}
function fillDialogChapters(){const s=$('v201NoteChapter');if(!s)return;const nums=Object.keys(courseContent||{}).map(Number).filter(n=>n>=1).sort((a,b)=>a-b);s.innerHTML='<option value="">Sin capítulo</option>'+nums.map(n=>`<option value="${n}">${n}. ${esc(courseContent?.[n]?.title||'Capítulo '+n)}</option>`).join('');}
function openEditor(n=null){ensureNoteDialog();fillDialogChapters();editingId=n?.id||null;$('v201NoteHeading').textContent=n?'Editar nota':'Nueva nota';$('v201NoteChapter').value=n?.chapter_number?String(n.chapter_number):($('v201NotesChapter')?.value||$('v20ReviewChapter')?.value||'');$('v201NoteType').value=n?.note_type||'note';$('v201NoteTitle').value=n?.title||'';$('v201NoteBody').value=n?.body||'';$('v201NoteMsg').textContent='';$('v201NoteDialog').showModal();setTimeout(()=>$('v201NoteTitle')?.focus(),20);}
async function saveNote(){
 const title=$('v201NoteTitle').value.trim(),body=$('v201NoteBody').value.trim();if(!title){$('v201NoteMsg').textContent='Añade un título.';return;}if(!body){$('v201NoteMsg').textContent='Escribe la anotación.';return;}const payload={user_id:session.user.id,chapter_number:$('v201NoteChapter').value?Number($('v201NoteChapter').value):null,note_type:$('v201NoteType').value,title,body,source_label:'v20-review-notes',updated_at:new Date().toISOString()};$('v201NoteMsg').textContent='Guardando…';let error;if(editingId)({error}=await sb.from('course_notes').update(payload).eq('id',editingId));else({error}=await sb.from('course_notes').insert(payload));if(error){$('v201NoteMsg').textContent=error.message;return;}$('v201NoteDialog').close();editingId=null;await loadNotes();
}
async function deleteNote(id){if(!confirm('¿Eliminar esta nota?'))return;const {error}=await sb.from('course_notes').delete().eq('id',id);if(error){$('v201NotesStatus').textContent=error.message;return;}await loadNotes();}

function syncReviewChapter(){const s=$('v20ReviewChapter');if(!s||s.dataset.v201==='1')return;s.dataset.v201='1';s.addEventListener('change',()=>{if($('v201NotesChapter'))$('v201NotesChapter').value=s.value;if($('v201NotesPanel')?.classList.contains('active'))loadNotes();});}
function keepReady(){installCss();ensureBottomNav();showNav();if(adminNow()&&signedIn()){ensureNotesTab();syncReviewChapter();}}
function init(){installCss();ensureBottomNav();interceptHomeCards();keepReady();new MutationObserver(keepReady).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});setInterval(keepReady,1000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
