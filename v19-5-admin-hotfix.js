/* V19.5 hotfix: activar/desactivar sin alterar nombre, rol ni idioma */
(()=>{
'use strict';
async function toggleUserPreservingProfile(email,newActive){
  try{
    const {data:u,error}=await sb.from('course_users').select('email,display_name,role,active,preferred_language').eq('email',email).maybeSingle();
    if(error||!u)throw new Error(error?.message||'Usuario no encontrado.');
    const {data,error:fnError}=await sb.functions.invoke('invite-course-user',{body:{action:'update',email:u.email,display_name:u.display_name||'',role:u.role||'member',preferred_language:u.preferred_language||'es',active:newActive}});
    if(fnError||data?.error)throw new Error(data?.error||fnError?.message||'No se pudo actualizar el usuario.');
    if(typeof renderAdminData==='function')await renderAdminData(false);
  }catch(err){alert(err?.message||String(err));}
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-admin-toggle]');
  if(!b)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  toggleUserPreservingProfile(b.dataset.adminToggle,b.dataset.active!=='1');
},true);
})();
