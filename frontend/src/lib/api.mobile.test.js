// @vitest-environment happy-dom

/* The phone build authenticates directly with Supabase. Without a Supabase session it refuses
   before touching Capacitor's local asset server; an existing legacy pairing still uses HTTP. */
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./mobile.js', () => ({ MOBILE: true }))

import { api, beacon, setRemoteAuth } from './api.js'
import { supabase } from './supabase.js'

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); setRemoteAuth('', null) })

describe('api() on the phone build', () => {
  it('without a Supabase session it refuses with auth (401) and never calls fetch', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    await expect(api('/api/data', { method: 'PUT', body: '{}' })).rejects.toMatchObject({ code: 'auth', status: 401 })
    await expect(api('/api/me')).rejects.toMatchObject({ code: 'auth', status: 401 })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('paired, it talks to the server with the pairing token', async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({ rev: 3 }), { status: 200, headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetch)
    setRemoteAuth('https://gym.example.com', 'TOKEN')
    await expect(api('/api/data/rev')).resolves.toEqual({ rev: 3 })
    expect(fetch.mock.calls[0][0]).toBe('https://gym.example.com/api/data/rev')
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer TOKEN')
  })

  it('cloud, it talks to Entren.ar with the Supabase bearer token', async () => {
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: { access_token: 'SUPABASE-TOKEN', user: { id: 'u1' } } }, error: null
    })
    const fetch = vi.fn(async () => new Response(JSON.stringify({ enabled: true }), { status: 200, headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetch)
    await expect(api('/api/admin/coach')).resolves.toEqual({ enabled: true })
    expect(fetch.mock.calls[0][0]).toBe('https://entren.ar/api/admin/coach')
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer SUPABASE-TOKEN')
  })
})

// The workout screen's "left" beacon went to https://localhost/api/activity on every phone, paired
// or not: Capacitor's asset server answered it with index.html (Android QA, v1.3.9).
describe('the "left" beacon on the phone build', () => {
  it('is never sent, paired or not: the api() call beside it is the one that reaches the server', () => {
    const sendBeacon = vi.fn(() => true)
    vi.stubGlobal('navigator', { ...navigator, sendBeacon })
    expect(beacon('/api/activity', { active: false })).toBe(false)
    setRemoteAuth('https://gym.example.com', 'TOKEN')
    expect(beacon('/api/activity', { active: false })).toBe(false)
    expect(sendBeacon).not.toHaveBeenCalled()
  })
})
