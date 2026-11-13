'use strict';
/* StratoFil3D · interfaz: navegación, avisos, pantallas principales y páginas de "Más".
   Las hojas (detalles y formularios) y las acciones están en hojas.js. */

/* ============ piezas ============ */
const IC = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  spool: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v6M12 15v6"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
  back: '<path d="M15 5l-7 7 7 7"/>', chev: '<path d="M9 5l7 7-7 7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  alert: '<path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17.5v.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  truck: '<path d="M2 6h11v10H2zM13 9h4l4 4v3h-8z"/><circle cx="6.5" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  box: '<path d="M3 8 12 3l9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.1.8 3.5 2.8 3.5 5.7"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  share: '<path d="M12 15V3M8 7l4-4 4 4M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>',
  chat: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/>',
  download: '<path d="M12 3v12M8 11l4 4 4-4M4 20h16"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 10v4M18 10v4"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.3"/>',
  file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
  cart: '<path d="M3 4h2.5l2.2 11h10.6L20 7H7"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  out: '<path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5M15 8l4 4-4 4M19 12H9"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m21 16-5-5-8 8"/>',
  dollar: '<path d="M12 3v18M16.5 7.5c-.8-1.4-2.4-2-4.5-2-2.6 0-4.3 1.2-4.3 3.2 0 4.4 9.1 2.1 9.1 6.6 0 2-1.8 3.2-4.8 3.2-2.3 0-4-.8-4.9-2.3"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>'
};
const ic = n => '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + (IC[n] || '') + '</svg>';
/* atributos data-* de una acción */
const A = (act, d) => { let s = 'data-act="' + act + '"'; for (const k in d || {}) s += ' data-' + k + '="' + esc(d[k]) + '"'; return s; };
function swatch(p, cls) {
  if (isAcc(p)) return '<span class="sw acc' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' + ic('box') + '</span>';
  return '<span class="sw' + (p && p.presentacion === 'REFILL' ? ' refill' : '') + (cls ? ' ' + cls : '') + '" style="--c:' + hexOf(p) + '" aria-hidden="true"></span>';
}
const PILL = { 'OK': 'ok', 'STOCK BAJO': 'warn', 'EN CAMINO': 'info', 'REVISAR': 'bad', 'PAGADO': 'ok', 'ABONADO': 'info', 'PENDIENTE': 'warn', 'APARTADO': 'info', 'ENTREGADO': 'ok', 'CANCELADO': 'mut', 'URGENTE': 'bad', 'PEDIR': 'warn', 'VIGILAR': 'info', 'RECIBIDO': 'ok', 'AGOTADO': 'bad' };
const pill = s => '<span class="pill p-' + (PILL[s] || 'mut') + '">' + esc(s) + '</span>';
const estadoInv = e => (e.estado === 'STOCK BAJO' && e.disp <= 0) ? 'AGOTADO' : e.estado;
const ini = n => { const w = String(n || '?').trim().split(/\s+/); return esc(((w[0] || '?')[0] + (w[1] ? w[1][0] : '')).toUpperCase()); };
const avatar = n => '<span class="av" aria-hidden="true">' + ini(n) + '</span>';
const icBox = (n, tone) => '<span class="ic' + (tone ? ' ' + tone : '') + '" aria-hidden="true">' + ic(n) + '</span>';
/* fila de lista: con acción es un botón, sin acción es un bloque */
function row(o) {
  const tag = o.a ? 'button' : 'div';
  return '<' + tag + ' class="row" ' + (o.a || '') + '>' + (o.left || '') + '<div class="main"><div class="t">' + o.t + '</div>' + (o.d ? '<div class="d">' + o.d + '</div>' : '') + '</div>'
    + (o.big !== undefined || o.end ? '<div class="end">' + (o.big !== undefined ? '<div class="big"' + (o.tone ? ' style="color:var(--' + o.tone + ')"' : '') + '>' + o.big + '</div>' : '') + (o.end || '') + '</div>' : '')
    + (o.go ? ic('chev').replace('class="i"', 'class="i go"') : '') + '</' + tag + '>';
}
const list = rows => '<div class="list">' + rows.join('') + '</div>';
const empty = (icon, t, d, extra) => '<div class="card empty">' + icBox(icon) + '<b>' + t + '</b>' + (d || '') + (extra ? '<div class="btns" style="justify-content:center;margin-top:12px">' + extra + '</div>' : '') + '</div>';
const sec = (t, r) => '<h2 class="sec"><span>' + t + '</span>' + (r ? '<span class="r num">' + r + '</span>' : '') + '</h2>';
const chips = (act, key, cur, opts) => '<div class="chips">' + opts.map(([k, l, n]) => '<button class="chip" ' + A(act, { [key]: k }) + ' aria-pressed="' + (cur === k) + '">' + l + (n !== undefined ? ' <small>' + n + '</small>' : '') + '</button>').join('') + '</div>';
const searchBox = (key, ph) => '<div class="searchbox">' + ic('search') + '<input class="search" id="q_' + key + '" type="search" enterkeyhint="search" autocomplete="off" placeholder="' + ph + '" aria-label="' + ph + '" value="' + esc(S[key]) + '" data-in="' + key + '"></div>';
const kpi = (l, v, s, a, icon) => '<' + (a ? 'button' : 'div') + ' class="kpi" ' + (a || '') + '><div class="l">' + (icon ? ic(icon) : '') + l + '</div><div class="v">' + v + '</div>' + (s ? '<div class="s">' + s + '</div>' : '') + '</' + (a ? 'button' : 'div') + '>';
const stat = (l, v) => '<div class="stat"><div class="l">' + l + '</div><div class="v">' + v + '</div></div>';
const barras = (items, tot) => '<div class="card bars">' + items.map(([l, v]) => '<div><div class="hd"><span>' + esc(l) + '</span><span class="num">' + money(v) + ' · ' + (tot ? (v / tot * 100).toFixed(0) : 0) + '%</span></div><div class="bar"><i style="width:' + (tot ? Math.max(0, v / tot * 100).toFixed(1) : 0) + '%"></i></div></div>').join('') + '</div>';
function delta(cur, prev, invert) {
  if (Math.abs(prev) < 0.005 && Math.abs(cur) < 0.005) return '<span class="dl">sin cambio</span>';
  if (Math.abs(prev) < 0.005) return '<span class="dl ' + (invert ? 'down' : 'up') + '">nuevo</span>';
  const d = (cur - prev) / Math.abs(prev), up = d >= 0, good = invert ? !up : up;
  return '<span class="dl ' + (Math.abs(d) < 0.005 ? '' : good ? 'up' : 'down') + '">' + (up ? '▲' : '▼') + ' ' + Math.abs(d * 100).toFixed(0) + '%</span>';
}

/* ============ avisos y confirmación ============ */
let toastT = null;
function toast(msg, type, ms) {
  const box = $('#toasts'); box.innerHTML = ''; clearTimeout(toastT);
  const el = document.createElement('div'); el.className = 'toast t-' + (type || 'info');
  el.innerHTML = (type === 'busy' ? '<span class="spin"></span>' : type === 'ok' ? ic('check') : type === 'err' ? ic('alert') : '') + '<span>' + esc(msg) + '</span>';
  box.appendChild(el);
  if (type !== 'busy') toastT = setTimeout(() => el.remove(), ms || (type === 'err' ? 5500 : 2600));
}
let dlgRes = null, uiAt = 0;
function ask(o) {
  return new Promise(res => {
    if (dlgRes) dlgRes(false);
    dlgRes = res;
    $('#dlg').innerHTML = '<div class="dlg-card" role="alertdialog" aria-modal="true" aria-labelledby="dlgT"><h3 id="dlgT">' + esc(o.title) + '</h3><p>' + esc(o.msg || '') + '</p><div class="btns"><button class="btn ghost" data-act="dlgNo">' + esc(o.no || 'Cancelar') + '</button><button class="btn ' + (o.danger ? 'danger' : 'pri') + '" data-act="dlgSi">' + esc(o.ok || 'Aceptar') + '</button></div></div>';
    $('#dlg').hidden = false; uiAt = Date.now();
  });
}
function dlgClose(v) { $('#dlg').hidden = true; $('#dlg').innerHTML = ''; const r = dlgRes; dlgRes = null; if (r) r(v); }
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); toast('Copiado', 'ok'); }
  catch (e) { push({ sheet: 'copia', a: { t } }); }
}
async function saveBlob(name, blob, share) {
  if (share && navigator.canShare) {
    try { const f = new File([blob], name, { type: blob.type }); if (navigator.canShare({ files: [f] })) { await navigator.share({ files: [f] }); return; } }
    catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const u = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 8000); toast('Archivo descargado', 'ok');
}
const puedeCompartir = () => { try { return !!navigator.canShare && navigator.canShare({ files: [new File([''], 'a.png', { type: 'image/png' })] }); } catch (e) { return false; } };

/* ============ guardar en la hoja ============ */
let wq = Promise.resolve();
function queue(fn) { const p = wq.then(fn, fn); wq = p.catch(() => {}); return p; }
/* corre fn (que escribe en la hoja) de una en una; devuelve true si se guardó */
async function W(fn, okMsg) {
  if (!conectado()) { toast('Falta conectar la app con tu hoja.', 'err'); return false; }
  return queue(async () => {
    S.busy = true; drawChrome(); toast('Guardando en la hoja…', 'busy');
    let ok = false;
    try {
      await fn(); ok = true;
      try { await readAll(); } catch (e) {}
      toast(okMsg || 'Guardado en la hoja', 'ok');
    } catch (e) {
      console.error(e);
      if (e && e.stale) toast('La hoja cambió mientras tanto. Ya la recargué: revisa y vuelve a intentar.', 'err');
      else if (e && e.user) toast(e.message, 'err');
      else toast(errMsg(e, true), 'err');
    } finally { S.busy = false; if (ok || !S.lastSync) S.lastSync = Date.now(); draw(); }
    return ok;
  });
}

/* ============ navegación: capas (páginas y hojas) enlazadas al botón atrás ============ */
const L = [];
let navQ = Promise.resolve(), popWait = null;
const topLayer = () => L[L.length - 1] || null;
const topSheet = () => { const t = topLayer(); return t && t.sheet ? t : null; };
const topPage = () => { for (let i = L.length - 1; i >= 0; i--) if (L[i].page) return L[i]; return null; };
const sheetCount = () => { let n = 0; for (let i = L.length - 1; i >= 0 && L[i].sheet; i--) n++; return n; };
const hpush = () => { try { history.pushState({ d: L.length }, ''); } catch (e) {} };
function push(layer) {
  return navQ = navQ.then(() => {
    layer.y = window.scrollY; L.push(layer); hpush(); uiAt = Date.now(); draw();
    if (layer.page) window.scrollTo(0, 0);
  });
}
function popTo(d) {
  d = Math.max(0, Math.min(d, L.length));
  const gone = L.splice(d);
  draw();
  const pg = gone.find(l => l.page);
  if (pg) window.scrollTo(0, pg.y || 0);
  if (popWait) { const w = popWait; popWait = null; clearTimeout(w.t); w.res(); }
}
/* cierra n capas pasando por el historial, para que el botón atrás del teléfono quede en su sitio */
function back(n) {
  return navQ = navQ.then(() => new Promise(res => {
    n = Math.min(n === undefined ? 1 : n, L.length);
    if (n <= 0) return res();
    const target = L.length - n;
    for (const l of L.slice(target)) l.dirty = false;
    popWait = { res, t: setTimeout(() => popTo(target), 700) };
    try { history.go(-n); } catch (e) { popTo(target); }
  }));
}
window.addEventListener('popstate', ev => {
  const d = Math.min(Math.max(0, (ev.state && ev.state.d) | 0), L.length);
  if (dlgRes) { dlgClose(false); if (d < L.length) hpush(); return; }
  const t = topLayer();
  if (d < L.length && t && t.dirty) { hpush(); cerrar(1); return; }
  popTo(d);
});
/* cierra capas preguntando antes si hay algo escrito sin guardar */
async function cerrar(n) {
  const t = topLayer();
  if (t && t.dirty && !(await ask({ title: '¿Descartar los cambios?', msg: 'Lo que escribiste todavía no se ha guardado.', ok: 'Descartar', no: 'Seguir editando', danger: true }))) return false;
  await back(n);
  return true;
}
const cerrarHojas = () => cerrar(sheetCount());
async function irTab(k) { if (!(await cerrar(L.length))) return; S.tab = k; lsSet('sf_tab', k); draw(); window.scrollTo(0, 0); }
async function irPagina(p) { if (sheetCount() && !(await cerrarHojas())) return; if (topPage() && topPage().page === p) return; await push({ page: p }); }
const abrir = (sheet, a) => push({ sheet, a: a || {} });
/* cierra la hoja desde la que se guardó, si sigue arriba */
const cerrarSi = me => (me && topLayer() === me) ? back(1) : Promise.resolve();
/* cambia la hoja de arriba por otra sin tocar el historial (p. ej. formulario → detalle de lo guardado) */
function cambiarHoja(me, sheet, a) {
  if (!me || topLayer() !== me) return;
  me.sheet = sheet; me.a = a; me.dirty = false; me.fixed = false; shown = null; uiAt = Date.now(); draw();
}

/* ============ dibujo ============ */
let touching = false, touchAt = 0, rsT = null, drawnSig = '', mainKey = '', shown = null, syncing = false;
document.addEventListener('pointerdown', () => { touching = true; touchAt = Date.now(); }, { passive: true, capture: true });
document.addEventListener('pointerup', () => { touching = false; touchAt = Date.now(); }, { passive: true, capture: true });
document.addEventListener('pointercancel', () => { touching = false; }, { passive: true, capture: true });
const dataSig = () => { try { return JSON.stringify(S.raw) + '|' + JSON.stringify(S.meta) + '|' + (S.sheetErr || '') + '|' + S.loaded.size + '|' + today(); } catch (e) { return String(Date.now()); } };
/* no redibujar mientras el dedo está tocando: así el toque no se pierde */
function drawWhenIdle() {
  clearTimeout(rsT);
  if (touching || Date.now() - touchAt < 700) { rsT = setTimeout(drawWhenIdle, 350); return; }
  draw();
}
function draw() {
  drawnSig = dataSig();
  C = calc();
  drawChrome(); drawMain(); drawSheet();
}
const TABS = [['inicio', 'Inicio', 'home'], ['inventario', 'Inventario', 'spool'], ['ventas', 'Ventas', 'receipt'], ['cobrar', 'Cobrar', 'wallet'], ['mas', 'Más', 'grid']];
function drawChrome() {
  const ok = conectado() && listo();
  $('#tabs').innerHTML = ok ? TABS.map(([k, l, i]) => '<button class="tab" ' + A('tab', { k }) + (S.tab === k ? ' aria-current="page"' : '') + '><span class="ic">' + ic(i) + '</span>' + l + '</button>').join('') : '';
  $('nav.tabs').hidden = !ok;
  const fab = $('#fab'), enVentas = S.tab === 'ventas' && !topPage();
  fab.hidden = !ok;
  fab.dataset.s = enVentas ? 'ventaForm' : 'nuevo'; fab.dataset.m = 'venta';
  fab.innerHTML = ic('plus') + (enVentas ? 'Venta' : 'Nuevo');
  $('#banner').innerHTML = S.sheetErr && conectado() ? '<div class="banner">' + esc(S.sheetErr) + (S.lastSync ? ' Ves los datos de la última vez que hubo conexión.' : '') + ' <a href="' + SHEET_URL + '" target="_blank" rel="noopener">Abrir la hoja</a></div>' : '';
  const el = $('#sync'); el.hidden = !conectado();
  const hm = () => { const d = new Date(S.lastSync); return (d.toDateString() === new Date().toDateString() ? '' : pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + ' ') + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  let cls = 's-ok', txtS;
  if (S.busy) { cls = 's-busy'; txtS = 'Guardando…'; }
  else if (S.sheetErr) { cls = 's-err'; txtS = 'Sin conexión' + (S.lastSync ? ' · ' + hm() : ''); }
  else if (!listo() || S.deCache) { cls = 's-busy'; txtS = S.deCache ? 'Actualizando…' : 'Leyendo la hoja…'; }
  else txtS = 'Al día · ' + hm();
  el.className = 'sync ' + cls; el.lastElementChild.textContent = txtS;
  el.title = 'Toca para actualizar';
}
function drawMain() {
  const m = $('#main'); let html, key;
  if (!conectado()) { key = 'setup'; if (mainKey === key) return; html = vSetup(); }
  else if (!listo()) { key = 'carga' + (S.sheetErr ? 'E' : ''); html = vCargando(); }
  else {
    const p = topPage();
    if (p) { key = 'p:' + p.page; if (mainKey === key && p.dirty) return; html = PAGES[p.page](); }
    else { key = 't:' + S.tab; html = VIEWS[S.tab](); }
  }
  const act = document.activeElement, keep = act && act.id && m.contains(act) ? { id: act.id, s: act.selectionStart } : null;
  m.innerHTML = html;
  if (key !== mainKey) { mainKey = key; m.classList.remove('view-in'); void m.offsetWidth; m.classList.add('view-in'); }
  if (keep) { const n = document.getElementById(keep.id); if (n) { n.focus({ preventScroll: true }); try { n.setSelectionRange(keep.s, keep.s); } catch (e) {} } }
}
function drawSheet() {
  const t = topSheet(), el = $('#sheet'), card = $('#sheetCard');
  if (!t) {
    if (shown || !el.hidden) { el.hidden = true; card.innerHTML = ''; document.body.classList.remove('lock'); shown = null; }
    return;
  }
  if (shown === t && t.fixed) return;
  let r = null;
  try { r = SHEETS[t.sheet](t.a || {}); } catch (e) { console.error(e); }
  if (!r) { if (shown === t) shown = null; back(1); return; }
  const same = shown === t, b0 = $('#sheetB'), sc = same && b0 ? b0.scrollTop : 0, atras = L.length > 1 && L[L.length - 2].sheet;
  card.innerHTML = '<div class="sheet-h" id="sheetH">' + (atras ? '<button class="icb bk" data-act="atras" aria-label="Volver">' + ic('back') + '</button>' : '')
    + '<h2 id="sheetT">' + esc(r.t) + '</h2><button class="icb" data-act="cerrarHojas" aria-label="Cerrar">' + ic('x') + '</button></div>'
    + '<div class="sheet-b" id="sheetB">' + r.h + '</div>' + (r.foot ? '<div class="sheet-f">' + r.foot + '</div>' : '');
  t.fixed = !!(r.form || r.fixed); t.form = !!r.form;
  el.hidden = false; document.body.classList.add('lock');
  if (!same) { el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); }
  shown = t;
  const b = $('#sheetB');
  b.addEventListener('scroll', () => $('#sheetH').classList.toggle('scrolled', b.scrollTop > 4), { passive: true });
  if (r.mount) r.mount();
  if (same) b.scrollTop = sc;
}
function aplicarTema() {
  let t = lsGet('sf_tema') || 'auto';
  if (t !== 'light' && t !== 'dark') t = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', t);
  const m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'dark' ? '#051022' : '#F1F6F0');
}

/* ============ pantallas ============ */
const vh = (t, sub, back) => '<div class="vh">' + (back ? '<button class="icb" data-act="atras" aria-label="Volver">' + ic('back') + '</button>' : '') + '<h1>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + esc(t) + '</h1></div>';
function vSetup() {
  return '<div class="setup"><img class="logo lg-d" src="logo-oscuro.png" alt="STRATO"><img class="logo lg-l" src="logo-claro.png" alt="STRATO">'
    + '<div class="vh"><h1>Conecta tu hoja</h1></div><p class="muted" style="margin-top:-6px">Pega el enlace del puente (la aplicación web de Google Apps Script) y tu clave. Solo se hace una vez en cada teléfono.</p>'
    + '<form class="fg" data-form="setup" id="F0" novalidate><div class="f"><label for="su_api">Enlace del puente</label><input id="su_api" name="api" inputmode="url" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="https://script.google.com/macros/s/…/exec" value="' + esc(API) + '"></div>'
    + '<div class="f"><label for="su_k">Clave</label><input id="su_k" name="clave" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="XXXX-XXXX-XXXX" value="' + esc(KEY) + '"></div>'
    + '<div class="err" data-err role="alert">' + esc(S.sheetErr || '') + '</div><button class="btn pri block" type="submit">Conectar</button></form></div>';
}
function vCargando() {
  if (S.sheetErr) return vh('Sin datos') + '<p class="muted">Cuando la conexión con tu hoja funcione, tus datos aparecerán aquí.</p><div class="btns"><button class="btn pri" data-act="reload">Reintentar</button><button class="btn ghost" data-act="logout">Cambiar la conexión</button></div>';
  return '<div class="skel tall"></div><div class="skel"></div><div class="skel"></div><p class="note">Cargando inventario, ventas y pedidos desde Google Sheets…</p>';
}
function invTotales() {
  let valor = 0, enMano = 0, disp = 0, camino = 0, rep = 0, bajo = 0;
  for (const k in C.P) { const e = C.P[k]; valor += e.valor; enMano += Math.max(0, e.enMano); disp += Math.max(0, e.disp); camino += e.enCamino; rep += e.costoRep; if (!e.p.missing && (e.estado === 'STOCK BAJO' || e.estado === 'REVISAR')) bajo++; }
  return { valor, enMano, disp, camino, rep, bajo };
}
function spark(vals, hoyIdx) {
  const W = 300, H = 44, n = vals.length, bw = W / n, max = Math.max(1, ...vals);
  return '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' + vals.map((v, i) => {
    const h = i > hoyIdx ? 2 : Math.max(2, v / max * (H - 2));
    return '<rect x="' + (i * bw + bw * 0.18).toFixed(1) + '" y="' + (H - h).toFixed(1) + '" width="' + (bw * 0.64).toFixed(1) + '" height="' + h.toFixed(1) + '" rx="1.5" fill="' + (i === hoyIdx ? '#00DF60' : i > hoyIdx ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.34)') + '"/>';
  }).join('') + '</svg>';
}
function vInicio() {
  const hoy = today(), dt = new Date(), y = dt.getFullYear(), mi = dt.getMonth();
  const R = resumen(y), mr = rangeOfP('mes'), ma = periodStats([mr[0], hoy]), mb = periodStats(prevRange('mes')), hs = periodStats([hoy, hoy]);
  const cob = porCobrar(), totCob = cob.reduce((s, x) => s + x.total, 0), inv = invTotales();
  const apPend = S.apartados.filter(activo), apListosN = apPend.filter(a => !apListos(a).resto.length).length;
  const pedidos = new Set(S.encamino.filter(x => x.estado !== 'RECIBIDO').map(x => (x.pedido || 'Sin número') + '|' + x.fecha)).size;
  const dias = +mr[1].slice(8), porDia = new Array(dias).fill(0);
  for (const v of ma.vs) porDia[+v.fecha.slice(8) - 1] += vt(v).total;
  const nom = myName().split(' ')[0];
  let h = vh(nom ? 'Hola, ' + nom : 'Tu negocio hoy', DIAS[dt.getDay()] + ' ' + dt.getDate() + ' de ' + MESES[mi].toLowerCase());
  h += '<button class="hero" ' + A('pg', { p: 'stats' }) + '><div class="l">Ventas de ' + MESES[mi].toLowerCase() + '</div><div class="v">' + money(ma.ventas) + '</div>'
    + '<div class="s">' + delta(ma.ventas, mb.ventas) + '<span>vs. mes pasado</span><span><b>' + plural(ma.n, 'venta') + '</b></span><span>utilidad neta <b>' + money(ma.neta) + '</b></span></div>' + spark(porDia, +hoy.slice(8) - 1) + '</button>';
  h += '<div class="kpis">'
    + kpi('Caja de hoy', money(hs.cobrado), 'vendiste ' + money(hs.ventas), A('pg', { p: 'caja' }), 'cash')
    + kpi('Te deben', money(totCob), plural(cob.length, 'cliente'), A('tab', { k: 'cobrar' }), 'wallet')
    + kpi('Inventario', money(inv.valor), plural(inv.enMano, 'unidad', 'unidades') + ' al costo', A('tab', { k: 'inventario' }), 'spool')
    + kpi('En camino', inv.camino, plural(pedidos, 'pedido'), A('pg', { p: 'pedidos' }), 'truck') + '</div>';
  h += '<div class="qa"><button ' + A('sh', { s: 'ventaForm', m: 'venta' }) + '><span>' + ic('plus') + '</span>Venta</button><button ' + A('sh', { s: 'ventaForm', m: 'apartado' }) + '><span>' + ic('bookmark') + '</span>Apartado</button>'
    + '<button ' + A('sh', { s: 'cobroElegir' }) + '><span>' + ic('dollar') + '</span>Cobro</button><button ' + A('sh', { s: 'gastoForm' }) + '><span>' + ic('minus') + '</span>Gasto</button></div>';
  const c = cfg(), al = [];
  const todo = (tone, icon, html, a) => '<button ' + a + '><span class="ic p-' + tone + '">' + ic(icon) + '</span><span class="main">' + html + '</span>' + ic('chev').replace('class="i"', 'class="i go"') + '</button>';
  if (installEvt) al.push(todo('ok', 'download', '<b>Instalar StratoFil3D</b> en este teléfono', A('install')));
  if (!c.tasa) al.push(todo('warn', 'dollar', '<b>Pon la tasa del día</b> para ver precios y cobros en bolívares', A('sh', { s: 'tasa' })));
  else if (c.tasaFecha !== hoy) al.push(todo('warn', 'dollar', 'La tasa (<b>' + tasaFmt(c.tasa) + ' Bs/$</b>) es del ' + (c.tasaFecha ? fdate(c.tasaFecha) : 'otro día') + '. Actualízala', A('sh', { s: 'tasa' })));
  if (apListosN) al.push(todo('ok', 'bookmark', '<b>' + plural(apListosN, 'apartado') + '</b> ' + (apListosN === 1 ? 'listo' : 'listos') + ' para entregar', A('pg', { p: 'apartados' })));
  if (inv.bajo) al.push(todo('warn', 'alert', '<b>' + plural(inv.bajo, 'producto') + '</b> con stock bajo y nada en camino', A('goInv', { f: 'bajo' })));
  if (cob.length) al.push(todo('bad', 'wallet', '<b>' + money(totCob) + '</b> por cobrar · la deuda más vieja tiene ' + plural(Math.max(...cob.map(x => daysSince(x.oldest))), 'día'), A('tab', { k: 'cobrar' })));
  if (apPend.length - apListosN > 0) al.push(todo('info', 'clock', '<b>' + plural(apPend.length - apListosN, 'apartado') + '</b> esperando mercancía', A('pg', { p: 'apartados' })));
  if (pedidos) al.push(todo('mut', 'truck', '<b>' + plural(pedidos, 'pedido') + '</b> en camino · márcalos como recibidos al llegar', A('pg', { p: 'pedidos' })));
  h += sec('Pendientes') + (al.length ? '<div class="todo">' + al.join('') + '</div>' : '<div class="card muted small">Todo al día. ' + (c.tasa ? 'Tasa de hoy: ' + tasaFmt(c.tasa) + ' Bs/$.' : '') + '</div>');
  h += '<h2 class="sec"><span>Ventas y utilidad ' + y + '</span><button class="lk" ' + A('pg', { p: 'resumen' }) + '>Ver resumen</button></h2>' + chartMeses(R);
  const top = Object.values(C.P).filter(e => e.vendidas > 0).sort((a, b) => b.vendidas - a.vendidas).slice(0, 5);
  h += sec('Más vendidos');
  h += top.length ? list(top.map(e => row({ a: A('sh', { s: 'prod', c: e.p.codigo }), left: swatch(e.p), t: esc(title(e.p.color)), d: esc(e.p.tipo + ' · ' + title(e.p.presentacion)), big: e.vendidas, end: '<div class="d">vendidas</div>' })))
    : empty('receipt', 'Aún no hay ventas', 'Registra la primera con el botón “Venta”.');
  return h;
}
function ejes(top, sy, W, pl) {
  let g = '';
  for (let i = 0; i <= 2; i++) { const v = top * i / 2, yy = sy(v); g += '<line x1="' + pl + '" x2="' + (W - 6) + '" y1="' + yy + '" y2="' + yy + '" style="stroke:var(--line)" stroke-width="1"/><text x="' + (pl - 4) + '" y="' + (yy + 3) + '" text-anchor="end" font-size="9">' + (v >= 1000 ? r2(v / 1000) + 'k' : r2(v)) + '</text>'; }
  return g;
}
const techo = max => { const step = Math.pow(10, Math.floor(Math.log10(max))); let top = Math.ceil(max / step) * step; if (top < max) top += step; return top; };
function chartMeses(R) {
  const W = 340, H = 170, pl = 34, pb = 22, pt = 8, iw = W - pl - 6, ih = H - pb - pt;
  const top = techo(Math.max(10, ...R.m.map(x => Math.max(x.ventas, x.neta))));
  const sy = v => pt + ih - (Math.max(0, v) / top) * ih, bw = iw / 12, mi = new Date().getMonth();
  let g = ejes(top, sy, W, pl);
  R.m.forEach((x, i) => {
    const x0 = pl + i * bw + bw * 0.14, w = bw * 0.36;
    if (x.ventas > 0) g += '<rect x="' + x0 + '" y="' + sy(x.ventas) + '" width="' + w + '" height="' + (pt + ih - sy(x.ventas)) + '" rx="2" style="fill:var(--accent)"><title>' + MESES[i] + ' · ventas ' + money(x.ventas) + '</title></rect>';
    if (x.neta > 0) g += '<rect x="' + (x0 + w + 1) + '" y="' + sy(x.neta) + '" width="' + w + '" height="' + (pt + ih - sy(x.neta)) + '" rx="2" style="fill:var(--fg);opacity:.5"><title>' + MESES[i] + ' · utilidad ' + money(x.neta) + '</title></rect>';
    g += '<text x="' + (pl + i * bw + bw / 2) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="9.5"' + (i === mi && R.year === new Date().getFullYear() ? ' style="fill:var(--fg);font-weight:700"' : '') + '>' + MESES[i][0] + '</text>';
  });
  return '<div class="chart"><div class="legend"><span><i style="background:var(--accent)"></i>Ventas</span><span><i style="background:var(--fg);opacity:.5"></i>Utilidad neta</span></div><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Ventas y utilidad neta por mes">' + g + '</svg></div>';
}
function chartBars(labels, values, showEvery, nombres) {
  const W = 340, H = 160, pl = 34, pb = 22, pt = 10, iw = W - pl - 6, ih = H - pb - pt;
  const top = techo(Math.max(10, ...values)), sy = v => pt + ih - (Math.max(0, v) / top) * ih, bw = iw / labels.length;
  let g = ejes(top, sy, W, pl);
  values.forEach((v, i) => {
    const w = Math.max(2, bw * 0.62), x0 = pl + i * bw + (bw - w) / 2;
    if (v > 0) g += '<rect x="' + x0 + '" y="' + sy(v) + '" width="' + w + '" height="' + (pt + ih - sy(v)) + '" rx="2" style="fill:var(--accent)"><title>' + esc((nombres || labels)[i]) + ': ' + money(v) + '</title></rect>';
    if (i % (showEvery || 1) === 0) g += '<text x="' + (pl + i * bw + bw / 2) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="9.5">' + esc(labels[i]) + '</text>';
  });
  return '<div class="chart"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Ventas por período">' + g + '</svg></div>';
}

const INV_F = { todos: () => true, disp: e => e.disp > 0, bajo: e => e.estado === 'STOCK BAJO' || e.estado === 'REVISAR', camino: e => e.enCamino > 0, apartado: e => e.apartado > 0, agotado: e => e.disp <= 0 };
const busca = q => { const w = q.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/\s+/).filter(Boolean); return s => { s = String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); return w.every(x => s.includes(x)); }; };
function vInventario() {
  const all = Object.values(C.P), inv = invTotales();
  let h = vh('Inventario');
  h += '<div class="kpis c2" style="margin:0 0 12px">' + kpi('Disponibles', inv.disp, plural(all.length, 'producto'), '', 'spool') + kpi('Valor al costo', money(inv.valor), plural(inv.enMano, 'unidad', 'unidades') + ' en mano', '', 'dollar') + '</div>';
  h += searchBox('invQ', 'Buscar color, código o tipo');
  h += chips('invF', 'f', S.invFilter, [['todos', 'Todos', all.length], ['disp', 'Disponibles', all.filter(INV_F.disp).length], ['bajo', 'Stock bajo', all.filter(INV_F.bajo).length], ['camino', 'En camino', all.filter(INV_F.camino).length], ['apartado', 'Apartados', all.filter(INV_F.apartado).length], ['agotado', 'Agotados', all.filter(INV_F.agotado).length]]);
  h += '<div class="btns" style="margin-bottom:4px"><button class="btn sm" ' + A('sh', { s: 'prodForm' }) + '>' + ic('plus') + 'Producto</button><button class="btn sm ghost" ' + A('pg', { p: 'reposicion' }) + '>' + ic('cart') + 'Qué pedir</button></div>';
  return h + '<div id="dyn">' + invList() + '</div>';
}
function invList() {
  const all = Object.values(C.P), ok = busca(S.invQ);
  const ls = all.filter(INV_F[S.invFilter] || INV_F.todos).filter(e => ok(e.p.codigo + ' ' + e.p.color + ' ' + e.p.tipo + ' ' + e.p.presentacion));
  if (!ls.length) return empty('spool', all.length ? 'Nada coincide' : 'Sin productos todavía', all.length ? 'Prueba otro filtro o búsqueda.' : 'Agrega tu primer producto con “Producto”.');
  const groups = {}; for (const e of ls) (groups[e.p.tipo] = groups[e.p.tipo] || []).push(e);
  const order = cfg().tipos; let h = '';
  Object.keys(groups).sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99) || a.localeCompare(b)).forEach(t => {
    const g = groups[t].sort((a, b) => (a.p.presentacion || '').localeCompare(b.p.presentacion || '') || a.p.color.localeCompare(b.p.color));
    h += sec(esc(t), g.reduce((s, e) => s + Math.max(0, e.disp), 0) + ' disp.');
    h += list(g.map(e => { const est = estadoInv(e); return row({ a: A('sh', { s: 'prod', c: e.p.codigo }), left: swatch(e.p), t: esc(title(e.p.color)),
      d: '<span class="num">' + esc(e.p.codigo) + '</span> · ' + esc(title(e.p.presentacion) || '—') + ' · ' + money(e.precio) + (e.enCamino ? ' · <b>+' + e.enCamino + '</b> en camino' : '') + (e.apartado ? ' · ' + e.apartado + ' apart.' : ''),
      big: e.disp, tone: e.disp <= 0 ? 'bad' : '', end: est !== 'OK' ? pill(est) : '<div class="d">disp.</div>' }); }));
  });
  return h;
}

function ventaRow(v, conCliente) {
  const t = vt(v);
  return row({ a: A('sh', { s: 'venta', n: v.numero }), left: conCliente === false ? '' : avatar(v.cliente), t: conCliente === false ? 'N° ' + esc(v.numero) + ' · ' + fdate(v.fecha) : esc(v.cliente || 'Sin nombre'),
    d: conCliente === false ? plural(t.units, 'producto') : 'N° ' + esc(v.numero) + ' · ' + fcorta(v.fecha) + ' · ' + t.units + ' prod.' + (v.metodo ? ' · ' + esc(title(v.metodo)) : ''),
    big: money(t.total), end: t.estado === 'PAGADO' ? '' : pill(t.estado) });
}
function porMes(items, fechaDe, montoDe, rowDe) {
  const tot = {}; for (const x of items) { const k = (fechaDe(x) || '').slice(0, 7); tot[k] = (tot[k] || 0) + montoDe(x); }
  let mk = null, h = '';
  for (const x of items) { const k = (fechaDe(x) || '').slice(0, 7); if (k !== mk) { if (mk !== null) h += '</div>'; mk = k; h += sec(mesDe(k), money(tot[k])) + '<div class="list">'; } h += rowDe(x); }
  return h + (mk !== null ? '</div>' : '');
}
function vVentas() {
  const hoy = today(), mes = hoy.slice(0, 7);
  let h = vh('Ventas') + searchBox('ventasQ', 'Buscar cliente, número o producto');
  h += chips('ventasF', 'f', S.ventasF, [['todas', 'Todas', S.ventas.length], ['pend', 'Por cobrar', S.ventas.filter(v => vt(v).saldo > 0.005).length], ['hoy', 'Hoy', S.ventas.filter(v => v.fecha === hoy).length], ['mes', 'Este mes', S.ventas.filter(v => (v.fecha || '').startsWith(mes)).length]]);
  return h + '<div id="dyn">' + ventasList() + '</div>';
}
function ventasList() {
  const hoy = today(), mes = hoy.slice(0, 7), ok = busca(S.ventasQ);
  const F = { todas: () => true, pend: v => vt(v).saldo > 0.005, hoy: v => v.fecha === hoy, mes: v => (v.fecha || '').startsWith(mes) };
  const ls = S.ventas.filter(F[S.ventasF] || F.todas).filter(v => ok(v.cliente + ' ' + v.numero + ' ' + (v.items || []).map(i => i.codigo + ' ' + prodName(i.codigo)).join(' ')))
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '') || num(b.numero) - num(a.numero));
  if (!ls.length) return empty('receipt', S.ventas.length ? 'Nada coincide' : 'Aún no hay ventas', S.ventas.length ? 'Prueba otro filtro o búsqueda.' : 'Toca “Venta” para registrar la primera.');
  return porMes(ls, v => v.fecha, v => vt(v).total, v => ventaRow(v));
}

function vCobrar() {
  const cob = porCobrar(), tot = cob.reduce((s, x) => s + x.total, 0);
  const aps = S.apartados.filter(activo).map(a => ({ a, t: apTotals(a) })).filter(x => x.t.saldo > 0.005);
  const viejo = cob.length ? Math.max(...cob.map(x => daysSince(x.oldest))) : 0;
  let h = vh('Por cobrar');
  h += '<div class="hero"><div class="l">Total que te deben</div><div class="v' + (tot > 0.005 ? '' : ' g') + '">' + money(tot) + '</div><div class="s">' + (cob.length ? '<span><b>' + plural(cob.length, 'cliente') + '</b></span><span>la deuda más vieja tiene <b>' + plural(viejo, 'día') + '</b></span>' + (cfg().tasa ? '<span>' + enBs(tot) + '</span>' : '') : '<span>Nadie te debe. Todo cobrado.</span>') + '</div></div>';
  h += '<div class="btns full" style="margin-top:10px"><button class="btn" ' + A('pg', { p: 'pagos' }) + '>' + ic('check') + 'Pagos recibidos</button><button class="btn" ' + A('pg', { p: 'caja' }) + '>' + ic('cash') + 'Caja y cierre</button></div>';
  h += sec('Por cliente');
  if (!cob.length) h += empty('wallet', 'Nadie te debe', 'Las ventas con saldo pendiente aparecen aquí.');
  else h += '<div class="list">' + cob.map(x => {
    const d = daysSince(x.oldest), cl = clienteDe(x.cliente);
    return '<div class="cardrow"><button class="hd" ' + A('sh', { s: 'ecuenta', cl: x.cliente }) + '>' + avatar(x.cliente) + '<div class="main" style="flex:1;min-width:0"><div class="t" style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(x.cliente) + '</div><div class="small muted">' + plural(x.ventas.length, 'venta') + ' · <b class="' + (d > 15 ? 'bad' : d > 7 ? 'warn' : '') + '">' + plural(d, 'día') + '</b>' + (cl && cl.telefono ? '' : ' · sin teléfono') + '</div></div><div class="num" style="font-size:19px;font-weight:700">' + money(x.total) + '</div></button>'
      + '<div class="btns full"><button class="btn sm pri" ' + A('sh', { s: 'pagoCli', cl: x.cliente }) + '>' + ic('dollar') + 'Registrar pago</button><a class="btn sm" target="_blank" rel="noopener" href="' + esc(waLink(cl && cl.telefono, msgCobro(x))) + '">' + ic('chat') + 'WhatsApp</a><button class="btn sm ghost ico" ' + A('copyCobro', { cl: x.cliente }) + ' aria-label="Copiar mensaje de cobro" title="Copiar mensaje de cobro">' + ic('copy') + '</button></div></div>';
  }).join('') + '</div>';
  if (cob.length) h += sec('Ventas con saldo') + list(cob.flatMap(x => x.ventas).sort((a, b) => (a.v.fecha || '').localeCompare(b.v.fecha || '')).map(({ v, t }) => row({ a: A('sh', { s: 'venta', n: v.numero }), t: esc(v.cliente) + ' · N° ' + esc(v.numero), d: fcorta(v.fecha) + ' · total ' + money(t.total) + ' · pagó ' + money(t.pagado), big: money(t.saldo), end: pill(t.estado) })));
  if (aps.length) h += sec('Apartados con saldo', money(aps.reduce((s, x) => s + x.t.saldo, 0))) + list(aps.map(({ a, t }) => row({ a: A('sh', { s: 'apartado', n: a.numero }), left: icBox('bookmark', 'o'), t: esc(a.cliente) + ' · ' + esc(a.numero), d: fcorta(a.fecha) + ' · abonó ' + money(t.pagado) + ' de ' + money(t.total), big: money(t.saldo) })));
  return h;
}

const MAS = [
  ['Dinero', [['caja', 'cash', 'Caja y cierre', 'Lo que entró por cada método de pago'], ['pagos', 'check', 'Pagos recibidos', 'Quién te pagó, cuándo y cómo'], ['gastos', 'minus', 'Gastos', 'Delivery, empaques, publicidad…'], ['stats', 'trend', 'Estadísticas', 'Compara períodos, productos y clientes'], ['resumen', 'chart', 'Resumen anual', 'Ventas, utilidad y gastos por mes']]],
  ['Mercancía', [['apartados', 'bookmark', 'Apartados', 'Productos reservados por clientes'], ['pedidos', 'truck', 'Pedidos en camino', 'Lo que viene del proveedor'], ['compras', 'box', 'Compras', 'Mercancía recibida y su costo'], ['reposicion', 'cart', 'Qué pedir', 'Reposición sugerida según ventas'], ['catalogo', 'tag', 'Catálogo', 'Texto e imagen para WhatsApp']]],
  ['Clientes y ajustes', [['clientes', 'users', 'Clientes', 'Directorio, historial y estados de cuenta'], ['ajustes', 'sliders', 'Ajustes', 'Tu nombre, costos, listas, respaldo']]]
];
function vMas() {
  const c = cfg();
  let h = vh('Más');
  for (const [t, items] of MAS) {
    h += sec(t) + '<div class="tiles">' + items.map(([k, i, n, d]) => '<button class="tile" ' + A('pg', { p: k }) + '><span class="ic">' + ic(i) + '</span><span><span class="t">' + n + '</span><div class="d">' + d + '</div></span></button>').join('');
    if (t === 'Clientes y ajustes') h += '<button class="tile" ' + A('sh', { s: 'tasa' }) + '><span class="ic">' + ic('dollar') + '</span><span><span class="t">Tasa del día</span><div class="d">' + (c.tasa ? tasaFmt(c.tasa) + ' Bs/$' + (c.tasaFecha ? ' · del ' + fdate(c.tasaFecha) : '') : 'Sin definir') + '</div></span></button>'
      + '<a class="tile" href="' + SHEET_URL + '" target="_blank" rel="noopener"><span class="ic">' + ic('table') + '</span><span><span class="t">Abrir la hoja</span><div class="d">Tu Google Sheet con todos los datos</div></span></a>';
    h += '</div>';
  }
  return h + '<div class="foot"><b>' + LEMA + '</b><div class="muted small">' + esc(c.negocio.nombre) + (c.negocio.ciudad ? ' · ' + esc(c.negocio.ciudad) : '') + '</div></div>';
}
const VIEWS = { inicio: vInicio, inventario: vInventario, ventas: vVentas, cobrar: vCobrar, mas: vMas };
const DYN = { invQ: invList, ventasQ: ventasList, cliQ: () => cliList() };

/* ============ páginas ============ */
const pagoRowHtml = (p, conCliente) => {
  const d = p.tipo === 'VENTA' ? ventaN(p.numero) : apartadoN(p.numero);
  return row({ a: d ? A('sh', { s: p.tipo === 'VENTA' ? 'venta' : 'apartado', n: p.numero }) : '', left: conCliente === false ? '' : icBox('check', 'g'), t: conCliente === false ? money(p.monto) : esc(p.cliente || 'Sin nombre'),
    d: fcorta(p.fecha) + ' · ' + (p.tipo === 'VENTA' ? 'venta N° ' : 'apartado ') + esc(p.numero) + (p.metodo ? ' · ' + esc(title(p.metodo)) : '') + (p.vendedor ? ' · ' + esc(p.vendedor) : ''),
    big: conCliente === false ? undefined : money(p.monto), tone: 'ok', end: p.tasa ? '<div class="d">' + bsFmt(p.monto * p.tasa) + '</div>' : '' });
};
const gastoRowHtml = g => row({ a: A('sh', { s: 'gastoForm', id: g.id }), left: icBox('minus', 'r'), t: esc(g.descripcion || title(g.categoria) || 'Gasto'), d: fcorta(g.fecha) + (g.categoria ? ' · ' + esc(title(g.categoria)) : '') + (g.metodo ? ' · ' + esc(title(g.metodo)) : ''), big: money(num(g.monto)) });
const cajaRange = () => S.cajaP === 'dia' && S.cajaDia ? [S.cajaDia, S.cajaDia] : rangeOfP(S.cajaP);
function pagosFiltro() {
  const t = today(), [y, m] = t.split('-').map(Number);
  let r = null;
  if (S.pgP === 'semana') r = rangeOfP('semana');
  else if (S.pgP === 'mes') r = rangeOfP('mes');
  else if (S.pgP === 'mesant') r = rangeOfP('mes', (m === 1 ? (y - 1) + '-12' : y + '-' + pad(m - 1)) + '-01');
  return S.pagos.filter(p => (!r || inR(p.fecha, r)) && (!S.pgCli || sameName(p.cliente, S.pgCli)) && (!S.pgMet || (p.metodo || 'SIN MÉTODO') === S.pgMet))
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.row - a.row);
}
const PG_LBL = { semana: 'Esta semana', mes: 'Este mes', mesant: 'Mes pasado', todo: 'Todo' };
function pagosTexto(ls) {
  const tot = ls.reduce((s, p) => s + p.monto, 0);
  return '*Pagos recibidos · ' + cfg().negocio.nombre + '*\n' + PG_LBL[S.pgP] + (S.pgCli ? ' · ' + S.pgCli : '') + (S.pgMet ? ' · ' + title(S.pgMet) : '') + '\n\n'
    + ls.map(p => fdate(p.fecha) + ' · ' + p.cliente + ' · ' + (p.tipo === 'VENTA' ? 'venta N° ' : 'apartado ') + p.numero + (p.metodo ? ' · ' + title(p.metodo) : '') + ': ' + money(p.monto)).join('\n')
    + '\n\n*Total: ' + money(tot) + '* (' + plural(ls.length, 'pago') + ')';
}
function cliList() {
  const ok = busca(S.cliQ), stats = clientesStats().filter(s => ok(s.c.nombre + ' ' + s.c.telefono + ' ' + s.c.cedula));
  if (!stats.length) return empty('users', S.clientes.length ? 'Nada coincide' : 'Sin clientes', S.clientes.length ? 'Prueba otra búsqueda.' : 'Se crean solos al registrar una venta, o agrégalos aquí.');
  return list(stats.map(s => row({ a: A('sh', { s: 'cliente', id: s.c.id }), left: avatar(s.c.nombre), t: esc(s.c.nombre), d: plural(s.n, 'compra') + ' · ' + money(s.total) + (s.ultima ? ' · última ' + fcorta(s.ultima) : '') + (s.c.telefono ? '' : ' · sin teléfono'),
    big: s.saldo > 0.005 ? money(s.saldo) : undefined, tone: 'bad', end: s.saldo > 0.005 ? '<div class="d">debe</div>' : '<div class="d">al día</div>' })));
}
function vPedidos(kind) {
  const recibido = kind === 'compras', rows = recibido ? S.compras : S.encamino, groups = {};
  for (const x of rows) { const k = (x.pedido || 'Sin número') + '|' + x.fecha; (groups[k] = groups[k] || { pedido: x.pedido || 'Sin número', fecha: x.fecha, proveedor: x.proveedor, lines: [] }).lines.push(x); }
  const ls = Object.values(groups).map(g => Object.assign(g, { pend: !recibido && g.lines.some(x => x.estado !== 'RECIBIDO') }))
    .sort((a, b) => (b.pend ? 1 : 0) - (a.pend ? 1 : 0) || (b.fecha || '').localeCompare(a.fecha || ''));
  let h = vh(recibido ? 'Compras' : 'Pedidos en camino', '', true);
  h += '<div class="btns" style="margin-bottom:10px"><button class="btn pri sm" ' + A('sh', { s: 'pedidoForm', k: kind }) + '>' + ic('plus') + (recibido ? 'Compra recibida' : 'Pedido') + '</button></div>';
  if (!recibido) h += '<p class="note" style="margin-top:0">Al llegar un pedido, ábrelo y toca “Marcar como recibido”: pasa solo a Compras y suma al inventario.</p>';
  if (!ls.length) return h + empty(recibido ? 'box' : 'truck', recibido ? 'Sin compras' : 'Nada en camino', recibido ? 'Las compras recibidas forman tu inventario y su costo.' : 'Registra aquí lo que pidas a tu proveedor.');
  return h + list(ls.map(g => {
    const units = g.lines.reduce((s, x) => s + num(x.cantidad), 0), total = g.lines.reduce((s, x) => s + (recibido ? compraLine(x).total : num(x.subtotal) * (1 + cfg().tax)), 0);
    return row({ a: A('sh', { s: 'pedido', k: kind, p: g.pedido, f: g.fecha }), left: icBox(recibido ? 'box' : 'truck', recibido ? '' : g.pend ? 'o' : 'g'), t: '<span class="num">' + esc(g.pedido) + '</span>', d: fcorta(g.fecha) + (g.proveedor ? ' · ' + esc(title(g.proveedor)) : '') + ' · ' + plural(units, 'unidad', 'unidades'), big: money(total), end: recibido ? '' : pill(g.pend ? 'EN CAMINO' : 'RECIBIDO') });
  }));
}
const PAGES = {
  apartados() {
    const ls = S.apartados.slice().sort((a, b) => (activo(a) ? 0 : 1) - (activo(b) ? 0 : 1) || (b.fecha || '').localeCompare(a.fecha || ''));
    let h = vh('Apartados', '', true) + '<div class="btns" style="margin-bottom:10px"><button class="btn pri sm" ' + A('sh', { s: 'ventaForm', m: 'apartado' }) + '>' + ic('plus') + 'Apartado</button></div>';
    if (!ls.length) return h + empty('bookmark', 'Sin apartados', 'Cuando un cliente reserve productos, regístralo aquí.');
    return h + list(ls.map(a => { const t = apTotals(a), est = a.estado || 'APARTADO', ok = activo(a) && !apListos(a).resto.length;
      return row({ a: A('sh', { s: 'apartado', n: a.numero }), left: avatar(a.cliente), t: esc(a.cliente) + ' · ' + esc(a.numero), d: fcorta(a.fecha) + ' · ' + t.units + ' prod.' + (activo(a) ? (ok ? ' · <b class="ok">listo para entregar</b>' : ' · esperando mercancía') : ''), big: money(t.total), end: pill(est) }); }));
  },
  pedidos: () => vPedidos('encamino'),
  compras: () => vPedidos('compras'),
  gastos() {
    const ls = S.gastos.slice().sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '') || b.row - a.row);
    let h = vh('Gastos', '', true) + '<div class="btns" style="margin-bottom:10px"><button class="btn pri sm" ' + A('sh', { s: 'gastoForm' }) + '>' + ic('plus') + 'Gasto</button></div>';
    if (!ls.length) return h + empty('minus', 'Sin gastos', 'Registra delivery, empaques o publicidad para ver tu utilidad real.');
    return h + porMes(ls, g => g.fecha, g => num(g.monto), gastoRowHtml);
  },
  clientes() {
    return vh('Clientes', '', true) + searchBox('cliQ', 'Buscar nombre, teléfono o cédula') + '<div class="btns" style="margin-bottom:10px"><button class="btn pri sm" ' + A('sh', { s: 'clienteForm' }) + '>' + ic('plus') + 'Cliente</button></div><div id="dyn">' + cliList() + '</div>';
  },
  reposicion() {
    const ORD = ['URGENTE', 'PEDIR', 'VIGILAR', 'EN CAMINO', 'OK'], c = cfg();
    const rows = Object.values(C.P).filter(e => !e.p.missing).sort((a, b) => ORD.indexOf(a.prioridad) - ORD.indexOf(b.prioridad) || b.vendidas - a.vendidas);
    const tot = rows.reduce((s, e) => s + e.costoRep, 0), units = rows.reduce((s, e) => s + e.sugerido, 0);
    let h = vh('Qué pedir', '', true);
    h += '<div class="kpis c2" style="margin-top:0">' + kpi('Unidades sugeridas', units) + kpi('Costo estimado', money(tot)) + '</div>';
    h += '<p class="note">Se calcula con las ventas de los últimos 90 días, para cubrir ' + plural(c.mesesCobertura, 'mes', 'meses') + ' más el stock mínimo de ' + c.stockMin + ', restando lo disponible y lo que viene en camino.</p>';
    if (!rows.length) return h + empty('cart', 'Sin productos', 'Agrega productos en Inventario.');
    h += list(rows.map(e => row({ a: A('sh', { s: 'prod', c: e.p.codigo }), left: swatch(e.p), t: esc(title(e.p.color)) + ' <span class="muted small">' + esc(title(e.p.presentacion)) + '</span>', d: 'Disp. ' + e.disp + ' · ' + e.prom.toFixed(1) + '/mes · ' + (e.prom ? Math.max(0, e.disp / e.prom).toFixed(1) + ' meses de stock' : 'sin ventas recientes'), big: e.sugerido || undefined, end: pill(e.prioridad) })));
    if (units) h += '<div class="btns full" style="margin-top:12px"><button class="btn" data-act="copyRepo">' + ic('copy') + 'Copiar lista de pedido</button></div>';
    return h;
  },
  resumen() {
    const R = resumen(S.year), inv = invTotales();
    const years = new Set([new Date().getFullYear()]);
    for (const k of ['ventas', 'compras', 'gastos']) for (const v of S[k]) if (v.fecha) years.add(+v.fecha.slice(0, 4));
    let h = vh('Resumen anual', '', true);
    h += chips('year', 'y', String(S.year), [...years].sort().map(y => [String(y), String(y)]));
    h += '<div class="hero"><div class="l">Utilidad neta ' + S.year + '</div><div class="v">' + money(R.T.neta) + '</div><div class="s"><span>sobre ventas de <b>' + money(R.T.ventas) + '</b></span><span>margen neto <b>' + pct(R.T.margen) + '</b></span></div></div>';
    h += '<div class="kpis">' + kpi('Gastos', money(R.T.gastos)) + kpi('Compras de inventario', money(R.T.compras)) + kpi('Valor inventario', money(inv.valor), plural(inv.enMano, 'unidad', 'unidades')) + kpi('Reposición sugerida', money(inv.rep), inv.camino + ' en camino') + '</div>';
    h += sec('Por mes') + chartMeses(R);
    const tr = (n, x, cls) => '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + n + '</td><td>' + money(x.ventas) + '</td><td>' + x.units + '</td><td>' + money(x.costo) + '</td><td>' + money(x.com) + '</td><td>' + money(x.bruta) + '</td><td>' + money(x.gastos) + '</td><td>' + money(x.neta) + '</td><td>' + pct(x.margen) + '</td><td>' + money(x.compras) + '</td></tr>';
    h += '<div class="tbl-wrap" style="margin-top:10px"><table><thead><tr><th>Mes</th><th>Ventas</th><th>Unid.</th><th>Costo</th><th>Comis.</th><th>Ut. bruta</th><th>Gastos</th><th>Ut. neta</th><th>Margen</th><th>Compras</th></tr></thead><tbody>'
      + R.m.map((x, i) => tr(MESES[i], x)).join('') + tr('Total', R.T, 'tot') + '</tbody></table></div>';
    return h;
  },
  catalogo() {
    const groups = catGroups(), c = cfg();
    let h = vh('Catálogo', '', true) + '<p class="note" style="margin-top:-6px">Muestra lo que tienes libre para vender. Compártelo como texto o como imagen por WhatsApp e Instagram.</p>';
    h += '<div class="chips"><button class="chip" ' + A('catCam', { v: 0 }) + ' aria-pressed="' + (!S.catEnCamino) + '">Solo en existencia</button><button class="chip" ' + A('catCam', { v: 1 }) + ' aria-pressed="' + S.catEnCamino + '">Incluir lo que llega pronto</button>' + (c.tasa ? '<button class="chip" data-act="catBs" aria-pressed="' + S.catBs + '">Precios también en Bs</button>' : '') + '</div>';
    if (!groups.length) return h + empty('tag', 'Nada disponible', 'Cuando tengas stock libre aparecerá aquí.');
    h += '<div class="btns full"><button class="btn pri" ' + A('sh', { s: 'catImg' }) + '>' + ic('image') + 'Imagen</button><button class="btn" data-act="catCopy">' + ic('copy') + 'Copiar texto</button><a class="btn" target="_blank" rel="noopener" href="' + esc(waLink('', catText())) + '">' + ic('chat') + 'WhatsApp</a></div>';
    for (const g of groups) h += '<div class="cat-h"><span>' + esc(g.tipo) + ' · ' + esc(title(g.pres)) + '</span><span class="pr">' + money(g.precio) + (S.catBs && c.tasa ? ' · ' + enBs(g.precio) : '') + '</span></div><div class="cat-grid">' + g.items.map(e => '<div class="cat-it">' + swatch(e.p) + '<div style="min-width:0"><div class="n">' + esc(title(e.p.color)) + '</div><div class="s">' + (e.disp > 0 ? 'Disponible' : 'Llega pronto') + '</div></div></div>').join('') + '</div>';
    return h;
  },
  caja() {
    const r = cajaRange(), st = periodStats(r), ms = cajaMetodos(st), c = cfg();
    let h = vh('Caja y cierre', '', true);
    h += '<div class="chips">' + [['hoy', 'Hoy'], ['ayer', 'Ayer'], ['semana', 'Esta semana'], ['mes', 'Este mes']].map(([k, l]) => '<button class="chip" ' + A('cajaP', { p: k }) + ' aria-pressed="' + (S.cajaP === k) + '">' + l + '</button>').join('')
      + '<label class="chip" for="cajaDia"' + (S.cajaP === 'dia' ? ' style="border-color:var(--fg)"' : '') + '>' + ic('calendar') + '<input id="cajaDia" type="date" aria-label="Otro día" max="' + today() + '" value="' + esc(S.cajaP === 'dia' ? S.cajaDia : '') + '"></label></div>';
    h += '<div class="hero"><div class="l">Entró a caja · ' + rangeTxt(r) + '</div><div class="v">' + money(st.cobrado) + '</div><div class="s"><span><b>' + plural(st.ps.length, 'pago') + '</b></span>' + (c.tasa ? '<span>' + enBs(st.cobrado) + ' a la tasa de hoy</span>' : '') + '</div></div>';
    h += '<div class="kpis">' + kpi('Vendido', money(st.ventas), plural(st.n, 'venta')) + kpi('Gastos', money(st.gastos), plural(st.gs.length, 'registro')) + kpi('Neto en caja', money(st.cobrado - st.gastos), 'entró menos gastos') + kpi('Fiado', money(st.saldo), 'de estas ventas') + '</div>';
    h += sec('Por método de pago');
    h += ms.length ? '<div class="tbl-wrap"><table><thead><tr><th>Método</th><th>Entró</th><th>Gastos</th><th>Neto</th></tr></thead><tbody>' + ms.map(x => '<tr><td>' + esc(title(x.m)) + (x.bs ? '<div class="muted small" style="font-weight:500">' + bsFmt(x.bs) + '</div>' : '') + '</td><td>' + money(x.in) + '</td><td>' + money(x.out) + '</td><td><b>' + money(x.in - x.out) + '</b></td></tr>').join('') + '<tr class="tot"><td>Total</td><td>' + money(st.cobrado) + '</td><td>' + money(st.gastos) + '</td><td>' + money(st.cobrado - st.gastos) + '</td></tr></tbody></table></div>'
      : empty('cash', 'Sin movimientos', 'Los pagos y gastos de este período aparecerán aquí.');
    h += '<div class="btns full" style="margin-top:12px"><button class="btn pri" data-act="copyCierre">' + ic('copy') + 'Copiar cierre</button><a class="btn" target="_blank" rel="noopener" href="' + esc(waLink('', cierreTexto(r))) + '">' + ic('chat') + 'Enviar por WhatsApp</a></div>';
    if (st.ps.length) h += sec('Pagos recibidos') + list(st.ps.slice().sort((a, b) => b.fecha.localeCompare(a.fecha) || b.row - a.row).map(p => pagoRowHtml(p)));
    if (st.vs.length) h += sec('Ventas del período') + list(st.vs.slice().sort((a, b) => b.fecha.localeCompare(a.fecha) || num(b.numero) - num(a.numero)).map(v => ventaRow(v)));
    if (st.gs.length) h += sec('Gastos del período') + list(st.gs.map(gastoRowHtml));
    return h + '<p class="note" style="margin-top:14px">La caja cuenta los pagos registrados en la pestaña Pagos de tu hoja. Los cobros anteriores a que existiera esa pestaña solo aparecen si se registraron ahí.</p>';
  },
  pagos() {
    const ls = pagosFiltro(), tot = ls.reduce((s, p) => s + p.monto, 0);
    const clientes = [...new Set(S.pagos.map(p => p.cliente).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const metodos = [...new Set(S.pagos.map(p => p.metodo || 'SIN MÉTODO'))].sort();
    let h = vh('Pagos recibidos', '', true);
    h += chips('pgP', 'p', S.pgP, Object.entries(PG_LBL));
    h += '<form class="fg2" style="margin-bottom:12px" onsubmit="return false"><select id="pg_cli" aria-label="Cliente"><option value="">Todos los clientes</option>' + clientes.map(c => '<option' + (sameName(c, S.pgCli) ? ' selected' : '') + '>' + esc(c) + '</option>').join('') + '</select>'
      + '<select id="pg_met" aria-label="Método de pago"><option value="">Todos los métodos</option>' + metodos.map(m => '<option value="' + esc(m) + '"' + (m === S.pgMet ? ' selected' : '') + '>' + esc(title(m)) + '</option>').join('') + '</select></form>';
    h += '<div class="hero"><div class="l">Recibido · ' + esc(PG_LBL[S.pgP]) + (S.pgCli ? ' · ' + esc(S.pgCli) : '') + '</div><div class="v">' + money(tot) + '</div><div class="s"><span><b>' + plural(ls.length, 'pago') + '</b></span>' + (ls.length ? '<span>promedio ' + money(tot / ls.length) + '</span>' : '') + '</div></div>';
    const byM = {}; for (const p of ls) { const k = p.metodo || 'SIN MÉTODO'; byM[k] = (byM[k] || 0) + p.monto; }
    const ms = Object.entries(byM).sort((a, b) => b[1] - a[1]);
    if (ms.length > 1) h += sec('Por método') + barras(ms.map(([m, v]) => [title(m), v]), tot);
    if (S.pgCli) h += '<div class="btns" style="margin-top:12px"><button class="btn sm" ' + A('sh', { s: 'ecuenta', cl: S.pgCli }) + '>' + ic('file') + 'Estado de cuenta de ' + esc(S.pgCli) + '</button></div>';
    if (!ls.length) h += '<div style="margin-top:12px">' + empty('check', 'Sin pagos en este filtro', 'Prueba otro período o quita el filtro de cliente.') + '</div>';
    else h += porMes(ls, p => p.fecha, p => p.monto, p => pagoRowHtml(p)) + '<div class="btns full" style="margin-top:12px"><button class="btn" data-act="copyPagos">' + ic('copy') + 'Copiar lista</button></div>';
    if (S.pgP === 'todo' && !S.pgMet) {
      let sin = 0;
      for (const v of S.ventas) { if (S.pgCli && !sameName(v.cliente, S.pgCli)) continue; const rest = r2(vt(v).pagado - ventaPagos(v).reduce((a, p) => a + p.monto, 0)); if (rest > 0.005) sin += rest; }
      if (sin > 0.005) h += '<p class="note" style="margin-top:12px">Además hay ' + money(sin) + ' en pagos registrados antes de que existiera la pestaña Pagos, sin fecha ni método. Sí cuentan en el estado de cuenta de cada cliente.</p>';
    }
    return h;
  },
  stats() {
    const k = S.statP, full = rangeOfP(k), r = [full[0], today()], pr = prevRange(k), a = periodStats(r), b = periodStats(pr);
    let h = vh('Estadísticas', '', true);
    h += chips('statP', 'p', k, [['semana', 'Semana'], ['mes', 'Mes'], ['anio', 'Año']]);
    h += '<p class="note" style="margin-top:0">Del ' + rangeTxt(r) + ', comparado con el mismo tramo del período anterior (' + rangeTxt(pr) + ').</p>';
    const card = (l, cur, prev, f, inv) => kpi(l, f(cur), delta(cur, prev, inv) + ' · antes ' + f(prev)), n0 = x => String(Math.round(x));
    h += '<div class="kpis" style="margin-top:0">' + card('Ventas', a.ventas, b.ventas, money) + card('N° de ventas', a.n, b.n, n0) + card('Ticket promedio', a.ticket, b.ticket, money) + card('Unidades', a.units, b.units, n0)
      + card('Utilidad bruta', a.bruta, b.bruta, money) + card('Gastos', a.gastos, b.gastos, money, true) + card('Utilidad neta', a.neta, b.neta, money) + card('Cobrado', a.cobrado, b.cobrado, money) + '</div>';
    let labels = [], vals = [], every = 1, nombres = null;
    if (k === 'anio') { labels = MESES.map(m => m[0]); nombres = MESES; vals = new Array(12).fill(0); for (const v of a.vs) vals[+v.fecha.slice(5, 7) - 1] += vt(v).total; }
    else {
      const days = Math.round((Date.parse(full[1]) - Date.parse(full[0])) / 864e5) + 1; nombres = [];
      for (let i = 0; i < days; i++) { const d = addDays(full[0], i); labels.push(k === 'semana' ? ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'][i] : String(+d.slice(8))); nombres.push(fdate(d)); vals.push(a.vs.filter(v => v.fecha === d).reduce((s, v) => s + vt(v).total, 0)); }
      every = k === 'mes' ? 5 : 1;
    }
    h += sec('Ventas por ' + (k === 'anio' ? 'mes' : 'día')) + chartBars(labels, vals, every, nombres);
    const byV = {}; for (const v of a.vs) { const n = v.vendedor || 'Sin asignar', t = vt(v); (byV[n] = byV[n] || { n: 0, total: 0, util: 0 }); byV[n].n++; byV[n].total += t.total; byV[n].util += t.util; }
    const vend = Object.entries(byV).sort((x, y) => y[1].total - x[1].total), nada = '<div class="card muted small">Sin ventas en este período.</div>';
    h += sec('Por vendedor') + (vend.length ? '<div class="tbl-wrap"><table><thead><tr><th>Vendedor</th><th>Ventas</th><th>Monto</th><th>Utilidad</th></tr></thead><tbody>' + vend.map(([n, x]) => '<tr><td>' + esc(n) + '</td><td>' + x.n + '</td><td>' + money(x.total) + '</td><td>' + money(x.util) + '</td></tr>').join('') + '</tbody></table></div>' : nada);
    const byP = {}, byT = {}, byC = {};
    for (const v of a.vs) {
      for (const it of v.items) { const p = prod(it.codigo) || { tipo: '?' }, m = lineaTotal(it); (byP[it.codigo] = byP[it.codigo] || { q: 0, m: 0 }); byP[it.codigo].q += num(it.cantidad); byP[it.codigo].m += m; byT[p.tipo] = (byT[p.tipo] || 0) + m; }
      byC[v.cliente] = (byC[v.cliente] || 0) + vt(v).total;
    }
    const topP = Object.entries(byP).sort((x, y) => y[1].q - x[1].q || y[1].m - x[1].m).slice(0, 8);
    h += sec('Productos más vendidos') + (topP.length ? list(topP.map(([c, x]) => { const p = prod(c) || { codigo: c, color: c, tipo: '', presentacion: '' }; return row({ a: A('sh', { s: 'prod', c }), left: swatch(p), t: esc(title(p.color)), d: esc([p.tipo, title(p.presentacion)].filter(Boolean).join(' · ')) + ' · ' + money(x.m), big: x.q, end: '<div class="d">unid.</div>' }); })) : nada);
    const totT = Object.values(byT).reduce((s, x) => s + x, 0);
    if (totT > 0) h += sec('Por material') + barras(Object.entries(byT).sort((x, y) => y[1] - x[1]), totT);
    const topC = Object.entries(byC).sort((x, y) => y[1] - x[1]).slice(0, 5);
    if (topC.length) h += sec('Mejores clientes') + list(topC.map(([n, m]) => { const c = clienteDe(n); return row({ a: c ? A('sh', { s: 'cliente', id: c.id }) : '', left: avatar(n), t: esc(n || 'Sin nombre'), big: money(m) }); }));
    const lastSale = {}; for (const v of S.ventas) for (const it of v.items) if (!lastSale[it.codigo] || v.fecha > lastSale[it.codigo]) lastSale[it.codigo] = v.fecha;
    const lastBuy = {}; for (const x of S.compras) if (!lastBuy[x.codigo] || x.fecha > lastBuy[x.codigo]) lastBuy[x.codigo] = x.fecha;
    const quietos = Object.values(C.P).filter(e => e.disp > 0 && !e.p.missing).map(e => { const ref = lastSale[e.p.codigo] || lastBuy[e.p.codigo]; return { e, dias: ref ? daysSince(ref) : 0, nunca: !lastSale[e.p.codigo] }; }).filter(x => x.dias >= 30).sort((x, y) => y.dias - x.dias);
    h += sec('Sin movimiento (30 días o más)', money(quietos.reduce((s, x) => s + x.e.valor, 0)) + ' parados')
      + (quietos.length ? list(quietos.map(x => row({ a: A('sh', { s: 'prod', c: x.e.p.codigo }), left: swatch(x.e.p), t: esc(title(x.e.p.color)) + ' <span class="muted small">' + esc(title(x.e.p.presentacion)) + '</span>', d: x.e.disp + ' disp. · ' + x.dias + ' días ' + (x.nunca ? 'sin vender' : 'desde la última venta'), big: money(x.e.valor) }))) : '<div class="card muted small">Todo tu inventario se ha movido en el último mes.</div>');
    return h;
  },
  ajustes() {
    const c = cfg(), tema = lsGet('sf_tema') || 'auto';
    const inp = (id, name, label, val, extra) => '<div class="f"><label for="' + id + '">' + label + '</label><input id="' + id + '" name="' + name + '" value="' + esc(val) + '"' + (extra || '') + '></div>';
    const area = (id, name, label, val) => '<div class="f"><label for="' + id + '">' + label + '</label><textarea id="' + id + '" name="' + name + '" autocapitalize="characters" spellcheck="false">' + esc(val) + '</textarea></div>';
    return vh('Ajustes', '', true)
      + '<div class="card fg" style="margin-bottom:12px"><b>Apariencia</b><div class="seg">' + [['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Oscuro']].map(([k, l]) => '<button type="button" ' + A('tema', { v: k }) + ' aria-pressed="' + (tema === k) + '">' + l + '</button>').join('') + '</div></div>'
      + '<form class="fg" data-form="ajustes" id="FA" novalidate>'
      + '<div class="card fg"><b>Este dispositivo</b>' + inp('aj_yo', 'minombre', 'Tu nombre', myName(), ' placeholder="Ej. Ismael" autocomplete="off"') + '<p class="hint">Se guarda en cada venta y pago que registres, para ver cuánto vende cada quien.</p></div>'
      + '<div class="card fg"><b>Tu negocio</b><div class="fg2">' + inp('aj_nom', 'nombre', 'Nombre', c.negocio.nombre) + inp('aj_wa', 'whatsapp', 'WhatsApp del negocio', c.negocio.whatsapp, ' inputmode="tel" placeholder="0414…"') + inp('aj_ig', 'instagram', 'Instagram', c.negocio.instagram, ' placeholder="@stratofil3d" autocapitalize="off"') + inp('aj_ci', 'ciudad', 'Ciudad', c.negocio.ciudad) + '</div><p class="hint">Salen en los recibos y en el catálogo.</p></div>'
      + '<div class="card fg"><b>Costos y alertas</b><p class="hint">Estos valores y las listas se guardan en la hoja Parámetros.</p><div class="fg2">' + inp('aj_tax', 'tax', 'Impuesto (TAX) %', r2(c.tax * 100), ' inputmode="decimal"') + inp('aj_tp', 'tarifaPie', 'Envío por pie cúbico ($)', c.tarifaPie, ' inputmode="decimal"') + inp('aj_sm', 'stockMin', 'Stock mínimo (alerta)', c.stockMin, ' inputmode="numeric"') + inp('aj_mc', 'mesesCobertura', 'Meses de cobertura', c.mesesCobertura, ' inputmode="numeric"') + '</div></div>'
      + '<div class="card fg"><b>Listas</b>' + area('aj_met', 'metodos', 'Métodos de pago (uno por línea: NOMBRE = comisión %)', c.metodos.map(m => m.n + ' = ' + num(m.c)).join('\n')) + area('aj_cat', 'categorias', 'Categorías de gasto', c.categorias.join('\n')) + '<div class="fg2">' + area('aj_tip', 'tipos', 'Tipos de producto', c.tipos.join('\n')) + area('aj_pro', 'proveedores', 'Proveedores', c.proveedores.join('\n')) + '</div></div>'
      + '<div class="err" data-err role="alert"></div><button class="btn pri block" type="submit">Guardar ajustes</button></form>'
      + sec('Conexión') + '<div class="card fg"><p class="small" style="margin:0">Este teléfono está conectado a tu hoja. Para que tu socio use la app, envíale el enlace de acceso: abre la app ya conectada. Compártelo solo con él.</p><div class="btns full"><button class="btn" data-act="copyAccess">' + ic('link') + 'Copiar enlace de acceso</button><button class="btn ghost" data-act="logout">' + ic('out') + 'Desconectar</button></div></div>'
      + sec('Respaldo') + '<div class="card fg"><p class="small" style="margin:0">Descarga una copia de todos tus datos (productos, ventas, compras, clientes…) en un archivo.</p><div class="btns full"><button class="btn" data-act="backup">' + ic('download') + 'Respaldo (.json)</button><button class="btn" data-act="csvVentas">' + ic('table') + 'Ventas para Excel (.csv)</button></div></div>'
      + '<p class="note" style="text-align:center;margin-top:18px">StratoFil3D · versión ' + VERSION + '</p>';
  }
};
const VERSION = '2.0';
let installEvt = null;
