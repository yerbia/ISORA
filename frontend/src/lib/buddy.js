// Trino: the small block companion that lives in Entren.ar, reads the user's training and grows
// with it. Pure helpers here: identity, mood, level, contextual fallback lines and cache keys.
export const KIND = 'block'
export const KIND_COLOR = 'var(--acc)'
export const DEFAULT_NAME = 'Trino'
export const emptyBuddy = () => ({ kind: null, name: '', born: null, level: 1, line: null })
export function cleanBuddy(b) {
  const o = b && typeof b === 'object' ? b : {}
  const kind = typeof o.kind === 'string' && o.kind ? KIND : null
  const name = kind ? DEFAULT_NAME : ''
  const lvl = Number(o.level)
  const line = o.line && typeof o.line === 'object' && typeof o.line.text === 'string' && typeof o.line.key === 'string'
    ? { key: o.line.key.slice(0, 120), text: o.line.text.slice(0, 200) } : null
  return { kind, name, born: typeof o.born === 'string' ? o.born : null, level: Number.isInteger(lvl) && lvl >= 1 ? lvl : 1, line }
}
export const XP_WORKOUT = 40
export const XP_PER_SET = 2
export const XP_SET_CAP = 60
export const XP_PR = 25
export function totalXP(workouts, setsOf) {
  let xp = 0
  for (const w of workouts || []) {
    if (!w) continue
    xp += XP_WORKOUT + Math.min(XP_SET_CAP, XP_PER_SET * (setsOf(w) || 0)) + XP_PR * ((w.prs || []).length)
  }
  return xp
}
export const xpForLevel = n => 50 * n * (n - 1)
export function levelOf(xp) {
  let level = 1
  while (xpForLevel(level + 1) <= xp) level++
  const into = xp - xpForLevel(level)
  const need = xpForLevel(level + 1) - xpForLevel(level)
  return { level, into, need, pct: Math.round((into / need) * 100) }
}
export function gearFor(level) { return { band: level >= 3, phones: level >= 6, crown: level >= 10 } }
export function moodOf({ active, doneToday, plannedToday, hour, daysSinceLast, everTrained }) {
  if (active) return 'active'
  if (doneToday) return 'proud'
  if (plannedToday) return 'hyped'
  if (hour >= 23 || hour < 5) return 'sleepy'
  if (!everTrained) return 'new'
  if (daysSinceLast != null && daysSinceLast >= 4) return 'missing'
  return 'chill'
}
export const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5)

// Eight reviewed offline lines per mood. {0}=name, {1}=session, {2}=level.
export const LINES = {
  active: [
    'You\'ve got this, {0}. One set at a time.', 'Locked in. I\'m right here, {0}.',
    'Strong start, {0}. Stay with the session.', 'That set is done. Keep the rhythm, {0}.',
    'One clean rep at a time, {0}.', 'Your focus is showing today, {0}.',
    'Trino is right here for the hard part.', 'Finish the session you started, {0}.',
  ],
  proud: [
    'That\'s today done, {0}. I\'m proud of you.', 'Workout logged. Now we recover, {0}.',
    'That session moved you forward, {0}.', 'You earned a win today, {0}.',
    'Your consistency is building something, {0}.', 'New work, same you, stronger result.',
    'Your level is growing because you showed up.', 'Recover well; tomorrow\'s progress starts here.',
  ],
  hyped: [
    '{1} today, {0}. Ready when you are.', 'It\'s {1} day, {0}. Let\'s make it count.',
    'Your plan is ready, {0}. Start with the first set.', 'A good session is waiting for you.',
    'Bring your goal to the bar today, {0}.', 'Your streak has a next step, {0}.',
    'Level {2} energy: let\'s put it to work.', 'The first set is all we need to begin.',
  ],
  sleepy: [
    'It\'s late, {0}. Sleep is training too.', 'Rest up, {0}. Big things tomorrow.',
    'The best move tonight is recovery, {0}.', 'Close the day gently; your body is still working.',
    'Tomorrow\'s session will thank you for resting.', 'No guilt tonight, {0}. Recovery counts.',
    'Trino is dimming the lights. We go again tomorrow.', 'Good night, {0}. Keep the long game.',
  ],
  missing: [
    'Haven\'t seen you in a while, {0}. Even a short session counts.', 'I missed you, {0}. Shall we ease back in?',
    'A gentle restart is still a restart, {0}.', 'Your next session does not need to be perfect.',
    'Come back with one small win, {0}.', 'The plan is waiting, not judging.',
    'Four quiet days do not erase your progress.', 'Let\'s make today the next page, {0}.',
  ],
  new: [
    'Hi {0}! Start your first workout and I\'ll start growing.', 'Your first workout is the hardest one, {0}. Let\'s do it.',
    'Every strong routine starts with one first set.', 'No perfect start needed, {0}. Just begin.',
    'Trino will grow with every workout you log.', 'Pick one movement and make today count.',
    'Today can be day one, {0}.', 'Let\'s learn the rhythm together, {0}.',
  ],
  chill: [
    'Rest day, {0}. Muscles grow while you recover.', 'Take it easy, {0}. You\'ve earned it.',
    'Recovery is part of the plan, not a pause from it.', 'A quiet day keeps the next session strong.',
    'Let your body catch up, {0}.', 'Rest now; progress is still happening.',
    'Your goal includes recovery too, {0}.', 'Trino approves this well-earned breather.',
  ],
}

export const LINES_ES = {
  active: [
    'Tú puedes, {0}. Serie a serie.', 'Concentrados. Estoy aquí, {0}.',
    'Buen comienzo, {0}. Sigue con la sesión.', 'Serie terminada. Mantén el ritmo, {0}.',
    'Una repetición limpia cada vez, {0}.', 'Hoy se nota tu concentración, {0}.',
    'Trino está aquí para la parte difícil.', 'Termina la sesión que has empezado, {0}.',
  ],
  proud: [
    'Hoy ya está, {0}. Estoy orgulloso de ti.', 'Entreno guardado. Ahora toca recuperar, {0}.',
    'Esa sesión te ha hecho avanzar, {0}.', 'Hoy te has ganado una victoria, {0}.',
    'Tu constancia está construyendo algo, {0}.', 'Trabajo nuevo, la misma persona, un resultado más fuerte.',
    'Tu nivel crece porque has aparecido.', 'Recupera bien; el progreso de mañana empieza aquí.',
  ],
  hyped: [
    'Hoy toca {1}, {0}. Cuando quieras.', 'Hoy es día de {1}, {0}. Que cuente.',
    'Tu plan está listo, {0}. Empieza por la primera serie.', 'Una buena sesión te está esperando.',
    'Hoy lleva tu objetivo a la barra, {0}.', 'Tu racha tiene un siguiente paso, {0}.',
    'Energía de nivel {2}: vamos a ponerla a trabajar.', 'Para empezar solo necesitamos la primera serie.',
  ],
  sleepy: [
    'Es tarde, {0}. Dormir también es entrenar.', 'Descansa, {0}. Mañana viene fuerte.',
    'El mejor movimiento esta noche es recuperar, {0}.', 'Cierra el día con calma; tu cuerpo sigue trabajando.',
    'La sesión de mañana te agradecerá que descanses.', 'Esta noche no hay culpa, {0}. Recuperar también cuenta.',
    'Trino baja las luces. Mañana volvemos.', 'Buenas noches, {0}. Piensa en el largo plazo.',
  ],
  missing: [
    'Hace tiempo que no te veo, {0}. Una sesión corta también cuenta.', 'Te eché de menos, {0}. ¿Volvemos poco a poco?',
    'Un reinicio suave sigue siendo un reinicio, {0}.', 'Tu próxima sesión no tiene que ser perfecta.',
    'Vuelve con una pequeña victoria, {0}.', 'El plan te espera, no te juzga.',
    'Cuatro días tranquilos no borran tu progreso.', 'Hagamos de hoy la siguiente página, {0}.',
  ],
  new: [
    '¡Hola {0}! Empieza tu primer entreno y empezaré a crecer.', 'El primer entreno es el más difícil, {0}. Vamos allá.',
    'Toda rutina fuerte empieza con una primera serie.', 'No necesitas un comienzo perfecto, {0}. Solo empieza.',
    'Trino crecerá con cada entrenamiento que registres.', 'Elige un movimiento y haz que hoy cuente.',
    'Hoy puede ser el día uno, {0}.', 'Aprendamos el ritmo juntos, {0}.',
  ],
  chill: [
    'Día de descanso, {0}. Los músculos crecen mientras descansas.', 'Tómatelo con calma, {0}. Te lo has ganado.',
    'Recuperar es parte del plan, no una pausa del mismo.', 'Un día tranquilo mantiene fuerte la próxima sesión.',
    'Deja que tu cuerpo se ponga al día, {0}.', 'Descansa ahora; el progreso sigue ocurriendo.',
    'Tu objetivo también incluye recuperar, {0}.', 'Trino aprueba este descanso bien merecido.',
  ],
}
const LINE_CONTEXT = {
  active: [[], [], ['session'], ['action'], ['session'], ['goal'], ['action'], ['action']],
  proud: [[], [], ['session'], ['action'], ['streak'], ['record'], ['level'], ['action']],
  hyped: [[], [], ['action'], ['session'], ['goal'], ['streak'], ['level'], ['action']],
  sleepy: [[], [], ['action'], ['session'], ['session'], ['action'], ['action'], ['goal']],
  missing: [[], [], ['action'], ['session'], ['action'], ['action'], ['streak'], ['action']],
  new: [[], [], ['action'], ['action'], ['level'], ['session'], ['action'], ['goal']],
  chill: [[], [], ['action'], ['session'], ['action'], ['action'], ['goal'], ['action']],
}
const contextTags = context => new Set([
  context?.action, context?.session ? 'session' : null, context?.record ? 'record' : null,
  Number(context?.streak) > 0 ? 'streak' : null, Number(context?.level) > 1 ? 'level' : null,
  context?.goal ? 'goal' : null,
].filter(Boolean))
const stableHash = value => [...String(value)].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7)
export function fallbackLine(mood, isoDate, context = {}, lang = 'en') {
  const list = String(lang).toLowerCase().startsWith('es') ? (LINES_ES[mood] || LINES_ES.chill) : (LINES[mood] || LINES.chill)
  const tags = contextTags(context)
  const choices = list.map((_, i) => {
    const matches = (LINE_CONTEXT[mood] || LINE_CONTEXT.chill)[i].filter(tag => tags.has(tag)).length
    const seed = [isoDate, mood, context.action || '', context.session || '', context.record || '',
      context.streak || 0, context.level || 1, context.goal || '', i].join('|')
    return { i, score: matches * 1000 + stableHash(seed) % 1000 }
  }).sort((a, b) => b.score - a.score)
  return list[choices[0]?.i || 0]
}
export const lineKey = (mood, isoDate, context = {}) =>
  [isoDate, mood, context.action || '', context.session || '', context.record || '',
    context.streak || 0, context.level || 1, context.goal || ''].join(':').slice(0, 120)
