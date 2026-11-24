import { useEffect } from 'react'
import { getLang, useLang } from './i18n.js'

// The admin surface is intentionally English for every language except Spanish: it is an operator
// tool, and Spanish is the product's default language. Keeping the source phrases as the keys
// means a non-Spanish admin always sees the original English wording.
const ES = {
  Admin: 'Administración',
  'Loading…': 'Cargando…',
  'Loading Coach status…': 'Cargando el estado del entrenador IA…',
  'Could not load': 'No se pudo cargar',
  'The last update failed': 'La última actualización falló',
  'Could not load the users': 'No se pudieron cargar los usuarios',
  'Try again': 'Reintentar',
  'Everything about running this instance: who uses it, how they get in, the AI Coach, and what has happened on it. Nothing here shows anyone’s training data beyond counts.': 'Todo sobre la administración de esta instancia: quién la usa, cómo accede, el entrenador IA y lo que ha ocurrido. Aquí no se muestran datos de entrenamiento, solo cifras.',
  Users: 'Usuarios',
  'Training now': 'Entrenando ahora',
  'Active 7 days': 'Activos en 7 días',
  Disabled: 'Desactivados',
  'Sessions running at this moment. Tap a name for details.': 'Sesiones en curso. Toca un nombre para ver sus detalles.',
  'Everyone with a profile on this instance. Tap one to see their activity, to disable the account (nothing is deleted) or to delete it with all their data for good.': 'Todas las personas con un perfil en esta instancia. Toca una para ver su actividad, desactivar la cuenta (no se borra nada) o eliminarla definitivamente con todos sus datos.',
  'No users yet.': 'Todavía no hay usuarios.',
  'Invite codes': 'Códigos de invitación',
  'New code': 'Nuevo código',
  'Sign-up is invite-only: someone needs one of these codes to create a profile. Each code works once.': 'El registro requiere invitación: se necesita uno de estos códigos para crear un perfil. Cada código funciona una vez.',
  'Sign-up is open, so codes are optional here. They only record who invited whom.': 'El registro está abierto, así que los códigos son opcionales. Solo registran quién invitó a quién.',
  'Unused · tap to copy': 'Sin usar · toca para copiar',
  'Already used': 'Ya utilizados',
  used: 'utilizado',
  'No codes yet. "New code" makes one and copies it to your clipboard.': 'Todavía no hay códigos. «Nuevo código» crea uno y lo copia al portapapeles.',
  'Activity log': 'Registro de actividad',
  'Who signed in, what failed, and what an admin changed.': 'Quién inició sesión, qué falló y qué cambió un administrador.',
  All: 'Todos',
  'Sign-ins': 'Inicios de sesión',
  Admin: 'Administración',
  Failed: 'Fallidos',
  failed: 'fallido',
  'Nothing logged yet.': 'Todavía no hay actividad registrada.',
  'Show more': 'Mostrar más',
  'Reset code for': 'Código de restablecimiento para',
  'Done': 'Listo',
  'Workouts': 'Entrenamientos',
  'Weigh-ins': 'Pesajes',
  Measurements: 'Medidas',
  Routines: 'Rutinas',
  'Last sync': 'Última sincronización',
  'Workout history': 'Historial de entrenamientos',
  'No workouts logged.': 'No hay entrenamientos registrados.',
  'Download their data': 'Descargar sus datos',
  'Delete account': 'Eliminar cuenta',
  'Disable account': 'Desactivar cuenta',
  'Enable account': 'Activar cuenta',
  'Reset password': 'Restablecer contraseña',
  'Reset code': 'Código de restablecimiento',
  'AI Coach': 'Entrenador IA',
  'Set up the Coach': 'Configurar el entrenador IA',
  'Provider': 'Proveedor',
  Endpoint: 'Endpoint',
  Credential: 'Credencial',
  Model: 'Modelo',
  Test: 'Prueba',
  Advanced: 'Avanzado',
  Activity: 'Actividad',
  'Which AI answers the Coach': 'Qué IA responde al entrenador',
  'Where the model runs': 'Dónde se ejecuta el modelo',
  'Pick who answers. A key or token you save stays with its provider, so you can switch back and forth without pasting it again.': 'Elige quién responde. La clave o token se conserva con su proveedor para poder cambiar sin pegarlo de nuevo.',
  'Base URL': 'URL base',
  'Extra headers (optional)': 'Cabeceras adicionales (opcional)',
  'Connected': 'Conectado',
  'Replace key': 'Reemplazar clave',
  Remove: 'Quitar',
  'Add Claude Code token': 'Añadir token de Claude Code',
  'Add API key': 'Añadir clave API',
  'Add API key (optional)': 'Añadir clave API (opcional)',
  'Refresh list': 'Actualizar lista',
  'List models': 'Listar modelos',
  'Test the Coach': 'Probar el entrenador IA',
  Passed: 'Correcto',
  Failed: 'Fallido',
  Runtime: 'Entorno',
  ready: 'listo',
  missing: 'no disponible',
  'Jobs today': 'Trabajos de hoy',
  'Last success': 'Último éxito',
  'Last failure': 'Último fallo',
  'Recent jobs': 'Trabajos recientes',
  'No jobs yet.': 'Todavía no hay trabajos.',
  'Limits': 'Límites',
  'Per user, per day': 'Por usuario y día',
  'Whole instance, per day': 'Toda la instancia y día',
  'Max message length': 'Longitud máxima del mensaje',
  'Max output tokens': 'Máximo de tokens de salida',
  'Compare with others': 'Comparar con otras personas',
  'Whose account pays': 'Qué cuenta paga',
  'Jobs are blocked': 'Los trabajos están bloqueados',
  'Save token': 'Guardar token',
  'Save key': 'Guardar clave',
  'Token saved': 'Token guardado',
  'Credential removed': 'Credencial eliminada',
  'Loading Coach status…': 'Cargando el estado del entrenador IA…',
  'Force-disabled by': 'Desactivado por',
  'AI Coach': 'Entrenador IA',
  'Off right now, so nobody sees it anywhere in the app.': 'Ahora está desactivado, así que nadie lo ve en la aplicación.',
  'Bring any AI.': 'Usa cualquier IA.',
  'Private by design.': 'Privado por diseño.',
  'Each user decides.': 'Cada usuario decide.',
  'Users find the Coach under Plan → Coach. This switch is the only place it can be turned off for everyone.': 'Los usuarios encuentran el entrenador en Plan → Entrenador IA. Este interruptor es el único lugar donde se puede desactivar para todos.',
  'Provider': 'Proveedor',
  'Endpoint': 'Endpoint',
  'Credential': 'Credencial',
  'Model': 'Modelo',
  'Test': 'Prueba',
  'Advanced': 'Avanzado',
  'Activity': 'Actividad',
  'key saved': 'clave guardada',
  'Replace key': 'Reemplazar clave',
  'Remove': 'Quitar',
  'Add Claude Code token': 'Añadir token de Claude Code',
  'Add API key': 'Añadir clave API',
  'Add API key (optional)': 'Añadir clave API (opcional)',
  'Pick a model…': 'Elige un modelo…',
  'passed': 'correcto',
  'one real round trip, no user data': 'una prueba real, sin datos de usuarios',
  'Test the Coach': 'Probar el entrenador IA',
  'Finish the Endpoint step first.': 'Completa primero el paso Endpoint.',
  'Finish the Credential step first.': 'Completa primero el paso Credencial.',
  'Asking the provider…': 'Consultando al proveedor…',
  'Provider:': 'Proveedor:',
  'The provider answered as expected.': 'El proveedor respondió correctamente.',
  'No answer from the provider.': 'El proveedor no respondió.',
  'connected': 'conectado',
  'not needed': 'no necesaria',
  'optional, none saved': 'opcional, ninguna guardada',
  "can't be read": 'no se puede leer',
  'needed': 'necesaria',
  'Last failure': 'Último fallo',
  'Recent jobs': 'Trabajos recientes',
  'scheduled': 'programado',
  'Plan': 'Plan',
  'Review': 'Revisión',
  'No jobs yet.': 'Todavía no hay trabajos.',
  'Counts and outcomes only. What people asked the Coach, and what it answered, is never shown here.': 'Solo se muestran cifras y resultados. Nunca se muestra lo que las personas preguntaron ni lo que respondió el entrenador.',
  'The host is written to the job log, so you can always see where requests went.': 'El servidor se guarda en el registro de trabajos para saber siempre adónde fueron las solicitudes.',
  'Save token': 'Guardar token',
  'Save key': 'Guardar clave',
  'Connect': 'Conectar',
  'Account': 'Cuenta',
  'Delete account': 'Eliminar cuenta',
  'Disable account': 'Desactivar cuenta',
  'Enable account': 'Activar cuenta',
  'Coach test passed ✅': 'Prueba del entrenador correcta ✅',
  'Test failed': 'Prueba fallida',
  'Copied': 'Copiado',
  'Account deleted': 'Cuenta eliminada',
  'User disabled': 'Usuario desactivado',
  'User enabled': 'Usuario activado',
}

const sourceOf = new WeakMap()
const attrSource = new WeakMap()
const ATTRS = ['aria-label', 'title', 'placeholder']
const translate = (value, spanish) => spanish ? (ES[value] || value) : value

function translateDynamic(value, spanish) {
  if (!spanish) return value
  const users = value.match(/^([0-9]+) users Â· ([0-9]+) active this week$/)
  if (users) return `${users[1]} usuarios Â· ${users[2]} activos esta semana`
  const steps = value.match(/^([0-9]+) of ([0-9]+) steps done[.]$/)
  if (steps) return `${steps[1]} de ${steps[2]} pasos completados.`
  if (/^\\d+ users · \\d+ active this week$/.test(value)) {
    return value.replace(/^(\\d+) users · (\\d+) active this week$/, '$1 usuarios · $2 activos esta semana')
  }
  if (/^\\d+ of \\d+ steps done\\./.test(value)) return value.replace(/^([\\d]+) of ([\\d]+) steps done\\./, '$1 de $2 pasos completados.')
  return translate(value, true)
}

function apply(root, spanish) {
  if (!root) return
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  for (const node of nodes) {
    const current = node.nodeValue
    // React reuses text nodes for changing counters. A cached value such as the initial
    // "Loading…" must not win over the current English dynamic value, or the observer would
    // restore the loading label after the request has completed.
    const cached = sourceOf.get(node)
    // If the current value is exactly our translation of the cached source, keep the source.
    // Otherwise React has supplied a new value and it must replace the cache.
    const raw = cached && current === translateDynamic(cached, spanish) ? cached : current
    sourceOf.set(node, raw)
    const leading = raw.match(/^\s*/)?.[0] || ''
    const trailing = raw.match(/\s*$/)?.[0] || ''
    const body = raw.slice(leading.length, raw.length - trailing.length || undefined)
    if (body) {
      const next = leading + translateDynamic(body, spanish) + trailing
      if (next !== node.nodeValue) node.nodeValue = next
    }
  }
  root.querySelectorAll('*').forEach(el => {
    for (const attr of ATTRS) {
      if (!el.hasAttribute(attr)) continue
      let saved = attrSource.get(el)
      if (!saved) { saved = {}; attrSource.set(el, saved) }
      saved[attr] ??= el.getAttribute(attr)
      const next = translateDynamic(saved[attr], spanish)
      if (next !== el.getAttribute(attr)) el.setAttribute(attr, next)
    }
  })
}

export function useAdminLocalization(ref) {
  const version = useLang()
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const spanish = getLang() === 'es'
    let applying = false
    const run = () => { if (applying) return; applying = true; apply(root, spanish); applying = false }
    run()
    const observer = new MutationObserver(run)
    observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS })
    return () => observer.disconnect()
  }, [ref, version])
}
