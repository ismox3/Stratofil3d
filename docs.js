'use strict';
/* StratoFil3D · documentos: textos para WhatsApp, recibos e imágenes en canvas, y PDF. */

const LEMA = 'Calidad capa a capa.';

/* ============ textos ============ */
function msgCobro(x) {
  const c = cfg(), nombre = String(x.cliente).trim().split(' ')[0];
  const det = x.ventas.map(({ v, t }) => '• Compra del ' + fdate(v.fecha) + ' (N° ' + v.numero + '): ' + money(t.saldo)).join('\n');
  return 'Hola ' + nombre + ', ¿cómo estás? Te escribo de ' + c.negocio.nombre + ' para recordarte el saldo pendiente de *' + money(x.total) + '*'
    + (c.tasa ? ' (' + enBs(x.total) + ' a la tasa de hoy, ' + tasaFmt(c.tasa) + ')' : '') + ':\n' + det
    + '\n\nPuedes pagar por ' + c.metodos.map(m => title(m.n)).join(', ') + '. Avísame cuando lo hagas para registrarlo. ¡Gracias!';
}
function reciboTexto(kind, d) {
  const n = cfg().negocio, isV = kind === 'venta', t = isV ? vt(d) : apTotals(d);
  let s = '*' + n.nombre.toUpperCase() + '*\n' + (isV ? 'Recibo de venta N° ' + d.numero : 'Comprobante de apartado ' + d.numero) + '\nFecha: ' + fdate(d.fecha) + '\nCliente: ' + d.cliente + '\n\n';
  s += (d.items || []).map(it => '• ' + num(it.cantidad) + ' × ' + prodName(it.codigo) + ' — ' + money(lineaTotal(it)) + (num(it.descuento) ? ' (desc. ' + money(num(it.descuento)) + ')' : '')).join('\n');
  s += '\n\n*Total: ' + money(t.total) + '*\n' + (isV ? 'Pagado' : 'Abonado') + ': ' + money(t.pagado) + '\n'
    + (t.saldo > 0.005 ? (isV ? 'Saldo pendiente' : 'Resta por pagar') + ': ' + money(t.saldo) + '\n' : (isV ? 'Pagado completo. ¡Gracias!\n' : ''));
  if (!isV) s += 'Los productos quedan reservados a tu nombre.\n';
  return s + '\nGracias por tu compra en ' + n.nombre + '.\n_' + LEMA + '_';
}
function ecuentaTexto(ec) {
  const n = cfg().negocio;
  let s = '*' + n.nombre.toUpperCase() + '*\nEstado de cuenta\nCliente: ' + ec.nombre + '\nAl ' + fdate(today()) + '\n';
  if (ec.movs.length) s += '\n*Movimientos*\n' + ec.movs.map(m => fdate(m.fecha) + ' · ' + m.desc + ': ' + (m.tipo === 'cargo' ? '+' : '−') + money(m.monto) + ' → saldo ' + money(m.saldo)).join('\n') + '\n';
  s += '\nTotal comprado: ' + money(ec.comprado) + '\nTotal pagado: ' + money(ec.pagado) + '\n*' + (ec.debe > 0.005 ? 'Saldo pendiente: ' + money(ec.debe) : 'Estás al día. ¡Gracias!') + '*\n';
  if (ec.aps.length) s += '\n*Apartados activos* (no suman al saldo hasta la entrega)\n' + ec.aps.map(({ a, t }) => '• ' + a.numero + ' del ' + fdate(a.fecha) + ': total ' + money(t.total) + ', abonado ' + money(t.pagado) + ', resta ' + money(t.saldo)).join('\n') + '\n';
  return s + '\n_' + LEMA + '_';
}
function cierreTexto(r) {
  const st = periodStats(r), ms = cajaMetodos(st), n = cfg().negocio;
  let t = '*Cierre de caja · ' + n.nombre + '*\n' + rangeTxt(r) + '\n\n*Entró: ' + money(st.cobrado) + '*\n';
  for (const x of ms) if (x.in) t += '• ' + title(x.m) + ': ' + money(x.in) + (x.bs ? ' (' + bsFmt(x.bs) + ')' : '') + '\n';
  t += '\nGastos: ' + money(st.gastos) + '\n*Neto en caja: ' + money(st.cobrado - st.gastos) + '*\n';
  t += '\nVentas: ' + st.n + ' por ' + money(st.ventas) + (st.saldo > 0.005 ? '\nDe esas ventas aún te deben: ' + money(st.saldo) : '');
  if (myName()) t += '\n\nCerrado por ' + myName();
  return t;
}
function catText() {
  const c = cfg(), n = c.negocio, gs = catGroups(), bs = S.catBs && c.tasa;
  let t = '*' + n.nombre.toUpperCase() + '* · Filamento original Bambu Lab\n' + (n.ciudad ? n.ciudad + ' · ' : '') + 'Precios en USD\n';
  for (const g of gs) {
    t += '\n*' + g.tipo + ' · ' + title(g.pres) + ' — ' + money(g.precio) + (bs ? ' (' + enBs(g.precio) + ')' : '') + '*\n';
    t += g.items.map(e => '• ' + title(e.p.color) + (e.disp > 0 ? '' : ' _(llega pronto)_')).join('\n') + '\n';
  }
  if (bs) t += '\nPrecios en Bs a la tasa del ' + fdate(c.tasaFecha || today()) + ' (' + tasaFmt(c.tasa) + ').';
  t += '\nPagos: ' + c.metodos.map(m => title(m.n)).join(', ') + '.';
  if (n.whatsapp) t += '\nPedidos: ' + n.whatsapp;
  if (n.instagram) t += '\nInstagram: ' + n.instagram;
  return t + '\n\n_' + LEMA + '_';
}
function repoTexto() {
  const rows = Object.values(C.P).filter(e => e.sugerido > 0 && !e.p.missing);
  return 'Pedido sugerido ' + fdate(today()) + '\n' + rows.map(e => '• ' + e.sugerido + ' × ' + e.p.codigo + ' ' + title(e.p.color) + ' (' + e.p.tipo + ', ' + title(e.p.presentacion) + ')').join('\n')
    + '\nCosto estimado: ' + money(rows.reduce((s, e) => s + e.costoRep, 0));
}

/* ============ canvas ============ */
const LOGO_L = new Image(); LOGO_L.src = 'logo-claro.png';
const logoReady = () => LOGO_L.decode ? LOGO_L.decode().catch(() => {}) : Promise.resolve();
const BR = { noche: '#051022', verde: '#00DF60', naranja: '#FF5500', hueso: '#F1F6F0', muted: '#4F5967', mutedD: '#A6B0BC', line: '#D5DCD4', raised: '#0D1B33' };
const FD = '"Space Grotesk", "Helvetica Neue", Arial, sans-serif', FB = '"Plus Jakarta Sans", "Helvetica Neue", Arial, sans-serif';
async function canvasListo() { try { await document.fonts.ready; await logoReady(); } catch (e) {} }
function drawLogo(x, X, Y, h) {
  if (LOGO_L.complete && LOGO_L.naturalWidth) x.drawImage(LOGO_L, X, Y, h * LOGO_L.naturalWidth / LOGO_L.naturalHeight, h);
  else { x.fillStyle = BR.hueso; x.font = '700 ' + Math.round(h * 0.5) + 'px ' + FD; x.fillText('STRATO.', X, Y + h * 0.7); }
}
function layers(x, X, Y, w, h, color) { x.fillStyle = color; for (let yy = Y; yy < Y + h; yy += 10) x.fillRect(X, yy, w, 2); }
/* recorta un texto para que quepa en un ancho */
function fit(x, s, maxW) {
  s = String(s ?? '');
  if (x.measureText(s).width <= maxW) return s;
  while (s.length > 1 && x.measureText(s + '…').width > maxW) s = s.slice(0, -1);
  return s.trim() + '…';
}
function cabecera(x, W, etiqueta, l1, l2) {
  x.fillStyle = BR.noche; x.fillRect(0, 0, W, 250);
  layers(x, 0, 236, W, 14, 'rgba(0,223,96,.55)');
  drawLogo(x, 70, 50, 140);
  x.font = '700 28px ' + FD;
  const bw = Math.max(290, x.measureText(etiqueta).width + 56);
  x.fillStyle = BR.verde; x.fillRect(W - 70 - bw, 70, bw, 76);
  x.fillStyle = BR.noche; x.textAlign = 'center'; x.fillText(etiqueta, W - 70 - bw / 2, 119);
  x.fillStyle = BR.mutedD; x.font = '500 22px ' + FB; x.fillText(l1 || '', W - 70 - bw / 2, 182); x.fillText(l2 || '', W - 70 - bw / 2, 212);
  x.textAlign = 'left';
}
function pie(x, W, H, linea) {
  x.fillStyle = BR.noche; x.fillRect(0, H - 130, W, 130);
  x.fillStyle = BR.verde; x.font = '700 34px ' + FD; x.textAlign = 'center'; x.fillText(LEMA, W / 2, H - 72);
  x.fillStyle = BR.mutedD; x.font = '500 22px ' + FB; x.fillText(fit(x, linea, W - 140), W / 2, H - 34);
  x.textAlign = 'left';
}
function muestra(x, p, cx, cy, r, bordeClaro) {
  if (isAcc(p)) { x.fillStyle = bordeClaro ? BR.raised : '#E6ECE6'; x.fillRect(cx - r, cy - r, r * 2, r * 2); return; }
  x.fillStyle = hexOf(p); x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
  x.strokeStyle = bordeClaro ? 'rgba(241,246,240,.25)' : 'rgba(5,16,34,.18)'; x.lineWidth = 2; x.stroke();
  if (p.presentacion === 'REFILL') { x.setLineDash([6, 6]); x.strokeStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.arc(cx, cy, r * 0.56, 0, Math.PI * 2); x.stroke(); x.setLineDash([]); }
}
function bloqueSaldo(x, W, y, etiqueta, monto) {
  x.fillStyle = BR.noche; x.fillRect(70, y, W - 140, 84);
  x.fillStyle = BR.hueso; x.font = '700 30px ' + FD; x.fillText(etiqueta, 100, y + 54);
  x.fillStyle = BR.verde; x.font = '700 42px ' + FD; x.textAlign = 'right'; x.fillText(money(monto), W - 100, y + 56); x.textAlign = 'left';
}
function drawRecibo(cv, kind, d) {
  const isV = kind === 'venta', t = isV ? vt(d) : apTotals(d), n = cfg().negocio;
  const W = 1080, items = d.items || [];
  const H = 900 + items.length * 120 + (t.desc ? 52 : 0) + (isV ? 0 : 60);
  cv.width = W; cv.height = H; const x = cv.getContext('2d');
  x.fillStyle = BR.hueso; x.fillRect(0, 0, W, H);
  cabecera(x, W, isV ? 'RECIBO N° ' + d.numero : 'APARTADO ' + d.numero, 'Filamento original Bambu Lab', n.ciudad || '');
  let y = 320;
  x.fillStyle = BR.muted; x.font = '700 22px ' + FB; x.fillText('CLIENTE', 70, y); x.fillText('FECHA', W - 330, y);
  y += 46; x.fillStyle = BR.noche; x.font = '700 40px ' + FD; x.fillText(fit(x, d.cliente, W - 440), 70, y); x.font = '600 36px ' + FD; x.fillText(fdate(d.fecha), W - 330, y);
  y += 40; x.fillStyle = BR.line; x.fillRect(70, y, W - 140, 3); y += 30;
  for (const it of items) {
    const p = prod(it.codigo) || { color: it.codigo };
    y += 20;
    muestra(x, p, 102, y + 32, 32);
    x.font = '700 32px ' + FD; const tot = money(lineaTotal(it)), tw = x.measureText(tot).width;
    x.fillStyle = BR.noche; x.fillText(fit(x, title(p.color), W - 250 - tw), 160, y + 26);
    x.textAlign = 'right'; x.fillText(tot, W - 70, y + 42); x.textAlign = 'left';
    x.fillStyle = BR.muted; x.font = '500 23px ' + FB;
    x.fillText(fit(x, [title(p.tipo || '') + (p.presentacion && p.presentacion !== 'UNIDAD' ? ' · ' + title(p.presentacion) : '') + (p.codigo ? ' (' + p.codigo + ')' : ''), num(it.cantidad) + ' × ' + money(num(it.precio)) + (num(it.descuento) ? '  − ' + money(num(it.descuento)) : '')].filter(s => s.trim()).join(' · '), W - 250 - tw), 160, y + 62);
    y += 100;
  }
  y += 10; x.fillStyle = BR.line; x.fillRect(70, y, W - 140, 3); y += 56;
  const rowT = (l, v, big) => { x.fillStyle = big ? BR.noche : BR.muted; x.font = (big ? '700 40px ' + FD : '500 27px ' + FB); x.fillText(l, 70, y); x.font = (big ? '700 44px ' : '600 30px ') + FD; x.textAlign = 'right'; x.fillText(v, W - 70, y); x.textAlign = 'left'; y += big ? 64 : 52; };
  if (t.desc) rowT('Descuentos', '-' + money(t.desc));
  rowT('Total', money(t.total), true);
  rowT(isV ? 'Pagado' : 'Abonado', money(t.pagado));
  bloqueSaldo(x, W, y - 24, t.saldo > 0.005 ? (isV ? 'Saldo pendiente' : 'Resta por pagar') : 'Pagado completo', t.saldo);
  y += 112;
  if (!isV) { x.fillStyle = BR.muted; x.font = 'italic 500 24px ' + FB; x.fillText('Los productos quedan reservados a tu nombre.', 70, y); }
  pie(x, W, H, ['¡Gracias por tu compra!', n.whatsapp ? 'WhatsApp ' + n.whatsapp : '', n.instagram || ''].filter(Boolean).join('   ·   '));
}
function drawEcuenta(cv, ec) {
  const n = cfg().negocio, W = 1080, rowH = 74, apH = ec.aps.length ? 80 + ec.aps.length * 56 : 0;
  const H = 990 + Math.max(1, ec.movs.length) * rowH + apH;
  cv.width = W; cv.height = H; const x = cv.getContext('2d');
  x.fillStyle = BR.hueso; x.fillRect(0, 0, W, H);
  cabecera(x, W, 'ESTADO DE CUENTA', 'Al ' + fdate(today()), 'Montos en dólares');
  let y = 320;
  x.fillStyle = BR.muted; x.font = '700 22px ' + FB; x.fillText('CLIENTE', 70, y);
  y += 46; x.fillStyle = BR.noche; x.font = '700 40px ' + FD; x.fillText(fit(x, ec.nombre, W - 140), 70, y);
  const sub = [ec.c && ec.c.telefono, ec.c && ec.c.cedula].filter(Boolean).join(' · ');
  if (sub) { x.fillStyle = BR.muted; x.font = '500 22px ' + FB; x.fillText(fit(x, sub, W - 140), 70, y + 34); }
  y += 70; const bw = (W - 140 - 40) / 3;
  const box = (i, l, v, dark) => {
    const bx = 70 + i * (bw + 20); x.fillStyle = dark ? BR.noche : '#FFFFFF'; x.fillRect(bx, y, bw, 110);
    if (!dark) { x.strokeStyle = BR.line; x.lineWidth = 2; x.strokeRect(bx + 1, y + 1, bw - 2, 108); }
    x.fillStyle = dark ? BR.mutedD : BR.muted; x.font = '700 20px ' + FB; x.fillText(l, bx + 22, y + 38);
    x.fillStyle = dark ? BR.verde : BR.noche; x.font = '700 36px ' + FD; x.fillText(fit(x, v, bw - 40), bx + 22, y + 86);
  };
  box(0, 'TOTAL COMPRADO', money(ec.comprado)); box(1, 'TOTAL PAGADO', money(ec.pagado)); box(2, ec.debe > 0.005 ? 'SALDO PENDIENTE' : 'AL DÍA', money(ec.debe), true);
  y += 160;
  const cX = [70, 180, 690, 850, W - 70], conW = 360;
  x.fillStyle = BR.muted; x.font = '700 19px ' + FB;
  x.fillText('FECHA', cX[0], y); x.fillText('CONCEPTO', cX[1], y); x.textAlign = 'right'; x.fillText('CARGO', cX[2], y); x.fillText('ABONO', cX[3], y); x.fillText('SALDO', cX[4], y); x.textAlign = 'left';
  y += 18; x.fillStyle = BR.line; x.fillRect(70, y, W - 140, 3); y += 12;
  if (!ec.movs.length) { y += 46; x.fillStyle = BR.muted; x.font = '500 24px ' + FB; x.fillText('Sin compras registradas.', 70, y); y += rowH - 46; }
  const cuts = cv._cuts = [];
  ec.movs.forEach((m, i) => {
    cuts.push(y);
    if (i % 2) { x.fillStyle = 'rgba(5,16,34,.035)'; x.fillRect(70, y, W - 140, rowH); }
    const ty = y + 46;
    x.fillStyle = BR.muted; x.font = '500 22px ' + FD; x.fillText(m.fecha ? fdate(m.fecha).slice(0, 5) : '—', cX[0], ty);
    x.fillStyle = BR.noche; x.font = (m.tipo === 'cargo' ? '700 ' : '500 ') + '21px ' + FB; x.fillText(fit(x, m.desc, conW), cX[1], ty);
    x.textAlign = 'right'; x.font = '600 24px ' + FD;
    if (m.tipo === 'cargo') { x.fillStyle = BR.noche; x.fillText(money(m.monto), cX[2], ty); }
    else { x.fillStyle = '#00803A'; x.fillText('−' + money(m.monto), cX[3], ty); }
    x.fillStyle = BR.noche; x.font = '700 24px ' + FD; x.fillText(money(m.saldo), cX[4], ty); x.textAlign = 'left';
    y += rowH;
  });
  y += 6; x.fillStyle = BR.line; x.fillRect(70, y, W - 140, 3); y += 40;
  cuts.push(y - 20);
  bloqueSaldo(x, W, y, ec.debe > 0.005 ? 'Saldo pendiente' : 'Estás al día', ec.debe);
  y += 124;
  cuts.push(y - 40); cuts.push(H - 130);
  if (ec.aps.length) {
    x.fillStyle = BR.noche; x.font = '700 26px ' + FD; x.fillText('Apartados activos', 70, y);
    x.fillStyle = BR.muted; x.font = '500 20px ' + FB; x.fillText('No suman al saldo hasta que se entregan.', 70, y + 30);
    y += 70;
    for (const { a, t } of ec.aps) {
      x.font = '700 24px ' + FD; const r = 'resta ' + money(t.saldo), rw = x.measureText(r).width;
      x.fillStyle = BR.noche; x.textAlign = 'right'; x.fillText(r, W - 70, y); x.textAlign = 'left';
      x.font = '600 23px ' + FB; x.fillText(fit(x, a.numero + ' · ' + fdate(a.fecha) + ' · total ' + money(t.total) + ' · abonado ' + money(t.pagado), W - 170 - rw), 70, y);
      y += 56;
    }
  }
  pie(x, W, H, [n.nombre, n.whatsapp ? 'WhatsApp ' + n.whatsapp : '', n.instagram || ''].filter(Boolean).join('   ·   '));
}
function drawCatalogo(cv) {
  const gs = catGroups(), c = cfg(), n = c.negocio, W = 1080, cols = 2, rowH = 92, bs = S.catBs && c.tasa, colW = (W - 140) / cols;
  let H = 330 + 170; for (const g of gs) H += 120 + Math.ceil(g.items.length / cols) * rowH;
  cv.width = W; cv.height = H; const x = cv.getContext('2d');
  x.fillStyle = BR.noche; x.fillRect(0, 0, W, H);
  drawLogo(x, 70, 60, 150);
  x.fillStyle = BR.hueso; x.font = '700 40px ' + FD; x.textAlign = 'right'; x.fillText('Catálogo', W - 70, 118);
  x.fillStyle = BR.mutedD; x.font = '500 24px ' + FB; x.fillText('Filamento original Bambu Lab', W - 70, 160); x.fillText((n.ciudad ? n.ciudad + ' · ' : '') + 'precios en USD', W - 70, 194); x.textAlign = 'left';
  layers(x, 0, 250, W, 30, 'rgba(0,223,96,.5)');
  let y = 330;
  for (const g of gs) {
    x.fillStyle = BR.verde; x.fillRect(70, y, W - 140, 4); y += 60;
    x.font = '700 42px ' + FD; const pr = money(g.precio).replace(/\.00$/, ''), pw = x.measureText(pr).width;
    x.fillStyle = BR.verde; x.textAlign = 'right'; x.fillText(pr, W - 70, y);
    if (bs) { x.fillStyle = BR.mutedD; x.font = '500 22px ' + FB; x.fillText(enBs(g.precio), W - 70, y + 32); }
    x.textAlign = 'left'; x.fillStyle = BR.hueso; x.font = '700 36px ' + FD; x.fillText(fit(x, title(g.tipo) + ' · ' + title(g.pres), W - 170 - pw), 70, y);
    y += 46;
    g.items.forEach((e, i) => {
      const cx = 70 + (i % cols) * colW, cy = y + Math.floor(i / cols) * rowH;
      muestra(x, e.p, cx + 28, cy + 42, 28, true);
      x.fillStyle = BR.hueso; x.font = '600 29px ' + FD; x.fillText(fit(x, title(e.p.color), colW - 96), cx + 76, cy + 42);
      const ok = e.disp > 0;
      x.fillStyle = ok ? BR.verde : BR.naranja; x.font = '600 21px ' + FB; x.fillText(ok ? 'Disponible' : 'Llega pronto', cx + 76, cy + 72);
    });
    y += Math.ceil(g.items.length / cols) * rowH + 14;
  }
  x.fillStyle = BR.verde; x.fillRect(0, H - 150, W, 150);
  layers(x, 0, H - 150, W, 150, 'rgba(5,16,34,.07)');
  x.fillStyle = BR.noche; x.textAlign = 'center'; x.font = '700 46px ' + FD; x.fillText(LEMA, W / 2, H - 84);
  x.font = '600 24px ' + FB; x.fillText(fit(x, ['Pide por WhatsApp', n.whatsapp, n.instagram].filter(Boolean).join('  ·  '), W - 140), W / 2, H - 40); x.textAlign = 'left';
}

/* ============ PDF (una imagen JPEG por página) ============ */
function jpegOf(cv) {
  const bin = atob(cv.toDataURL('image/jpeg', 0.93).split(',')[1]), img = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) img[i] = bin.charCodeAt(i);
  return img;
}
function pdfOf(pages, PW, PH) {
  const enc = new TextEncoder(), parts = [], offs = []; let len = 0;
  const put = d => { const u = typeof d === 'string' ? enc.encode(d) : d; parts.push(u); len += u.length; };
  const obj = (n, body) => { offs[n] = len; put(n + ' 0 obj\n' + body + '\nendobj\n'); };
  put('%PDF-1.4\n%STRATO\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [' + pages.map((p, i) => (3 + i * 3) + ' 0 R').join(' ') + '] /Count ' + pages.length + ' >>');
  pages.forEach((cv, i) => {
    const n = 3 + i * 3, img = jpegOf(cv), c = 'q ' + PW + ' 0 0 ' + PH + ' 0 0 cm /Im0 Do Q';
    obj(n, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PW + ' ' + PH + '] /Resources << /XObject << /Im0 ' + (n + 1) + ' 0 R >> >> /Contents ' + (n + 2) + ' 0 R >>');
    offs[n + 1] = len; put((n + 1) + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + cv.width + ' /Height ' + cv.height + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + img.length + ' >>\nstream\n'); put(img); put('\nendstream\nendobj\n');
    obj(n + 2, '<< /Length ' + c.length + ' >>\nstream\n' + c + '\nendstream');
  });
  const N = 3 + pages.length * 3, xref = len; let xr = 'xref\n0 ' + N + '\n0000000000 65535 f \n';
  for (let i = 1; i < N; i++) xr += String(offs[i]).padStart(10, '0') + ' 00000 n \n';
  put(xr + 'trailer\n<< /Size ' + N + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
  return new Blob(parts, { type: 'application/pdf' });
}
/* parte un canvas largo en páginas tamaño carta, cortando entre filas */
function cartaPages(cv) {
  const W = cv.width, PH = Math.round(W * 11 / 8.5), foot = 64, top = 56, H = cv.height, cuts = (cv._cuts || []).concat([H]), segs = [];
  if (H <= PH) segs.push([0, H]);
  else {
    let s = 0;
    while (s < H) {
      const lim = PH - foot - (segs.length ? top : 0);
      if (H - s <= lim) { segs.push([s, H]); break; }
      let e = 0; for (const c of cuts) if (c > s + 80 && c <= s + lim) e = c;
      if (!e) e = s + lim;
      segs.push([s, e]); s = e;
    }
  }
  return segs.map(([a, b], i) => {
    const t = document.createElement('canvas'); t.width = W; t.height = PH; const x = t.getContext('2d');
    x.fillStyle = BR.hueso; x.fillRect(0, 0, W, PH); x.drawImage(cv, 0, a, W, b - a, 0, i ? top : 0, W, b - a);
    if (segs.length > 1) { x.fillStyle = BR.muted; x.font = '500 20px ' + FB; x.textAlign = 'right'; x.fillText('Página ' + (i + 1) + ' de ' + segs.length, W - 70, PH - 24); }
    return t;
  });
}
function canvasPdf(cv) {
  if (cv.dataset.doc === 'carta') return pdfOf(cartaPages(cv), 612, 792);
  const t = document.createElement('canvas'); t.width = cv.width; t.height = cv.height;
  const x = t.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, t.width, t.height); x.drawImage(cv, 0, 0);
  return pdfOf([t], 595.28, Math.round(595.28 * cv.height / cv.width * 100) / 100);
}
const archivo = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w\-.]+/g, '_');
