'use strict';
/* Hoja de Google simulada para probar la app sin tocar la hoja real.
   Entiende las mismas operaciones que el puente de Apps Script: ping, read, write y meta. */
const COL = s => s.split('').reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0);
const serial = iso => { const [y, m, d] = iso.split('-').map(Number); return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 864e5); };
const fecha = n => { const d = new Date(Date.UTC(1899, 11, 30) + n * 864e5); return String(d.getUTCDate()).padStart(2, '0') + '/' + String(d.getUTCMonth() + 1).padStart(2, '0') + '/' + d.getUTCFullYear(); };
const FECHAS = { Ventas: [0], Compras: [0], 'En Camino': [0, 13], Apartados: [0], Gastos: [0], Pagos: [0] };

class Hoja {
  constructor(clave) { this.clave = clave; this.t = {}; this.meta = {}; this.log = []; this.fallar = null; this.lento = 0; }
  set(tab, row, values) {
    const T = this.t[tab] = this.t[tab] || {}, r = T[row] = T[row] || [];
    values.forEach((v, i) => { if (v === null || v === undefined) return; r[i] = typeof v === 'string' && v.startsWith("'") ? { texto: v.slice(1) } : v; });
  }
  celda(tab, row, col) { const r = (this.t[tab] || {})[row]; const v = r ? r[col] : ''; return v === undefined || v === null ? '' : v; }
  raw(tab, row, col) { const v = this.celda(tab, row, col); return v && v.texto !== undefined ? v.texto : v; }
  /* valor como lo mostraría la hoja */
  val(tab, row, col) {
    let v = this.celda(tab, row, col);
    if (v && v.texto !== undefined) return v.texto;
    if (typeof v === 'string' && v.startsWith('=')) {
      if (v.startsWith('=IF(D')) { const cod = this.raw(tab, row, 3); v = ''; if (cod !== '') for (let r = 5; r <= 204; r++) if (String(this.raw('Inventario', r, 0)) === String(cod)) { v = this.raw('Inventario', r, 15); break; } }
      else if (v.startsWith('=IF(OR(E')) { const e = this.raw(tab, row, 4), g = this.raw(tab, row, 6); v = e === '' || g === '' ? '' : e * g; }
      else v = '';
    }
    if (v === '') return '';
    if (typeof v === 'number') {
      if ((FECHAS[tab] || []).includes(col)) return fecha(v);
      if (tab === 'Inventario' && col === 15) return '$' + v.toFixed(2);
      if (tab === 'Parámetros' && row === 4 && col === 1) return (v * 100).toFixed(2) + '%';
      return String(v);
    }
    return String(v);
  }
  read(range) {
    const m = range.match(/^'?([^'!]+)'?!([A-Z]+)(\d+):([A-Z]+)(\d+)$/); if (!m) throw new Error('rango ' + range);
    const [, tab, c1, r1, c2, r2] = m, out = [];
    for (let r = +r1; r <= +r2; r++) { const row = []; for (let c = COL(c1) - 1; c < COL(c2); c++) row.push(this.val(tab, r, c)); out.push(row); }
    while (out.length && out[out.length - 1].every(x => x === '')) out.pop();
    return out;
  }
  handle(body) {
    if (this.fallar) { const f = this.fallar; if (f.una) this.fallar = null; if (!f.op || f.op === body.op) return f.res; }
    if (body.clave !== this.clave) return { ok: false, error: 'clave' };
    if (body.op === 'ping') return { ok: true };
    if (body.op === 'read') { const values = {}; for (const k in body.ranges) values[k] = this.read(body.ranges[k]); return { ok: true, values, meta: this.meta }; }
    if (body.op === 'write') { this.log.push(body); for (const r of body.rows) this.set(body.sheet, r.row, r.values); return { ok: true }; }
    if (body.op === 'meta') { this.meta = body.meta; return { ok: true }; }
    return { ok: false, error: 'op desconocida' };
  }
  /* filas con datos de una pestaña, ya como valores mostrados */
  filas(tab, ancho) { const out = []; for (const r of Object.keys(this.t[tab] || {}).map(Number).sort((a, b) => a - b)) { if (r < 5) continue; const row = []; for (let c = 0; c < ancho; c++) row.push(this.val(tab, r, c)); if (row.slice(0, 4).some(x => x !== '')) out.push({ r, v: row }); } return out; }
}

function sembrar(h, hoy) {
  const dia = n => { const d = new Date(hoy + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return serial(d.toISOString().slice(0, 10)); };
  h.set('Parámetros', 4, ['TAX', 0.07]); h.set('Parámetros', 5, ['Tarifa pie cúbico', 34]); h.set('Parámetros', 7, ['Stock mínimo', 3]); h.set('Parámetros', 8, ['Meses cobertura', 2]);
  h.set('Parámetros', 9, ['Tasa', 205.5, 'Actualizada el ' + fecha(dia(-1))]);
  const tipos = ['PLA BASIC', 'PLA MATTE', 'PETG BASIC', 'ACCESORIO'], met = ['EFECTIVO USD', 'ZELLE', 'PAGO MÓVIL', 'BINANCE / USDT'], cat = ['DELIVERY LOCAL', 'EMPAQUES', 'PUBLICIDAD'];
  for (let i = 0; i < 4; i++) h.set('Parámetros', 12 + i, [tipos[i] || '', '', ['CON SPOOL', 'REFILL', 'UNIDAD'][i] || '', met[i] || '', i === 3 ? 0.01 : 0, '', cat[i] || '', i ? '' : 'BAMBU LAB US']);
  const P = [[10100, 'PLA BASIC', 'JADE WHITE', 'CON SPOOL', 24], [10101, 'PLA BASIC', 'BLACK', 'CON SPOOL', 24], ['10101R', 'PLA BASIC', 'BLACK', 'REFILL', 20], [11300, 'PLA MATTE', 'ICE BLUE', 'CON SPOOL', 26], [30100, 'PETG BASIC', 'ORANGE', 'CON SPOOL', 25], ['ACC01', 'ACCESORIO', 'BOQUILLA 0.4', 'UNIDAD', 12]];
  P.forEach((p, i) => h.set('Inventario', 5 + i, [p[0], p[1], p[2], p[3], '', '', '', i === 5 ? '' : 7.87, i === 5 ? '' : 8.26, i === 5 ? '' : 2.75, '', '', '', '', '', p[4]]));
  const C = [[10100, 10, 130], [10101, 8, 104], ['10101R', 2, 22], [11300, 4, 60], ['ACC01', 5, 25]];
  C.forEach((c, i) => h.set('Compras', 5 + i, [dia(-60), 'US-1001', 'BAMBU LAB US', c[0], '', '', '', c[1], c[2], '', '', '', i === 0 ? 30 : '', '', '', '', '']));
  h.set('En Camino', 5, [dia(-5), 'US-1002', 'BAMBU LAB US', 30100, '', '', '', 6, 84, '', '', '', 'EN CAMINO', '', '']);
  h.set('En Camino', 6, [dia(-5), 'US-1002', 'BAMBU LAB US', 11300, '', '', '', 3, 45, '', '', '', 'EN CAMINO', '', '']);
  const fI = r => '=IF(D' + r + '="","",IFERROR(INDEX(Inventario!$P$5:$P$204,MATCH(D' + r + ',Inventario!$A$5:$A$204,0)),""))';
  const venta = (r, d, n, cli, cod, q, met, est, pag, nota, vend) => h.set('Ventas', r, [dia(d), n, cli, cod, '', '', '', q, fI(r), '', '', met, '', '', '', '', '', 205.5, '', est, pag, '', nota, vend]);
  venta(5, -40, 1, 'Carlos Rojas', 10100, 2, 'ZELLE', 'PAGADO', 48, '', 'Ismael');
  venta(6, -40, 1, 'Carlos Rojas', 10101, 1, 'ZELLE', '', '', '', 'Ismael');
  venta(7, -12, 2, 'María Gómez', 10101, 2, '', 'ABONADO', 20, 'Abonó $20.00', 'Ismael');
  venta(8, -3, 3, 'Carlos Rojas', 'ACC01', 1, 'EFECTIVO USD', 'PENDIENTE', 0, '', 'Luis');
  h.set('Pagos', 5, [dia(-40), 'VENTA', '1', 'Carlos Rojas', 72, 'ZELLE', '', '', 'Ismael', 'Pago al registrar la venta']);
  h.set('Pagos', 6, [dia(-12), 'VENTA', '2', 'María Gómez', 20, 'PAGO MÓVIL', 200, '', 'Ismael', 'Pago de venta']);
  h.set('Apartados', 5, [dia(-4), 'A-001', 'María Gómez', 30100, '', '', '', 2, fI(5), '', '', 10, 'APARTADO', '']);
  h.set('Apartados', 6, [dia(-4), 'A-001', 'María Gómez', 10100, '', '', '', 1, fI(6), '', '', '', 'APARTADO', '']);
  h.set('Pagos', 7, [dia(-4), 'APARTADO', 'A-001', 'María Gómez', 10, 'ZELLE', '', '', 'Ismael', 'Abono inicial del apartado']);
  h.set('Gastos', 5, [dia(-2), 'DELIVERY LOCAL', 'Envío a La Lago', 4, 'EFECTIVO USD', '']);
  h.set('Clientes', 5, ['Carlos Rojas', '04141234567', 'V-12345678', '', 'Maracaibo', '', '']);
  h.set('Clientes', 6, ['María Gómez', '', '', '', 'Maracaibo', '', '']);
  h.meta = { negocio: { nombre: 'StratoFil3D', whatsapp: '0414-0000000', instagram: '@stratofil3d', ciudad: 'Maracaibo' } };
  return h;
}
module.exports = { Hoja, sembrar, serial, fecha };
