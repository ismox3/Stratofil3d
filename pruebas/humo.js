'use strict';
const { montar, manos } = require('./base.js');
(async () => {
  const dir = process.argv[2] || '.', t = await montar({ dsf: 2 }), { page } = t, m = manos(page);
  await m.conectar(t);
  for (const k of ['inicio', 'inventario', 'ventas', 'cobrar', 'mas']) { await m.tap('.tab[data-k="' + k + '"]'); await m.pausa(250); await page.screenshot({ path: dir + '/' + k + '.png', fullPage: true }); }
  console.log('errores:', t.errores);
  await t.cerrar();
})().catch(e => { console.error(e); process.exit(1); });
