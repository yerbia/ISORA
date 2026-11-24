// Node 26 no longer exposes a usable global localStorage unless Vitest is started with a
// --localstorage-file. The application and its browser-oriented tests deliberately exercise
// storage failure paths, so provide the small Web Storage contract they need in every environment.
function storage() {
  const values = new Map()
  const target = {
    get length() { return values.size },
    key: index => [...values.keys()][index] ?? null,
    getItem: key => values.has(String(key)) ? values.get(String(key)) : null,
    setItem: (key, value) => {
      const name = String(key)
      values.set(name, String(value))
      Object.defineProperty(target, name, { configurable: true, enumerable: true, writable: true, value: String(value) })
    },
    removeItem: key => {
      const name = String(key)
      values.delete(name)
      delete target[name]
    },
    clear: () => {
      for (const name of values.keys()) delete target[name]
      values.clear()
    },
  }
  return target
}

function install(name) {
  if (globalThis[name] && typeof globalThis[name].clear === 'function') return
  const value = storage()
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
  if (typeof window !== 'undefined') {
    try { Object.defineProperty(window, name, { configurable: true, writable: true, value }) } catch { /* happy-dom may own it */ }
  }
}

install('localStorage')
install('sessionStorage')
