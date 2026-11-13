# StratoFil3D

App (PWA) para manejar el inventario, las ventas, los apartados y los cobros de StratoFil3D.
Los datos viven en Google Sheets; la app se conecta a través de un puente de Google Apps Script
protegido con clave. Ni la clave ni el enlace del puente se guardan en este repositorio.

## Archivos

| Archivo | Qué contiene |
| --- | --- |
| `index.html` | La página base |
| `app.css` | El diseño (claro, oscuro, teléfono y pantalla ancha) |
| `datos.js` | Conexión con la hoja, lectura, cálculos y escritura de filas |
| `docs.js` | Textos para WhatsApp, recibos, estados de cuenta y PDF |
| `app.js` | Navegación y pantallas |
| `hojas.js` | Detalles, formularios, acciones y arranque |
| `sw.js` | Permite abrir la app sin internet |

Al publicar una versión nueva, sube el número `?v=` en `index.html` y en `sw.js` (y `VERSION` en `sw.js`).

## Pruebas

`pruebas/` trae una hoja de Google simulada y un recorrido automático de la app; nunca toca la hoja real.
Necesita Node y Playwright:

```
node pruebas/flujos.js      # ventas, pagos, apartados, pedidos, gastos, clientes, ajustes…
node pruebas/sw.js          # abrir sin internet
node pruebas/capturas.js carpeta/   # capturas de las pantallas
```
