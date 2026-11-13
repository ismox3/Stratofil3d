'use strict';
/* Arranque común de las pruebas: sirve la app, abre un navegador y conecta el puente simulado. */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { Hoja, sembrar } = require('./puente-simulado.js');
const RAIZ = path.join(__dirname, '..'), API = 'https://script.google.com/macros/s/PRUEBA/exec', CLAVE = 'AAAA-BBBB-CCCC';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const hoyISO = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

async function montar(opts = {}) {
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html';
    const f = path.join(RAIZ, p);
    if (!f.startsWith(RAIZ) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' }); res.end(fs.readFileSync(f));
  });
  await new Promise(r => srv.listen(0, r));
  const url = 'http://localhost:' + srv.address().port + '/';
  const hoja = sembrar(new Hoja(CLAVE), hoyISO());
  const browser = await chromium.launch();
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 }, deviceScaleFactor: opts.dsf || 1, hasTouch: true, isMobile: true, serviceWorkers: 'block', acceptDownloads: true, locale: 'es-VE', colorScheme: opts.oscuro ? 'dark' : 'light' }, opts.ctx || {}));
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
  const errores = [];
  const enganchar = async page => {
    page.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
    page.on('pageerror', e => errores.push('PAGEERROR ' + e.message));
    await page.route(API, async route => {
      const body = JSON.parse(route.request().postData() || '{}');
      if (hoja.lento) await new Promise(r => setTimeout(r, hoja.lento));
      if (hoja.caida) return route.abort('internetdisconnected');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(hoja.handle(body)) });
    });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  };
  const page = await ctx.newPage(); page.setDefaultTimeout(8000); await enganchar(page);
  return { url, hoja, browser, ctx, page, errores, enganchar, API, CLAVE, cerrar: async () => { await browser.close(); srv.close(); } };
}
/* utilidades sobre una página */
function manos(page) {
  const pausa = ms => page.waitForTimeout(ms);
  const tap = async (sel, o) => { await pausa(420); const l = typeof sel === 'string' ? page.locator(sel).first() : sel; await l.scrollIntoViewIfNeeded(); await l.click(o); };
  const guardado = async () => { await page.waitForSelector('.toast.t-ok', { timeout: 15000 }); await pausa(150); };
  const conectar = async (t) => { await page.goto(t.url); await page.fill('#su_api', t.API); await page.fill('#su_k', t.CLAVE); await tap('#F0 button[type=submit]'); await page.waitForSelector('nav.tabs .tab', { timeout: 15000 }); await pausa(300); };
  const titulo = () => page.locator('#sheetT').textContent();
  const hojaAbierta = () => page.locator('#sheet').isVisible();
  return { pausa, tap, guardado, conectar, titulo, hojaAbierta };
}
module.exports = { montar, manos, hoyISO };
