'use strict';
/* StratoFil3D · datos: utilidades, conexión con la hoja de Google, lectura, cálculos y escritura.
   El formato de filas y columnas es el de la hoja; no cambiarlo sin cambiar la hoja. */

/* ============ utilidades ============ */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/* número escrito por una persona: acepta 12.5, 12,5, 1.205,50 y 1,205.50 */
const num = v => {
  if (v === null || v === undefined || v === '') return 0;
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  let s = String(v).trim().replace(/[$\s]/g, '');
  const c = s.lastIndexOf(','), d = s.lastIndexOf('.');
  if (c >= 0 && d >= 0) s = c > d ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  else if (c >= 0) s = s.replace(',', '.');
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
};
const r2 = n => Math.round((n + Number.EPSILON) * 100) / 100;
const miles = (s, sep) => s.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
const money = n => { n = r2(n || 0); return (n < 0 ? '-$' : '$') + miles(Math.abs(n).toFixed(2), ','); };
const moneyK = n => { n = n || 0; const a = Math.abs(n); return a >= 10000 ? (n < 0 ? '-$' : '$') + (a / 1000).toFixed(1).replace('.0', '') + 'k' : money(n).replace(/\.00$/, ''); };
const pct = n => (n === null || n === undefined || !isFinite(n)) ? '—' : (n * 100).toFixed(1) + '%';
const pad = n => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
const fdate = s => s ? s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4) : 'sin fecha';
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const fcorta = s => s ? +s.slice(8, 10) + ' ' + MESES[+s.slice(5, 7) - 1].slice(0, 3).toLowerCase() : 'sin fecha';
const mesDe = k => /^\d{4}-\d{2}$/.test(k) ? MESES[+k.slice(5) - 1] + ' ' + k.slice(0, 4) : 'Sin fecha';
const daysSince = s => s ? Math.max(0, Math.round((Date.parse(today()) - Date.parse(s)) / 864e5)) : 0;
const plural = (n, uno, muchos) => n + ' ' + (n === 1 ? uno : (muchos || uno + 's'));
const title = s => String(s || '').toLowerCase().replace(/(^|[\s(/-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase())
  .replace(/\bUsdt\b/g, 'USDT').replace(/\bUsd\b/g, 'USD').replace(/\bPla\b/g, 'PLA').replace(/\bPetg\b/g, 'PETG').replace(/\bAbs\b/g, 'ABS').replace(/\bTpu\b/g, 'TPU').replace(/\bBs\b/g, 'Bs');
const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
const lsDel = k => { try { localStorage.removeItem(k); } catch (e) {} };
const userErr = msg => Object.assign(new Error(msg), { user: true });

const DEF = {
  tax: 0.07, tarifaPie: 34, stockMin: 3, mesesCobertura: 2,
  metodos: [{ n: 'EFECTIVO USD', c: 0 }, { n: 'ZELLE', c: 0 }, { n: 'PAGO MÓVIL', c: 0 }, { n: 'TRANSFERENCIA BS', c: 0 }, { n: 'BINANCE / USDT', c: 0 }, { n: 'ZINLI', c: 0 }],
  categorias: ['DELIVERY LOCAL', 'EMPAQUES', 'PUBLICIDAD', 'COMISIONES BANCARIAS', 'HERRAMIENTAS / EQUIPOS', 'SERVICIOS', 'OTROS'],
  proveedores: ['BAMBU LAB US'],
  tipos: ['PLA BASIC', 'PLA PURE', 'PLA SILK+', 'PLA MATTE', 'PETG BASIC', 'ABS', 'ACCESORIO'],
  presentaciones: ['CON SPOOL', 'REFILL', 'UNIDAD'],
  negocio: { nombre: 'StratoFil3D', whatsapp: '', instagram: '', ciudad: 'Maracaibo' }
};
const COLS = ['productos', 'compras', 'ventas', 'encamino', 'apartados', 'gastos', 'clientes', 'pagos'];

/* ============ conexión con tu Google Sheet ============ */
const SHEET_ID = '1pqmDnkzPCPrjwNeghiVCEymI1tjyZzZ1tJt2YnB-DfM';
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit';
const SH = {
  productos: { tab: 'Inventario', last: 'P', max: 204 },
  compras: { tab: 'Compras', last: 'Q', max: 504 },
  ventas: { tab: 'Ventas', last: 'X', max: 504 },
  encamino: { tab: "'En Camino'", last: 'O', max: 204 },
  apartados: { tab: 'Apartados', last: 'N', max: 204 },
  gastos: { tab: 'Gastos', last: 'F', max: 504 },
  clientes: { tab: 'Clientes', last: 'G', max: 504 },
  pagos: { tab: 'Pagos', last: 'J', max: 1004 },
  params: { tab: "'Parámetros'", range: "'Parámetros'!A4:H61" }
};
const rangeOf = k => SH[k].range || (SH[k].tab + '!A5:' + SH[k].last + SH[k].max);
const ALLKEYS = COLS.concat(['params']);
const LS_API = 'sf_api', LS_KEY = 'sf_clave', LS_CACHE = 'sf_cache';
let API = lsGet(LS_API) || '', KEY = lsGet(LS_KEY) || '';

/* ============ estado ============ */
const S = {
  productos: [], compras: [], ventas: [], encamino: [], apartados: [], gastos: [], clientes: [], pagos: [], params: null, meta: null,
  raw: {}, loaded: new Set(), sheetErr: null, busy: false, lastSync: null, deCache: false,
  tab: 'inicio', year: new Date().getFullYear(),
  invFilter: 'todos', invQ: '', ventasQ: '', ventasF: 'todas', cliQ: '',
  cajaP: 'hoy', cajaDia: '', statP: 'mes', catBs: false, catEnCamino: true,
  pgP: 'mes', pgCli: '', pgMet: ''
};
let C = { P: {} };

const conectado = () => !!API && !!KEY;
const listo = () => S.loaded.size >= ALLKEYS.length;
const cfg = () => {
  const c = Object.assign({}, DEF, S.params || {});
  const m = S.meta || {};
  c.negocio = Object.assign({}, DEF.negocio, m.negocio || {});
  c.hex = m.hex || {};
  c.tasa = (S.params && S.params.tasa) || 0;
  c.tasaFecha = (S.params && S.params.tasaFecha) || '';
  return c;
};
const prod = code => S.productos.find(p => p.codigo === code);
const isAcc = p => !!p && (p.presentacion === 'UNIDAD' || p.tipo === 'ACCESORIO');
const bsNum = n => miles((Math.round((n || 0) * 100) / 100).toFixed(2).replace('.', ','), '.');
const bsFmt = n => 'Bs ' + bsNum(n);
const tasaFmt = bsNum;
const tasaIn = n => n ? (Math.round(n * 100) / 100).toFixed(2).replace('.', ',') : '';
const enBs = usd => cfg().tasa ? bsFmt(usd * cfg().tasa) : '';
const myName = () => (lsGet('sf_nombre') || '').trim();
const addDays = (iso, n) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };
const inR = (iso, r) => !!iso && iso >= r[0] && iso <= r[1];
function rangeOfP(kind, t) {
  t = t || today();
  const [y, m, d] = t.split('-').map(Number);
  if (kind === 'ayer') { const a = addDays(t, -1); return [a, a]; }
  if (kind === 'semana') { const dow = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7; return [addDays(t, -dow), addDays(t, 6 - dow)]; }
  if (kind === 'mes') return [y + '-' + pad(m) + '-01', addDays((m === 12 ? (y + 1) + '-01' : y + '-' + pad(m + 1)) + '-01', -1)];
  if (kind === 'anio') return [y + '-01-01', y + '-12-31'];
  return [t, t];
}
function prevRange(kind, t) {
  t = t || today();
  const cur = rangeOfP(kind, t), elapsed = Math.round((Date.parse(t) - Date.parse(cur[0])) / 864e5);
  let start;
  if (kind === 'semana') start = addDays(cur[0], -7);
  else if (kind === 'mes') { const [y, m] = cur[0].split('-').map(Number); start = (m === 1 ? (y - 1) + '-12' : y + '-' + pad(m - 1)) + '-01'; }
  else if (kind === 'anio') start = (+cur[0].slice(0, 4) - 1) + '-01-01';
  else start = addDays(cur[0], -1);
  const prevFull = rangeOfP(kind, start);
  const end = addDays(start, elapsed);
  return [start, end < prevFull[1] ? end : prevFull[1]];
}
const rangeTxt = r => r[0] === r[1] ? fdate(r[0]) : fdate(r[0]) + ' al ' + fdate(r[1]);
const comPct = m => { const x = cfg().metodos.find(z => z.n === m); return x ? num(x.c) / 100 : 0; };
const sameName = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
const activo = a => (a.estado || 'APARTADO') === 'APARTADO';

/* ============ cálculos (misma lógica que tu hoja) ============ */
function compraLine(x) {
  const c = cfg(), q = num(x.cantidad), sub = num(x.subtotal), tax = sub * c.tax, p = prod(x.codigo);
  let est = null;
  if (p && num(p.largo) && num(p.ancho) && num(p.alto)) est = q * num(p.largo) * num(p.ancho) * num(p.alto) / 1728 * c.tarifaPie;
  const real = (x.envioReal !== null && x.envioReal !== undefined && x.envioReal !== '');
  const env = real ? num(x.envioReal) : (est || 0);
  const total = sub + tax + env;
  return { q, sub, tax, est, env, total, unit: q ? total / q : 0 };
}
function apQuien(codigo) {
  return [...new Set(S.apartados.filter(a => activo(a) && (a.items || []).some(it => it.codigo === codigo)).map(a => a.cliente + ' ' + a.numero))].join(', ');
}
function calc() {
  const c = cfg(), P = {};
  const blank = p => ({ p, compradas: 0, vendidas: 0, sub: 0, tax: 0, env: 0, tot: 0, enCamino: 0, apartado: 0, vend90: 0 });
  for (const p of S.productos) P[p.codigo] = blank(p);
  const get = k => P[k] || (P[k] = blank({ codigo: k, tipo: '?', color: k, presentacion: '', precio: 0, missing: true }));
  for (const x of S.compras) { const l = compraLine(x), e = get(x.codigo); e.compradas += l.q; e.sub += l.sub; e.tax += l.tax; e.env += l.env; e.tot += l.total; }
  const t90 = Date.parse(today()) - 90 * 864e5;
  for (const v of S.ventas) for (const it of v.items || []) { const e = get(it.codigo); e.vendidas += num(it.cantidad); if (Date.parse(v.fecha) >= t90) e.vend90 += num(it.cantidad); }
  for (const x of S.encamino) if (x.estado !== 'RECIBIDO') get(x.codigo).enCamino += num(x.cantidad);
  for (const a of S.apartados) if (activo(a)) for (const it of a.items || []) get(it.codigo).apartado += num(it.cantidad);
  for (const k in P) {
    const e = P[k], q = e.compradas;
    e.enMano = q - e.vendidas;
    e.apStock = Math.min(e.apartado, Math.max(0, e.enMano));
    e.apCamino = e.apartado - e.apStock;
    e.disp = e.enMano - e.apStock;
    e.costoProm = q ? e.sub / q : null; e.taxProm = q ? e.tax / q : null; e.envProm = q ? e.env / q : null; e.totalProm = q ? e.tot / q : null;
    e.precio = num(e.p.precio);
    e.util = e.totalProm !== null && e.precio ? e.precio - e.totalProm : null;
    e.markup = e.util !== null && e.totalProm ? e.util / e.totalProm : null;
    e.margen = e.util !== null && e.precio ? e.util / e.precio : null;
    e.valor = e.totalProm !== null ? e.enMano * e.totalProm : 0;
    e.estado = e.disp < 0 ? 'REVISAR' : e.disp <= c.stockMin ? (e.enCamino > 0 ? 'EN CAMINO' : 'STOCK BAJO') : 'OK';
    e.libre = e.enMano + e.enCamino - e.apartado;
    e.prom = e.vend90 / 3;
    e.sugerido = Math.max(0, Math.ceil(e.prom * c.mesesCobertura - 1e-9) + c.stockMin - e.libre);
    e.costoRep = e.sugerido * (e.totalProm || 0);
    e.prioridad = (e.disp <= c.stockMin && e.enCamino > 0) ? 'EN CAMINO' : e.disp <= 0 ? 'URGENTE' : e.sugerido > 0 ? 'PEDIR' : e.disp <= c.stockMin ? 'VIGILAR' : 'OK';
  }
  return { P };
}
const estadoPago = (total, pagado) => pagado >= total - 0.005 ? 'PAGADO' : pagado > 0 ? 'ABONADO' : 'PENDIENTE';
const lineaTotal = it => num(it.cantidad) * num(it.precio) - num(it.descuento);
const sumItems = items => items.reduce((s, it) => s + lineaTotal(it), 0);
function vt(v) {
  let total = 0, bruto = 0, desc = 0, costo = 0, units = 0;
  for (const it of v.items || []) {
    const q = num(it.cantidad), pr = num(it.precio), d = num(it.descuento);
    bruto += q * pr; desc += d; total += q * pr - d; units += q;
    const cu = (it.costo !== null && it.costo !== undefined) ? num(it.costo) : ((C.P[it.codigo] && C.P[it.codigo].totalProm) || 0);
    costo += q * cu;
  }
  const pagos = v.pagos || v.abonos || [];
  const pagado = pagos.reduce((s, p) => s + num(p.monto), 0);
  const com = total * comPct(v.metodo);
  const saldo = Math.max(0, r2(total - pagado));
  return { total, bruto, desc, costo, units, com, util: total - costo - com, pagado, saldo,
    estado: saldo <= 0.005 ? 'PAGADO' : pagado > 0 ? 'ABONADO' : 'PENDIENTE' };
}
const apTotals = a => vt({ items: a.items, pagos: a.abonos || [], metodo: '' });
function resumen(year) {
  const m = Array.from({ length: 12 }, () => ({ ventas: 0, units: 0, costo: 0, com: 0, gastos: 0, compras: 0 }));
  const inY = f => f && +f.slice(0, 4) === year;
  for (const v of S.ventas) if (inY(v.fecha)) { const t = vt(v), x = m[+v.fecha.slice(5, 7) - 1]; x.ventas += t.total; x.units += t.units; x.costo += t.costo; x.com += t.com; }
  for (const g of S.gastos) if (inY(g.fecha)) m[+g.fecha.slice(5, 7) - 1].gastos += num(g.monto);
  for (const x of S.compras) if (inY(x.fecha)) m[+x.fecha.slice(5, 7) - 1].compras += compraLine(x).total;
  for (const x of m) { x.bruta = x.ventas - x.costo - x.com; x.neta = x.bruta - x.gastos; x.margen = x.ventas ? x.neta / x.ventas : null; }
  const T = m.reduce((a, x) => { for (const k in x) if (typeof x[k] === 'number') a[k] = (a[k] || 0) + x[k]; return a; }, {});
  T.margen = T.ventas ? T.neta / T.ventas : null;
  return { m, T, year };
}
function porCobrar() {
  const by = {};
  for (const v of S.ventas) {
    const t = vt(v);
    if (t.saldo <= 0.005) continue;
    const k = v.cliente || 'Sin nombre';
    const g = by[k] = by[k] || { cliente: k, ventas: [], total: 0, oldest: v.fecha };
    g.ventas.push({ v, t }); g.total += t.saldo;
    if (v.fecha && (!g.oldest || v.fecha < g.oldest)) g.oldest = v.fecha;
  }
  return Object.values(by).sort((a, b) => b.total - a.total);
}
function periodStats(r) {
  const vs = S.ventas.filter(v => inR(v.fecha, r));
  let ventas = 0, costo = 0, com = 0, units = 0, saldo = 0;
  for (const v of vs) { const t = vt(v); ventas += t.total; costo += t.costo; com += t.com; units += t.units; saldo += t.saldo; }
  const gs = S.gastos.filter(g => inR(g.fecha, r)), gastos = gs.reduce((s, g) => s + num(g.monto), 0);
  const ps = S.pagos.filter(p => inR(p.fecha, r)), cobrado = ps.reduce((s, p) => s + p.monto, 0);
  const bruta = ventas - costo - com;
  return { vs, gs, ps, ventas, costo, com, units, saldo, n: vs.length, ticket: vs.length ? ventas / vs.length : 0, bruta, gastos, neta: bruta - gastos, cobrado };
}
function cajaMetodos(st) {
  const M = {};
  const get = m => (M[m || 'SIN MÉTODO'] = M[m || 'SIN MÉTODO'] || { in: 0, out: 0, bs: 0, n: 0 });
  for (const p of st.ps) { const x = get(p.metodo); x.in += p.monto; x.n++; if (p.tasa) x.bs += p.monto * p.tasa; }
  for (const g of st.gs) get(g.metodo).out += num(g.monto);
  return Object.keys(M).sort((a, b) => M[b].in - M[a].in || M[b].out - M[a].out).map(k => Object.assign({ m: k }, M[k]));
}
function clienteDe(nombre) { return S.clientes.find(c => sameName(c.nombre, nombre)); }
function clientesStats() {
  return S.clientes.map(c => {
    const vs = S.ventas.filter(v => sameName(v.cliente, c.nombre));
    let total = 0, saldo = 0, ultima = '';
    for (const v of vs) { const t = vt(v); total += t.total; saldo += t.saldo; if (v.fecha > ultima) ultima = v.fecha; }
    return { c, n: vs.length, total, saldo, ultima };
  }).sort((a, b) => b.saldo - a.saldo || b.total - a.total || String(a.c.nombre).localeCompare(b.c.nombre));
}
function waPhone(tel) { let d = String(tel || '').replace(/\D/g, ''); if (!d) return ''; if (d.startsWith('0')) d = '58' + d.slice(1); else if (d.length === 10) d = '58' + d; return d; }
function waLink(tel, text) { return 'https://wa.me/' + waPhone(tel) + '?text=' + encodeURIComponent(text); }
function prodName(code) { const p = prod(code); return p ? title(p.color) + ' · ' + p.tipo + (p.presentacion && p.presentacion !== 'UNIDAD' ? ' · ' + title(p.presentacion) : '') : code; }
const pagosDe = (tipo, numero) => S.pagos.filter(p => p.tipo === tipo && String(p.numero) === String(numero));
const isBsM = m => /M[ÓO]VIL|\bBS\b|TRANSFERENCIA/i.test(m || '');
const ventaN = n => S.ventas.find(v => String(v.numero) === String(n));
const apartadoN = n => S.apartados.find(a => String(a.numero) === String(n));
function ventaPagos(v) {
  const ap = (String(v.notas || '').match(/Entrega del apartado (A-\d+)/i) || [])[1];
  return pagosDe('VENTA', v.numero).concat(ap ? pagosDe('APARTADO', ap) : []).sort((a, b) => a.fecha.localeCompare(b.fecha));
}
function ventaDeApartado(numero) {
  return S.ventas.find(v => new RegExp('Entrega del apartado ' + String(numero).replace(/[^\w-]/g, '') + '(?![\\w-])', 'i').test(String(v.notas || '')));
}
function deudaCliente(nombre) {
  const byF = (a, b) => String(a.d.fecha).localeCompare(String(b.d.fecha));
  const vs = S.ventas.filter(v => sameName(v.cliente, nombre)).map(v => ({ k: 'ventas', d: v, saldo: vt(v).saldo, lbl: 'Venta N° ' + v.numero })).filter(x => x.saldo > 0.005).sort(byF);
  const as = S.apartados.filter(a => sameName(a.cliente, nombre) && activo(a)).map(a => ({ k: 'apartados', d: a, saldo: apTotals(a).saldo, lbl: 'Apartado ' + a.numero })).filter(x => x.saldo > 0.005).sort(byF);
  return vs.concat(as);
}
function repartir(nombre, monto) {
  let r = r2(monto); const partes = [];
  for (const x of deudaCliente(nombre)) { if (r <= 0.005) break; const m = r2(Math.min(r, x.saldo)); partes.push(Object.assign({ m }, x)); r = r2(r - m); }
  return { partes, sobra: r };
}
/* de un apartado: qué líneas ya se pueden entregar con lo que hay en mano */
function apListos(a) {
  const have = {}, listos = [], resto = [];
  for (const it of a.items || []) {
    const e = C.P[it.codigo] || {}, q = num(it.cantidad), libre = (e.enMano || 0) - (have[it.codigo] || 0);
    if (libre >= q) { listos.push(it); have[it.codigo] = (have[it.codigo] || 0) + q; } else resto.push(it);
  }
  return { listos, resto };
}
function estadoCuenta(nombre) {
  const vs = S.ventas.filter(v => sameName(v.cliente, nombre)).sort((a, b) => a.fecha.localeCompare(b.fecha) || num(a.numero) - num(b.numero));
  const movs = []; let comprado = 0, pagado = 0, debe = 0;
  for (const v of vs) {
    const t = vt(v); comprado += t.total; pagado += t.pagado; debe += t.saldo;
    movs.push({ fecha: v.fecha, k: v.fecha, o: 0, tipo: 'cargo', desc: 'Venta N° ' + v.numero + ' · ' + plural(t.units, 'producto'), monto: t.total, v });
    let sum = 0;
    for (const p of ventaPagos(v)) {
      sum += p.monto;
      const antes = p.fecha < v.fecha;
      movs.push({ fecha: antes ? v.fecha : p.fecha, k: antes ? v.fecha : p.fecha, o: 1, tipo: 'abono', desc: (p.tipo === 'APARTADO' ? 'Abono del apartado ' + p.numero + (antes ? ' (' + fdate(p.fecha).slice(0, 5) + ')' : '') : 'Pago de la venta N° ' + v.numero) + (p.metodo ? ' · ' + title(p.metodo) : ''), monto: p.monto, v });
    }
    const rest = r2(t.pagado - sum);
    if (rest > 0.005) movs.push({ fecha: v.fecha, k: v.fecha, o: 1, tipo: 'abono', desc: 'Pagos anteriores de la venta N° ' + v.numero, monto: rest, v });
  }
  movs.sort((a, b) => a.k.localeCompare(b.k) || a.o - b.o);
  let saldo = 0; for (const m of movs) { saldo += m.tipo === 'cargo' ? m.monto : -m.monto; m.saldo = r2(saldo); }
  const aps = S.apartados.filter(a => sameName(a.cliente, nombre) && activo(a)).map(a => ({ a, t: apTotals(a) }));
  const c = clienteDe(nombre);
  return { nombre: (c && c.nombre) || nombre, c, vs, movs, aps, comprado: r2(comprado), pagado: r2(pagado), debe: r2(debe) };
}
function catGroups() {
  const by = {};
  for (const k in C.P) {
    const e = C.P[k]; if (e.p.missing) continue;
    if (!(S.catEnCamino ? e.libre > 0 : e.disp > 0)) continue;
    const key = e.p.tipo + '|' + e.p.presentacion + '|' + e.precio;
    (by[key] = by[key] || { tipo: e.p.tipo, pres: e.p.presentacion, precio: e.precio, items: [] }).items.push(e);
  }
  const order = cfg().tipos;
  return Object.values(by).sort((a, b) => (order.indexOf(a.tipo) + 1 || 99) - (order.indexOf(b.tipo) + 1 || 99) || a.pres.localeCompare(b.pres))
    .map(g => (g.items.sort((a, b) => a.p.color.localeCompare(b.p.color)), g));
}

/* ============ colores de muestra ============ */
const HEX = { 'JADE WHITE': '#F4F4F0', 'BLACK': '#111111', 'PUMPKIN ORANGE': '#FF9016', 'BAMBU GREEN': '#00AE42', 'RED': '#C12E1F', 'PURPLE': '#5E43B7', 'MILKY PINK': '#F2C4D6', 'SUNFLOWER YELLOW': '#FEC600', 'BLUE': '#0A2989', 'CYAN': '#0086D6', 'LIGHT GRAY': '#D1D3D5', 'DARK GRAY': '#545454', 'SILVER': '#A6A9AA', 'INDIGO PURPLE': '#482960', 'BRIGHT GREEN': '#BECF00', 'MAGENTA': '#EC008C', 'MAROON RED': '#9D2235', 'ICE BLUE': '#A3D8E1', 'DESERT TAN': '#E8DBB7', 'CANDY GREEN': '#2C8C3C', 'CANDY RED': '#C8102E', 'GOLD': '#D4AF37', 'MISTLETOE GREEN': '#3F8E43', 'WHITE': '#FFFFFF', 'DARK BLUE': '#042F56', 'ORANGE': '#FF6A13', 'BROWN': '#9D432C', 'COCOA BROWN': '#6F5034' };
const hexOf = p => { const h = (p && cfg().hex[p.codigo]) || HEX[(p && p.color) || '']; return /^#[0-9a-f]{3,8}$/i.test(h || '') ? h : '#888888'; };

/* ============ lectura de la hoja ============ */
const cell = (r, i) => (r && r[i] !== null && r[i] !== undefined) ? String(r[i]).trim() : '';
const pnum = s => { s = String(s ?? '').trim(); if (!s) return 0; const neg = s.startsWith('-') || /^\(.*\)$/.test(s); const n = parseFloat(s.replace(/[^0-9.]/g, '')); return isFinite(n) ? (neg ? -n : n) : 0; };
const ppct = s => { s = String(s || ''); return s.includes('%') ? pnum(s) / 100 : pnum(s); };
function pdate(s) {
  s = String(s || '').trim(); let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return m[3] + '-' + pad(m[2]) + '-' + pad(m[1]);
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return m[0];
  if (/^\d{5}$/.test(s)) return new Date(Date.UTC(1899, 11, 30) + (+s) * 864e5).toISOString().slice(0, 10);
  return '';
}
const serial = iso => { const [y, m, d] = String(iso || today()).split('-').map(Number); return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 864e5); };
/* texto seguro para una celda: nada que la hoja pueda tomar por fórmula o número */
const txt = s => { s = String(s ?? '').trim(); return (/^[=+\-@]/.test(s) || /^[\d.,\s]+$/.test(s)) && s ? "'" + s : s; };
const codeVal = s => /^\d+$/.test(String(s)) ? Number(s) : String(s);
const sigOf = r => [0, 2, 3].map(i => cell(r, i)).join('|');

function groupRows(raw, pre, head, extra) {
  const out = [], byNum = {};
  raw.forEach((r, i) => {
    const row = i + 5, cod = cell(r, 3); if (!cod) return;
    const n = cell(r, 1) || ('?' + cell(r, 0) + cell(r, 2));
    let g = byNum[n];
    if (!g) { g = byNum[n] = Object.assign({ id: pre + row, numero: n, items: [], rows: [], sigs: {} }, head(r)); out.push(g); }
    g.items.push({ codigo: cod, cantidad: pnum(r[7]), precio: pnum(r[8]), descuento: pnum(r[9]), row });
    g.rows.push(row); g.sigs[row] = sigOf(r);
    if (extra) extra(g, r);
  });
  return out;
}
function parseAll() {
  const R = S.raw;
  if (R.productos) S.productos = R.productos.map((r, i) => ({ row: i + 5, sig: sigOf(r), codigo: cell(r, 0), tipo: cell(r, 1), color: cell(r, 2), presentacion: cell(r, 3),
    largo: cell(r, 7) ? pnum(r[7]) : null, ancho: cell(r, 8) ? pnum(r[8]) : null, alto: cell(r, 9) ? pnum(r[9]) : null, precio: pnum(r[15]) })).filter(p => p.codigo);
  if (R.compras) S.compras = R.compras.map((r, i) => ({ row: i + 5, id: 'c' + (i + 5), sig: sigOf(r), fecha: pdate(r[0]), pedido: cell(r, 1), proveedor: cell(r, 2), codigo: cell(r, 3),
    cantidad: pnum(r[7]), subtotal: pnum(r[8]), envioReal: cell(r, 12) === '' ? null : pnum(r[12]), notas: cell(r, 16) })).filter(x => x.codigo);
  if (R.encamino) S.encamino = R.encamino.map((r, i) => ({ row: i + 5, id: 'e' + (i + 5), sig: sigOf(r), fecha: pdate(r[0]), pedido: cell(r, 1), proveedor: cell(r, 2), codigo: cell(r, 3),
    cantidad: pnum(r[7]), subtotal: pnum(r[8]), estado: cell(r, 12) || 'EN CAMINO', fechaLlegada: pdate(r[13]), notas: cell(r, 14) })).filter(x => x.codigo);
  if (R.gastos) S.gastos = R.gastos.map((r, i) => ({ row: i + 5, id: 'g' + (i + 5), sig: sigOf(r), fecha: pdate(r[0]), categoria: cell(r, 1), descripcion: cell(r, 2), monto: pnum(r[3]), metodo: cell(r, 4), notas: cell(r, 5) })).filter(x => x.fecha || x.monto);
  if (R.clientes) S.clientes = R.clientes.map((r, i) => ({ row: i + 5, id: 'k' + (i + 5), sig: sigOf(r), nombre: cell(r, 0), telefono: cell(r, 1), cedula: cell(r, 2), direccion: cell(r, 3), ciudad: cell(r, 4), correo: cell(r, 5), notas: cell(r, 6) })).filter(x => x.nombre);
  if (R.ventas) S.ventas = groupRows(R.ventas, 'v', r => ({ fecha: pdate(r[0]), cliente: cell(r, 2), metodo: cell(r, 11), tasa: cell(r, 17) ? pnum(r[17]) : '', estado: cell(r, 19), pagadoCell: pnum(r[20]), notas: cell(r, 22), vendedor: cell(r, 23) }))
    .map(v => { const tot = sumItems(v.items); v.pagos = [{ monto: (!v.estado || v.estado === 'PAGADO') ? tot : v.pagadoCell }]; return v; });
  if (R.apartados) S.apartados = groupRows(R.apartados, 'a', r => ({ fecha: pdate(r[0]), cliente: cell(r, 2), estado: cell(r, 12) || 'APARTADO', notas: cell(r, 13) }), (g, r) => { g.abonoSum = (g.abonoSum || 0) + pnum(r[11]); if (!g.notas && cell(r, 13)) g.notas = cell(r, 13); })
    .map(a => { a.abonos = a.abonoSum ? [{ monto: a.abonoSum }] : []; return a; });
  if (R.pagos) S.pagos = R.pagos.map((r, i) => ({ row: i + 5, id: 'p' + (i + 5), sig: sigOf(r), fecha: pdate(r[0]), tipo: cell(r, 1), numero: cell(r, 2), cliente: cell(r, 3), monto: pnum(r[4]), metodo: cell(r, 5), tasa: cell(r, 6) ? pnum(r[6]) : 0, vendedor: cell(r, 8), notas: cell(r, 9) })).filter(x => x.fecha && x.monto);
  const P = R.params;
  if (P) {
    const g = (i, j) => cell(P[i], j), lists = P.slice(8), colv = j => lists.map(r => cell(r, j)).filter(Boolean);
    const tf = String(g(5, 2)).match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    S.params = { tax: ppct(g(0, 1)), tarifaPie: pnum(g(1, 1)) || 34, stockMin: pnum(g(3, 1)), mesesCobertura: pnum(g(4, 1)) || 2,
      tipos: colv(0), colores: colv(1), presentaciones: colv(2), metodos: lists.filter(r => cell(r, 3)).map(r => ({ n: cell(r, 3), c: ppct(cell(r, 4)) * 100 })),
      categorias: colv(6), proveedores: colv(7), tasa: pnum(g(5, 1)), tasaFecha: tf ? pdate(tf[1]) : '' };
    for (const k of ['tipos', 'presentaciones', 'categorias', 'proveedores', 'metodos']) if (!S.params[k].length) delete S.params[k];
  }
}

/* ============ puente ============ */
async function api(body, timeoutMs) {
  if (!conectado()) throw Object.assign(new Error('setup'), { code: 'setup' });
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), timeoutMs || 60000);
  let res;
  try { res = await fetch(API, { method: 'POST', body: JSON.stringify(Object.assign({ clave: KEY }, body)), redirect: 'follow', signal: ctl.signal }); }
  catch (e) { throw Object.assign(new Error('net'), { code: e.name === 'AbortError' ? 'timeout' : 'network' }); }
  finally { clearTimeout(t); }
  let j; try { j = await res.json(); } catch (e) { throw Object.assign(new Error('bad'), { code: 'bad_response' }); }
  if (!j || !j.ok) throw Object.assign(new Error((j && j.error) || 'error'), { code: j && j.error === 'clave' ? 'clave' : 'server', detail: j && j.error });
  return j;
}
function saveCache() { lsSet(LS_CACHE, JSON.stringify({ t: S.lastSync, raw: S.raw, meta: S.meta })); }
function loadCache() {
  try {
    const c = JSON.parse(lsGet(LS_CACHE) || 'null');
    if (!c || !c.raw || ALLKEYS.some(k => !Array.isArray(c.raw[k]))) return false;
    S.raw = c.raw; S.meta = c.meta || {}; S.lastSync = c.t || null; S.deCache = true;
    for (const k of ALLKEYS) S.loaded.add(k);
    parseAll();
    return true;
  } catch (e) { return false; }
}
function olvidarDatos() {
  lsDel(LS_CACHE); S.raw = {}; S.loaded.clear(); S.meta = null; S.params = null; S.lastSync = null; S.deCache = false;
  for (const k of COLS) S[k] = [];
}
async function readAll(keys) {
  keys = keys || ALLKEYS;
  const ranges = {}; for (const k of keys) ranges[k] = rangeOf(k);
  const j = await api({ op: 'read', ranges });
  for (const k of keys) { S.raw[k] = (j.values || {})[k] || []; S.loaded.add(k); }
  S.meta = j.meta || {}; S.lastSync = Date.now(); S.sheetErr = null; S.deCache = false;
  parseAll();
  if (listo()) saveCache();
  return j;
}
async function fresh(k) { await readAll([k]); return S.raw[k]; }
/* lee todo de nuevo y recalcula: lo que se escriba a continuación parte del estado real de la hoja */
async function alDia() { await readAll(); C = calc(); }
async function writeRows(k, map) {
  const rows = Object.keys(map).map(Number).sort((a, b) => a - b).map(r => ({ row: r, values: map[r] }));
  if (!rows.length) return;
  await api({ op: 'write', sheet: SH[k].tab.replace(/^'|'$/g, ''), rows });
}
function nextRow(k) { const raw = S.raw[k] || []; let last = -1; raw.forEach((r, i) => { if ([0, 1, 2, 3].some(j => cell(r, j) !== '')) last = i; }); return last + 6; }
function needRows(k, n) {
  const r = nextRow(k);
  if (r + n - 1 > SH[k].max) throw userErr('La hoja ' + SH[k].tab.replace(/'/g, '') + ' llegó a su límite de filas (' + SH[k].max + '). Amplíala antes de seguir.');
  return r;
}
async function verify(k, rowsSig) {
  await fresh(k);
  const raw = S.raw[k];
  for (const row in rowsSig) if (sigOf(raw[row - 5] || []) !== rowsSig[row]) throw Object.assign(new Error('stale'), { stale: true });
}
function errMsg(e, write) {
  const c = e && e.code;
  if (c === 'setup') return 'Falta conectar la app con tu hoja.';
  if (c === 'clave') return 'La clave no coincide con la del puente de tu hoja.';
  if (c === 'bad_response') return 'El enlace del puente no responde bien. Revisa que esté implementado como aplicación web para "Cualquier persona".';
  if (c === 'server') return 'Google respondió con un error: ' + (e.detail || 'desconocido');
  if (c === 'network' || c === 'timeout') return write ? 'Sin internet o Google no respondió. Revisa la hoja antes de reintentar: puede que sí se haya guardado.' : 'Sin internet o Google no respondió. Se reintentará sola.';
  return write ? 'No se pudo guardar en la hoja.' : 'No se pudo leer la hoja.';
}
async function saveMeta(patch) {
  const cur = JSON.parse(JSON.stringify(S.meta || {}));
  for (const k in patch) cur[k] = (patch[k] && typeof patch[k] === 'object' && !Array.isArray(patch[k])) ? Object.assign({}, cur[k] || {}, patch[k]) : patch[k];
  await api({ op: 'meta', meta: cur });
  S.meta = cur;
}

/* ============ filas tal como van en la hoja ============ */
/* fórmulas que la app restaura al borrar filas */
const fB = r => '=IF(A' + r + '="","",IF(AND(A' + r + '=A' + (r - 1) + ',TRIM(C' + r + ')=TRIM(C' + (r - 1) + ')),B' + (r - 1) + ',MAX(B$4:B' + (r - 1) + ')+1))';
const fI = r => '=IF(D' + r + '="","",IFERROR(INDEX(Inventario!$P$5:$P$204,MATCH(D' + r + ',Inventario!$A$5:$A$204,0)),""))';
const precioCell = (r, it) => { const p = prod(it.codigo); return (p && Math.abs(num(it.precio) - num(p.precio)) < 0.005) ? fI(r) : num(it.precio); };
const BLANK = {
  ventas: r => ['', fB(r), '', '', null, null, null, '', fI(r), '', null, '', null, null, null, null, null, '', null, '', '', null, '', ''],
  pagos: () => ['', '', '', '', '', '', '', '', '', ''],
  apartados: r => ['', '', '', '', null, null, null, '', fI(r), '', null, '', '', ''],
  compras: () => ['', '', '', '', null, null, null, '', '', null, null, null, '', null, null, null, ''],
  encamino: () => ['', '', '', '', null, null, null, '', '', null, null, null, '', '', ''],
  gastos: () => ['', '', '', '', '', ''],
  clientes: () => ['', '', '', '', '', '', ''],
  productos: () => ['', '', '', '', null, null, null, '', '', '', null, null, null, null, null, '']
};
function ventaRows(start, v, items, estado, pagado) {
  const m = {};
  items.forEach((it, i) => {
    const r = start + i, first = i === 0;
    m[r] = [serial(v.fecha), Number(v.numero), txt(v.cliente), codeVal(it.codigo), null, null, null, num(it.cantidad), precioCell(r, it), num(it.descuento) || '', null, v.metodo || '', null, null, null, null, null, v.tasa ? num(v.tasa) : '', null, first ? estado : '', first ? r2(pagado) : '', null, first ? txt(v.notas || '') : '', txt(v.vendedor || '')];
  });
  return m;
}
function apRows(start, a, items) {
  const m = {};
  items.forEach((it, i) => {
    const r = start + i, first = i === 0;
    m[r] = [serial(a.fecha), a.numero, txt(a.cliente), codeVal(it.codigo), null, null, null, num(it.cantidad), precioCell(r, it), num(it.descuento) || '', null, first && a.abono ? r2(a.abono) : '', a.estado || 'APARTADO', first ? txt(a.notas || '') : ''];
  });
  return m;
}
const compraRow = d => [serial(d.fecha), txt(d.pedido), txt(d.proveedor), codeVal(d.codigo), null, null, null, num(d.cantidad), num(d.subtotal), null, null, null, d.envioReal === null || d.envioReal === undefined || d.envioReal === '' ? '' : num(d.envioReal), null, null, null, txt(d.notas || '')];
const caminoRow = d => [serial(d.fecha), txt(d.pedido), txt(d.proveedor), codeVal(d.codigo), null, null, null, num(d.cantidad), num(d.subtotal), null, null, null, d.estado || 'EN CAMINO', d.fechaLlegada ? serial(d.fechaLlegada) : '', txt(d.notas || '')];
const pagoRow = (r, d) => [serial(d.fecha), d.tipo, txt(String(d.numero)), txt(d.cliente), r2(num(d.monto)), d.metodo || '', d.tasa ? num(d.tasa) : '', '=IF(OR(E' + r + '="",G' + r + '=""),"",E' + r + '*G' + r + ')', txt(d.vendedor || ''), txt(d.notas || '')];
const nextVenta = () => S.ventas.reduce((m, v) => Math.max(m, /^\d+$/.test(String(v.numero)) ? +v.numero : 0), 0) + 1;
const nextApartado = () => 'A-' + String(S.apartados.reduce((m, v) => Math.max(m, +String(v.numero || '').replace(/\D/g, '') || 0), 0) + 1).padStart(3, '0');
const contiguous = rows => rows.every((r, i) => i === 0 || r === rows[i - 1] + 1);
const conNota = (vieja, nueva) => txt((vieja ? vieja + '. ' : '') + nueva);
const tasaPago = (metodo, tasa) => isBsM(metodo) ? (num(tasa) || cfg().tasa || '') : '';

async function logPago(d) {
  await fresh('pagos');
  const r = needRows('pagos', 1);
  await writeRows('pagos', { [r]: pagoRow(r, Object.assign({ vendedor: myName() }, d)) });
}
async function unlogPagos(tipo, numero) {
  await fresh('pagos');
  const m = {}; for (const p of pagosDe(tipo, numero)) m[p.row] = BLANK.pagos();
  await writeRows('pagos', m);
}
/* deja el pagado de una venta o el abono de un apartado en un monto; d debe venir recién leído */
async function writePagado(k, d, pagado, nota, metodo) {
  const first = d.rows[0], mm = {};
  if (k === 'ventas') {
    const arr = new Array(23).fill(null);
    arr[19] = estadoPago(vt(d).total, pagado); arr[20] = r2(pagado);
    if (nota) arr[22] = conNota(d.notas, nota);
    if (!d.metodo && metodo) arr[11] = metodo;
    mm[first] = arr;
    if (!d.metodo && metodo) for (const r of d.rows.slice(1)) { const a2 = new Array(12).fill(null); a2[11] = metodo; mm[r] = a2; }
  } else {
    const arr = new Array(14).fill(null);
    arr[11] = pagado > 0.005 ? r2(pagado) : '';
    if (nota) arr[13] = conNota(d.notas, nota);
    mm[first] = arr;
    for (const r of d.rows.slice(1)) { const a2 = new Array(12).fill(null); a2[11] = ''; mm[r] = a2; }
  }
  await writeRows(k, mm);
}
async function setApEstado(a, estado, nota) {
  const m = {};
  a.rows.forEach((r, i) => { const arr = new Array(14).fill(null); arr[12] = estado; if (i === 0 && nota) arr[13] = conNota(a.notas, nota); m[r] = arr; });
  await writeRows('apartados', m);
}
async function ensureCliente(nombre, tel) {
  await fresh('clientes');
  if (clienteDe(nombre)) return;
  const r = needRows('clientes', 1);
  await writeRows('clientes', { [r]: [txt(nombre), txt(tel || ''), '', '', txt(cfg().negocio.ciudad || ''), '', ''] });
}
async function addToList(colIdx, value) {
  await fresh('params');
  const vals = (S.raw.params || []).slice(8).map(r => cell(r, colIdx).toUpperCase());
  while (vals.length < 50) vals.push('');
  if (vals.includes(String(value).toUpperCase())) return;
  const idx = vals.findIndex(v => !v);
  if (idx < 0 || idx >= 50) return;
  const arr = new Array(colIdx + 1).fill(null); arr[colIdx] = txt(value);
  await writeRows('params', { [12 + idx]: arr });
}
/* escribe un documento (venta o apartado) reutilizando sus filas si caben, o al final de la hoja */
async function ubicarFilas(k, old, n) {
  if (old) {
    if (n <= old.rows.length && contiguous(old.rows)) {
      const m = {}; for (const r of old.rows.slice(n)) m[r] = BLANK[k](r);
      await writeRows(k, m);
      return old.rows[0];
    }
    const m = {}; for (const r of old.rows) m[r] = BLANK[k](r);
    await writeRows(k, m);
    await fresh(k);
  }
  return needRows(k, n);
}
/* firma de un documento: si cambia entre que se abre el formulario y se guarda, alguien más lo editó */
const docSig = d => JSON.stringify([d.fecha, d.cliente, (d.items || []).map(i => [i.codigo, num(i.cantidad), r2(num(i.precio)), r2(num(i.descuento))])]);
function faltaStock(items, old) {
  const need = {}; for (const o of items) need[o.codigo] = (need[o.codigo] || 0) + num(o.cantidad);
  for (const c in need) {
    const own = old ? old.items.filter(i => i.codigo === c).reduce((s, i) => s + num(i.cantidad), 0) : 0, e = C.P[c] || {};
    if (need[c] > (e.disp || 0) + own) return 'No hay suficiente ' + title((prod(c) || {}).color || c) + ' disponible (quedan ' + Math.max(0, (e.disp || 0) + own) + ').' + (e.apStock ? ' Lo que hay está apartado para ' + apQuien(c) + '; si es para esa persona, entrégalo desde el apartado.' : e.enCamino ? ' Si viene en camino, regístralo como apartado.' : '');
  }
  return '';
}
