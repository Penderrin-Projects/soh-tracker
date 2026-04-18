const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const http = require('node:http');
const fs = require('node:fs');

const DEV_ROOT = path.join(__dirname, 'dev');
const MIME = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.ico':'image/x-icon','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf'};

let port = 0;
const srv = http.createServer((req, res) => {
  let u = decodeURIComponent((req.url||'/').split('?')[0]);
  if (u==='/') u='/index.html';
  const fp = path.join(DEV_ROOT, u);
  if (!fp.startsWith(DEV_ROOT)) return res.end('403');
  fs.stat(fp, (e, st) => {
    if (e||!st.isFile()) { res.writeHead(404); return res.end('404 '+u); }
    res.writeHead(200, {'Content-Type': MIME[path.extname(fp).toLowerCase()]||'application/octet-stream'});
    fs.createReadStream(fp).pipe(res);
  });
});
srv.listen(0, '127.0.0.1', () => { port = srv.address().port; });

app.whenReady().then(async () => {
  while (port === 0) await new Promise(r=>setTimeout(r,10));
  const win = new BrowserWindow({width:1400,height:900,show:false,webPreferences:{sandbox:false}});
  const errors = [];
  win.webContents.on('console-message', (_, lvl, msg, line, src) => {
    if (msg.includes('Electron Security')) return;
    if (lvl >= 2) errors.push(msg);
  });
  await win.loadURL('http://127.0.0.1:'+port+'/?nosw');
  await new Promise(r=>setTimeout(r,15000));
  const diag = await win.webContents.executeJavaScript(`
    ({
      loadingMsg: document.getElementById('loading-info')?.innerHTML || '',
      splashVisible: document.getElementById('splash')?.className || 'no-splash',
      bodyChildren: Array.from(document.body.children).map(e=>e.tagName+(e.id?'#'+e.id:'')+(e.className?'.'+e.className:'')).join(', '),
      bridge: !!globalThis.__sohBridge,
      hasApp: !!globalThis.savestate,
    })
  `);
  console.log('DIAG:', JSON.stringify(diag, null, 2));
  console.log('\nERRORS:');
  errors.slice(0,10).forEach(e => console.log(' -', e.substring(0,300)));
  app.quit();
});
app.on('window-all-closed',()=>app.quit());
