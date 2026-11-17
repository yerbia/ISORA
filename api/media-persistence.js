/* Durable media backing for ephemeral API instances. Bytes live in Supabase Storage and this
 * table is the per-user index used by missing/usage checks. The browser never sees this client. */
import fs from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'user-media';

export function createMediaPersistence({ url, serviceRoleKey, log = console } = {}) {
  if (!url || !serviceRoleKey) return null;
  const client = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const pathOf = (uid, hash, ext) => `${uid}/${hash}.${ext}`;
  const avatarPath = uid => `avatars/${uid}.webp`;
  const warn = error => log.error?.('Supabase media persistence unavailable:', error?.message || error);

  return {
    enabled: true,
    async putAvatar(uid, { bytes, mime, size }) {
      const storagePath = avatarPath(uid);
      const { error: uploadError } = await client.storage.from(BUCKET).upload(storagePath, bytes, {
        contentType: mime,
        upsert: true,
        cacheControl: '31536000'
      });
      if (uploadError) throw uploadError;
      const { error } = await client.from('profiles').update({ avatar_path: storagePath, avatar_mime: mime, avatar_size: size }).eq('id', uid);
      if (error) throw error;
      return storagePath;
    },
    async avatar(uid) {
      const { data: profile, error } = await client.from('profiles').select('avatar_path,avatar_mime,avatar_size').eq('id', uid).maybeSingle();
      if (error) throw error;
      if (!profile?.avatar_path) return null;
      const { data, error: downloadError } = await client.storage.from(BUCKET).download(profile.avatar_path);
      if (downloadError) throw downloadError;
      return { mime: profile.avatar_mime || 'image/webp', size: profile.avatar_size || data.size, bytes: Buffer.from(await data.arrayBuffer()) };
    },
    async removeAvatar(uid) {
      const { data: profile } = await client.from('profiles').select('avatar_path').eq('id', uid).maybeSingle();
      if (profile?.avatar_path) {
        const { error } = await client.storage.from(BUCKET).remove([profile.avatar_path]);
        if (error) warn(error);
      }
      const { error } = await client.from('profiles').update({ avatar_path: null, avatar_mime: null, avatar_size: null }).eq('id', uid);
      if (error) throw error;
    },
    async put(uid, file) {
      const bytes = await fs.readFile(file.path);
      const storagePath = pathOf(uid, file.hash, file.ext);
      const { error: uploadError } = await client.storage.from(BUCKET).upload(storagePath, bytes, {
        contentType: file.mime,
        upsert: true,
        cacheControl: '31536000'
      });
      if (uploadError) throw uploadError;
      const { error } = await client.from('media_files').upsert({
        user_id: uid,
        hash: file.hash,
        mime: file.mime,
        ext: file.ext,
        size: file.size,
        storage_path: storagePath,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,hash' });
      if (error) throw error;
    },
    async metadata(uid, hash) {
      const { data, error } = await client.from('media_files')
        .select('hash,mime,ext,size,storage_path').eq('user_id', uid).eq('hash', hash).maybeSingle();
      if (error) throw error;
      return data || null;
    },
    async download(uid, hash) {
      const row = await this.metadata(uid, hash);
      if (!row) return null;
      const { data, error } = await client.storage.from(BUCKET).download(row.storage_path);
      if (error) throw error;
      return { ...row, bytes: Buffer.from(await data.arrayBuffer()) };
    },
    async missing(uid, hashes) {
      const { data, error } = await client.from('media_files').select('hash,size')
        .eq('user_id', uid).in('hash', hashes);
      if (error) throw error;
      const present = new Set((data || []).map(row => row.hash));
      return { missing: hashes.filter(hash => !present.has(hash)), usage: await this.usage(uid) };
    },
    async usage(uid) {
      const { data, error } = await client.from('media_files').select('size').eq('user_id', uid);
      if (error) throw error;
      return { bytes: (data || []).reduce((n, row) => n + Number(row.size || 0), 0), count: (data || []).length };
    },
    async remove(uid, hash) {
      const row = await this.metadata(uid, hash);
      if (!row) return;
      const { error: storageError } = await client.storage.from(BUCKET).remove([row.storage_path]);
      if (storageError) warn(storageError);
      const { error } = await client.from('media_files').delete().eq('user_id', uid).eq('hash', hash);
      if (error) throw error;
    },
    async sweep(uid, referenced, { force = false } = {}) {
      const { data, error } = await client.from('media_files').select('hash,storage_path,size,updated_at')
        .eq('user_id', uid);
      if (error) throw error;
      const old = (data || []).filter(row => !referenced.has(row.hash) && (force || Date.parse(row.updated_at || 0) < Date.now() - 14 * 86400000));
      if (!old.length) return { removed: 0, bytes: 0 };
      const { error: storageError } = await client.storage.from(BUCKET).remove(old.map(row => row.storage_path));
      if (storageError) warn(storageError);
      const { error: deleteError } = await client.from('media_files').delete().eq('user_id', uid).in('hash', old.map(row => row.hash));
      if (deleteError) throw deleteError;
      return { removed: old.length, bytes: old.reduce((n, row) => n + Number(row.size || 0), 0) };
    }
  };
}
