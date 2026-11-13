'use strict';
/* Recorre los flujos principales contra la hoja simulada y comprueba lo que queda escrito. */
const { montar, manos, hoyISO } = require('./base.js');
const { fecha, serial } = require('./puente-simulado.js');
let fallos = 0, pasos = 0;
const ok = (c, msg) => { pasos++; if (!c) { fallos++; console.log('  ✗ ' + msg); } else if (process.env.V) console.log('  ✓ ' + msg); };
const eq = (a, b, msg) => ok(String(a) === String(b), msg + ' → esperaba «' + b + '», salió «' + a + '»');
(async () => {
  const dir = process.argv[2], t = await montar(), { page, hoja } = t, m = manos(page), { tap, pausa, guardado } = m;
  const hoy = fecha(serial(hoyISO()));
  const V = () => hoja.filas('Ventas', 24), PG = () => hoja.filas('Pagos', 10), AP = () => hoja.filas('Apartados', 14);
  const paso = async (n, fn) => { console.log('· ' + n); try { await fn(); } catch (e) { fallos++; console.log('  ✗ EXCEPCIÓN ' + e.message.split('\n')[0]); if (dir) await page.screenshot({ path: dir + '/fallo-' + n.replace(/\W+/g, '_') + '.png' }); } };
  const cerrarTodo = async () => { for (let i = 0; i < 6 && await m.hojaAbierta(); i++) { await pausa(350); await page.keyboard.press('Escape'); await pausa(350); if (await page.locator('#dlg').isVisible()) await tap('[data-act=dlgSi]'); } await pausa(300); };

  await paso('clave incorrecta', async () => {
    await page.goto(t.url); await page.fill('#su_api', t.API); await page.fill('#su_k', 'MALA'); await tap('#F0 button[type=submit]'); await pausa(600);
    ok((await page.locator('[data-err]').textContent()).includes('clave'), 'avisa de la clave incorrecta');
    await page.fill('#su_api', 'http://otro.com'); await tap('#F0 button[type=submit]'); await pausa(300);
    ok((await page.locator('[data-err]').textContent()).includes('script.google'), 'valida el enlace');
  });
  await paso('conectar', async () => { await m.conectar(t); ok(await page.locator('.hero').isVisible(), 'muestra el inicio'); eq(await page.locator('.kpi .v').nth(1).textContent(), '$40.00', 'te deben'); });

  await paso('venta completa con cliente nuevo', async () => {
    await tap('.qa [data-m=venta]');
    await page.fill('#v_c', 'Ana Pérez'); await pausa(100);
    ok(await page.locator('#telBox').isVisible(), 'pide teléfono de cliente nuevo'); await page.fill('#v_t', '04145550000');
    await tap('.pick[data-c="10100"]'); await tap('.pick[data-c="10100"]'); await tap('.pick[data-c="ACC01"]');
    eq(await page.locator('#fTot').textContent(), '$60.00', 'total en el pie');
    await tap('button[form=F]'); await pausa(200);
    ok((await page.locator('[data-err]').textContent()).includes('cómo pagó'), 'exige indicar cómo pagó');
    await tap('[data-act=modo][data-v=todo]'); await tap('button[form=F]'); await pausa(200);
    ok((await page.locator('[data-err]').textContent()).includes('método'), 'exige método si hay pago');
    await page.selectOption('#v_m', 'PAGO MÓVIL'); await tap('button[form=F]'); await guardado();
    eq(await m.titulo(), 'Venta N° 4', 'abre el detalle de la venta nueva');
    const v = V().filter(x => x.v[1] === '4');
    eq(v.length, 2, 'dos filas en Ventas'); eq(v[0].v.slice(0, 4).join('|'), hoy + '|4|Ana Pérez|10100', 'fila 1'); eq(v[0].v[7] + '|' + v[0].v[8] + '|' + v[0].v[11] + '|' + v[0].v[19] + '|' + v[0].v[20], '2|24|PAGO MÓVIL|PAGADO|60', 'cantidad, precio, método, estado, pagado');
    eq(v[1].v[3] + '|' + v[1].v[7] + '|' + v[1].v[19], 'ACC01|1|', 'fila 2 sin estado');
    ok(String(hoja.raw('Ventas', v[0].r, 8)).startsWith('=IF(D'), 'precio de lista va como fórmula');
    const p = PG().pop(); eq(p.v.slice(0, 7).join('|'), hoy + '|VENTA|4|Ana Pérez|60|PAGO MÓVIL|205.5', 'pago en Pagos con tasa');
    const c = hoja.filas('Clientes', 7).pop(); eq(c.v[0] + '|' + c.v[1], 'Ana Pérez|04145550000', 'cliente creado con teléfono');
    await cerrarTodo(); ok(!(await m.hojaAbierta()), 'cierra la hoja');
  });

  await paso('venta fiada, abono y anulación', async () => {
    await tap('.tab[data-k=ventas]'); await tap('#fab'); eq(await m.titulo(), 'Nueva venta', 'el botón + abre venta en la pestaña Ventas');
    await page.fill('#v_c', 'car'); await pausa(150); await tap('#cliSug button'); eq(await page.inputValue('#v_c'), 'Carlos Rojas', 'sugerencia de cliente');
    await tap('.pick[data-c="11300"]'); await page.fill('.l-pr', '25'); await page.fill('.l-d', '2,50'); await pausa(100);
    eq(await page.locator('#fTot').textContent(), '$22.50', 'precio y descuento manuales');
    await tap('[data-act=modo][data-v=fiado]'); await tap('button[form=F]'); await guardado();
    let v = V().find(x => x.v[1] === '5'); eq(v.v[8] + '|' + v.v[9] + '|' + v.v[19] + '|' + v.v[20], '25|2.5|PENDIENTE|0', 'venta fiada con precio fijo');
    await tap('[data-s=pagoForm]'); await page.fill('#pg_m', '30'); await page.selectOption('#pg_me', 'ZELLE'); await tap('button[form=F]'); await pausa(200);
    ok((await page.locator('[data-err]').textContent()).includes('mayor'), 'no deja pagar de más');
    await page.fill('#pg_m', '10'); await tap('button[form=F]'); await guardado();
    v = V().find(x => x.v[1] === '5'); eq(v.v[19] + '|' + v.v[20] + '|' + v.v[11], 'ABONADO|10|ZELLE', 'abono registrado y método puesto');
    eq(await m.titulo(), 'Venta N° 5', 'vuelve al detalle');
    ok((await page.locator('#sheetB').textContent()).includes('$12.50'), 'saldo actualizado en el detalle');
    await tap('[data-act=anular]'); await tap('[data-act=dlgSi]'); await guardado();
    v = V().find(x => x.v[1] === '5'); eq(v.v[19] + '|' + v.v[20], 'PENDIENTE|0', 'pago anulado');
    ok(!PG().some(x => x.v[2] === '5'), 'el pago salió de Pagos');
    await cerrarTodo();
  });

  await paso('no deja vender de más', async () => {
    await tap('#fab'); await page.fill('#v_c', 'Carlos Rojas'); await tap('.pick[data-c="10101R"]'); await page.fill('.l-q', '9'); await pausa(100);
    ok((await page.locator('.l-info.warn').textContent()).includes('Solo hay 2'), 'avisa en la línea');
    await tap('[data-act=modo][data-v=fiado]'); await tap('button[form=F]'); await pausa(250);
    ok((await page.locator('[data-err]').textContent()).includes('No hay suficiente'), 'bloquea al guardar');
    await pausa(350); await page.keyboard.press('Escape'); await pausa(350);
    ok(await page.locator('#dlg').isVisible(), 'pregunta antes de descartar'); await tap('[data-act=dlgNo]'); ok(await m.hojaAbierta(), 'sigue editando');
    await pausa(350); await page.goBack(); await pausa(400); ok(await page.locator('#dlg').isVisible(), 'el botón atrás también pregunta'); await tap('[data-act=dlgSi]'); await pausa(500);
    ok(!(await m.hojaAbierta()), 'descarta y cierra');
  });

  await paso('editar venta', async () => {
    await tap('#dyn .row >> nth=1');
    const n = (await m.titulo()).replace('Venta N° ', '');
    await tap('[data-s=ventaForm][data-n="' + n + '"]');
    await tap('[data-act=step][data-d="1"]'); await page.fill('#v_n', 'Entrega en tienda'); await tap('button[form=F]'); await guardado();
    eq(await m.titulo(), 'Venta N° ' + n, 'vuelve al detalle tras editar');
    const v = V().filter(x => x.v[1] === n); eq(v[0].v[22], 'Entrega en tienda', 'nota guardada'); ok(v.length >= 1, 'sigue en la hoja');
    await cerrarTodo();
  });

  await paso('cobrar: pago repartido', async () => {
    await tap('.tab[data-k=cobrar]');
    await tap('[data-s=pagoCli][data-cl="Carlos Rojas"]');
    ok((await page.locator('#pcPrev').textContent()).includes('Venta N° 3'), 'muestra el reparto');
    await page.fill('#pg_m', '20'); await page.selectOption('#pg_me', 'EFECTIVO USD'); await pausa(150);
    await tap('button[form=F]'); await guardado();
    const v3 = V().find(x => x.v[1] === '3'), v5 = V().find(x => x.v[1] === '5');
    eq(v3.v[19] + '|' + v3.v[20], 'PAGADO|12', 'venta más vieja pagada'); eq(v5.v[19] + '|' + v5.v[20], 'ABONADO|8', 'el resto a la siguiente');
    eq(PG().filter(x => x.v[0] === hoy && x.v[3] === 'Carlos Rojas').map(x => x.v[4]).join('+'), '12+8', 'dos registros en Pagos');
    await cerrarTodo();
  });

  await paso('estado de cuenta, recibo y PDF', async () => {
    await tap('.cardrow .hd'); eq(await m.titulo(), 'Estado de cuenta', 'abre el estado de cuenta');
    await tap('[data-s=ecuentaImg]'); await pausa(600);
    ok(await page.evaluate(() => { const c = document.querySelector('#docCv'); return c.width === 1080 && c.height > 900 && c.getContext('2d').getImageData(200, 100, 1, 1).data[2] > 20; }), 'dibuja el estado de cuenta');
    const [d] = await Promise.all([page.waitForEvent('download'), tap('[data-act=savePdf]')]);
    ok(/Estado-de-cuenta-.*\.pdf$/.test(d.suggestedFilename()), 'descarga el PDF ' + d.suggestedFilename());
    const buf = require('fs').readFileSync(await d.path()); ok(buf.slice(0, 5).toString() === '%PDF-' && buf.length > 20000, 'el PDF es válido');
    await tap('[data-act=atras]'); eq(await m.titulo(), 'Estado de cuenta', 'vuelve con la flecha');
    await tap('#sheetB .row'); ok((await m.titulo()).startsWith('Venta N°'), 'abre una venta desde el estado de cuenta');
    await tap('[data-s=recibo]'); await pausa(600);
    const [d2] = await Promise.all([page.waitForEvent('download'), tap('[data-act=saveImg]')]); ok(/^Recibo-.*\.png$/.test(d2.suggestedFilename()), 'descarga el recibo ' + d2.suggestedFilename());
    await tap('[data-act=copyRecibo]'); await pausa(200); ok((await page.evaluate(() => navigator.clipboard.readText())).includes('Recibo de venta'), 'copia el texto del recibo');
    await pausa(350); await page.goBack(); await pausa(400); ok((await m.titulo()).startsWith('Venta N°'), 'atrás del teléfono vuelve una hoja');
    await tap('[data-act=cerrarHojas]'); await pausa(500); ok(!(await m.hojaAbierta()), 'la X cierra todas');
  });

  await paso('apartado, pedido recibido y entrega', async () => {
    await tap('.tab[data-k=inicio]'); await tap('.qa [data-m=apartado]');
    await page.fill('#v_c', 'Ana Pérez'); await tap('.pick[data-c="30100"]'); await page.fill('#v_pag', '5'); await page.selectOption('#v_m', 'ZELLE');
    await tap('button[form=F]'); await guardado();
    eq(await m.titulo(), 'Apartado A-002', 'crea el apartado A-002');
    let a = AP().find(x => x.v[1] === 'A-002'); eq(a.v[3] + '|' + a.v[7] + '|' + a.v[11] + '|' + a.v[12], '30100|1|5|APARTADO', 'fila del apartado');
    ok(!(await page.locator('[data-act=entregar]').count()), 'no se puede entregar sin mercancía');
    await cerrarTodo();
    await tap('.kpi[data-p=pedidos]'); await tap('#main .row'); eq(await m.titulo(), 'Pedido', 'abre el pedido');
    await tap('[data-act=recibir]'); await guardado();
    const c = hoja.filas('Compras', 17).filter(x => x.v[1] === 'US-1002'); eq(c.length, 2, 'pasó a Compras'); eq(c[0].v[3] + '|' + c[0].v[7] + '|' + c[0].v[8], '30100|6|84', 'línea de compra');
    eq(hoja.filas('En Camino', 15).map(x => x.v[12] + x.v[13]).join(), 'RECIBIDO' + hoy + ',RECIBIDO' + hoy, 'marcado como recibido');
    await cerrarTodo(); await pausa(350); await page.goBack(); await pausa(500);
    ok(await page.locator('.hero').isVisible(), 'atrás vuelve de la página al inicio');
    await tap('.todo [data-p=apartados]'); await tap('#main .row >> text=A-002'); await tap('[data-act=entregar]'); await guardado();
    ok((await m.titulo()).startsWith('Venta N°'), 'la entrega abre la venta');
    const n = (await m.titulo()).replace('Venta N° ', ''), v = V().find(x => x.v[1] === n);
    eq(v.v[2] + '|' + v.v[3] + '|' + v.v[19] + '|' + v.v[20], 'Ana Pérez|30100|ABONADO|5', 'venta de la entrega con el abono');
    a = AP().find(x => x.v[1] === 'A-002'); eq(a.v[12], 'ENTREGADO', 'apartado entregado');
    ok((await page.locator('#sheetB').textContent()).includes('abono del apartado A-002'), 'el abono aparece en la venta');
    await cerrarTodo();
  });

  await paso('entrega parcial', async () => {
    // A-001: 2 naranjas (ya llegaron) + 1 blanco. Se vende casi todo el blanco para que falte.
    await tap('.tab[data-k=ventas]'); await tap('#fab'); await page.fill('#v_c', 'Carlos Rojas'); await tap('.pick[data-c="10100"]');
    const disp = +(await page.locator('.pick[data-c="10100"] small').textContent()).split('·').pop();
    await page.fill('.l-q', String(disp)); await tap('[data-act=modo][data-v=fiado]'); await tap('button[form=F]'); await guardado(); await cerrarTodo();
    hoja.set('Compras', 5, [null, null, null, null, null, null, null, 5]);          // "alguien" corrige la compra: ahora falta el blanco
    await tap('#sync'); await pausa(800);
    await tap('.tab[data-k=mas]'); await tap('[data-p=apartados]'); await tap('#main .row >> text=A-001');
    await tap('[data-act=entregarParcial]'); await tap('[data-act=dlgSi]'); await guardado();
    const a = AP().filter(x => x.v[1] === 'A-001'); eq(a.length, 1, 'queda una línea apartada'); eq(a[0].v[3] + '|' + a[0].v[11] + '|' + a[0].v[12], '10100||APARTADO', 'sigue apartado lo que falta, abono ya usado');
    const v = V().filter(x => /Entrega parcial del apartado A-001/.test(x.v[22])); eq(v.length, 1, 'venta parcial creada'); eq(v[0].v[3] + '|' + v[0].v[7] + '|' + v[0].v[19] + '|' + v[0].v[20], '30100|2|ABONADO|10', 'con el abono aplicado');
    ok(PG().some(x => x.v[1] === 'VENTA' && x.v[2] === v[0].v[1] && x.v[4] === '10'), 'el abono pasó a la venta en Pagos');
    await cerrarTodo(); await pausa(350); await page.goBack(); await pausa(400);
  });

  await paso('gasto: crear, editar, eliminar', async () => {
    await tap('.tab[data-k=inicio]'); await tap('#fab'); await tap('.menu [data-s=gastoForm]');
    await page.fill('#g_m', '7,25'); await page.fill('#g_d', '=HYPERLINK("x")'); await page.selectOption('#g_me', 'ZELLE'); await tap('button[form=F]'); await guardado();
    let g = hoja.filas('Gastos', 6).pop(); eq(g.v.join('|'), hoy + '|DELIVERY LOCAL|=HYPERLINK("x")|7.25|ZELLE|', 'gasto guardado');
    eq(hoja.raw('Gastos', g.r, 2), '=HYPERLINK("x")', 'el texto que parece fórmula se guarda como texto');
    ok(!(await m.hojaAbierta()), 'cierra tras guardar');
    await tap('.tab[data-k=mas]'); await tap('[data-p=gastos]'); await tap('#main .row'); await page.fill('#g_d', 'Cajas'); await tap('button[form=F]'); await guardado();
    eq(hoja.filas('Gastos', 6).pop().v[2], 'Cajas', 'gasto editado');
    await tap('#main .row'); await tap('[data-act=delFila]'); await tap('[data-act=dlgSi]'); await guardado(); await pausa(400);
    eq(hoja.filas('Gastos', 6).length, 1, 'gasto eliminado'); ok(!(await m.hojaAbierta()), 'cierra tras eliminar');
    await pausa(350); await page.goBack(); await pausa(400);
  });

  await paso('cliente: renombrar', async () => {
    await tap('[data-p=clientes]'); await page.fill('#q_cliQ', 'maria'); await pausa(200);
    eq(await page.locator('#dyn .row').count(), 1, 'busca sin acentos'); await tap('#dyn .row');
    await tap('#sheetCard [data-s=clienteForm]'); await page.fill('#c_nombre', 'María Gómez Paz'); await page.fill('#c_tel', '0424-1112233'); await tap('button[form=F]'); await guardado();
    ok(V().filter(x => x.v[1] === '2').every(x => x.v[2] === 'María Gómez Paz'), 'ventas renombradas'); ok(PG().filter(x => x.v[2] === '2').every(x => x.v[3] === 'María Gómez Paz'), 'pagos renombrados');
    eq(hoja.raw('Clientes', 6, 1), '0424-1112233', 'teléfono como texto');
    eq(await m.titulo(), 'Cliente', 'vuelve a la ficha'); ok((await page.locator('#sheetB .n').textContent()).includes('Paz'), 'ficha con el nombre nuevo');
    await cerrarTodo(); await page.fill('#q_cliQ', ''); await pausa(350); await page.goBack(); await pausa(400);
  });

  await paso('producto: crear, editar y eliminar', async () => {
    await tap('.tab[data-k=inventario]'); await tap('#main [data-s=prodForm]');
    await page.fill('#p_cod', '12000'); await page.fill('#p_pre', '28'); await page.fill('#p_col', 'gold'); await tap('button[form=F]'); await guardado();
    const p = hoja.filas('Inventario', 16).pop(); eq(p.v[0] + '|' + p.v[1] + '|' + p.v[2] + '|' + p.v[3] + '|' + p.v[15], '12000|PLA BASIC|GOLD|CON SPOOL|$28.00', 'producto creado');
    eq(hoja.raw('Parámetros', 12, 1), 'GOLD', 'color agregado a la lista');
    await page.fill('#q_invQ', 'gold'); await pausa(200); await tap('#dyn .row'); await tap('#sheetCard [data-s=prodForm]'); await page.fill('#p_pre', '29,5'); await tap('button[form=F]'); await guardado();
    eq(hoja.filas('Inventario', 16).pop().v[15], '$29.50', 'precio editado');
    await tap('[data-act=delProd]'); await tap('[data-act=dlgSi]'); await guardado(); await pausa(500);
    eq(hoja.filas('Inventario', 16).length, 6, 'producto eliminado'); ok(!(await m.hojaAbierta()), 'la ficha se cierra sola');
    await page.fill('#q_invQ', '');
  });

  await paso('pedido y compra: crear y editar', async () => {
    await tap('#fab'); await tap('.menu [data-k=encamino]');
    await page.fill('#pd_n', 'US-2000'); await page.selectOption('.l-p', '10101'); await page.fill('.l-q', '4'); await page.fill('.l-s', '52'); await pausa(100);
    eq(await page.locator('#fTot').textContent(), '$55.64', 'total con tax'); await tap('button[form=F]'); await guardado();
    let e = hoja.filas('En Camino', 15).pop(); eq(e.v.slice(1, 4).join('|') + '|' + e.v[7] + '|' + e.v[8] + '|' + e.v[12], 'US-2000|BAMBU LAB US|10101|4|52|EN CAMINO', 'pedido guardado');
    await tap('.tab[data-k=mas]'); await tap('[data-p=pedidos]'); await tap('#main .row >> text=US-2000'); await tap('#sheetCard [data-s=pedidoForm]');
    await page.fill('#pd_n', 'US-2001'); await page.fill('.l-q', '5'); await tap('button[form=F]'); await guardado();
    e = hoja.filas('En Camino', 15).filter(x => x.v[1].startsWith('US-20')); eq(e.length, 1, 'una sola fila tras editar'); eq(e[0].v[1] + '|' + e[0].v[7], 'US-2001|5', 'pedido editado');
    ok((await page.locator('#sheetB .n').textContent()).includes('US-2001'), 'el detalle sigue al pedido renombrado');
    await tap('[data-act=delPedido]'); await tap('[data-act=dlgSi]'); await guardado(); await pausa(500);
    ok(!hoja.filas('En Camino', 15).some(x => x.v[1] === 'US-2001'), 'pedido eliminado');
    await pausa(350); await page.goBack(); await pausa(400);
  });

  await paso('tasa y ajustes', async () => {
    await tap('.tile[data-s=tasa]'); await page.fill('#tz_v', '1.210,75'); await tap('button[form=F]'); await guardado();
    eq(hoja.raw('Parámetros', 9, 1), 1210.75, 'tasa con miles y coma');
    await tap('[data-p=ajustes]'); await page.fill('#aj_yo', 'Ismael'); await page.fill('#aj_sm', '2');
    await page.fill('#aj_met', 'EFECTIVO USD = 0\nZELLE = 0\nPAGO MÓVIL = 0\nBINANCE / USDT = 1,5\nZINLI = 3');
    await pausa(350); await page.goBack(); await pausa(400); ok(await page.locator('#dlg').isVisible(), 'avisa de ajustes sin guardar'); await tap('[data-act=dlgNo]');
    await tap('#FA button[type=submit]'); await guardado();
    eq(hoja.raw('Parámetros', 7, 1), 2, 'stock mínimo'); eq(hoja.raw('Parámetros', 16, 3) + '|' + hoja.raw('Parámetros', 16, 4), 'ZINLI|0.03', 'método nuevo con comisión'); eq(hoja.raw('Parámetros', 15, 4), 0.015, 'comisión con coma');
    eq(hoja.raw('Parámetros', 12, 1), 'GOLD', 'no pisa la lista de colores');
    await tap('[data-act=tema][data-v=dark]'); eq(await page.evaluate(() => document.documentElement.dataset.theme), 'dark', 'tema oscuro');
    await tap('[data-act=tema][data-v=light]');
    await pausa(350); await page.goBack(); await pausa(400); ok(!(await page.locator('#dlg').isVisible()) && await page.locator('.tiles').first().isVisible(), 'sale de ajustes sin preguntar tras guardar');
  });

  await paso('páginas de consulta', async () => {
    for (const p of ['caja', 'pagos', 'stats', 'resumen', 'reposicion', 'catalogo', 'compras', 'clientes']) {
      await tap('[data-p=' + p + ']'); await pausa(150); ok(await page.locator('#main .vh h1').isVisible(), 'abre ' + p);
      if (p === 'caja') { ok((await page.locator('.hero .v').textContent()) === '$85.00', 'caja de hoy suma los pagos de hoy: ' + await page.locator('.hero .v').textContent()); await tap('[data-act=copyCierre]'); await pausa(150); ok((await page.evaluate(() => navigator.clipboard.readText())).includes('Cierre de caja'), 'copia el cierre'); for (const c of ['ayer', 'semana', 'mes']) await tap('[data-p=' + c + ']'); }
      if (p === 'stats') for (const c of ['semana', 'anio']) await tap('.chip[data-p=' + c + ']');
      if (p === 'pagos') { await tap('.chip[data-p=todo]'); await page.selectOption('#pg_cli', 'Carlos Rojas'); await pausa(200); ok(await page.locator('[data-s=ecuenta]').isVisible(), 'filtra por cliente'); await page.selectOption('#pg_cli', ''); }
      if (p === 'catalogo') { await tap('[data-s=catImg]'); await pausa(500); ok(await page.evaluate(() => document.querySelector('#docCv').height > 500), 'imagen del catálogo'); await cerrarTodo(); }
      if (dir) await page.screenshot({ path: dir + '/pg-' + p + '.png', fullPage: true });
      await pausa(350); await page.goBack(); await pausa(400);
    }
  });

  await paso('eliminar venta', async () => {
    await tap('.tab[data-k=ventas]'); await page.fill('#q_ventasQ', 'ana'); await pausa(200); await tap('#dyn .row >> text=N° 4');
    await tap('[data-act=delDoc]'); await tap('[data-act=dlgSi]'); await guardado(); await pausa(500);
    ok(!V().some(x => x.v[1] === '4'), 'venta 4 fuera de la hoja'); ok(!PG().some(x => x.v[1] === 'VENTA' && x.v[2] === '4'), 'sus pagos también'); ok(!(await m.hojaAbierta()), 'cierra sola');
    ok(String(hoja.raw('Ventas', 9, 1)).startsWith('=IF(A9'), 'la fila queda con sus fórmulas'); await page.fill('#q_ventasQ', '');
  });

  await paso('cambio en la hoja por otra persona', async () => {
    await tap('#dyn .row >> text=N° 5'); await tap('#sheetCard [data-s=ventaForm]');
    const r = V().find(x => x.v[1] === '5').r; hoja.set('Ventas', r, [null, null, null, null, null, null, null, 3]);
    await page.fill('#v_n', 'cambio'); await tap('button[form=F]'); await page.waitForSelector('.toast.t-err'); ok((await page.locator('.toast').textContent()).includes('Alguien cambió'), 'no pisa cambios ajenos');
    eq(hoja.raw('Ventas', r, 7), 3, 'la hoja conserva lo del otro'); await cerrarTodo();
  });

  await paso('sin conexión', async () => {
    hoja.caida = true; await tap('.tab[data-k=cobrar]'); await tap('#main [data-s=pagoCli]'); await page.selectOption('#pg_me', 'ZELLE'); await tap('button[form=F]');
    await page.waitForSelector('.toast.t-err'); ok((await page.locator('.toast').textContent()).includes('Sin internet'), 'avisa que no guardó'); ok(await m.hojaAbierta(), 'el formulario sigue abierto con lo escrito');
    await cerrarTodo(); await page.reload(); await pausa(900);
    ok(await page.locator('nav.tabs .tab').first().isVisible(), 'abre con los datos guardados aunque no haya conexión'); ok((await page.locator('#sync').textContent()).includes('Sin conexión'), 'indica sin conexión');
    hoja.caida = false; await tap('#sync'); await pausa(900); ok((await page.locator('#sync').textContent()).includes('Al día'), 'se recupera al volver la conexión');
  });

  await paso('enlace de acceso y desconectar', async () => {
    await tap('.tab[data-k=mas]'); await tap('[data-p=ajustes]'); await tap('[data-act=copyAccess]'); await pausa(200);
    const link = await page.evaluate(() => navigator.clipboard.readText()); ok(link.includes('?api=') && link.includes('&k='), 'copia el enlace');
    await tap('[data-act=logout]'); await tap('[data-act=dlgSi]'); await pausa(600); ok(await page.locator('#su_api').isVisible(), 'vuelve a la pantalla de conexión');
    eq(await page.evaluate(() => localStorage.getItem('sf_cache')), 'null', 'borra la copia local');
    await page.goto(link); await page.waitForSelector('nav.tabs .tab'); ok(!page.url().includes('k='), 'el enlace conecta y limpia la dirección');
  });

  const errs = t.errores.filter(e => !/ERR_FAILED|ERR_INTERNET_DISCONNECTED|Alguien cambió|Error: net/.test(e));
  ok(!errs.length, 'sin errores en consola: ' + errs.join(' | '));
  console.log('\n' + (fallos ? '✗ ' + fallos + ' fallo(s)' : '✓ todo bien') + ' · ' + pasos + ' comprobaciones');
  await t.cerrar(); process.exit(fallos ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
