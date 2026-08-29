# Curso IA – versión dinámica

Esta versión sólo necesita publicarse una vez en GitHub Pages.

- El contenido de capítulos, prácticas y rúbricas se descarga desde Supabase.
- Los capítulos nuevos aparecen automáticamente al abrir la app, sin reinstalarla.
- El progreso, respuestas, notas y feedback se sincronizan en Supabase al iniciar sesión.
- Hay caché local para poder consultar el último contenido descargado sin conexión.
- La app usa una publishable key, nunca service_role.

## Actualizar desde la versión anterior
Sustituye en el repositorio de GitHub Pages los archivos por los de este paquete y haz commit. La PWA instalada se actualizará automáticamente; no necesitas volver a añadirla a la pantalla de inicio.


## v4 Auth
Recuperación de contraseña, reenvío de confirmación y mensajes de error específicos.


## v5 — cierre de sesión robusto
- Cierre sólo de la sesión del dispositivo actual (`scope: local`).
- Limpieza explícita de las claves de autenticación Supabase en navegador.
- Si el servidor ya había cerrado la sesión (`session_not_found`), la interfaz se desconecta igualmente.
- Mensaje visible de resultado.


## v6 — sincronización robusta
- La fecha de sincronización la fija Supabase, no el reloj del PC/iPhone.
- Descargar nube siempre fuerza lectura remota.
- Subir este dispositivo siempre fuerza escritura del estado local.
- Una descarga remota no crea una falsa fecha local nueva.
- Si ambos dispositivos cambiaron desde la última sincronización, no se sobrescribe automáticamente.


## v7 — sincronización atómica definitiva
- Nuevo almacén de progreso v2 aislado de clientes antiguos.
- Cada edición genera un patch con solo los campos modificados.
- Supabase fusiona el patch atómicamente en el servidor.
- Una edición de Notas no puede borrar Prácticas, Feedback, Progreso o respuestas.
- Al actualizar desde v6 o anterior, la primera sesión descarga el estado canónico recuperado de la nube.
- Las respuestas de ejercicios ya no vienen pre-rellenadas en instalaciones nuevas.
- Fechas de capítulos ajustadas a cadencia diaria.


## v8 — persistencia de comprobaciones de prácticas
- Guarda los resultados de «Comprobar 1A», «Comprobar 1B» y «Comprobar comprensión».
- Los resultados reaparecen al cambiar de pestaña, recargar o abrir otro dispositivo.
- Los resultados se sincronizan de forma atómica junto con el resto del progreso.
- Si se modifica una respuesta después de comprobarla, se invalida sólo esa comprobación y debe repetirse.

- Si una práctica antigua estaba marcada como realizada pero sus comprobaciones no existían (v7 o anteriores), v8 reconstruye una vez los resultados desde las respuestas guardadas y los sincroniza.


## v10 — Capítulo 2 completo
- Mantiene la arquitectura multiusuario privada de v9.
- Práctica 2A completa: 5 ejercicios, respuestas persistentes y comprobaciones.
- Práctica 2B completa: reescritura de prompt con rúbrica orientativa.
- Práctica 2C completa: caso real con rúbrica orientativa.
- Las comprobaciones quedan guardadas y sincronizadas por usuario.
- El feedback del Capítulo 2 acepta el esquema publicado en Supabase.
- El progreso de la práctica 2 se guarda igual que el del Capítulo 1.


## v11 — multiusuario real + capítulos dinámicos
- Panel Administración visible solo a administradores.
- Lista privada de correos autorizados; usuarios no autorizados no reciben contenido desde Supabase.
- Estado local, caché y sincronización separados por usuario.
- Teoría y feedback ya son completamente dinámicos desde `course_content`.
- Prácticas de futuros capítulos usan el esquema genérico `practice.sections`/`practice.exercises`, sin actualizar GitHub.
- Aviso emergente al abrir la app cuando hay un capítulo publicado que el usuario aún no había visto.
- El aviso permite ir directamente al nuevo capítulo o posponerlo.
