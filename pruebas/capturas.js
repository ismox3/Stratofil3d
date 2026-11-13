'use strict';
/* Capturas de las pantallas principales para revisar el diseño. Uso: node pruebas/capturas.js <carpeta> */
const { montar, manos } = require('./base.js');
(async () => {
  const dir = process.argv[2] || '.';
  for (const modo of ['claro', 'oscuro', 'ancho']) {
    const t = await montar({ dsf: modo === 'ancho' ? 1 : 2, oscuro: modo === 'oscuro', ctx: modo === 'ancho' ? { viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false } : {} }), { page } = t, m = manos(page);
    const foto = n => page.screenshot({ path: dir + '/' + modo + '-' + n + '.png' });
    await m.conectar(t); await m.pausa(2800); await foto('inicio');
    if (modo !== 'ancho') { await page.evaluate(() => scrollTo(0, 700)); await m.pausa(200); await foto('inicio2'); }
    for (const k of ['inventario', 'ventas', 'cobrar', 'mas']) { await m.tap('.tab[data-k="' + k + '"]'); await m.pausa(250); await foto(k); }
    await m.tap('.tab[data-k=ventas]'); await m.tap('#dyn .row'); await m.pausa(400); await foto('venta');
    await page.keyboard.press('Escape'); await m.tap('#fab'); await page.fill('#v_c', 'Car'); await m.tap('.pick[data-c="10101"]'); await m.tap('.pick[data-c="11300"]'); await m.pausa(300); await foto('ventaForm');
    await page.evaluate(() => { document.querySelector('#sheetB').scrollTop = 9999; }); await m.pausa(200); await foto('ventaForm2');
    await page.keyboard.press('Escape'); await m.tap('[data-act=dlgSi]'); await m.tap('.tab[data-k=inicio]'); await m.tap('#fab'); await m.pausa(400); await foto('nuevo');
    await page.keyboard.press('Escape'); await m.tap('.tab[data-k=inventario]'); await m.tap('#dyn .row'); await m.pausa(400); await foto('producto');
    await page.keyboard.press('Escape'); await m.tap('.tab[data-k=ventas]'); await m.tap('#dyn .row'); await m.tap('[data-s=recibo]'); await m.pausa(900); await foto('recibo');
    await t.cerrar();
  }
})().catch(e => { console.error(e); process.exit(1); });
