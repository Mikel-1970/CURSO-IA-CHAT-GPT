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


## v12 — Corrección pedagógica mejorada
- Las preguntas abiertas muestran los criterios acertados.
- También muestran los criterios pendientes o mejorables.
- Las prácticas pueden incluir una respuesta de referencia definida desde Supabase.
- La respuesta de referencia se presenta como ejemplo, no como única solución válida.
- Las comprobaciones antiguas se reconstruyen automáticamente para incorporar los aciertos.
- Las clasificaciones muestran tanto aciertos como elementos a revisar.
- Esta funcionalidad forma parte del renderizador genérico y se aplica a futuros capítulos sin modificar la app.


## v13 — Progresión y capítulos adaptativos
- El estado ya no se cambia manualmente.
- Cada capítulo exige Lectura terminada + Prácticas comprobadas/terminadas + Feedback enviado.
- Los capítulos posteriores quedan bloqueados.
- Al completar un capítulo se crea en Supabase una solicitud única para el siguiente.
- Se guarda un perfil de aprendizaje con feedback, preferencias y resultados.
- Desde el capítulo 3 la app está preparada para priorizar contenido personalizado por usuario.
- El estado del siguiente capítulo puede ser Pendiente, Preparando o Disponible.
- La app comprueba periódicamente si el capítulo solicitado ya está publicado y muestra el aviso de nuevo capítulo.
- No existe calendario diario de capítulos.
- La generación automática del texto requiere un procesador servidor/IA con credenciales; la cola y la app ya quedan preparadas.


## v14 — Motor IA automático
- Al completar un capítulo, la app crea la solicitud y llama a `generate-course-chapter`.
- La Edge Function está desplegada en Supabase con JWT obligatorio.
- El trabajo se ejecuta en segundo plano.
- Las solicitudes pendientes se reintentan de forma limitada.
- El contenido generado se guarda en `course_user_content` y queda aislado por usuario.
- Cuando el capítulo está publicado, la app lo detecta y muestra el aviso.
- La clave `OPENAI_API_KEY` se almacena exclusivamente en los secretos de Supabase.


# v15 FINAL — Arquitectura definitiva
- 17 capítulos.
- No existe generación automática de capítulos ni llamadas a OpenAI desde la app.
- El contenido es común y se publica en `course_content`.
- Los capítulos posteriores pueden estar publicados, pero permanecen bloqueados hasta completar todos los anteriores.
- Cada capítulo exige: Lectura terminada + Prácticas terminadas y comprobadas + Feedback enviado.
- El feedback no puede enviarse si faltan preguntas cerradas obligatorias; los textos libres de capítulos anteriores siguen siendo opcionales.
- El capítulo 17 es la recapitulación y evaluación final.
- Su feedback global es cerrado: escalas y preguntas con cuatro opciones útiles + NS/NC.
- El feedback final se duplica en `course_final_feedback` para facilitar análisis agregado.
- Administración muestra número de respuestas finales, satisfacción media, NPS y dominio final percibido.
- El test final puede incluir `category` en cada pregunta para mostrar fortalezas y áreas a reforzar.
- Al completar el capítulo 17 se muestra el resumen final del curso.


## v15.2 — Corrección real del cierre del teclado en iPhone
Causa identificada:
- cada pulsación guardaba localmente la respuesta;
- tras 700 ms de pausa, el autosync enviaba el cambio a Supabase;
- al finalizar la sincronización se ejecutaba `renderAll()`;
- la pantalla se reconstruía y el `textarea` activo era sustituido;
- iOS perdía el foco y cerraba el teclado.

Corrección:
- todas las reconstrucciones completas pasan por `safeRenderAll()`;
- si existe un `textarea` o `input` de texto con foco, la reconstrucción se aplaza;
- el guardado local y el autosync continúan funcionando;
- al salir del campo de texto, se realiza el render pendiente si lo hubiera;
- la comprobación periódica de contenidos tampoco puede cerrar el teclado.
- no modifica progreso, prácticas, feedback, Supabase ni el bloqueo secuencial.


## v15.3 — Prácticas e interfaz iOS
### Comprobar
- El resultado permanece visible desde el primer clic.
- El autosync deja de reconstruir toda la pantalla después de subir un cambio.
- Se cancela cualquier render aplazado al comprobar y el resultado se reafirma tras las microactualizaciones.

### Respuestas abiertas
- La app ya no utiliza la coincidencia de palabras como veredicto correcto/incorrecto.
- Muestra criterios reconocidos y criterios no reconocidos automáticamente.
- Advierte de que un criterio no reconocido puede estar expresado de otra forma.
- La solución de referencia se presenta como una posible respuesta, no como la única correcta.

### iPhone
- Los botones que quedan físicamente detrás del teclado se ocultan mientras el teclado está abierto.
- Esto elimina la sombra azul visible a través del teclado translúcido.
- Se mantiene la protección de foco introducida en v15.2.


## v15.4 — Prácticas más ágiles
- Las preguntas de selección dejan de pedir cualquier justificación escrita, aunque el ejercicio publicado conserve un antiguo `require_reason=true`.
- Al comprobar una respuesta se muestra siempre:
  - tu respuesta;
  - Correcto / Incorrecto;
  - respuesta esperada cuando has fallado;
  - explicación breve y útil en ambos casos.
- Las respuestas abiertas mantienen la corrección orientativa de v15.3.
- Política editorial para capítulos siguientes:
  - objetivo aproximado 70–80 % de preguntas de selección;
  - 20–30 % de respuestas abiertas/casos;
  - usar preguntas abiertas solo cuando redactar o razonar por escrito forme parte real del aprendizaje.


## v15.5 — Actualización de contenido en móvil
Problema detectado en logs:
- el iPhone descargaba `course_progress_v2`;
- pero no estaba solicitando `course_content`;
- por ello podía conocer el progreso sin ver un capítulo recién publicado.

Corrección:
- al iniciar sesión se fuerza la descarga del contenido publicado;
- `Descargar nube` descarga tanto progreso como contenido;
- al volver la PWA a primer plano (`visibilitychange`, `pageshow`, `focus`) se comprueban capítulos nuevos;
- al recuperar conexión se actualiza el contenido;
- el polling periódico utiliza el mismo proceso de actualización;
- el service worker solicita actualizaciones con `updateViaCache: "none"`.


## v15.6 — Estabilidad de las prácticas
Problema observado:
- durante una práctica, una respuesta de sincronización podía llegar con un estado capturado unos instantes antes;
- algunas comprobaciones podían desaparecer y había que volver a pulsar `Comprobar`.

Solución:
- se conserva un snapshot local del capítulo activo durante cada subida;
- después de fusionar la respuesta de Supabase se restaura encima la práctica local activa;
- el polling de `course_content` no reconstruye la práctica si las versiones publicadas no han cambiado;
- aparece `Comprobados X / Y`;
- al marcar la práctica terminada se fuerza una sincronización completa antes de continuar.


## v17 — Rediseño solicitado
- Nombre: Curso IA ChatGPT.
- Pantalla inicial de acceso moderna en tonos azules.
- Login preparado para gestores de contraseñas (`autocomplete=username/current-password`).
- Menú principal con Curso, Prácticas y Feedback.
- Progreso mostrado como porcentaje compacto.
- Curso y prácticas en ventanas de trabajo independientes.
- Prácticas bloqueadas hasta `Lectura terminada`.
- Feedback bloqueado hasta `Práctica Terminada`.
- Nube retirada del menú normal e integrada en Administración/Sincronización.
- Administración completa para admin; para usuario normal solo sincronización.
- Nueva Edge Function `invite-course-user`: alta autorizada + invitación por correo.


## v17.3 — Interfaz futurista completa
- El mismo fondo futurista se utiliza en la pantalla principal y en las ventanas funcionales.
- Se conserva únicamente la estructura acordada: Curso, Prácticas y Feedback.
- Administración continúa separada.
- En móvil, el panel de acceso se desplaza hacia la zona superior derecha y ocupa aprox. 82 % del ancho, manteniendo inputs de 17 px y 50 px de altura.
- Curso, prácticas, feedback y administración usan paneles oscuros translúcidos con alto contraste.
- No se añaden calendario, foro, logros u otras funciones mostradas solo como inspiración visual en los mockups.


## v18
Revisión integral de interfaz, usuarios, instalación PWA y soporte multilingüe. El español continúa siendo la versión maestra; las traducciones de contenido se publican en `course_content_translations` y, mientras no existan, la app muestra un aviso y usa español.


## v18.1
Correcciones posteriores a la prueba móvil: diseño de acceso aprobado, recuerdo de usuario, refresco del perfil, Teoría, selector emergente de capítulo, listas con mayúscula inicial y justificación sin guiones automáticos.


## v18.2
Revisión de excelencia: capítulo 0, fondo futurista visible, selectores emergentes, respuestas por toque, bloqueo y persistencia de comprobaciones, progreso emergente y administración simplificada con refresco automático.


## v18.3
- El idioma elegido en la pantalla de acceso pasa a ser la preferencia del usuario.
- El cambio de idioma desde Perfil se aplica inmediatamente a la interfaz.
- Feedback deja de ser una zona principal: se abre automáticamente al completar cada práctica.
- La cabecera móvil se compacta para mantener visibles progreso, instalación, perfil y salida.
- El resumen de progreso muestra teoría, prácticas, comprobaciones y porcentaje de acierto.
- Si una traducción de contenido aún no está publicada, se avisa de forma explícita.
