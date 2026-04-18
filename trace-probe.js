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
  win.webContents.on('console-message', (_, lvl, msg, line, src) => {
    if (msg.includes('Electron Security')) return;
    console.log(`[${['V','I','W','E'][lvl]||'?'}] ${msg.substring(0,400)} @ ${src.split('/').pop()}:${line}`);
  });
  await win.loadURL('http://127.0.0.1:'+port+'/?nosw');
  await new Promise(r=>setTimeout(r,18000));
  // Try to directly import app.js and see what happens
  const diag = await win.webContents.executeJavaScript(`
    (async () => {
      try {
        const m = await import('/script/app.js');
        return {ok:true, keys:Object.keys(m)};
      } catch(e) {
        return {ok:false, msg:String(e), stack:(e.stack||'').substring(0,500)};
      }
    })()
  `);
  console.log('IMPORT_APPJS:', JSON.stringify(diag, null, 2));
  app.quit();
});
app.on('window-all-closed',()=>app.quit());
