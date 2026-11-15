#!/usr/bin/env node
// Renders the Entren.ar logo to every icon the app ships:
//   public/icon-180/192/512.png         the PWA (manifest, iOS home screen, notifications)
//   resources/icon-only.png ...         the sources @capacitor/assets turns into the native
//                                       Android and iOS icons and splash screens
// Run after changing public/logo.png:
//   node scripts/build-icons.mjs
//   npx @capacitor/assets generate --ios --android --iconBackgroundColor '#000000' --splashBackgroundColor '#000000' --iconBackgroundColorDark '#000000' --splashBackgroundColorDark '#000000'
import sharp from 'sharp'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const res = join(root, 'resources')
const BG = '#000000'
const logo = join(root, 'public', 'logo.png')
const render = (input, size, out) => sharp(input).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(out)
const centered = async (size, logoSize, out) => {
  const image = await sharp(logo).resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } }).composite([{ input: image, gravity: 'centre' }]).png().toFile(out)
}

for (const size of [180, 192, 512]) {
  await render(logo, size, join(root, 'public', `icon-${size}.png`))
  console.log(`public/icon-${size}.png`)
}

// Native sources. The logo itself is the legacy/iOS icon. Android's adaptive icon can crop its
// foreground, so it gets a smaller copy on a transparent canvas. Splash uses the same logo,
// centred on the app's black background.
await render(logo, 1024, join(res, 'icon-only.png'))
await centered(1024, 700, join(res, 'icon-foreground.png'))
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: BG } }).png().toFile(join(res, 'icon-background.png'))
for (const name of ['splash.png', 'splash-dark.png']) await centered(2732, 980, join(res, name))
console.log('resources/icon-only.png, icon-foreground.png, icon-background.png, splash.png, splash-dark.png')
