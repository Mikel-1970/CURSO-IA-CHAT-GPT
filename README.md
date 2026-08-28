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
