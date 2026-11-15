/* Persistent instance configuration for deployments whose filesystem is ephemeral.
 *
 * The service-role key is intentionally server-only. The row contains encrypted provider
 * credentials, so it must never be readable or writable directly from the browser.
 */
import { createClient } from '@supabase/supabase-js';
import * as cfgStore from './config.js';

export function createCoachPersistence({ url, serviceRoleKey, log = console } = {}) {
  if (!url || !serviceRoleKey) return null;
  const client = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  let warned = false;
  const report = error => {
    if (!warned) {
      warned = true;
      log.warn?.('Coach configuration persistence is unavailable; using local fallback:', error?.message || error);
    }
  };

  return {
    enabled: true,
    async load() {
      try {
        const { data, error } = await client.from('coach_config').select('config').eq('id', 'default').maybeSingle();
        if (error) throw error;
        if (data?.config && typeof data.config === 'object') cfgStore.replace(data.config);
        return true;
      } catch (error) {
        report(error);
        return false;
      }
    },
    async save(config = cfgStore.load()) {
      try {
        const { error } = await client.from('coach_config').upsert({ id: 'default', config, updated_at: new Date().toISOString() });
        if (error) throw error;
        warned = false;
        return true;
      } catch (error) {
        report(error);
        return false;
      }
    }
  };
}
