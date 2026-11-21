import test from 'node:test';
import assert from 'node:assert/strict';
import { dayReminderPush, restTimerPush, testPush } from '../push-messages.js';

test('localizes every server-generated notification in pt-BR', () => {
  assert.deepEqual(restTimerPush('pt-BR'), {
    title: 'Descanso terminado 💪',
    body: 'Hora da próxima série.',
    tag: 'rest-timer',
  });
  assert.deepEqual(testPush('pt-BR'), {
    title: 'Entren.ar',
    body: 'Notificação de teste ✅ É assim que os alertas aparecem.',
    tag: 'test',
  });
  assert.deepEqual(dayReminderPush('pt-BR', { name: 'Treino A', emoji: '💪' }), {
    title: '💪 Treino A hoje',
    body: 'Está no seu plano. Bora treinar 💪',
    tag: 'day-reminder',
  });
});

test('keeps the existing English copy as the fallback', () => {
  assert.deepEqual(restTimerPush('fr'), restTimerPush('en'));
  assert.equal(dayReminderPush('unknown', null).title, 'Workout planned today');
  assert.equal(testPush(undefined).body, 'Test notification ✅ This is what alerts look like.');
});

test('localizes Spanish push copy and uses Entren.ar branding', () => {
  assert.deepEqual(testPush('es'), {
    title: 'Entren.ar',
    body: 'Notificación de prueba ✅ Así son las alertas de Entren.ar.',
    tag: 'test',
  });
  assert.deepEqual(dayReminderPush('es', { name: 'Pierna', emoji: '🏋️' }), {
    title: '🏋️ Pierna hoy',
    body: 'Está en tu plan. ¡A entrenar! 💪',
    tag: 'day-reminder',
  });
});
