'use strict';
/* Comprueba que la app instalada abre sin internet (service worker) con los últimos datos. */
const { montar, manos } = require('./base.js');
(async () => {
  const t = await montar({ ctx: { serviceWorkers: 'allow' } }), { page, ctx } = t, m = manos(page);
  await m.conectar(t);
  await page.evaluate(() => navigator.serviceWorker.ready); await m.pausa(1500);
  await ctx.setOffline(true); t.hoja.caida = true;
  await page.reload(); await m.pausa(1500);
  const ok = await page.locator('nav.tabs .tab').first().isVisible() && await page.locator('.hero').isVisible();
  const st = await page.locator('#sync').textContent();
  console.log(ok ? '✓ abre sin internet · ' + st.trim() : '✗ no abre sin internet');
  await t.cerrar(); process.exit(ok ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
