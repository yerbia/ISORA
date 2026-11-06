// @vitest-environment happy-dom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Login from './Login.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// ISORA signs users in with Supabase email/password or Google OAuth. This suite deliberately
// contains no passkey coverage: passkeys are not part of ISORA's authentication contract.
const mocks = vi.hoisted(() => {
  const state = { config: null, google: vi.fn(), sheets: [] }
  state.snapshot = () => ({
    config: state.config, S: {},
    setUser: vi.fn(), adoptProfile: vi.fn(), setGuest: vi.fn(), loadConfig: vi.fn(async () => state.config),
    pushState: vi.fn(), pullState: vi.fn(),
  })
  return state
})
vi.mock('../store/useStore.js', () => {
  const useStore = selector => selector ? selector(mocks.snapshot()) : mocks.snapshot()
  useStore.getState = mocks.snapshot
  return { useStore, hasData: () => false }
})
vi.mock('../store/useUI.js', () => {
  const snap = () => ({ toast: vi.fn(), openSheet: render => { mocks.sheets.push(render); return {} } })
  const useUI = selector => selector ? selector(snap()) : snap()
  useUI.getState = snap
  return { useUI }
})
vi.mock('../lib/api.js', () => ({
  bootstrapSupabaseSession: vi.fn(),
  supabaseSignIn: vi.fn(),
  supabaseSignInWithGoogle: (...args) => mocks.google(...args),
  supabaseSignUp: vi.fn(),
}))
vi.mock('../lib/demo.js', () => ({ DEMO: false, PERSONAL: false, REPO: 'https://example.invalid' }))

const mounted = []
function mount(el) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  mounted.push({ root, host })
  act(() => root.render(el))
  return host
}
const buttons = host => [...host.querySelectorAll('button')].map(b => b.textContent)
const button = (host, text) => [...host.querySelectorAll('button')].find(b => b.textContent === text)

beforeEach(() => { mocks.config = null; mocks.google.mockReset(); mocks.sheets.length = 0 })
afterEach(() => { act(() => { mounted.splice(0).forEach(({ root, host }) => { root.unmount(); host.remove() }) }) })

describe('ISORA email and Google authentication', () => {
  it('renders email/password and Google without passkey controls', () => {
    const page = mount(<Login />)
    expect(page.querySelector('input[type="email"]')).toBeTruthy()
    expect(page.querySelector('input[type="password"]')).toBeTruthy()
    expect(buttons(page)).toContain('Sign in')
    expect(buttons(page)).toContain('Continue with Google')
    expect(page.textContent.toLowerCase()).not.toContain('passkey')
  })

  it('switches to account creation with name and new-password fields', () => {
    const page = mount(<Login />)
    act(() => button(page, 'Create a new account').click())
    expect(page.querySelector('input[autocomplete="name"]')).toBeTruthy()
    expect(page.querySelector('input[autocomplete="new-password"]')).toBeTruthy()
    expect(buttons(page)).toContain('Create account')
  })

  it('starts Google OAuth from the login screen', () => {
    const page = mount(<Login />)
    act(() => button(page, 'Continue with Google').click())
    expect(mocks.google).toHaveBeenCalledTimes(1)
  })
})
