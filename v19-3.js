/* Curso IA ChatGPT v19.3 — capa incremental sobre v19.2 */
(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const noteTypes=['note','idea','prompt','test','application','task'];
  const labels={
    es:{notes:'Mis notas',desc:'Reúne las ideas, prompts, pruebas y aplicaciones que anotas mientras avanzas en el curso.',search:'Buscar en mis notas…',allChapters:'Todos los capítulos',allTypes:'Todos los tipos',newNote:'Nueva nota',chapter:'Capítulo',type:'Tipo',body:'Anotación',save:'Guardar nota',cancel:'Cancelar',edit:'Editar',copy:'Copiar',chat:'Trabajar con ChatGPT',del:'Eliminar',empty:'Todavía no hay notas que coincidan con el filtro.',saved:'Nota guardada.',updated:'Nota actualizada.',deleted:'Nota eliminada.',copied:'Copiado al portapapeles.',chatCopied:'He copiado un prompt preparado. Pégalo en ChatGPT para continuar.',note:'Nota',idea:'Idea',prompt:'Prompt',test:'Prueba',application:'Aplicación',task:'Tarea pendiente',add:'Añadir nota'},
    en:{notes:'My notes',desc:'Collect ideas, prompts, tests and applications while you progress through the course.',search:'Search my notes…',allChapters:'All chapters',allTypes:'All types',newNote:'New note',chapter:'Chapter',type:'Type',body:'Note',save:'Save note',cancel:'Cancel',edit:'Edit',copy:'Copy',chat:'Work with ChatGPT',del:'Delete',empty:'No notes match the current filter.',saved:'Note saved.',updated:'Note updated.',deleted:'Note deleted.',copied:'Copied to clipboard.',chatCopied:'A prepared prompt was copied. Paste it into ChatGPT to continue.',note:'Note',idea:'Idea',prompt:'Prompt',test:'Test',application:'Application',task:'Pending task',add:'Add note'},
    fr:{notes:'Mes notes',desc:'Regroupez les idées, prompts, essais et applications notés pendant le cours.',search:'Rechercher dans mes notes…',allChapters:'Tous les chapitres',allTypes:'Tous les types',newNote:'Nouvelle note',chapter:'Chapitre',type:'Type',body:'Note',save:'Enregistrer',cancel:'Annuler',edit:'Modifier',copy:'Copier',chat:'Travailler avec ChatGPT',del:'Supprimer',empty:'Aucune note ne correspond au filtre.',saved:'Note enregistrée.',updated:'Note mise à jour.',deleted:'Note supprimée.',copied:'Copié.',chatCopied:'Un prompt préparé a été copié. Collez-le dans ChatGPT.',note:'Note',idea:'Idée',prompt:'Prompt',test:'Essai',application:'Application',task:'Tâche',add:'Ajouter une note'},
    de:{notes:'Meine Notizen',desc:'Ideen, Prompts, Tests und Anwendungen aus dem Kurs gesammelt anzeigen.',search:'Notizen durchsuchen…',allChapters:'Alle Kapitel',allTypes:'Alle Typen',newNote:'Neue Notiz',chapter:'Kapitel',type:'Typ',body:'Notiz',save:'Speichern',cancel:'Abbrechen',edit:'Bearbeiten',copy:'Kopieren',chat:'Mit ChatGPT bearbeiten',del:'Löschen',empty:'Keine Notizen für diesen Filter.',saved:'Notiz gespeichert.',updated:'Notiz aktualisiert.',deleted:'Notiz gelöscht.',copied:'Kopiert.',chatCopied:'Ein vorbereiteter Prompt wurde kopiert. Fügen Sie ihn in ChatGPT ein.',note:'Notiz',idea:'Idee',prompt:'Prompt',test:'Test',application:'Anwendung',task:'Aufgabe',add:'Notiz hinzufügen'},
    it:{notes:'Le mie note',desc:'Raccogli idee, prompt, prove e applicazioni annotate durante il corso.',search:'Cerca nelle note…',allChapters:'Tutti i capitoli',allTypes:'Tutti i tipi',newNote:'Nuova nota',chapter:'Capitolo',type:'Tipo',body:'Nota',save:'Salva',cancel:'Annulla',edit:'Modifica',copy:'Copia',chat:'Lavora con ChatGPT',del:'Elimina',empty:'Nessuna nota corrisponde al filtro.',saved:'Nota salvata.',updated:'Nota aggiornata.',deleted:'Nota eliminata.',copied:'Copiato.',chatCopied:'È stato copiato un prompt preparato. Incollalo in ChatGPT.',note:'Nota',idea:'Idea',prompt:'Prompt',test:'Prova',application:'Applicazione',task:'Attività',add:'Aggiungi nota'},
    pt:{notes:'As minhas notas',desc:'Reúna ideias, prompts, testes e aplicações anotados ao longo do curso.',search:'Pesquisar nas notas…',allChapters:'Todos os capítulos',allTypes:'Todos os tipos',newNote:'Nova nota',chapter:'Capítulo',type:'Tipo',body:'Nota',save:'Guardar',cancel:'Cancelar',edit:'Editar',copy:'Copiar',chat:'Trabalhar com ChatGPT',del:'Eliminar',empty:'Nenhuma nota corresponde ao filtro.',saved:'Nota guardada.',updated:'Nota atualizada.',deleted:'Nota eliminada.',copied:'Copiado.',chatCopied:'Foi copiado um prompt preparado. Cole-o no ChatGPT.',note:'Nota',idea:'Ideia',prompt:'Prompt',test:'Teste',application:'Aplicação',task:'Tarefa',add:'Adicionar nota'}
  };
  const L=()=>labels[(window.currentLanguage||'es')]||labels.es;
  let notesCache=[],editingId=null,chapterSaveTimer=null,lastChapterKey=null;

  function setVersion(){
    document.querySelectorAll('.shell-brand .pill').forEach(x=>x.textContent='v19.3');
  }

  function chapterTitle(n){
    try{return window.courseContent?.[n]?.title||window.metadata?.(n)?.[0]||`Capítulo ${n}`;}catch(e){return `Capítulo ${n}`;}
  }

  function addHomeNotesCard(){
    const grid=document.querySelector('#homeMenu .zone-grid');
    if(!grid||$('openNotesZoneBtn'))return;
    const b=document.createElement('button');b.id='openNotesZoneBtn';b.className='zone-card';b.type='button';
    b.innerHTML=`<div class="zone-icon">✎</div><strong>${esc(L().notes)}</strong><span>${esc(L().desc)}</span>`;
    b.addEventListener('click',openNotesWorkspace);grid.appendChild(b);
  }

  function addNotesWorkspace(){
    if($('misNotas'))return;
    const shell=$('appShell');if(!shell)return;
    const sec=document.createElement('section');sec.id='misNotas';sec.className='workspace';
    sec.innerHTML=`<div class="workspace-head"><div class="workspace-head-inner"><button id="closeNotesZoneBtn" class="icon-btn" type="button">← ${esc(L().cancel==='Cancel'?'Back':'Volver')}</button><div class="workspace-title">${esc(L().notes)}</div></div></div>
      <div class="notes-workspace-body">
        <div class="card"><h2>${esc(L().notes)}</h2><p>${esc(L().desc)}</p>
          <div class="notes-toolbar"><input id="notesSearch" type="search" placeholder="${esc(L().search)}"><select id="notesChapterFilter"></select><select id="notesTypeFilter"></select></div>
        </div>
        <div id="noteEditorCard" class="card hidden"><h3 id="noteEditorTitle">${esc(L().newNote)}</h3><div class="note-editor"><div class="note-editor-grid"><div><label for="noteEditorChapter">${esc(L().chapter)}</label><select id="noteEditorChapter"></select></div><div><label for="noteEditorType">${esc(L().type)}</label><select id="noteEditorType"></select></div></div><div><label for="noteEditorBody">${esc(L().body)}</label><textarea id="noteEditorBody" rows="6"></textarea></div><div class="btnrow"><button id="saveNoteBtn" class="btn primary" type="button">${esc(L().save)}</button><button id="cancelNoteBtn" class="btn" type="button">${esc(L().cancel)}</button></div></div></div>
        <div class="btnrow"><button id="newNoteBtn" class="btn primary" type="button">＋ ${esc(L().add)}</button></div>
        <div id="notesStatus" class="notes-status"></div><div id="notesList" class="notes-list"></div>
      </div>`;
    shell.appendChild(sec);
    $('closeNotesZoneBtn').addEventListener('click',closeNotesWorkspace);
    $('newNoteBtn').addEventListener('click',()=>openNoteEditor());
    $('cancelNoteBtn').addEventListener('click',closeNoteEditor);
    $('saveNoteBtn').addEventListener('click',saveNote);
    ['notesSearch','notesChapterFilter','notesTypeFilter'].forEach(id=>$(id).addEventListener(id==='notesSearch'?'input':'change',renderNotes));
    fillNoteSelects();
  }

  function fillNoteSelects(){
    if(!$('notesChapterFilter'))return;
    const max=17;
    const chapterOpts=Array.from({length:max},(_,i)=>`<option value="${i+1}">${i+1}. ${esc(chapterTitle(i+1))}</option>`).join('');
    $('notesChapterFilter').innerHTML=`<option value="">${esc(L().allChapters)}</option>${chapterOpts}`;
    $('noteEditorChapter').innerHTML=`<option value="">—</option>${chapterOpts}`;
    const typeOpts=noteTypes.map(t=>`<option value="${t}">${esc(L()[t]||t)}</option>`).join('');
    $('notesTypeFilter').innerHTML=`<option value="">${esc(L().allTypes)}</option>${typeOpts}`;
    $('noteEditorType').innerHTML=typeOpts;
  }

  function addProfileShortcut(){
    const card=$('profileCard');if(!card||$('profileNotesBtn'))return;
    const row=$('profileProgressValue')?.closest('.profile-row');if(row)row.classList.add('v19-hide-progress');
    const wrap=document.createElement('div');wrap.className='profile-notes-shortcut';wrap.innerHTML=`<button id="profileNotesBtn" class="btn" type="button">✎ ${esc(L().notes)}</button>`;
    card.appendChild(wrap);$('profileNotesBtn').addEventListener('click',openNotesWorkspace);
  }

  function openNotesWorkspace(){
    if(!window.session||!window.accessProfile?.active)return;
    document.querySelectorAll('.workspace').forEach(w=>w.classList.remove('open'));
    $('misNotas')?.classList.add('open');document.body.style.overflow='hidden';
    fillNoteSelects();loadNotes();
  }
  function closeNotesWorkspace(){$('misNotas')?.classList.remove('open');document.body.style.overflow='';$('homeMenu')?.scrollIntoView({block:'start'});}

  async function loadNotes(){
    if(!window.sb||!window.session)return;
    $('notesStatus').textContent='…';
    const {data,error}=await window.sb.from('course_notes').select('id,chapter_number,note_type,body,source_label,created_at,updated_at').order('updated_at',{ascending:false});
    if(error){$('notesStatus').textContent=error.message;return;}
    notesCache=data||[];$('notesStatus').textContent='';renderNotes();
  }

  function renderNotes(){
    const box=$('notesList');if(!box)return;
    const q=String($('notesSearch')?.value||'').trim().toLocaleLowerCase();
    const ch=$('notesChapterFilter')?.value||'',type=$('notesTypeFilter')?.value||'';
    const rows=notesCache.filter(n=>(!ch||String(n.chapter_number||'')===ch)&&(!type||n.note_type===type)&&(!q||String(n.body||'').toLocaleLowerCase().includes(q)));
    if(!rows.length){box.innerHTML=`<div class="notes-empty">${esc(L().empty)}</div>`;return;}
    box.innerHTML=rows.map(n=>`<article class="note-item"><div class="note-item-head"><div class="note-meta">${n.chapter_number?`<span class="note-chip">${esc(L().chapter)} ${n.chapter_number}</span>`:''}<span class="note-chip">${esc(L()[n.note_type]||n.note_type)}</span></div><span class="muted">${fmt(n.updated_at)}</span></div><div class="note-body">${esc(n.body)}</div><div class="note-actions"><button class="btn" data-note-edit="${n.id}" type="button">${esc(L().edit)}</button><button class="btn" data-note-copy="${n.id}" type="button">${esc(L().copy)}</button><button class="btn primary" data-note-chat="${n.id}" type="button">${esc(L().chat)}</button><button class="btn danger-soft" data-note-delete="${n.id}" type="button">${esc(L().del)}</button></div></article>`).join('');
    box.querySelectorAll('[data-note-edit]').forEach(b=>b.addEventListener('click',()=>openNoteEditor(notesCache.find(n=>n.id===b.dataset.noteEdit))));
    box.querySelectorAll('[data-note-copy]').forEach(b=>b.addEventListener('click',()=>copyText(notesCache.find(n=>n.id===b.dataset.noteCopy)?.body||'',L().copied)));
    box.querySelectorAll('[data-note-chat]').forEach(b=>b.addEventListener('click',()=>workWithChatGPT(notesCache.find(n=>n.id===b.dataset.noteChat))));
    box.querySelectorAll('[data-note-delete]').forEach(b=>b.addEventListener('click',()=>deleteNote(b.dataset.noteDelete)));
  }

  function fmt(v){try{return new Intl.DateTimeFormat((window.currentLanguage||'es')==='en'?'en-GB':(window.currentLanguage||'es'),{dateStyle:'short',timeStyle:'short'}).format(new Date(v));}catch(e){return '';}}
  function openNoteEditor(n=null){editingId=n?.id||null;$('noteEditorCard').classList.remove('hidden');$('noteEditorTitle').textContent=n?L().edit:L().newNote;$('noteEditorChapter').value=n?.chapter_number?String(n.chapter_number):String(window.current||'');$('noteEditorType').value=n?.note_type||'note';$('noteEditorBody').value=n?.body||'';$('noteEditorBody').focus();}
  function closeNoteEditor(){editingId=null;$('noteEditorCard').classList.add('hidden');$('noteEditorBody').value='';}

  async function saveNote(){
    if(!window.sb||!window.session)return;
    const body=$('noteEditorBody').value.trim();if(!body)return;
    const payload={user_id:window.session.user.id,chapter_number:$('noteEditorChapter').value?Number($('noteEditorChapter').value):null,note_type:$('noteEditorType').value,body,source_label:'notes-hub'};
    let error;
    if(editingId)({error}=await window.sb.from('course_notes').update(payload).eq('id',editingId));else ({error}=await window.sb.from('course_notes').insert(payload));
    if(error){$('notesStatus').textContent=error.message;return;}
    $('notesStatus').textContent=editingId?L().updated:L().saved;closeNoteEditor();await loadNotes();
  }

  async function deleteNote(id){
    if(!confirm(`${L().del}?`))return;
    const {error}=await window.sb.from('course_notes').delete().eq('id',id);if(error){$('notesStatus').textContent=error.message;return;}$('notesStatus').textContent=L().deleted;await loadNotes();
  }

  async function copyText(text,msg){
    try{await navigator.clipboard.writeText(text);}catch(e){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();}
    if($('notesStatus'))$('notesStatus').textContent=msg||L().copied;
  }

  function workWithChatGPT(n){
    if(!n)return;
    const context=n.chapter_number?`Capítulo ${n.chapter_number}: ${chapterTitle(n.chapter_number)}`:'Nota personal del Curso IA';
    const prompt=`Quiero trabajar esta anotación surgida mientras realizaba el Curso IA.\n\nContexto: ${context}\nTipo de anotación: ${L()[n.note_type]||n.note_type}\n\nAnotación:\n${n.body}\n\nAyúdame a convertirla en algo práctico. Primero interpreta qué quiero conseguir. Después propón un enfoque concreto y, cuando tenga sentido, un prompt reutilizable, una prueba o un flujo de trabajo. Señala qué debería verificar antes de utilizar el resultado.`;
    window.open('https://chatgpt.com/','_blank','noopener,noreferrer');copyText(prompt,L().chatCopied);
  }

  function addScrollTop(){
    if($('theoryScrollTopBtn'))return;
    const b=document.createElement('button');b.id='theoryScrollTopBtn';b.type='button';b.title='Volver arriba';b.setAttribute('aria-label','Volver arriba');b.textContent='↑';document.body.appendChild(b);
    const ws=$('curso');if(!ws)return;
    const update=()=>b.classList.toggle('visible',ws.classList.contains('open')&&ws.scrollTop>320);
    ws.addEventListener('scroll',update,{passive:true});
    b.addEventListener('click',()=>ws.scrollTo({top:0,behavior:'smooth'}));
    const mo=new MutationObserver(update);mo.observe(ws,{attributes:true,attributeFilter:['class']});
  }

  async function mirrorChapterNote(){
    if(!window.sb||!window.session||!window.current||!$('notes'))return;
    const chapter=Number(window.current);if(chapter<1)return;
    const body=$('notes').value.trim();
    const key=`${window.session.user.id}:${chapter}`;lastChapterKey=key;
    const {data,error}=await window.sb.from('course_notes').select('id,body').eq('chapter_number',chapter).eq('source_label','chapter-theory-live').maybeSingle();
    if(error)return;
    if(lastChapterKey!==key)return;
    if(!body){if(data?.id)await window.sb.from('course_notes').delete().eq('id',data.id);return;}
    if(data?.id){if(data.body!==body)await window.sb.from('course_notes').update({body,note_type:'note'}).eq('id',data.id);}else await window.sb.from('course_notes').insert({user_id:window.session.user.id,chapter_number:chapter,note_type:'note',body,source_label:'chapter-theory-live'});
  }

  function hookChapterTextarea(){
    const ta=$('notes');if(!ta||ta.dataset.v193Hooked)return;ta.dataset.v193Hooked='1';
    ta.addEventListener('input',()=>{clearTimeout(chapterSaveTimer);chapterSaveTimer=setTimeout(mirrorChapterNote,900);});
    ta.addEventListener('blur',()=>{clearTimeout(chapterSaveTimer);mirrorChapterNote();});
  }

  function refreshDynamic(){setVersion();addHomeNotesCard();addNotesWorkspace();addProfileShortcut();addScrollTop();hookChapterTextarea();}
  function init(){refreshDynamic();const mo=new MutationObserver(()=>refreshDynamic());mo.observe(document.body,{childList:true,subtree:true});window.addEventListener('focus',()=>{setVersion();});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
