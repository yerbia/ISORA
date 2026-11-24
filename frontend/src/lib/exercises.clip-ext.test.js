import { afterEach, describe, expect, it, vi } from 'vitest'

// The Android release shows its animations as animated WebP images (VITE_CLIP_EXT=webp); every
// other build keeps the MP4 loops.
describe('gifSrc and VITE_CLIP_EXT', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.resetModules() })
  const ex = { id: '9999', img: '9999.webp', gif: '9999.mp4', fv: '9998' }

  it('names MP4 loops by default', async () => {
    const { gifSrc, isVideoSrc } = await import('./exercises.js')
    expect(gifSrc(ex, 'male')).toBe('exercise-media/clip/9999.mp4')
    expect(gifSrc(ex, 'female')).toBe('exercise-media/clip/9998.mp4')
    expect(isVideoSrc(gifSrc(ex, 'male'))).toBe(true)
  })

  it('names animated WebP images in the Android release', async () => {
    vi.stubEnv('VITE_CLIP_EXT', 'webp')
    const { gifSrc, imgSrc, isVideoSrc } = await import('./exercises.js')
    expect(gifSrc(ex, 'male')).toBe('exercise-media/clip/9999.webp')
    expect(gifSrc(ex, 'female')).toBe('exercise-media/clip/9998.webp')
    expect(isVideoSrc(gifSrc(ex, 'male'))).toBe(false)
    expect(imgSrc(ex, 'male')).toBe('exercise-media/still/9999.webp')
    // a fork's GIF stays a GIF
    expect(gifSrc({ ...ex, gif: '9999.gif', fv: undefined }, 'male')).toBe('exercise-media/clip/9999.gif')
  })
})
