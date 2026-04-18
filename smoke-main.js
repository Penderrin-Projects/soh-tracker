const { app, BrowserWindow } = require('electron');
const path = require('path');

const errors = [];

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 800, height: 600, show: false,
    webPreferences: { sandbox: false, nodeIntegration: false },
  });

  win.webContents.on('console-message', (_, level, msg, line, src) => {
    const lvl = ['VERBOSE','INFO','WARN','ERROR'][level] || 'INFO';
    console.log(`[${lvl}] ${msg}  (${src}:${line})`);
    if (level >= 2) errors.push(`${lvl}: ${msg}`);
  });

  win.webContents.on('did-fail-load', (_, code, desc, url) => {
    console.error(`FAILED TO LOAD: ${code} ${desc} at ${url}`);
    errors.push(`load-fail: ${desc}`);
  });

  win.loadFile(path.join(__dirname, 'dev/index.html')).then(() => {
    // Wait 8 seconds for all async imports to complete
    setTimeout(() => {
      console.log(`\n=== smoke test complete. ${errors.length} errors captured ===`);
      app.quit();
    }, 8000);
  }).catch((e) => {
    console.error('loadFile threw:', e);
    app.quit();
  });
});

app.on('window-all-closed', () => app.quit());
