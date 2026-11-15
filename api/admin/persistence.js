/* Supabase-backed admin data for ephemeral deployments. The service-role client is server-only. */
import { createClient } from '@supabase/supabase-js';

const records = value => Array.isArray(value) ? value.filter(v => v && typeof v === 'object' && !Array.isArray(v)) : [];
const stateFor = row => row?.state && typeof row.state === 'object' && !Array.isArray(row.state) ? row.state : {};

const summary = (profile, state) => {
  const workouts = records(state.workouts);
  const last = workouts[workouts.length - 1];
  return {
    id: profile.id,
    name: profile.name || '',
    created: profile.created_at || null,
    disabled: !!profile.disabled,
    admin: !!profile.admin,
    invitedBy: null,
    workouts: workouts.length,
    lastWorkout: last?.d || null,
    lastSync: state._ts || (state.updated_at ? Date.parse(state.updated_at) : null) || null,
    hasPush: false,
    live: false
  };
};

export function createAdminPersistence({ url, serviceRoleKey, log = console } = {}) {
  if (!url || !serviceRoleKey) return null;
  const client = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const warn = error => log.warn?.('Supabase admin persistence unavailable:', error?.message || error);

  return {
    async invites() {
      const { data, error } = await client.from('invites').select('code,note,created_by,created_at,used_by,used_at,revoked').order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []).map(i => ({ code: i.code, note: i.note || '', createdBy: i.created_by || null, created: i.created_at || null, usedBy: i.used_by || null, usedAt: i.used_at || null, revoked: !!i.revoked }));
    },
    async createInvite(invite) {
      const { error } = await client.from('invites').insert({ code: invite.code, note: invite.note || '', created_by: invite.createdBy || null, created_at: invite.created });
      if (error) throw error;
    },
    async revokeInvite(code) {
      const { error } = await client.from('invites').update({ revoked: true }).eq('code', code).is('used_by', null);
      if (error) throw error;
    },
    async useInvite(code, userId, usedAt) {
      const { data, error } = await client.from('invites').update({ used_by: userId, used_at: usedAt }).eq('code', code).is('used_by', null).eq('revoked', false).select('code').maybeSingle();
      if (error) throw error;
      return !!data;
    },
    async users() {
      const [{ data: profiles, error: pe }, { data: states, error: se }] = await Promise.all([
        client.from('profiles').select('id,name,admin,disabled,created_at').order('created_at', { ascending: true }),
        client.from('workout_states').select('user_id,state,updated_at')
      ]);
      if (pe) throw pe;
      if (se) throw se;
      const byId = new Map((states || []).map(row => [row.user_id, row]));
      return (profiles || []).map(profile => summary(profile, stateFor(byId.get(profile.id))));
    },
    async user(id) {
      const [{ data: profile, error: pe }, { data: stateRow, error: se }] = await Promise.all([
        client.from('profiles').select('id,name,admin,disabled,created_at').eq('id', id).maybeSingle(),
        client.from('workout_states').select('state,updated_at').eq('user_id', id).maybeSingle()
      ]);
      if (pe) throw pe;
      if (se) throw se;
      if (!profile) return null;
      const state = stateFor(stateRow);
      const workouts = records(state.workouts);
      return {
        user: { id: profile.id, name: profile.name || '', created: profile.created_at || null, disabled: !!profile.disabled, admin: !!profile.admin },
        unit: state.unit || 'kg',
        lastSync: state._ts || (stateRow?.updated_at ? Date.parse(stateRow.updated_at) : null) || null,
        routines: records(state.routines).map(r => ({ id: r.id, name: r.name, emoji: r.emoji, count: records(r.ex).length })),
        bodyweight: records(state.bodyweight),
        measurements: records(state.measurements),
        workouts: workouts.reverse().map(({ media, ...w }) => w)
      };
    },
    async setDisabled(id, disabled) {
      const { error } = await client.from('profiles').update({ disabled: !!disabled }).eq('id', id);
      if (error) throw error;
    },
    async appendAudit(event) {
      const { error } = await client.from('audit_events').insert(event);
      if (error) warn(error);
    },
    async audit({ limit = 100, category = '', before = Infinity } = {}) {
      let query = client.from('audit_events').select('*').order('id', { ascending: false }).limit(limit);
      if (Number.isFinite(before)) query = query.lt('id', before);
      if (category === 'fail') query = query.eq('ok', false);
      else if (category) query = query.like('ev', `${category}.%`);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(({ id, ts, ev, ok, uid, name, tgt, tname, msg, act, ip }) => ({ id, ts, ev, ok, uid, name, tgt, tname, msg, act, ip }));
    },
    async clearAudit() {
      const { error } = await client.from('audit_events').delete().not('id', 'is', null);
      if (error) throw error;
    }
  };
}
