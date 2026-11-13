'use strict';
/* StratoFil3D · hojas (detalles y formularios), acciones, guardado y arranque. */

const tot = (l, v, cls) => '<div' + (cls ? ' class="' + cls + '"' : '') + '><span>' + l + '</span><span class="num">' + v + '</span></div>';
const opts = (arr, sel) => arr.map(x => '<option' + (x === sel ? ' selected' : '') + '>' + esc(x) + '</option>').join('') + (sel && !arr.includes(sel) ? '<option selected>' + esc(sel) + '</option>' : '');
const metodoSel = (id, sel) => '<select id="' + id + '" name="metodo"><option value="">Sin indicar</option>' + opts(cfg().metodos.map(m => m.n), sel || '') + '</select>';
const fld = (id, name, label, val, extra) => '<div class="f"><label for="' + id + '">' + label + '</label><input id="' + id + '" name="' + name + '" value="' + esc(val ?? '') + '"' + (extra || '') + '></div>';
const pieF = (label, extra) => '<div class="err" data-err role="alert"></div>' + (extra || '') + '<button class="btn pri block" type="submit" form="F">' + label + '</button>';
const itemsCard = (items, extra) => '<div class="card items">' + items.map(it => {
  const p = prod(it.codigo) || { color: it.codigo };
  return '<div class="it">' + swatch(p) + '<div class="main"><b>' + esc(title(p.color)) + '</b><div class="muted small">' + esc([p.tipo, title(p.presentacion || '')].filter(Boolean).join(' · ')) + (p.tipo ? ' · ' : '') + num(it.cantidad) + ' × ' + money(num(it.precio)) + (num(it.descuento) ? ' − ' + money(num(it.descuento)) : '') + (extra ? extra(it) : '') + '</div></div><div class="num">' + money(lineaTotal(it)) + '</div></div>';
}).join('') + '</div>';
function pagosList(ls, pagado) {
  if (!ls.length && !(pagado > 0.005)) return '';
  const sum = ls.reduce((s, p) => s + p.monto, 0), rest = r2(pagado - sum);
  return sec('Pagos recibidos') + '<div class="list">' + ls.map(p => '<div class="row">' + icBox('check', 'g') + '<div class="main"><div class="t num">' + money(p.monto) + (p.tasa ? ' <span class="muted small">· ' + bsFmt(p.monto * p.tasa) + '</span>' : '') + '</div><div class="d">' + fdate(p.fecha) + (p.metodo ? ' · ' + esc(title(p.metodo)) : '') + (p.tipo === 'APARTADO' ? ' · abono del apartado ' + esc(p.numero) : '') + (p.vendedor ? ' · ' + esc(p.vendedor) : '') + '</div></div><button class="btn sm danger" ' + A('anular', { id: p.id, sig: p.sig }) + '>Anular</button></div>').join('')
    + (rest > 0.005 ? '<div class="row">' + icBox('check') + '<div class="main"><div class="t num">' + money(rest) + '</div><div class="d">Pagos anteriores sin detalle</div></div></div>' : '') + '</div>';
}
const pedidoRows = (k, p, f) => S[k].filter(x => (x.pedido || 'Sin número') === p && x.fecha === f);

/* ============ líneas de productos en formularios ============ */
function prodOptions(sel) {
  const groups = {}; for (const p of S.productos) (groups[p.tipo] = groups[p.tipo] || []).push(p);
  return '<option value="">Elige un producto…</option>' + (sel && !prod(sel) ? '<option value="' + esc(sel) + '" selected>' + esc(sel) + ' (no está en Inventario)</option>' : '')
    + Object.keys(groups).map(t => '<optgroup label="' + esc(t) + '">' + groups[t].sort((a, b) => (a.presentacion || '').localeCompare(b.presentacion || '') || a.color.localeCompare(b.color)).map(p => {
      const e = C.P[p.codigo] || { disp: 0, enCamino: 0 };
      return '<option value="' + esc(p.codigo) + '"' + (p.codigo === sel ? ' selected' : '') + '>' + esc(title(p.color) + ' · ' + title(p.presentacion) + ' (' + e.disp + ' disp.' + (e.enCamino ? ', +' + e.enCamino + ' en camino' : '') + ')') + '</option>';
    }).join('') + '</optgroup>').join('');
}
let lineSeq = 0;
function lineHtml(it, mode) {
  const i = lineSeq++, n = (id, cls, label, val, ph) => '<div class="f"><label for="' + id + i + '">' + label + '</label><input id="' + id + i + '" class="' + cls + '" inputmode="decimal" autocomplete="off" value="' + esc(val ?? '') + '"' + (ph ? ' placeholder="' + ph + '"' : '') + '></div>';
  return '<div class="line" data-line><div class="line-top"><select class="l-p" aria-label="Producto">' + prodOptions(it && it.codigo) + '</select><button type="button" class="rm" data-act="rmLine" aria-label="Quitar producto">' + ic('trash') + '</button></div>'
    + '<div class="line-nums' + (mode === 'pedido' ? ' two' : '') + '"><div class="f"><label for="l_q' + i + '">Cantidad</label><div class="stepper"><button type="button" ' + A('step', { d: -1 }) + ' aria-label="Uno menos">' + ic('minus') + '</button><input id="l_q' + i + '" class="l-q" inputmode="numeric" autocomplete="off" value="' + esc(it ? it.cantidad : 1) + '"><button type="button" ' + A('step', { d: 1 }) + ' aria-label="Uno más">' + ic('plus') + '</button></div></div>'
    + (mode === 'compra' ? n('l_s', 'l-s', 'Subtotal sin tax $', it && it.subtotal) + n('l_e', 'l-e', 'Envío real $', it && it.envioReal != null ? it.envioReal : '', 'auto')
      : mode === 'pedido' ? n('l_s', 'l-s', 'Subtotal sin tax $', it && it.subtotal)
      : n('l_pr', 'l-pr', 'Precio $', it && it.precio !== undefined ? it.precio : '') + n('l_d', 'l-d', 'Desc. $', it && num(it.descuento) ? it.descuento : ''))
    + '</div><div class="l-info"></div></div>';
}
function pickerHtml(mode) {
  const ls = S.productos.map(p => C.P[p.codigo]).filter(e => e && (mode === 'venta' ? e.disp > 0 : e.libre > 0)).sort((a, b) => b.vendidas - a.vendidas || a.p.color.localeCompare(b.p.color));
  if (!ls.length) return '';
  return '<div class="f"><span class="lb">Toca un producto para agregarlo</span>' + (ls.length > 8 ? '<div class="searchbox" style="margin:0">' + ic('search') + '<input class="search" id="pk_q" type="search" placeholder="Buscar color o código" aria-label="Buscar producto" autocomplete="off"></div>' : '') + '<div class="pick-grid" id="pkGrid">'
    + ls.map(e => '<button type="button" class="pick" ' + A('pick', { m: mode, c: e.p.codigo, q: e.p.codigo + ' ' + e.p.color + ' ' + e.p.tipo + ' ' + e.p.presentacion }) + '>' + swatch(e.p) + '<span class="pk-t"><b>' + esc(title(e.p.color)) + '</b><small>' + esc(e.p.tipo.replace('PLA ', '') + ' · ' + (e.p.presentacion === 'CON SPOOL' ? 'Spool' : title(e.p.presentacion))) + ' · ' + (mode === 'venta' ? e.disp : e.libre) + '</small></span><span class="pk-n" data-n></span></button>').join('')
    + '</div></div>';
}
function pickAdd(code, mode) {
  const lines = $$('#lines [data-line]');
  let el = lines.find(l => $('.l-p', l).value === code);
  if (el) { const q = $('.l-q', el); q.value = num(q.value) + 1; }
  else {
    el = lines.find(l => !$('.l-p', l).value);
    if (el) { $('.l-p', el).value = code; $('.l-q', el).value = 1; const pr = $('.l-pr', el); if (pr) pr.value = ''; }
    else $('#lines').insertAdjacentHTML('beforeend', lineHtml({ codigo: code, cantidad: 1 }, mode));
  }
  updateLines();
}
function readLines(mode) {
  return $$('#lines [data-line]').map(el => {
    const g = s => $(s, el), o = { codigo: g('.l-p').value, cantidad: num(g('.l-q').value) };
    if (mode === 'compra' || mode === 'pedido') { o.subtotal = num(g('.l-s').value); if (g('.l-e')) o.envioReal = g('.l-e').value.trim() === '' ? null : num(g('.l-e').value); }
    else { o.precio = num(g('.l-pr').value); o.descuento = num(g('.l-d').value); }
    return { el, o };
  });
}
function updateLines() {
  const form = $('#sheetCard form#F'); if (!form || !$('#lines')) return;
  const mode = form.dataset.form, isSale = mode === 'venta' || mode === 'apartado', lines = readLines(mode);
  const old = form.dataset.num ? (mode === 'venta' ? ventaN(form.dataset.num) : null) : null;
  let total = 0, desc = 0, bruto = 0, costo = 0, sub = 0;
  const need = {};
  for (const { el, o } of lines) {
    const info = $('.l-info', el), e = C.P[o.codigo];
    info.className = 'l-info'; info.textContent = '';
    if (!o.codigo || !e) continue;
    if (isSale) {
      const prI = $('.l-pr', el); if (prI.value === '' && document.activeElement !== prI) { prI.value = e.precio; o.precio = e.precio; }
      bruto += o.cantidad * o.precio; desc += o.descuento; total += o.cantidad * o.precio - o.descuento; costo += o.cantidad * (e.totalProm || 0);
      need[o.codigo] = (need[o.codigo] || 0) + o.cantidad;
      const own = old ? (old.items || []).filter(i => i.codigo === o.codigo).reduce((s, i) => s + num(i.cantidad), 0) : 0, avail = e.disp + own;
      if (mode === 'venta' && need[o.codigo] > avail) {
        info.className = 'l-info warn';
        info.textContent = 'Solo hay ' + Math.max(0, avail) + ' disponible' + (avail === 1 ? '' : 's') + (e.apStock ? '. ' + e.apStock + ' en existencia está' + (e.apStock === 1 ? '' : 'n') + ' apartado' + (e.apStock === 1 ? '' : 's') + ' (' + apQuien(o.codigo) + ')' : '') + (e.enCamino ? '. Viene' + (e.enCamino === 1 ? '' : 'n') + ' ' + e.enCamino + ' en camino; regístralo como apartado' : '') + '.';
      } else info.textContent = 'Disponible ' + e.disp + (e.apStock ? ' · ' + e.apStock + ' apartado' + (e.apStock === 1 ? '' : 's') : '') + (e.enCamino ? ' · ' + e.enCamino + ' en camino' : '') + (e.totalProm !== null ? ' · costo ' + money(e.totalProm) : '');
    } else {
      sub += o.subtotal;
      info.textContent = o.cantidad && o.subtotal ? 'Costo unitario ' + money(o.subtotal / o.cantidad) + ' + tax' : '';
    }
  }
  const c = cfg(), fT = $('#fTot'), fS = $('#fSub'), vacio = $('#linesVacio');
  if (vacio) vacio.hidden = lines.length > 0;
  if (isSale) {
    form.dataset.total = r2(total);
    const ts = $('#v_tasa'), tz = ts ? num(ts.value) : c.tasa, mt = $('#v_m');
    if (fT) fT.textContent = money(total);
    if (fS) fS.textContent = [desc ? 'descuentos ' + money(desc) : '', 'ganancia estimada ' + money(total - costo - total * comPct(mt ? mt.value : '')), tz && total ? bsFmt(total * tz) : ''].filter(Boolean).join(' · ');
    const cnt = {}; for (const { o } of lines) if (o.codigo) cnt[o.codigo] = (cnt[o.codigo] || 0) + o.cantidad;
    $$('#pkGrid .pick').forEach(b => { const n = cnt[b.dataset.c] || 0; b.classList.toggle('on', n > 0); $('[data-n]', b).textContent = n ? '×' + n : ''; });
    const ci = $('#v_c'), tb = $('#telBox'); if (ci && tb) tb.hidden = !ci.value.trim() || !!clienteDe(ci.value);
  } else {
    if (fT) fT.textContent = money(sub * (1 + c.tax));
    if (fS) fS.textContent = 'subtotal ' + money(sub) + ' + tax ' + r2(c.tax * 100) + '% ' + money(sub * c.tax);
  }
}
function cliSug() {
  const ci = $('#v_c'), box = $('#cliSug'); if (!ci || !box) return;
  const q = ci.value.trim(), ok = busca(q);
  const ls = q ? S.clientes.filter(c => ok(c.nombre) && !sameName(c.nombre, q)).slice(0, 5) : [];
  box.innerHTML = ls.map(c => '<button type="button" ' + A('cliPick', { n: c.nombre }) + '>' + esc(c.nombre) + '</button>').join('');
}
function pgBs() { const m = $('#pg_m'), t = $('#pg_t'), o = $('#pgBs'); if (m && t && o) o.textContent = num(t.value) && num(m.value) ? 'Equivale a ' + bsFmt(num(m.value) * num(t.value)) + '.' : ''; }
function pcPrev() {
  const f = $('#sheetCard form[data-form="pagoCli"]'), o = $('#pcPrev'); if (!f || !o) return;
  const m = num($('#pg_m').value), r = repartir(f.dataset.cl, m);
  o.innerHTML = !(m > 0) ? '<span class="muted">Escribe el monto para ver cómo se reparte.</span>'
    : '<div class="lb" style="margin-bottom:6px">Así se reparte</div>' + r.partes.map(p => '<div style="display:flex;justify-content:space-between;gap:10px;padding:3px 0"><span>' + esc(p.lbl) + ' <span class="muted small">· ' + (p.m >= p.saldo - 0.005 ? 'queda al día' : 'queda debiendo ' + money(p.saldo - p.m)) + '</span></span><b class="num">' + money(p.m) + '</b></div>').join('') + (r.sobra > 0.005 ? '<div class="bad small" style="margin-top:6px;font-weight:700">Sobran ' + money(r.sobra) + ': es más de lo que debe.</div>' : '');
}
const pagoCampos = (monto, metodo) => '<div class="fg2"><div class="f"><label for="pg_m">Monto ($)</label><input id="pg_m" name="monto" inputmode="decimal" autocomplete="off" value="' + monto.toFixed(2) + '"></div><div class="f"><label for="pg_f">Fecha</label><input id="pg_f" type="date" name="fecha" max="' + today() + '" value="' + today() + '"></div></div>'
  + '<div class="fg2"><div class="f"><label for="pg_me">Método</label>' + metodoSel('pg_me', metodo) + '</div><div class="f"><label for="pg_t">Tasa Bs/$</label><input id="pg_t" name="tasa" inputmode="decimal" autocomplete="off" value="' + tasaIn(cfg().tasa) + '"></div></div><p class="hint" id="pgBs"></p>';

/* ============ hojas ============ */
const SHEETS = {
  nuevo() {
    const m = [['ventaForm', { m: 'venta' }, 'plus', 'Venta', 'Vende lo que tienes en existencia'], ['ventaForm', { m: 'apartado' }, 'bookmark', 'Apartado', 'Reserva productos para un cliente'], ['cobroElegir', {}, 'dollar', 'Cobro', 'Registra el pago de un cliente'], ['gastoForm', {}, 'minus', 'Gasto', 'Delivery, empaques, publicidad…'],
      ['pedidoForm', { k: 'encamino' }, 'truck', 'Pedido', 'Mercancía que viene en camino'], ['pedidoForm', { k: 'compras' }, 'box', 'Compra recibida', 'Mercancía que ya llegó'], ['prodForm', {}, 'spool', 'Producto', 'Un color o accesorio nuevo'], ['clienteForm', {}, 'user', 'Cliente', 'Agrégalo al directorio']];
    return { t: 'Nuevo', h: '<div class="menu">' + m.map(([s, a, i, t, d]) => '<button class="tile" ' + A('shr', Object.assign({ s }, a)) + '><span class="ic">' + ic(i) + '</span><span><span class="t">' + t + '</span><div class="d">' + d + '</div></span></button>').join('') + '</div>' };
  },
  cobroElegir() {
    const cob = porCobrar(), aps = {};
    for (const a of S.apartados) if (activo(a)) { const s = apTotals(a).saldo; if (s > 0.005) aps[a.cliente] = (aps[a.cliente] || 0) + s; }
    const nombres = [...new Set(cob.map(x => x.cliente).concat(Object.keys(aps)))];
    return { t: '¿Quién pagó?', h: nombres.length ? list(nombres.map(n => { const x = cob.find(z => z.cliente === n); return row({ a: A('shr', { s: 'pagoCli', cl: n }), left: avatar(n), t: esc(n), d: [x ? 'debe ' + money(x.total) : '', aps[n] ? 'apartados ' + money(aps[n]) : ''].filter(Boolean).join(' · '), go: true }); }))
      : empty('wallet', 'Nadie te debe', 'No hay ventas ni apartados con saldo pendiente.') };
  },
  copia(a) {
    return { t: 'Copia el texto', fixed: true, h: '<textarea id="copyArea" class="inp" readonly style="min-height:260px">' + esc(a.t) + '</textarea><p class="hint" style="margin-top:8px">Mantén presionado para seleccionar y copiar.</p>', mount() { const x = $('#copyArea'); x.focus(); x.select(); } };
  },
  tasa() {
    const c = cfg();
    return { t: 'Tasa del día', form: true, h: '<form class="fg" id="F" data-form="tasa" novalidate><p class="hint">Se guarda en tu hoja (Parámetros) y la app la usa para mostrar precios y cobros en bolívares.' + (c.tasa ? ' Tasa actual: <b>' + tasaFmt(c.tasa) + '</b>' + (c.tasaFecha ? ', del ' + fdate(c.tasaFecha) : '') + '.' : '') + '</p>'
      + fld('tz_v', 'tasa', 'Bolívares por dólar', tasaIn(c.tasa), ' inputmode="decimal" autocomplete="off" placeholder="Ej. 205,50"') + '<p class="hint">Consulta la tasa oficial en <a href="https://www.bcv.org.ve/" target="_blank" rel="noopener">bcv.org.ve</a>.</p></form>', foot: pieF('Guardar tasa') };
  },
  prod(a) {
    const e = C.P[a.c]; if (!e) return null;
    const p = e.p, c = cfg(), est = estadoInv(e);
    const ventas = S.ventas.filter(v => (v.items || []).some(i => i.codigo === a.c)).sort((x, y) => (y.fecha || '').localeCompare(x.fecha || '')).slice(0, 6);
    let b = '<div class="who">' + swatch(p, 'lg') + '<div class="main"><div class="n">' + esc(title(p.color)) + '</div><div class="muted small"><span class="num">' + esc(p.codigo) + '</span>' + (p.missing ? ' · no está en Inventario' : ' · ' + esc(p.tipo) + ' · ' + esc(title(p.presentacion))) + '</div></div>' + pill(est) + '</div>';
    b += '<div class="card stats">' + stat('Disponible', e.disp) + stat('Apartado', e.apartado) + stat('En mano', e.enMano) + stat('En camino', e.enCamino) + stat('Vendidas', e.vendidas) + stat('Libre al llegar', e.libre) + '</div>';
    if (e.apartado) b += '<p class="note">Apartado para: ' + esc(apQuien(a.c)) + '.</p>';
    b += sec('Precio y ganancia') + '<div class="card stats">' + stat('Precio', money(e.precio)) + stat('Costo total', e.totalProm === null ? '—' : money(e.totalProm)) + stat('Utilidad', e.util === null ? '—' : money(e.util)) + stat('Margen', pct(e.margen)) + stat('Markup', pct(e.markup)) + stat('En inventario', money(e.valor)) + '</div>';
    if (c.tasa && e.precio) b += '<p class="note">Precio en bolívares: ' + enBs(e.precio) + '.</p>';
    b += sec('Costo promedio por unidad') + '<div class="card stats">' + stat('Costo', e.costoProm === null ? '—' : money(e.costoProm)) + stat('Tax', e.taxProm === null ? '—' : money(e.taxProm)) + stat('Envío', e.envProm === null ? '—' : money(e.envProm)) + '</div>';
    b += '<p class="note">' + (e.totalProm === null ? 'El costo aparece cuando registres la primera compra recibida de este producto. ' : '') + (num(p.largo) ? 'Caja de ' + p.largo + ' × ' + p.ancho + ' × ' + p.alto + ' pulgadas.' : '') + '</p>';
    if (ventas.length) b += sec('Últimas ventas') + list(ventas.map(v => { const q = v.items.filter(i => i.codigo === a.c).reduce((s, i) => s + num(i.cantidad), 0); return row({ a: A('sh', { s: 'venta', n: v.numero }), left: avatar(v.cliente), t: esc(v.cliente), d: fcorta(v.fecha) + ' · N° ' + esc(v.numero), big: '×' + q }); }));
    let foot = '';
    if (!p.missing) {
      const usado = e.compradas || e.vendidas || e.enCamino || e.apartado;
      foot = '<div class="btns full">' + (e.disp > 0 ? '<button class="btn pri" ' + A('sh', { s: 'ventaForm', m: 'venta', c: a.c }) + '>' + ic('plus') + 'Vender</button>' : '') + '<button class="btn" ' + A('sh', { s: 'prodForm', c: a.c }) + '>' + ic('edit') + 'Editar</button>' + (usado ? '' : '<button class="btn danger" ' + A('delProd', { c: a.c }) + '>' + ic('trash') + 'Eliminar</button>') + '</div>';
    }
    return { t: 'Producto', h: b, foot };
  },
  prodForm(a) {
    const p = a.c ? prod(a.c) : null, c = cfg(); if (a.c && !p) return null;
    const v = p || { codigo: '', tipo: c.tipos[0], color: '', presentacion: 'CON SPOOL', precio: '', largo: 7.87, ancho: 8.26, alto: 2.75 };
    return { t: p ? 'Editar producto' : 'Nuevo producto', form: true, h: '<form class="fg" id="F" data-form="prod" data-c="' + esc(a.c || '') + '" novalidate>'
      + '<div class="fg2">' + fld('p_cod', 'codigo', 'Código', v.codigo, (p ? ' readonly' : '') + ' autocapitalize="characters" autocomplete="off" placeholder="10100 o 10100R"') + fld('p_pre', 'precio', 'Precio de venta ($)', v.precio, ' inputmode="decimal" autocomplete="off"') + '</div>'
      + '<div class="fg2"><div class="f"><label for="p_tipo">Tipo</label><select id="p_tipo" name="tipo">' + opts(c.tipos, v.tipo) + '</select></div><div class="f"><label for="p_pres">Presentación</label><select id="p_pres" name="presentacion">' + opts(c.presentaciones, v.presentacion) + '</select></div></div>'
      + '<div class="fg2">' + fld('p_col', 'color', 'Color / nombre', v.color, ' autocapitalize="characters" autocomplete="off"') + '<div class="f"><label for="p_hex">Color de muestra</label><input id="p_hex" name="hex" type="color" value="' + hexOf(p || { color: v.color }) + '"></div></div>'
      + '<div class="f"><span class="lb">Medidas de la caja en pulgadas (para estimar el envío; déjalas vacías si no aplica)</span><div class="fg3"><input name="largo" inputmode="decimal" placeholder="Largo" aria-label="Largo" value="' + esc(v.largo ?? '') + '"><input name="ancho" inputmode="decimal" placeholder="Ancho" aria-label="Ancho" value="' + esc(v.ancho ?? '') + '"><input name="alto" inputmode="decimal" placeholder="Alto" aria-label="Alto" value="' + esc(v.alto ?? '') + '"></div></div>'
      + '<p class="hint">Para refills usa el código con “R” al final (ej. 10700R).</p></form>', foot: pieF('Guardar producto') };
  },
  ventaForm(a) {
    const mode = a.m === 'apartado' ? 'apartado' : 'venta', isV = mode === 'venta', c = cfg();
    const doc = a.n ? (isV ? ventaN(a.n) : apartadoN(a.n)) : null; if (a.n && !doc) return null;
    const v = doc || { fecha: today(), cliente: a.cl || '', metodo: '', tasa: '', notas: '', items: a.c ? [{ codigo: a.c, cantidad: 1 }] : [] };
    lineSeq = 0;
    let b = '<form class="fg" id="F" data-form="' + mode + '" data-num="' + esc(doc ? doc.numero : '') + '" data-sig="' + esc(doc ? docSig(doc) : '') + '" novalidate>'
      + '<div class="fg2"><div class="f"><label for="v_f">Fecha</label><input id="v_f" name="fecha" type="date" value="' + esc(v.fecha) + '"></div><div class="f"><label for="v_c">Cliente</label><input id="v_c" name="cliente" autocomplete="off" autocapitalize="words" placeholder="Nombre" value="' + esc(v.cliente) + '"></div></div>'
      + '<div class="sug" id="cliSug"></div>'
      + '<div class="f" id="telBox" hidden><label for="v_t">WhatsApp del cliente nuevo (opcional)</label><input id="v_t" name="telefono" inputmode="tel" autocomplete="off" placeholder="0414…"></div>'
      + pickerHtml(mode)
      + '<div class="f"><span class="lb">Productos</span><div id="lines" class="fg">' + v.items.map(it => lineHtml(it, mode)).join('') + '</div><p class="hint" id="linesVacio">Aún no has agregado productos.</p></div>'
      + '<div class="btns"><button type="button" class="btn sm" ' + A('addLine', { m: mode }) + '>' + ic('plus') + 'Otro producto</button></div>'
      + '<div class="f"><label for="v_du">Descuento por unidad ($)</label><div class="inline"><input id="v_du" inputmode="decimal" autocomplete="off" placeholder="0"><button type="button" class="btn sm ghost" data-act="applyDu">Aplicar a todo</button></div></div>'
      + '<div class="fg2"><div class="f"><label for="v_m">Método de pago</label>' + metodoSel('v_m', v.metodo) + '</div>'
      + (isV ? '<div class="f"><label for="v_tasa">Tasa Bs/$</label><input id="v_tasa" name="tasa" inputmode="decimal" autocomplete="off" value="' + esc(doc ? tasaIn(v.tasa) : tasaIn(c.tasa)) + '"></div>' : '<div></div>') + '</div>';
    if (!doc && isV) b += '<div class="f"><span class="lb">¿Cómo pagó?</span><input type="hidden" name="modo" id="v_modo" value=""><div class="seg" id="modoSeg">' + [['todo', 'Completo'], ['parte', 'Una parte'], ['fiado', 'Queda debiendo']].map(([k, l]) => '<button type="button" ' + A('modo', { v: k }) + ' aria-pressed="false">' + l + '</button>').join('') + '</div>'
      + '<div id="parteBox" hidden style="margin-top:8px"><label class="lb" for="v_pag">¿Cuánto pagó ahora? ($)</label><input id="v_pag" name="pagado" inputmode="decimal" autocomplete="off" placeholder="0" style="margin-top:5px"></div></div>';
    if (!doc && !isV) b += '<div class="f"><label for="v_pag">Abono inicial ($)</label><div class="inline"><input id="v_pag" name="pagado" inputmode="decimal" autocomplete="off" placeholder="0"><button type="button" class="btn sm ghost" data-act="payAll">Todo</button></div></div>';
    b += '<div class="f"><label for="v_n">Notas</label><textarea id="v_n" name="notas" placeholder="Ej. descuento de amigo, entrega a domicilio…">' + esc(v.notas || '') + '</textarea></div></form>';
    return { t: (doc ? 'Editar ' : (isV ? 'Nueva ' : 'Nuevo ')) + (isV ? 'venta' : 'apartado') + (doc ? ' ' + (isV ? 'N° ' : '') + v.numero : ''), form: true, h: b,
      foot: '<div class="tot"><span>Total<small id="fSub"></small></span><span class="num" id="fTot">$0.00</span></div>' + pieF(doc ? 'Guardar cambios' : (isV ? 'Registrar venta' : 'Registrar apartado')), mount: updateLines };
  },
  venta(a) {
    const v = ventaN(a.n); if (!v) return null;
    const t = vt(v), cl = clienteDe(v.cliente);
    let b = '<div class="who">' + avatar(v.cliente) + '<div class="main"><div class="n">' + esc(v.cliente || 'Sin nombre') + '</div><div class="muted small">' + fdate(v.fecha) + (v.metodo ? ' · ' + esc(title(v.metodo)) : '') + (v.vendedor ? ' · vendió ' + esc(v.vendedor) : '') + '</div></div>' + pill(t.estado) + '</div>';
    b += itemsCard(v.items || []);
    b += '<div class="sumbox" style="margin-top:10px">' + (t.desc ? tot('Subtotal', money(t.bruto)) + tot('Descuentos', '-' + money(t.desc)) : '') + tot('Total', money(t.total), 'tt') + (v.tasa ? tot('En bolívares (tasa ' + tasaFmt(v.tasa) + ')', bsFmt(t.total * num(v.tasa)), 'muted small') : '') + tot('Pagado', money(t.pagado), 'sep') + '<div style="font-weight:800" class="' + (t.saldo > 0.005 ? 'bad' : 'ok') + '"><span>Saldo</span><span class="num">' + money(t.saldo) + '</span></div></div>';
    b += '<div class="card stats" style="margin-top:10px">' + stat('Costo', money(t.costo)) + stat('Utilidad', money(t.util)) + stat('Margen', pct(t.total ? t.util / t.total : null)) + '</div>';
    b += pagosList(ventaPagos(v), t.pagado);
    if (v.notas) b += '<p class="note"><b>Notas:</b> ' + esc(v.notas) + '</p>';
    b += '<div class="btns full" style="margin-top:14px">' + (cl ? '<button class="btn ghost" ' + A('sh', { s: 'cliente', cl: cl.nombre }) + '>' + ic('user') + 'Cliente</button>' : '') + '<button class="btn ghost" ' + A('sh', { s: 'ventaForm', m: 'venta', n: v.numero }) + '>' + ic('edit') + 'Editar</button><button class="btn danger" ' + A('delDoc', { k: 'ventas', n: v.numero }) + '>' + ic('trash') + 'Eliminar</button></div>';
    b += '<p class="note">Fila' + (v.rows.length > 1 ? 's ' + v.rows[0] + '–' + v.rows[v.rows.length - 1] : ' ' + v.rows[0]) + ' de la hoja Ventas.</p>';
    const foot = '<div class="btns full">' + (t.saldo > 0.005 ? '<button class="btn pri" ' + A('sh', { s: 'pagoForm', k: 'ventas', n: v.numero }) + '>' + ic('dollar') + 'Registrar pago</button>' : '') + '<button class="btn' + (t.saldo > 0.005 ? '' : ' pri') + '" ' + A('sh', { s: 'recibo', k: 'venta', n: v.numero }) + '>' + ic('receipt') + 'Recibo</button><a class="btn" target="_blank" rel="noopener" href="' + esc(waLink(cl && cl.telefono, reciboTexto('venta', v))) + '">' + ic('chat') + 'WhatsApp</a></div>';
    return { t: 'Venta N° ' + v.numero, h: b, foot };
  },
  apartado(a) {
    const ap = apartadoN(a.n); if (!ap) return null;
    const t = apTotals(ap), est = ap.estado || 'APARTADO', act = activo(ap), cl = clienteDe(ap.cliente), { listos, resto } = apListos(ap), vEnt = ventaDeApartado(ap.numero);
    const enMano = it => listos.includes(it);
    let b = '<div class="who">' + avatar(ap.cliente) + '<div class="main"><div class="n">' + esc(ap.cliente || 'Sin nombre') + '</div><div class="muted small">' + fdate(ap.fecha) + ' · ' + plural(t.units, 'producto') + '</div></div>' + pill(est) + '</div>';
    b += itemsCard(ap.items || [], it => act ? ' · ' + (enMano(it) ? '<b class="ok">en existencia</b>' : '<b style="color:var(--info)">por llegar</b>') : '');
    b += '<div class="sumbox" style="margin-top:10px">' + tot('Total', money(t.total), 'tt') + tot('Abonado', money(t.pagado), 'sep') + '<div style="font-weight:800"><span>Resta</span><span class="num">' + money(t.saldo) + '</span></div></div>';
    if (act && resto.length) b += '<p class="note">Para entregarlo completo falta que llegue: ' + resto.map(it => esc(title((prod(it.codigo) || {}).color || it.codigo))).join(', ') + '.</p>';
    b += pagosList(pagosDe('APARTADO', ap.numero), t.pagado);
    if (ap.notas) b += '<p class="note"><b>Notas:</b> ' + esc(ap.notas) + '</p>';
    if (vEnt) b += '<div class="btns" style="margin-top:10px"><button class="btn sm" ' + A('sh', { s: 'venta', n: vEnt.numero }) + '>' + ic('receipt') + 'Ver la venta N° ' + esc(vEnt.numero) + '</button></div>';
    let foot = '<div class="btns full">';
    if (act) {
      if (!resto.length) foot += '<button class="btn pri" ' + A('entregar', { n: ap.numero }) + '>' + ic('check') + 'Entregar</button>';
      else if (listos.length) foot += '<button class="btn pri" ' + A('entregarParcial', { n: ap.numero }) + '>' + ic('check') + 'Entregar lo que llegó (' + listos.reduce((s, it) => s + num(it.cantidad), 0) + ')</button>';
      if (t.saldo > 0.005) foot += '<button class="btn" ' + A('sh', { s: 'pagoForm', k: 'apartados', n: ap.numero }) + '>' + ic('dollar') + 'Abono</button>';
    }
    foot += '<button class="btn" ' + A('sh', { s: 'recibo', k: 'apartado', n: ap.numero }) + '>' + ic('receipt') + 'Comprobante</button></div>';
    b += '<div class="btns full" style="margin-top:14px"><a class="btn ghost" target="_blank" rel="noopener" href="' + esc(waLink(cl && cl.telefono, reciboTexto('apartado', ap))) + '">' + ic('chat') + 'WhatsApp</a>'
      + (act ? '<button class="btn ghost" ' + A('sh', { s: 'ventaForm', m: 'apartado', n: ap.numero }) + '>' + ic('edit') + 'Editar</button><button class="btn ghost" ' + A('cancelAp', { n: ap.numero }) + '>Cancelar apartado</button>' : '')
      + '<button class="btn danger" ' + A('delDoc', { k: 'apartados', n: ap.numero }) + '>' + ic('trash') + 'Eliminar</button></div>';
    return { t: 'Apartado ' + ap.numero, h: b, foot };
  },
  pagoForm(a) {
    const k = a.k === 'apartados' ? 'apartados' : 'ventas', d = k === 'ventas' ? ventaN(a.n) : apartadoN(a.n); if (!d) return null;
    const t = k === 'ventas' ? vt(d) : apTotals(d);
    return { t: (k === 'ventas' ? 'Pago · ' : 'Abono · ') + d.cliente, form: true, h: '<form class="fg" id="F" data-form="pago" data-k="' + k + '" data-n="' + esc(d.numero) + '" novalidate><p class="hint">' + (k === 'ventas' ? 'Venta N° ' : 'Apartado ') + esc(d.numero) + ': debe <b>' + money(t.saldo) + '</b> de ' + money(t.total) + '.</p>' + pagoCampos(t.saldo, d.metodo) + '</form>', foot: pieF('Guardar pago'), mount: pgBs };
  },
  pagoCli(a) {
    const deuda = deudaCliente(a.cl);
    if (!deuda.length) return { t: 'Pago · ' + a.cl, h: empty('check', 'Está al día', esc(a.cl) + ' no debe nada.') };
    const tv = r2(deuda.filter(x => x.k === 'ventas').reduce((s, x) => s + x.saldo, 0)), ta = r2(deuda.filter(x => x.k === 'apartados').reduce((s, x) => s + x.saldo, 0));
    return { t: 'Pago · ' + a.cl, form: true, h: '<form class="fg" id="F" data-form="pagoCli" data-cl="' + esc(a.cl) + '" novalidate><p class="hint">' + (tv ? 'Debe <b>' + money(tv) + '</b> en ventas' : 'No debe ventas') + (ta ? ' y le restan <b>' + money(ta) + '</b> en apartados' : '') + '. Escribe lo que pagó y la app lo reparte: primero la venta más vieja y lo que sobre va a sus apartados.</p>'
      + pagoCampos(tv || ta, '') + '<div class="card" id="pcPrev" style="padding:12px 14px;font-size:14px"></div></form>', foot: pieF('Guardar pago'), mount() { pgBs(); pcPrev(); } };
  },
  pedido(a) {
    const kind = a.k === 'compras' ? 'compras' : 'encamino', rows = pedidoRows(kind, a.p, a.f); if (!rows.length) return null;
    const isC = kind === 'compras', pend = !isC && rows.some(x => x.estado !== 'RECIBIDO'), tax = cfg().tax;
    let total = 0;
    let b = '<div class="who">' + icBox(isC ? 'box' : 'truck', isC ? '' : pend ? 'o' : 'g') + '<div class="main"><div class="n num">' + esc(a.p) + '</div><div class="muted small">' + fdate(a.f) + (rows[0].proveedor ? ' · ' + esc(title(rows[0].proveedor)) : '') + '</div></div>' + (isC ? '' : pill(pend ? 'EN CAMINO' : 'RECIBIDO')) + '</div>';
    b += '<div class="card items">' + rows.map(x => {
      const p = prod(x.codigo) || { color: x.codigo }; let right, sub;
      if (isC) { const l = compraLine(x); total += l.total; right = money(l.total); sub = plural(num(x.cantidad), 'unidad', 'unidades') + ' · ' + money(l.unit) + ' c/u con tax y envío' + (x.envioReal === null ? ' estimado' : ''); }
      else { const tt = num(x.subtotal) * (1 + tax); total += tt; right = money(tt); sub = plural(num(x.cantidad), 'unidad', 'unidades') + ' · ' + money(num(x.subtotal) / (num(x.cantidad) || 1)) + ' c/u sin tax' + (x.estado === 'RECIBIDO' ? ' · recibido' + (x.fechaLlegada ? ' ' + fdate(x.fechaLlegada) : '') : ''); }
      return '<div class="it">' + swatch(p) + '<div class="main"><b>' + esc(title(p.color)) + '</b> <span class="muted small">' + esc(title(p.presentacion || '')) + '</span><div class="muted small">' + sub + '</div></div><div class="num">' + right + '</div></div>';
    }).join('') + '</div>';
    b += '<div class="sumbox" style="margin-top:10px">' + tot(isC ? 'Total con tax y envío' : 'Total con tax', money(total), 'tt') + '</div>';
    const notas = rows.map(x => x.notas).filter(Boolean); if (notas.length) b += '<p class="note"><b>Notas:</b> ' + esc([...new Set(notas)].join(' · ')) + '</p>';
    if (pend) b += '<div class="card fg" style="margin-top:12px"><b>¿Ya llegó?</b><div class="f"><label for="rc_f">Fecha de llegada</label><input class="inp" id="rc_f" type="date" max="' + today() + '" value="' + today() + '"></div><button class="btn pri" ' + A('recibir', { p: a.p, f: a.f }) + '>' + ic('check') + 'Marcar como recibido</button><p class="hint">Pasa todo a Compras con el envío estimado y lo suma al inventario.</p></div>';
    return { t: isC ? 'Compra' : 'Pedido', h: b, foot: '<div class="btns full"><button class="btn" ' + A('sh', { s: 'pedidoForm', k: kind, p: a.p, f: a.f }) + '>' + ic('edit') + 'Editar</button><button class="btn danger" ' + A('delPedido', { k: kind, p: a.p, f: a.f }) + '>' + ic('trash') + 'Eliminar</button></div>' };
  },
  pedidoForm(a) {
    const kind = a.k === 'compras' ? 'compras' : 'encamino', isC = kind === 'compras', c = cfg(), mode = isC ? 'compra' : 'pedido';
    const rows = a.p !== undefined ? pedidoRows(kind, a.p, a.f) : null; if (rows && !rows.length) return null;
    const g = rows ? { fecha: a.f, pedido: a.p === 'Sin número' ? '' : a.p, proveedor: rows[0].proveedor, notas: rows[0].notas, lines: rows } : { fecha: today(), pedido: '', proveedor: c.proveedores[0] || '', notas: '', lines: [null] };
    lineSeq = 0;
    return { t: (rows ? 'Editar ' : 'Nuevo ') + (isC ? (rows ? 'compra' : 'compra recibida') : 'pedido'), form: true, h: '<form class="fg" id="F" data-form="' + mode + '" data-orig="' + esc(rows ? JSON.stringify(rows.map(l => [l.row, l.sig])) : '') + '" novalidate>'
      + '<div class="fg2"><div class="f"><label for="pd_f">Fecha del pedido</label><input id="pd_f" name="fecha" type="date" value="' + esc(g.fecha) + '"></div>' + fld('pd_n', 'pedido', 'N° de pedido', g.pedido, ' autocomplete="off" autocapitalize="characters"') + '</div>'
      + '<div class="f"><label for="pd_p">Proveedor</label><input id="pd_p" name="proveedor" list="provList" autocomplete="off" autocapitalize="characters" value="' + esc(g.proveedor || '') + '"><datalist id="provList">' + c.proveedores.map(x => '<option value="' + esc(x) + '">').join('') + '</datalist></div>'
      + '<div class="f"><span class="lb">Productos</span><div id="lines" class="fg">' + g.lines.map(l => lineHtml(l, mode)).join('') + '</div><p class="hint" id="linesVacio" hidden>Aún no has agregado productos.</p></div>'
      + '<div class="btns"><button type="button" class="btn sm" ' + A('addLine', { m: mode }) + '>' + ic('plus') + 'Otro producto</button></div>'
      + '<p class="hint">¿No está en la lista? Créalo primero en Inventario.' + (isC ? ' El envío se estima con las medidas del producto y la tarifa del courier; escribe el envío real si lo sabes.' : '') + '</p>'
      + fld('pd_no', 'notas', 'Notas', g.notas, ' placeholder="Ej. Factura BBLUS…"') + '</form>',
      foot: '<div class="tot"><span>Total con tax<small id="fSub"></small></span><span class="num" id="fTot">$0.00</span></div>' + pieF(isC ? 'Guardar compra' : 'Guardar pedido'), mount: updateLines };
  },
  gastoForm(a) {
    const old = a.id ? S.gastos.find(x => x.id === a.id) : null, c = cfg(); if (a.id && !old) return null;
    const g = old || { fecha: today(), categoria: c.categorias[0], descripcion: '', monto: '', metodo: '', notas: '' };
    return { t: old ? 'Editar gasto' : 'Nuevo gasto', form: true, h: '<form class="fg" id="F" data-form="gasto" data-id="' + esc(a.id || '') + '" data-sig="' + esc(old ? old.sig : '') + '" novalidate>'
      + '<div class="fg2"><div class="f"><label for="g_f">Fecha</label><input id="g_f" type="date" name="fecha" value="' + esc(g.fecha) + '"></div>' + fld('g_m', 'monto', 'Monto ($)', g.monto, ' inputmode="decimal" autocomplete="off"') + '</div>'
      + '<div class="f"><label for="g_c">Categoría</label><select id="g_c" name="categoria">' + opts(c.categorias, g.categoria) + '</select></div>' + fld('g_d', 'descripcion', 'Descripción', g.descripcion, ' placeholder="Ej. Delivery a La Lago"')
      + '<div class="f"><label for="g_me">Método de pago</label>' + metodoSel('g_me', g.metodo) + '</div>' + fld('g_n', 'notas', 'Notas', g.notas) + '</form>',
      foot: pieF('Guardar gasto', old ? '<button class="btn danger block" style="margin-bottom:8px" type="button" ' + A('delFila', { k: 'gastos', id: old.id, sig: old.sig }) + '>' + ic('trash') + 'Eliminar gasto</button>' : '') };
  },
  cliente(a) {
    const c = a.cl !== undefined ? clienteDe(a.cl) : S.clientes.find(x => x.id === a.id); if (!c) return null;
    const vs = S.ventas.filter(v => sameName(v.cliente, c.nombre)).sort((x, y) => (y.fecha || '').localeCompare(x.fecha || '') || num(y.numero) - num(x.numero));
    const aps = S.apartados.filter(x => sameName(x.cliente, c.nombre)), pcs = S.pagos.filter(p => sameName(p.cliente, c.nombre)).sort((x, y) => y.fecha.localeCompare(x.fecha));
    let total = 0, saldo = 0; for (const v of vs) { const t = vt(v); total += t.total; saldo += t.saldo; }
    let b = '<div class="who">' + avatar(c.nombre) + '<div class="main"><div class="n">' + esc(c.nombre) + '</div><div class="muted small">' + esc([c.telefono, c.ciudad].filter(Boolean).join(' · ') || 'Sin teléfono') + '</div></div></div>';
    b += '<div class="card stats">' + stat('Compras', vs.length) + stat('Total', money(total)) + '<div class="stat"><div class="l">Debe</div><div class="v ' + (saldo > 0.005 ? 'bad' : 'ok') + '">' + money(saldo) + '</div></div></div>';
    const datos = [['Cédula / RIF', c.cedula], ['Dirección', c.direccion], ['Correo', c.correo], ['Notas', c.notas]].filter(x => x[1]);
    if (datos.length) b += '<div class="card dl-list" style="margin-top:10px">' + datos.map(x => '<div><span>' + x[0] + '</span><b style="font-weight:500;min-width:0">' + esc(x[1]) + '</b></div>').join('') + '</div>';
    if (!c.telefono) b += '<p class="note">Agrégale el teléfono para enviarle mensajes por WhatsApp.</p>';
    b += '<div class="btns full" style="margin-top:12px"><button class="btn" ' + A('sh', { s: 'ventaForm', m: 'venta', cl: c.nombre }) + '>' + ic('plus') + 'Venta</button>' + (c.telefono ? '<a class="btn" target="_blank" rel="noopener" href="' + esc(waLink(c.telefono, 'Hola ' + String(c.nombre).split(' ')[0] + ', ')) + '">' + ic('chat') + 'WhatsApp</a>' : '') + '<button class="btn" ' + A('sh', { s: 'clienteForm', id: c.id }) + '>' + ic('edit') + 'Editar</button></div>';
    if (vs.length) b += sec('Ventas') + list(vs.map(v => ventaRow(v, false)));
    if (aps.length) b += sec('Apartados') + list(aps.map(x => row({ a: A('sh', { s: 'apartado', n: x.numero }), t: esc(x.numero) + ' · ' + fdate(x.fecha), big: money(apTotals(x).total), end: pill(x.estado || 'APARTADO') })));
    if (pcs.length) b += sec('Pagos recibidos', money(pcs.reduce((s, p) => s + p.monto, 0))) + list(pcs.slice(0, 6).map(p => pagoRowHtml(p, false)).concat(pcs.length > 6 ? [row({ a: A('pagosCli', { cl: c.nombre }), t: 'Ver los ' + pcs.length + ' pagos', go: true })] : []));
    return { t: 'Cliente', h: b, foot: '<div class="btns full"><button class="btn pri" ' + A('sh', { s: 'ecuenta', cl: c.nombre }) + '>' + ic('file') + 'Estado de cuenta</button>' + (deudaCliente(c.nombre).length ? '<button class="btn" ' + A('sh', { s: 'pagoCli', cl: c.nombre }) + '>' + ic('dollar') + 'Registrar pago</button>' : '') + '</div>' };
  },
  clienteForm(a) {
    const old = a.id ? S.clientes.find(x => x.id === a.id) : null; if (a.id && !old) return null;
    const c = old || { nombre: '', telefono: '', cedula: '', direccion: '', ciudad: cfg().negocio.ciudad, correo: '', notas: '' };
    return { t: old ? 'Editar cliente' : 'Nuevo cliente', form: true, h: '<form class="fg" id="F" data-form="cliente" data-id="' + esc(a.id || '') + '" data-sig="' + esc(old ? old.sig : '') + '" novalidate>' + fld('c_nombre', 'nombre', 'Nombre', c.nombre, ' autocomplete="off" autocapitalize="words"')
      + '<div class="fg2">' + fld('c_tel', 'telefono', 'Teléfono / WhatsApp', c.telefono, ' inputmode="tel" autocomplete="off" placeholder="0414…"') + fld('c_ced', 'cedula', 'Cédula / RIF', c.cedula, ' autocomplete="off"') + fld('c_ciu', 'ciudad', 'Ciudad', c.ciudad) + fld('c_cor', 'correo', 'Correo', c.correo, ' inputmode="email" autocapitalize="off" autocomplete="off"') + '</div>' + fld('c_dir', 'direccion', 'Dirección', c.direccion) + fld('c_not', 'notas', 'Notas', c.notas) + '</form>',
      foot: pieF('Guardar cliente', old ? '<button class="btn danger block" style="margin-bottom:8px" type="button" ' + A('delFila', { k: 'clientes', id: old.id, sig: old.sig }) + '>' + ic('trash') + 'Eliminar cliente</button>' : '') };
  },
  ecuenta(a) {
    const ec = estadoCuenta(a.cl), tel = ec.c && ec.c.telefono;
    let b = '<div class="who">' + avatar(ec.nombre) + '<div class="main"><div class="n">' + esc(ec.nombre) + '</div><div class="muted small">Al ' + fdate(today()) + ' · montos en dólares</div></div></div>';
    b += '<div class="card stats">' + stat('Comprado', money(ec.comprado)) + stat('Pagado', money(ec.pagado)) + '<div class="stat"><div class="l">Saldo</div><div class="v ' + (ec.debe > 0.005 ? 'bad' : 'ok') + '">' + money(ec.debe) + '</div></div></div>';
    b += sec('Movimientos') + (ec.movs.length ? list(ec.movs.map(m => row({ a: A('sh', { s: 'venta', n: m.v.numero }), left: icBox(m.tipo === 'cargo' ? 'receipt' : 'check', m.tipo === 'cargo' ? '' : 'g'), t: esc(m.desc), d: fdate(m.fecha), big: (m.tipo === 'cargo' ? '+' : '−') + money(m.monto), tone: m.tipo === 'abono' ? 'ok' : '', end: '<div class="d">saldo ' + money(m.saldo) + '</div>' })))
      : empty('file', 'Sin compras todavía', 'Las ventas y pagos de este cliente aparecerán aquí.'));
    if (ec.aps.length) b += sec('Apartados activos', 'no suman al saldo') + list(ec.aps.map(({ a: ap, t }) => row({ a: A('sh', { s: 'apartado', n: ap.numero }), left: icBox('bookmark', 'o'), t: esc(ap.numero) + ' · ' + fdate(ap.fecha), d: 'total ' + money(t.total) + ' · abonado ' + money(t.pagado), big: money(t.saldo), end: '<div class="d">resta</div>' })));
    return { t: 'Estado de cuenta', h: b, foot: '<div class="btns full"><button class="btn pri" ' + A('sh', { s: 'ecuentaImg', cl: ec.nombre }) + '>' + ic('image') + 'Imagen o PDF</button><button class="btn" ' + A('ecCopy', { cl: ec.nombre }) + '>' + ic('copy') + 'Copiar</button><a class="btn" target="_blank" rel="noopener" href="' + esc(waLink(tel, ecuentaTexto(ec))) + '">' + ic('chat') + 'WhatsApp</a></div>' };
  },
  ecuentaImg(a) {
    const ec = estadoCuenta(a.cl), n = archivo('Estado-de-cuenta-' + ec.nombre + '-' + today());
    return docSheet('Estado de cuenta', n, 'carta', cv => drawEcuenta(cv, ec), true);
  },
  recibo(a) {
    const isV = a.k !== 'apartado', d = isV ? ventaN(a.n) : apartadoN(a.n); if (!d) return null;
    return docSheet(isV ? 'Recibo N° ' + d.numero : 'Comprobante ' + d.numero, archivo((isV ? 'Recibo-' : 'Apartado-') + d.numero + '-' + d.cliente), 'recibo', cv => drawRecibo(cv, isV ? 'venta' : 'apartado', d), true, '<button class="btn" ' + A('copyRecibo', { k: isV ? 'venta' : 'apartado', n: d.numero }) + '>' + ic('copy') + 'Texto</button>');
  },
  catImg() { return docSheet('Imagen del catálogo', 'Catalogo-StratoFil3D-' + today(), 'catalogo', drawCatalogo, false); }
};
/* hoja con un documento dibujado en canvas, para compartir como imagen o PDF */
function docSheet(t, nombre, tipo, dibujar, conPdf, extra) {
  const lbl = puedeCompartir() ? 'Compartir ' : 'Guardar ';
  return { t, fixed: true, h: '<canvas class="doc" id="docCv" data-doc="' + tipo + '" data-n="' + esc(nombre) + '" role="img" aria-label="' + esc(t) + '"></canvas>',
    foot: '<div class="btns full"><button class="btn pri" data-act="saveImg">' + ic('image') + lbl + 'imagen</button>' + (conPdf ? '<button class="btn pri" data-act="savePdf">' + ic('file') + lbl + 'PDF</button>' : '') + (extra || '') + '</div>',
    async mount() { const cv = $('#docCv'); await canvasListo(); if (cv.isConnected) dibujar(cv); } };
}

/* ============ operaciones sobre la hoja ============ */
async function anularPago(pid, sig) {
  const p0 = S.pagos.find(x => x.id === pid && x.sig === sig); if (!p0) { toast('Ese pago ya no está en la hoja.', 'err'); return; }
  if (!(await ask({ title: '¿Anular este pago?', msg: 'Se quita el pago de ' + money(p0.monto) + ' del ' + fdate(p0.fecha) + ' y la deuda vuelve a subir.', ok: 'Anular pago', danger: true }))) return;
  await W(async () => {
    await alDia();
    const p = S.pagos.find(x => x.id === pid && x.sig === sig);
    if (!p) throw userErr('Ese pago cambió en la hoja. Revisa y vuelve a intentar.');
    const nota = 'Se anuló el pago de ' + money(p.monto) + ' del ' + fdate(p.fecha);
    if (p.tipo === 'VENTA') {
      const v = ventaN(p.numero);
      if (v) await writePagado('ventas', v, Math.max(0, r2(vt(v).pagado - p.monto)), nota);
    } else {
      const a = apartadoN(p.numero);
      if (a) {
        await writePagado('apartados', a, Math.max(0, r2((a.abonoSum || 0) - p.monto)), nota);
        if ((a.estado || 'APARTADO') === 'ENTREGADO') { const v = ventaDeApartado(a.numero); if (v) await writePagado('ventas', v, Math.max(0, r2(vt(v).pagado - p.monto)), nota); }
      }
    }
    await writeRows('pagos', { [p.row]: BLANK.pagos() });
  }, 'Pago anulado');
}
async function entregar(n) {
  const a0 = apartadoN(n); if (!a0) return;
  if (apListos(a0).resto.length) { toast('Aún falta mercancía por llegar.', 'err'); return; }
  let numero;
  const me = topLayer();
  const ok = await W(async () => {
    await alDia();
    const a = apartadoN(n);
    if (!a || !activo(a)) throw userErr('Este apartado ya no está activo en la hoja.');
    if (apListos(a).resto.length) throw userErr('Aún falta mercancía por llegar.');
    numero = nextVenta();
    const total = sumItems(a.items), pagado = Math.min(a.abonoSum || 0, total), lp = pagosDe('APARTADO', a.numero).slice(-1)[0];
    const v = { fecha: today(), numero, cliente: a.cliente, metodo: (lp && lp.metodo) || '', tasa: cfg().tasa || '', vendedor: myName(), notas: ('Entrega del apartado ' + a.numero + (pagado ? ', con abonos por ' + money(pagado) : '') + '. ' + (a.notas || '')).trim() };
    await writeRows('ventas', ventaRows(needRows('ventas', a.items.length), v, a.items, estadoPago(total, pagado), pagado));
    await setApEstado(a, 'ENTREGADO', 'Entregado como venta N° ' + numero + ' el ' + fdate(today()));
  }, 'Entregado y registrado como venta');
  if (ok) cambiarHoja(me, 'venta', { n: numero });
}
async function entregarParcial(n) {
  const a0 = apartadoN(n); if (!a0) return;
  const r0 = apListos(a0);
  if (!r0.listos.length || !r0.resto.length) { toast('No hay nada que entregar por partes.', 'err'); return; }
  if (!(await ask({ title: '¿Entregar lo que ya llegó?', msg: 'Se registra una venta con ' + plural(r0.listos.reduce((s, it) => s + num(it.cantidad), 0), 'producto') + ' y el resto sigue apartado. Los abonos se aplican primero a esta entrega.', ok: 'Entregar' }))) return;
  await W(async () => {
    await alDia();
    const a = apartadoN(n);
    if (!a || !activo(a)) throw userErr('Este apartado ya no está activo en la hoja.');
    const { listos, resto } = apListos(a);
    if (!listos.length || !resto.length) throw userErr('El inventario cambió: ya no hay una entrega parcial que hacer. Revisa el apartado.');
    const numero = nextVenta(), total = sumItems(listos), abono = a.abonoSum || 0, aplica = r2(Math.min(abono, total));
    const logs = pagosDe('APARTADO', a.numero).sort((x, y) => String(x.fecha).localeCompare(String(y.fecha))), lp = logs[logs.length - 1];
    const nombres = listos.map(it => num(it.cantidad) + ' ' + title((prod(it.codigo) || {}).color || it.codigo)).join(', ');
    const v = { fecha: today(), numero, cliente: a.cliente, metodo: (lp && lp.metodo) || '', tasa: cfg().tasa || '', vendedor: myName(), notas: 'Entrega parcial del apartado ' + a.numero + (aplica ? ', con abonos por ' + money(aplica) : '') };
    await writeRows('ventas', ventaRows(needRows('ventas', listos.length), v, listos, estadoPago(total, aplica), aplica));
    const doc = { fecha: a.fecha, numero: a.numero, cliente: a.cliente, abono: r2(abono - aplica), estado: 'APARTADO', notas: (a.notas ? a.notas + '. ' : '') + 'Entrega parcial como venta N° ' + numero + ' el ' + fdate(today()) + ': ' + nombres };
    await writeRows('apartados', apRows(await ubicarFilas('apartados', a, resto.length), doc, resto));
    /* los abonos ya usados pasan a la venta nueva en la pestaña Pagos */
    let rem = aplica; const mp = {}, nuevos = [];
    for (const p of logs) {
      if (rem <= 0.005) break;
      if (p.monto <= rem + 0.005) { mp[p.row] = [null, 'VENTA', txt(String(numero))]; rem = r2(rem - p.monto); }
      else { mp[p.row] = [null, null, null, null, r2(p.monto - rem)]; nuevos.push({ fecha: p.fecha, tipo: 'VENTA', numero, cliente: a.cliente, monto: rem, metodo: p.metodo || '', tasa: p.tasa || '', vendedor: p.vendedor || '', notas: 'Parte de un abono del apartado ' + a.numero }); rem = 0; }
    }
    await writeRows('pagos', mp);
    for (const d of nuevos) await logPago(d);
  }, 'Entregado lo que ya llegó');
}
async function recibir(p, f, llegada) {
  const rows = pedidoRows('encamino', p, f).filter(x => x.estado !== 'RECIBIDO'); if (!rows.length) return;
  await W(async () => {
    const sig = {}; for (const r of rows) sig[r.row] = r.sig;
    await verify('encamino', sig);
    await fresh('compras');
    const start = needRows('compras', rows.length), m = {};
    rows.forEach((r, i) => { m[start + i] = compraRow({ fecha: r.fecha, pedido: r.pedido, proveedor: r.proveedor, codigo: r.codigo, cantidad: r.cantidad, subtotal: r.subtotal, envioReal: null, notas: (r.notas ? r.notas + '. ' : '') + 'Llegó el ' + fdate(llegada) }); });
    await writeRows('compras', m);
    const mm = {}; for (const r of rows) { const arr = new Array(14).fill(null); arr[12] = 'RECIBIDO'; arr[13] = serial(llegada); mm[r.row] = arr; }
    await writeRows('encamino', mm);
  }, 'Pedido recibido: ' + plural(rows.reduce((s, r) => s + num(r.cantidad), 0), 'unidad', 'unidades') + ' al inventario');
}
async function borrarDoc(k, n) {
  const isV = k === 'ventas', d0 = isV ? ventaN(n) : apartadoN(n); if (!d0) return;
  const np = pagosDe(isV ? 'VENTA' : 'APARTADO', n).length;
  if (!(await ask({ title: isV ? '¿Eliminar la venta N° ' + n + '?' : '¿Eliminar el apartado ' + n + '?', msg: 'Se borra de la hoja' + (np ? ' junto con ' + (np === 1 ? 'su pago registrado' : 'sus ' + np + ' pagos registrados') : '') + (isV ? ' y los productos vuelven al inventario.' : ' y los productos quedan libres.') + ' No se puede deshacer.', ok: 'Eliminar', danger: true }))) return;
  await W(async () => {
    await alDia();
    const d = isV ? ventaN(n) : apartadoN(n);
    if (!d) throw userErr('Ya no existe en la hoja.');
    const m = {}; for (const r of d.rows) m[r] = BLANK[k](r);
    await writeRows(k, m);
    await unlogPagos(isV ? 'VENTA' : 'APARTADO', d.numero);
  }, 'Eliminado de la hoja');
}
async function borrarFilas(k, filas, titulo, msg, me) {
  if (!(await ask({ title: titulo, msg: msg + ' No se puede deshacer.', ok: 'Eliminar', danger: true }))) return;
  const ok = await W(async () => {
    const sig = {}, m = {}; for (const [row, s] of filas) { sig[row] = s; m[row] = BLANK[k](row); }
    await verify(k, sig); await writeRows(k, m);
  }, 'Eliminado de la hoja');
  if (ok) cerrarSi(me);
}

/* ============ acciones ============ */
const inflight = new Set(); let lastTap = { el: null, t: 0 };
document.addEventListener('click', async ev => {
  const now = Date.now(), b = ev.target.closest('[data-act]');
  if (!b) { if (ev.target.id === 'sheet' && now - uiAt > 450 && topSheet() && !topSheet().form) cerrarHojas(); return; }
  if (b.disabled || b.classList.contains('is-busy')) return;
  const a = b.dataset.act;
  if (now - uiAt < 300) return;                                   /* nada de tocar lo que acaba de aparecer bajo el dedo */
  if (lastTap.el === b && now - lastTap.t < (a === 'pick' || a === 'step' ? 120 : 450)) return;
  lastTap = { el: b, t: now };
  const key = a + '|' + JSON.stringify(Object.assign({}, b.dataset));
  if (inflight.has(key)) return;
  inflight.add(key);
  const slow = setTimeout(() => { if (b.isConnected) b.classList.add('is-busy'); }, 150);
  try { await act(b, a, b.dataset); }
  catch (e) { console.error(e); toast('Algo falló. Intenta de nuevo.', 'err'); }
  finally { clearTimeout(slow); inflight.delete(key); b.classList.remove('is-busy'); }
});
const ensucia = () => { const t = topSheet(); if (t && t.form) t.dirty = true; };
async function act(b, a, d) {
  const args = () => { const o = Object.assign({}, d); delete o.act; delete o.s; return o; };
  switch (a) {
    case 'dlgSi': dlgClose(true); break;
    case 'dlgNo': dlgClose(false); break;
    case 'tab': await irTab(d.k); break;
    case 'pg': await irPagina(d.p); break;
    case 'sh': if (SHEETS[d.s]) await abrir(d.s, args()); break;
    case 'shr': if (SHEETS[d.s]) cambiarHoja(topSheet(), d.s, args()); break;
    case 'atras': await cerrar(1); break;
    case 'cerrarHojas': await cerrarHojas(); break;
    case 'goInv': S.invFilter = d.f; S.invQ = ''; await irTab('inventario'); break;
    case 'invF': S.invFilter = d.f; draw(); break;
    case 'ventasF': S.ventasF = d.f; draw(); break;
    case 'year': S.year = +d.y; draw(); break;
    case 'catCam': S.catEnCamino = d.v === '1'; draw(); break;
    case 'catBs': S.catBs = !S.catBs; draw(); break;
    case 'pgP': S.pgP = d.p; draw(); break;
    case 'cajaP': S.cajaP = d.p; draw(); break;
    case 'statP': S.statP = d.p; draw(); break;
    case 'tema': lsSet('sf_tema', d.v); aplicarTema(); drawMain(); break;
    case 'pagosCli': S.pgCli = d.cl; S.pgP = 'todo'; S.pgMet = ''; await irPagina('pagos'); draw(); break;
    case 'copyPagos': await copyText(pagosTexto(pagosFiltro())); break;
    case 'copyCierre': await copyText(cierreTexto(cajaRange())); break;
    case 'copyCobro': { const x = porCobrar().find(z => z.cliente === d.cl); if (x) await copyText(msgCobro(x)); break; }
    case 'copyRepo': await copyText(repoTexto()); break;
    case 'catCopy': await copyText(catText()); break;
    case 'ecCopy': await copyText(ecuentaTexto(estadoCuenta(d.cl))); break;
    case 'copyRecibo': { const x = d.k === 'venta' ? ventaN(d.n) : apartadoN(d.n); if (x) await copyText(reciboTexto(d.k, x)); break; }
    case 'saveImg': { const cv = $('#docCv'); if (cv && cv.width) await new Promise(res => cv.toBlob(async bl => { try { if (bl) await saveBlob(cv.dataset.n + '.png', bl, true); } finally { res(); } }, 'image/png')); break; }
    case 'savePdf': { const cv = $('#docCv'); if (cv && cv.width) await saveBlob(cv.dataset.n + '.pdf', canvasPdf(cv), true); break; }
    /* formularios de venta, apartado, pedido y compra */
    case 'pick': pickAdd(d.c, d.m); ensucia(); break;
    case 'addLine': $('#lines').insertAdjacentHTML('beforeend', lineHtml(null, d.m)); updateLines(); ensucia(); { const s = $('#lines [data-line]:last-child .l-p'); if (s) s.focus(); } break;
    case 'rmLine': b.closest('[data-line]').remove(); updateLines(); ensucia(); break;
    case 'step': { const q = $('.l-q', b.closest('.stepper')); q.value = Math.max(1, Math.round(num(q.value)) + (+d.d)); updateLines(); ensucia(); break; }
    case 'applyDu': { const du = num($('#v_du').value); for (const { el, o } of readLines('venta')) if (o.codigo) $('.l-d', el).value = du ? r2(du * o.cantidad) : ''; updateLines(); ensucia(); break; }
    case 'payAll': $('#v_pag').value = num($('#F').dataset.total).toFixed(2); ensucia(); break;
    case 'modo': { $('#v_modo').value = d.v; $$('#modoSeg button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); $('#parteBox').hidden = d.v !== 'parte'; if (d.v === 'parte') $('#v_pag').focus(); ensucia(); errEn($('#F'), ''); break; }
    case 'cliPick': { const ci = $('#v_c'); ci.value = d.n; cliSug(); updateLines(); ensucia(); break; }
    /* operaciones */
    case 'anular': await anularPago(d.id, d.sig); break;
    case 'entregar': await entregar(d.n); break;
    case 'entregarParcial': await entregarParcial(d.n); break;
    case 'recibir': { const el = $('#rc_f'); await recibir(d.p, d.f, (el && el.value) || today()); break; }
    case 'delDoc': await borrarDoc(d.k, d.n); break;
    case 'delFila': { const me = topSheet(); if (me) me.dirty = false; await borrarFilas(d.k, [[+d.id.slice(1), d.sig]], d.k === 'gastos' ? '¿Eliminar este gasto?' : '¿Eliminar este cliente?', d.k === 'gastos' ? 'Se borra de la hoja Gastos.' : 'Se borra del directorio. Sus ventas y pagos no se tocan.', me); break; }
    case 'delPedido': { const rows = pedidoRows(d.k, d.p, d.f); if (rows.length) await borrarFilas(d.k, rows.map(r => [r.row, r.sig]), d.k === 'compras' ? '¿Eliminar esta compra?' : '¿Eliminar este pedido?', d.k === 'compras' ? 'Esas unidades salen del inventario y de los costos.' : 'Deja de contar como mercancía en camino.'); break; }
    case 'delProd': { const p = prod(d.c); if (p) await borrarFilas('productos', [[p.row, p.sig]], '¿Eliminar ' + title(p.color) + '?', 'Se borra de la hoja Inventario.'); break; }
    case 'cancelAp': {
      const a0 = apartadoN(d.n); if (!a0) break;
      const ab = a0.abonoSum || 0;
      if (!(await ask({ title: '¿Cancelar el apartado ' + d.n + '?', msg: 'Los productos quedan libres para vender.' + (ab > 0.005 ? ' Tiene ' + money(ab) + ' abonados: si se los devuelves, anula esos pagos.' : ''), ok: 'Cancelar apartado', no: 'Volver', danger: true }))) break;
      await W(async () => { await alDia(); const x = apartadoN(d.n); if (!x || !activo(x)) throw userErr('Este apartado ya no está activo en la hoja.'); await setApEstado(x, 'CANCELADO', 'Cancelado el ' + fdate(today())); }, 'Apartado cancelado');
      break; }
    /* varios */
    case 'backup': { const data = { exportado: new Date().toISOString(), config: cfg() }; for (const k of COLS) data[k] = S[k]; await saveBlob('respaldo-stratofil3d-' + today() + '.json', new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); break; }
    case 'csvVentas': {
      const q = v => { let s = String(v ?? ''); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
      const rows = [['Fecha', 'N° venta', 'Cliente', 'Código', 'Producto', 'Cantidad', 'Precio', 'Descuento', 'Total línea', 'Método', 'Estado de pago', 'Vendedor']];
      for (const v of S.ventas.slice().sort((x, y) => (x.fecha || '').localeCompare(y.fecha || '') || num(x.numero) - num(y.numero))) { const t = vt(v); for (const it of v.items || []) rows.push([v.fecha ? fdate(v.fecha) : '', v.numero, v.cliente, it.codigo, prodName(it.codigo), it.cantidad, it.precio, num(it.descuento), r2(lineaTotal(it)), v.metodo || '', t.estado, v.vendedor || '']); }
      await saveBlob('ventas-stratofil3d-' + today() + '.csv', new Blob(['﻿' + rows.map(r => r.map((c, i) => typeof c === 'number' ? c : q(c)).join(',')).join('\r\n')], { type: 'text/csv' }));
      break; }
    case 'install': if (installEvt) { installEvt.prompt(); try { await installEvt.userChoice; } catch (e) {} installEvt = null; draw(); } break;
    case 'reload': if (!conectado()) break; if (!navigator.onLine) toast('Sin internet. Se actualizará sola al volver la conexión.', 'err'); S.sheetErr = null; drawChrome(); await sync(true); break;
    case 'copyAccess': await copyText(location.origin + location.pathname + '?api=' + encodeURIComponent(API) + '&k=' + encodeURIComponent(KEY)); break;
    case 'logout': {
      if (!(await ask({ title: '¿Desconectar este teléfono?', msg: 'Se borran de este dispositivo el enlace, la clave y la copia de tus datos. En la hoja no cambia nada.', ok: 'Desconectar', danger: true }))) break;
      const t = topPage(); if (t) t.dirty = false;
      await back(L.length);
      lsDel(LS_API); lsDel(LS_KEY); API = ''; KEY = ''; olvidarDatos(); S.sheetErr = null; S.tab = 'inicio'; mainKey = ''; draw();
      break; }
  }
}
document.addEventListener('input', ev => {
  const t = ev.target; if (!t || !t.closest) return;
  if (t.dataset && t.dataset.in) { S[t.dataset.in] = t.value; const dyn = $('#dyn'); if (dyn && DYN[t.dataset.in]) dyn.innerHTML = DYN[t.dataset.in](); return; }
  if (t.id === 'pk_q') { const ok = busca(t.value); $$('#pkGrid .pick').forEach(b => { b.hidden = !ok(b.dataset.q); }); return; }
  if (t.closest('#FA')) { const p = topPage(); if (p) p.dirty = true; return; }
  if (t.closest('#sheetCard form')) { ensucia(); if (t.id === 'v_c') cliSug(); updateLines(); pgBs(); pcPrev(); }
});
document.addEventListener('change', ev => {
  const t = ev.target; if (!t || !t.closest) return;
  if (t.id === 'pg_cli' || t.id === 'pg_met') { S[t.id === 'pg_cli' ? 'pgCli' : 'pgMet'] = t.value; draw(); return; }
  if (t.id === 'cajaDia') { if (t.value) { S.cajaP = 'dia'; S.cajaDia = t.value; draw(); } return; }
  if (t.closest('#sheetCard form')) { ensucia(); if (t.classList.contains('l-p')) { const pr = $('.l-pr', t.closest('[data-line]')); if (pr) pr.value = ''; } updateLines(); pgBs(); }
});
document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape') { if (dlgRes) dlgClose(false); else if (topSheet()) cerrar(1); return; }
  /* Enter en un campo no envía a medias una venta o un pedido */
  if (ev.key === 'Enter' && ev.target.tagName === 'INPUT') { const f = ev.target.closest('form'); if (f && ['venta', 'apartado', 'pedido', 'compra'].includes(f.dataset.form)) { ev.preventDefault(); ev.target.blur(); } }
});
document.addEventListener('focusin', ev => { const t = ev.target; if (t && t.tagName === 'INPUT' && t.closest('#sheetCard') && /decimal|numeric/.test(t.inputMode || '') && !t.readOnly) setTimeout(() => { try { t.select(); } catch (e) {} }, 0); });

/* ============ guardar formularios ============ */
function errEn(f, m) { const box = (f.closest('#sheetCard') || f.closest('#main') || document); const e = $('[data-err]', box); if (e) { e.textContent = m || ''; if (m) e.scrollIntoView({ block: 'nearest' }); } }
document.addEventListener('submit', async ev => {
  const f = ev.target; if (!f.dataset || !f.dataset.form) return;
  ev.preventDefault();
  if (f.dataset.saving) return;
  f.dataset.saving = '1';
  const sb = (f.id && $('button[type=submit][form="' + f.id + '"]')) || $('button[type=submit]', f), lbl = sb ? sb.innerHTML : '';
  if (sb) sb.disabled = true;
  const lt = setTimeout(() => { if (sb && sb.isConnected && f.dataset.saving) sb.innerHTML = '<span class="spin"></span>Guardando…'; }, 250);
  errEn(f, '');
  try { await onSubmit(f, m => errEn(f, m)); }
  catch (e) { console.error(e); toast('Algo falló. Intenta de nuevo.', 'err'); }
  finally { clearTimeout(lt); delete f.dataset.saving; if (sb && sb.isConnected) { sb.innerHTML = lbl; sb.disabled = false; } }
});
async function onSubmit(f, err) {
  const fd = Object.fromEntries(new FormData(f).entries()), kind = f.dataset.form, me = topSheet();
  const fechaOk = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '');
  if (kind === 'setup') {
    const a = (fd.api || '').trim(), k = (fd.clave || '').trim().toUpperCase();
    if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(a)) return err('El enlace debe empezar con https://script.google.com/');
    if (!k) return err('Escribe la clave.');
    const oldA = API, oldK = KEY; API = a; KEY = k;
    try { await api({ op: 'ping' }, 30000); lsSet(LS_API, a); lsSet(LS_KEY, k); olvidarDatos(); S.sheetErr = null; mainKey = ''; draw(); toast('Conectado a tu hoja', 'ok'); sync(); }
    catch (e) { API = oldA; KEY = oldK; err(errMsg(e, false)); }
    return;
  }
  if (!conectado()) return err('No hay conexión con la hoja.');
  if (kind === 'tasa') {
    const v = num(fd.tasa);
    if (!(v > 0)) return err('Escribe la tasa, por ejemplo 205,50.');
    if (await W(() => writeRows('params', { 9: [null, v, 'Actualizada el ' + fdate(today()) + (myName() ? ' por ' + myName() : '')] }), 'Tasa guardada: ' + tasaFmt(v) + ' Bs/$')) cerrarSi(me);
  }
  else if (kind === 'prod') {
    const code = (f.dataset.c || fd.codigo || '').trim().toUpperCase(), color = (fd.color || '').trim().toUpperCase(), old = f.dataset.c ? prod(code) : null;
    if (!/^[A-Z0-9_\-.]+$/.test(code)) return err('El código solo puede tener letras, números y guiones.');
    if (f.dataset.c && !old) return err('Este producto ya no está en la hoja. Cierra y vuelve a abrirlo.');
    if (!f.dataset.c && prod(code)) return err('Ya existe un producto con ese código.');
    if (!color) return err('Escribe el color o nombre.');
    if (!(num(fd.precio) > 0)) return err('Escribe el precio de venta.');
    const dim = v => String(v || '').trim() === '' ? '' : num(v);
    const arr = [codeVal(code), fd.tipo, txt(color), fd.presentacion, null, null, null, dim(fd.largo), dim(fd.ancho), dim(fd.alto), null, null, null, null, null, num(fd.precio)];
    const ok = await W(async () => {
      if (old) { await verify('productos', { [old.row]: old.sig }); await writeRows('productos', { [old.row]: arr }); }
      else { await fresh('productos'); if (prod(code)) throw userErr('Ya existe un producto con ese código en la hoja.'); await writeRows('productos', { [needRows('productos', 1)]: arr }); }
      await addToList(1, color); await addToList(0, fd.tipo);
      if (fd.hex && fd.hex.toLowerCase() !== String(cfg().hex[code] || HEX[color] || '#888888').toLowerCase()) { try { await saveMeta({ hex: { [code]: fd.hex } }); } catch (e) {} }
    }, 'Producto guardado');
    if (ok) cerrarSi(me);
  }
  else if (kind === 'venta' || kind === 'apartado') {
    const isV = kind === 'venta', k = isV ? 'ventas' : 'apartados', buscar = n => isV ? ventaN(n) : apartadoN(n);
    const items = readLines(kind).map(x => x.o).filter(o => o.codigo && o.cantidad > 0), nombre = (fd.cliente || '').trim().replace(/\s+/g, ' '), oldNum = f.dataset.num;
    const old = oldNum ? buscar(oldNum) : null;
    if (oldNum && !old) return err('Ya no existe en la hoja. Cierra y vuelve a intentarlo.');
    if (!fechaOk(fd.fecha)) return err('Elige la fecha.');
    if (!nombre) return err('Escribe el nombre del cliente.');
    if (!items.length) return err('Agrega al menos un producto.');
    if (items.some(o => !Number.isInteger(o.cantidad))) return err('Las cantidades deben ser números enteros.');
    if (items.some(o => o.precio < 0 || o.descuento < 0 || o.descuento > o.cantidad * o.precio + 0.005)) return err('Revisa precios y descuentos: un descuento no puede ser mayor que la línea.');
    if (isV) { const falta = faltaStock(items, old); if (falta) return err(falta); }
    const total = sumItems(items);
    let pagoIni = 0;
    if (!old) {
      if (isV) {
        if (!fd.modo) return err('Indica cómo pagó: completo, una parte o queda debiendo.');
        pagoIni = fd.modo === 'todo' ? total : fd.modo === 'parte' ? num(fd.pagado) : 0;
        if (fd.modo === 'parte' && !(pagoIni > 0)) return err('Escribe cuánto pagó ahora.');
      } else pagoIni = num(fd.pagado);
      if (pagoIni < 0) return err('El pago no puede ser negativo.');
      if (pagoIni > total + 0.005) return err('El pago (' + money(pagoIni) + ') es mayor que el total (' + money(total) + ').');
      pagoIni = r2(pagoIni);
      if (pagoIni > 0 && !fd.metodo) return err('Elige el método de pago: hace falta para la caja.');
    }
    let notas = (fd.notas || '').trim(), numero;
    if (!old && pagoIni > 0) notas = (notas ? notas + '. ' : '') + (isV ? 'Pagó ' : 'Abonó ') + money(pagoIni) + ' el ' + fdate(fd.fecha) + (fd.metodo ? ' por ' + title(fd.metodo) : '');
    const ok = await W(async () => {
      await alDia();
      const cur = oldNum ? buscar(oldNum) : null;
      if (oldNum && (!cur || docSig(cur) !== f.dataset.sig)) throw userErr(isV ? 'Alguien cambió esta venta en la hoja mientras la editabas. Ciérrala y vuelve a abrirla.' : 'Alguien cambió este apartado en la hoja mientras lo editabas. Ciérralo y vuelve a abrirlo.');
      if (cur && !isV && !activo(cur)) throw userErr('Este apartado ya no está activo en la hoja.');
      if (isV) { const falta = faltaStock(items, cur); if (falta) throw userErr(falta); }
      const start = await ubicarFilas(k, cur, items.length);
      numero = cur ? cur.numero : (isV ? nextVenta() : nextApartado());
      const doc = { fecha: fd.fecha, numero, cliente: nombre, metodo: fd.metodo || '', tasa: isV && fd.tasa ? num(fd.tasa) : '', notas, vendedor: cur ? (cur.vendedor || '') : myName() };
      if (isV) { const pagado = cur ? Math.min(vt(cur).pagado, total) : pagoIni; await writeRows('ventas', ventaRows(start, doc, items, estadoPago(total, pagado), pagado)); }
      else { doc.abono = cur ? (cur.abonoSum || 0) : pagoIni; doc.estado = 'APARTADO'; await writeRows('apartados', apRows(start, doc, items)); }
      if (!cur && pagoIni > 0) await logPago({ fecha: fd.fecha, tipo: isV ? 'VENTA' : 'APARTADO', numero, cliente: nombre, monto: pagoIni, metodo: fd.metodo || '', tasa: tasaPago(fd.metodo, fd.tasa), notas: isV ? 'Pago al registrar la venta' : 'Abono inicial del apartado' });
      if (cur && cur.cliente !== nombre) { await fresh('pagos'); const mp = {}; for (const p of pagosDe(isV ? 'VENTA' : 'APARTADO', numero)) mp[p.row] = [null, null, null, txt(nombre)]; await writeRows('pagos', mp); }
      await ensureCliente(nombre, (fd.telefono || '').trim());
    }, old ? 'Cambios guardados' : (isV ? 'Venta N° registrada' : 'Apartado registrado'));
    if (ok) { if (old) cerrarSi(me); else cambiarHoja(me, isV ? 'venta' : 'apartado', { n: numero }); }
  }
  else if (kind === 'pago') {
    const m = r2(num(fd.monto)), k = f.dataset.k, n = f.dataset.n, buscar = () => k === 'ventas' ? ventaN(n) : apartadoN(n), tot = d => k === 'ventas' ? vt(d) : apTotals(d);
    const d0 = buscar(); if (!d0) return err('Ya no existe en la hoja.');
    if (!(m > 0)) return err('Escribe un monto mayor a cero.');
    if (!fechaOk(fd.fecha)) return err('Elige la fecha.');
    const debe0 = tot(d0).saldo;
    if (m > debe0 + 0.005) return err(debe0 > 0.005 ? 'El monto es mayor que lo que debe (' + money(debe0) + ').' : 'Ya está pagado completo.');
    if (!fd.metodo) return err('Elige el método de pago: hace falta para la caja.');
    const nota = (k === 'ventas' ? 'Pagó ' : 'Abonó ') + money(m) + ' el ' + fdate(fd.fecha) + ' por ' + title(fd.metodo);
    const ok = await W(async () => {
      await alDia();
      const d = buscar(); if (!d) throw userErr('Ya no existe en la hoja.');
      const t = tot(d);
      if (m > t.saldo + 0.005) throw userErr('La deuda cambió mientras tanto: ahora debe ' + money(t.saldo) + '. Revisa y vuelve a intentar.');
      await writePagado(k, d, r2(t.pagado + m), nota, fd.metodo);
      await logPago({ fecha: fd.fecha, tipo: k === 'ventas' ? 'VENTA' : 'APARTADO', numero: d.numero, cliente: d.cliente, monto: m, metodo: fd.metodo, tasa: tasaPago(fd.metodo, fd.tasa), notas: k === 'ventas' ? 'Pago de venta' : 'Abono de apartado' });
    }, 'Pago registrado');
    if (ok) cerrarSi(me);
  }
  else if (kind === 'pagoCli') {
    const m = r2(num(fd.monto)), nombre = f.dataset.cl, fecha = fd.fecha;
    if (!(m > 0)) return err('Escribe un monto mayor a cero.');
    if (!fechaOk(fecha)) return err('Elige la fecha.');
    if (repartir(nombre, m).sobra > 0.005) return err('El monto es mayor que lo que debe.');
    if (!fd.metodo) return err('Elige el método de pago: hace falta para la caja.');
    const ok = await W(async () => {
      await alDia();
      const r = repartir(nombre, m);
      if (r.sobra > 0.005 || !r.partes.length) throw userErr('La deuda cambió mientras tanto. Revisa y vuelve a intentar.');
      const multi = r.partes.length > 1;
      for (const p of r.partes) {
        const nota = (p.k === 'ventas' ? 'Pagó ' : 'Abonó ') + money(p.m) + ' el ' + fdate(fecha) + ' por ' + title(fd.metodo) + (multi ? ' (de un pago de ' + money(m) + ')' : '');
        await writePagado(p.k, p.d, r2((p.k === 'ventas' ? vt(p.d).pagado : (p.d.abonoSum || 0)) + p.m), nota, fd.metodo);
        await logPago({ fecha, tipo: p.k === 'ventas' ? 'VENTA' : 'APARTADO', numero: p.d.numero, cliente: p.d.cliente, monto: p.m, metodo: fd.metodo, tasa: tasaPago(fd.metodo, fd.tasa),
          notas: multi ? 'Parte de un pago de ' + money(m) + ' (' + r.partes.filter(q => q !== p).map(q => money(q.m) + (q.k === 'ventas' ? ' a la venta N° ' : ' al apartado ') + q.d.numero).join(', ') + ')' : (p.k === 'ventas' ? 'Pago de venta' : 'Abono de apartado') });
      }
    }, 'Pago registrado');
    if (ok) cerrarSi(me);
  }
  else if (kind === 'pedido' || kind === 'compra') {
    const isC = kind === 'compra', k = isC ? 'compras' : 'encamino';
    const lines = readLines(kind).map(x => x.o).filter(o => o.codigo && o.cantidad > 0);
    if (!fechaOk(fd.fecha)) return err('Elige la fecha del pedido.');
    if (!lines.length) return err('Agrega al menos un producto con cantidad.');
    if (lines.some(o => !Number.isInteger(o.cantidad))) return err('Las cantidades deben ser números enteros.');
    if (lines.some(o => !(o.subtotal > 0))) return err('Falta el subtotal de alguna línea.');
    const orig = f.dataset.orig ? JSON.parse(f.dataset.orig) : [];
    const viejos = orig.map(([row]) => S[k].find(x => x.row === row)).filter(Boolean);
    const ok = await W(async () => {
      if (orig.length) { const sig = {}, m = {}; for (const [row, s] of orig) { sig[row] = s; m[row] = BLANK[k](row); } await verify(k, sig); await writeRows(k, m); }
      await fresh(k);
      const start = needRows(k, lines.length), m = {};
      lines.forEach((o, i) => {
        const v = viejos[i];
        const d = { fecha: fd.fecha, pedido: (fd.pedido || '').trim(), proveedor: (fd.proveedor || '').trim().toUpperCase(), codigo: o.codigo, cantidad: o.cantidad, subtotal: o.subtotal, notas: i === 0 ? fd.notas : '', envioReal: o.envioReal, estado: (v && v.codigo === o.codigo && v.estado) || 'EN CAMINO', fechaLlegada: v && v.codigo === o.codigo ? v.fechaLlegada : '' };
        m[start + i] = isC ? compraRow(d) : caminoRow(d);
      });
      await writeRows(k, m);
    }, isC ? 'Compra guardada' : 'Pedido guardado');
    if (ok) {
      /* el detalle de abajo puede haber cambiado de número o fecha */
      const abajo = L[L.length - 2];
      if (me && topLayer() === me && abajo && abajo.sheet === 'pedido') { abajo.a.p = (fd.pedido || '').trim() || 'Sin número'; abajo.a.f = fd.fecha; }
      cerrarSi(me);
    }
  }
  else if (kind === 'gasto') {
    const id = f.dataset.id, old = id ? S.gastos.find(x => x.id === id && x.sig === f.dataset.sig) : null;
    if (id && !old) return err('Este gasto cambió en la hoja. Cierra y vuelve a abrirlo.');
    if (!fechaOk(fd.fecha)) return err('Elige la fecha.');
    if (!(num(fd.monto) > 0)) return err('Escribe el monto.');
    const arr = [serial(fd.fecha), fd.categoria || '', txt(fd.descripcion), r2(num(fd.monto)), fd.metodo || '', txt(fd.notas || '')];
    const ok = await W(async () => {
      if (old) { await verify('gastos', { [old.row]: old.sig }); await writeRows('gastos', { [old.row]: arr }); }
      else { await fresh('gastos'); await writeRows('gastos', { [needRows('gastos', 1)]: arr }); }
    }, 'Gasto guardado');
    if (ok) cerrarSi(me);
  }
  else if (kind === 'cliente') {
    const id = f.dataset.id, old = id ? S.clientes.find(x => x.id === id && x.sig === f.dataset.sig) : null, nombre = (fd.nombre || '').trim().replace(/\s+/g, ' ');
    if (id && !old) return err('Este cliente cambió en la hoja. Cierra y vuelve a abrirlo.');
    if (!nombre) return err('Escribe el nombre.');
    const otro = clienteDe(nombre); if (otro && (!old || otro.id !== old.id)) return err('Ya existe un cliente con ese nombre.');
    const arr = [txt(nombre), txt(fd.telefono), txt(fd.cedula), txt(fd.direccion), txt(fd.ciudad), txt(fd.correo), txt(fd.notas)];
    const ok = await W(async () => {
      if (old) {
        await verify('clientes', { [old.row]: old.sig }); await writeRows('clientes', { [old.row]: arr });
        if (old.nombre !== nombre) {
          for (const kk of ['ventas', 'apartados']) { await fresh(kk); const m = {}; for (const d of S[kk].filter(x => sameName(x.cliente, old.nombre))) for (const r of d.rows) m[r] = [null, null, txt(nombre)]; await writeRows(kk, m); }
          await fresh('pagos'); const mp = {}; for (const p of S.pagos.filter(x => sameName(x.cliente, old.nombre))) mp[p.row] = [null, null, null, txt(nombre)]; await writeRows('pagos', mp);
        }
      } else { await fresh('clientes'); if (clienteDe(nombre)) throw userErr('Ya existe un cliente con ese nombre.'); await writeRows('clientes', { [needRows('clientes', 1)]: arr }); }
    }, 'Cliente guardado');
    if (ok) {
      if (old) for (const l of L) if (l.sheet === 'cliente') { if (l.a.cl !== undefined && sameName(l.a.cl, old.nombre)) l.a.cl = nombre; }
      cerrarSi(me);
    }
  }
  else if (kind === 'ajustes') {
    const lines = s => [...new Set(String(s || '').split('\n').map(x => x.trim().toUpperCase()).filter(Boolean))];
    const metodos = String(fd.metodos || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => { const i = l.lastIndexOf('='); return { n: (i < 0 ? l : l.slice(0, i)).trim().toUpperCase(), c: i < 0 ? 0 : num(l.slice(i + 1)) }; }).filter(x => x.n);
    const tipos = lines(fd.tipos), cats = lines(fd.categorias), provs = lines(fd.proveedores);
    const negocio = { nombre: (fd.nombre || '').trim() || 'StratoFil3D', whatsapp: (fd.whatsapp || '').trim(), instagram: (fd.instagram || '').trim(), ciudad: (fd.ciudad || '').trim() };
    if (Math.max(tipos.length, cats.length, provs.length, metodos.length) > 50) return err('Cada lista admite hasta 50 elementos.');
    if (!metodos.length) return err('Deja al menos un método de pago.');
    if (!(num(fd.tax) >= 0 && num(fd.tax) < 100)) return err('El impuesto debe ser un porcentaje entre 0 y 100.');
    lsSet('sf_nombre', (fd.minombre || '').trim());
    const ok = await W(async () => {
      const m = { 4: [null, num(fd.tax) / 100], 5: [null, num(fd.tarifaPie)], 7: [null, Math.max(0, Math.round(num(fd.stockMin)))], 8: [null, Math.max(1, Math.round(num(fd.mesesCobertura)))] };
      for (let i = 0; i < 50; i++) m[12 + i] = [tipos[i] || '', null, null, metodos[i] ? metodos[i].n : '', metodos[i] ? metodos[i].c / 100 : '', null, cats[i] || '', provs[i] || ''];
      await writeRows('params', m);
      await saveMeta({ negocio });
    }, 'Ajustes guardados');
    if (ok) { const p = topPage(); if (p) p.dirty = false; draw(); } else err('No se pudieron guardar todos los ajustes.');
  }
}

/* ============ arranque ============ */
async function sync(avisar) {
  if (!conectado() || syncing || S.busy) return;
  syncing = true;
  try { await readAll(); if (avisar) toast('Datos al día', 'ok', 1500); }
  catch (e) {
    S.sheetErr = errMsg(e, false);
    if (e.code === 'clave') { lsDel(LS_KEY); KEY = ''; olvidarDatos(); mainKey = ''; }
  }
  finally { syncing = false; if (dataSig() !== drawnSig) drawWhenIdle(); else drawChrome(); }
}
(function arranque() {
  try {
    const q = new URLSearchParams(location.search);
    if (q.get('api') && q.get('k')) { API = q.get('api'); KEY = q.get('k').toUpperCase(); lsSet(LS_API, API); lsSet(LS_KEY, KEY); lsDel(LS_CACHE); history.replaceState(null, '', location.pathname); }
  } catch (e) {}
  let alAbrir = null;
  try { const q = new URLSearchParams(location.search); if (q.get('nuevo') === 'venta') alAbrir = () => abrir('ventaForm', { m: 'venta' }); else if (VIEWS[q.get('ir')]) S.tab = q.get('ir'); } catch (e) {}
  try { history.replaceState({ d: 0 }, '', location.pathname); } catch (e) {}
  aplicarTema();
  if (conectado()) loadCache();
  draw();
  sync().then(() => { if (alAbrir && listo() && !L.length) alAbrir(); });
  setInterval(() => { if (document.visibilityState === 'visible') sync(); }, 30000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sync(); });
  window.addEventListener('online', () => sync());
  window.addEventListener('offline', () => { if (conectado()) { S.sheetErr = 'Sin internet.'; drawChrome(); } });
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; drawWhenIdle(); });
  window.addEventListener('appinstalled', () => { installEvt = null; draw(); toast('App instalada', 'ok'); });
  if (window.matchMedia) { const mq = matchMedia('(prefers-color-scheme: dark)'), fn = () => aplicarTema(); if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn); }
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
})();
