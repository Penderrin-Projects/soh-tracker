/**
 * Electron main process for SoH Rando Tracker (Track-OOT fork)
 * 
 * Responsibilities:
 * - Create the BrowserWindow that loads Track-OOT's index.html from dev/
 * - Watch the SoH save file for changes
 * - Parse the save, send normalized state to renderer over IPC
 * - Persist user preferences (save file path, window bounds)
 */

'use strict';

const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const chokidar = require('chokidar');

const saveParser = require('./save-parser.js');

// ---------------------------------------------------------------------------
// Preferences (persisted to %APPDATA%/soh-tracker/prefs.json)
// ---------------------------------------------------------------------------

function prefsPath() {
  return path.join(app.getPath('userData'), 'prefs.json');
}

function loadPrefs() {
  try {
    return JSON.parse(fs.readFileSync(prefsPath(), 'utf8'));
  } catch (_) {
    return {
      savePath: null,
      windowBounds: { width: 1600, height: 1000 },
      // Pollable override for Windows network shares
      watchPoll: false,
    };
  }
}

function savePrefs(prefs) {
  try {
    fs.mkdirSync(path.dirname(prefsPath()), { recursive: true });
    fs.writeFileSync(prefsPath(), JSON.stringify(prefs, null, 2));
  } catch (err) {
    console.error('Failed to write prefs:', err);
  }
}

let prefs = loadPrefs();

// ---------------------------------------------------------------------------
// Embedded static HTTP server
//
// Track-OOT uses ES module imports with absolute paths like
// "/script/foo.js" and "/GameTrackerJS/bar.js". These only resolve correctly
// when served from an HTTP origin, not via file://. We run a minimal static
// server on localhost and have Electron load from it.
// ---------------------------------------------------------------------------

const DEV_ROOT = path.join(__dirname, '..', '..', 'dev');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.map':  'application/json; charset=utf-8',
};

// CSS variables that track the primary theme color
const THEME_COLOR_VARS = [
  '--navigation-back-color',
  '--modal-header-back-color',
  '--modal-footer-back-color',
  '--tabpanel-categories-border-color',
  '--contextmenu-text-color',
  '--contextmenu-border-color',
  '--button-active-back-color',
];
const THEME_ALPHA_VARS = [
  { name: '--page-hover-back-color', alpha: '5c' },
  { name: '--main-hover-color', alpha: '32' },
  { name: '--contextmenu-hover-back-color', alpha: '32' },
];
const DEFAULT_THEME_COLOR = '#cb9c3d';

/**
 * Build a <style> block that overrides Track-OOT's gold theme with the
 * user's chosen color. Returns empty string if the user hasn't chosen one
 * or picked the default gold.
 */
function buildColorOverrideStyle() {
  const hex = prefs.customColor;
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return '';
  if (hex.toLowerCase() === DEFAULT_THEME_COLOR.toLowerCase()) return '';
  const lines = ['<style id="soh-custom-color-override">', ':root {'];
  for (const v of THEME_COLOR_VARS) lines.push(`  ${v}: ${hex} !important;`);
  for (const { name, alpha } of THEME_ALPHA_VARS) lines.push(`  ${name}: ${hex}${alpha} !important;`);
  lines.push('}', '</style>');
  return lines.join('\n');
}

function serveFile(req, res) {
  try {
    // Strip query string, decode URL
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

    // Prevent path traversal
    const safePath = path.posix.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
    let filePath = path.join(DEV_ROOT, safePath);
    if (!filePath.startsWith(DEV_ROOT)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }

    // If the request points at a directory (or a path with a trailing slash),
    // try serving its index.html. Track-OOT's detached windows rely on this:
    // window.open("/detached/#items") -> requests /detached/ -> /detached/index.html
    if (urlPath.endsWith('/')) {
      filePath = path.join(filePath, 'index.html');
    }

    const finishServe = (fp, stat) => {
      const ext = path.extname(fp).toLowerCase();
      // For HTML responses, inject any custom theme-color override so
      // persistence survives restarts and can't be stomped by
      // Track-OOT's later stylesheet loads.
      if (ext === '.html') {
        fs.readFile(fp, 'utf8', (err, html) => {
          if (err) {
            res.writeHead(500); res.end('Read error: ' + err.message); return;
          }
          const inject = buildColorOverrideStyle();
          if (inject) {
            // Append immediately before </body> (or end of document as fallback)
            if (html.includes('</body>')) {
              html = html.replace('</body>', inject + '\n</body>');
            } else {
              html = html + '\n' + inject;
            }
          }
          const buf = Buffer.from(html, 'utf8');
          res.writeHead(200, {
            'Content-Type': MIME['.html'],
            'Content-Length': buf.length,
            'Cache-Control': 'no-store',
          });
          res.end(buf);
        });
        return;
      }

      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Content-Length': stat.size,
        'Cache-Control': 'no-store',
      });
      fs.createReadStream(fp).pipe(res);
    };

    fs.stat(filePath, (err, stat) => {
      // If stat failed and we didn't already try an index.html, try one now
      if ((err || !stat.isFile()) && !filePath.endsWith('index.html')) {
        const withIndex = path.join(filePath, 'index.html');
        fs.stat(withIndex, (e2, s2) => {
          if (e2 || !s2.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found: ' + urlPath);
            return;
          }
          finishServe(withIndex, s2);
        });
        return;
      }
      if (err || !stat.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found: ' + urlPath);
        return;
      }
      finishServe(filePath, stat);
    });
  } catch (e) {
    res.writeHead(500); res.end('Server error: ' + e.message);
  }
}

let serverPort = 0;

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(serveFile);
    // Port 0 = random free port (avoids conflicts with Track-OOT's default 5000)
    server.listen(0, '127.0.0.1', () => {
      serverPort = server.address().port;
      console.log(`[server] serving ${DEV_ROOT} at http://127.0.0.1:${serverPort}`);
      resolve(server);
    });
    server.on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Save watcher
// ---------------------------------------------------------------------------

let watcher = null;
let currentSavePath = null;
let lastState = null;

function stopWatcher() {
  if (watcher) {
    watcher.close().catch(() => {});
    watcher = null;
    currentSavePath = null;
  }
}

/**
 * Start watching a save file. Emits 'soh:state-update' to renderer on change.
 */
function startWatcher(win, savePath) {
  stopWatcher();

  if (!savePath) return;
  if (!fs.existsSync(savePath)) {
    win.webContents.send('soh:watch-error', {
      path: savePath,
      error: 'Save file does not exist',
    });
    return;
  }

  currentSavePath = savePath;
  console.log(`[watcher] watching ${savePath}`);

  watcher = chokidar.watch(savePath, {
    persistent: true,
    usePolling: prefs.watchPoll || false,
    interval: 500,
    awaitWriteFinish: {
      stabilityThreshold: 50,
      pollInterval: 25,
    },
  });

  let debounceTimer = null;

  const reload = async () => {
    try {
      const state = await saveParser.parseSaveFile(savePath);
      lastState = state;
      win.webContents.send('soh:state-update', state);
    } catch (err) {
      console.error('[watcher] parse failed:', err.message);
      win.webContents.send('soh:watch-error', {
        path: savePath,
        error: err.message,
      });
    }
  };

  const scheduleReload = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(reload, 75);
  };

  watcher.on('add', scheduleReload);
  watcher.on('change', scheduleReload);
  watcher.on('error', (err) => {
    console.error('[watcher] error:', err);
    win.webContents.send('soh:watch-error', {
      path: savePath,
      error: String(err),
    });
  });

  // Trigger initial load
  scheduleReload();
}

// ---------------------------------------------------------------------------
// Window
// ---------------------------------------------------------------------------

function createWindow() {
  const { width, height, x, y } = prefs.windowBounds || {};

  const win = new BrowserWindow({
    width: width || 1600,
    height: height || 1000,
    x, y,
    backgroundColor: '#222',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Persist window bounds on close
  win.on('close', () => {
    prefs.windowBounds = win.getBounds();
    savePrefs(prefs);
  });

  // Load Track-OOT from the embedded HTTP server. Track-OOT's sources use
  // absolute paths like "/script/foo.js" which require an HTTP origin to
  // resolve. file:// would look for "C:/script/foo.js" which fails.
  //
  // ?nosw disables service-worker registration. Service workers make sense
  // for a hosted web app but cause cache/state issues inside Electron.
  const appUrl = `http://127.0.0.1:${serverPort}/?nosw`;
  win.loadURL(appUrl).catch((err) => {
    console.error('Failed to load app URL:', err);
    dialog.showErrorBox(
      'App load failed',
      `Could not load ${appUrl}\n\n` +
      `Make sure dev/ has been built:\n` +
      `  node ./soh-integration/dev-build.js\n\n` +
      `Error: ${err.message}`
    );
  });

  // Handle window.open() for Track-OOT's detached item / locationlist /
  // worldmap windows. They call window.open("/detached/#items", ...) etc.
  // By default Electron blocks these - we need to allow them and configure
  // the new window properly.
  win.webContents.setWindowOpenHandler(({ url, frameName, features }) => {
    // Parse the features string (e.g. "popup=1,toolbar=0,...")
    const featureMap = Object.fromEntries(
      (features || '').split(',').map(f => {
        const [k, v] = f.split('=');
        return [k.trim(), (v ?? '').trim()];
      })
    );

    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        width: 400,
        height: 500,
        parent: win,
        backgroundColor: '#222',
        title: frameName || 'Track-OOT',
        autoHideMenuBar: true,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: false,
        },
      },
    };
  });

  // Open devtools via F12 (on the main window)
  win.webContents.on('before-input-event', (_, input) => {
    if (input.key === 'F12') {
      win.webContents.toggleDevTools();
    }
  });

  return win;
}

// ---------------------------------------------------------------------------
// IPC handlers (renderer → main)
// ---------------------------------------------------------------------------

function setupIpc(win) {
  ipcMain.handle('soh:get-prefs', () => prefs);

  ipcMain.handle('soh:set-save-path', async (_ev, newPath) => {
    prefs.savePath = newPath;
    savePrefs(prefs);
    startWatcher(win, newPath);
    return { ok: true };
  });

  ipcMain.handle('soh:pick-save-file', async () => {
    const result = await dialog.showOpenDialog(win, {
      title: 'Select Ship of Harkinian save file',
      defaultPath: prefs.savePath || undefined,
      filters: [{ name: 'SoH Save', extensions: ['sav'] }],
      properties: ['openFile'],
    });
    if (result.canceled || !result.filePaths[0]) return null;
    const chosen = result.filePaths[0];
    prefs.savePath = chosen;
    savePrefs(prefs);
    startWatcher(win, chosen);
    return chosen;
  });

  ipcMain.handle('soh:get-last-state', () => lastState);

  ipcMain.handle('soh:reload', async () => {
    if (currentSavePath) {
      const state = await saveParser.parseSaveFile(currentSavePath);
      lastState = state;
      win.webContents.send('soh:state-update', state);
      return { ok: true };
    }
    return { ok: false, error: 'No save file configured' };
  });

  ipcMain.handle('soh:toggle-poll', async () => {
    prefs.watchPoll = !prefs.watchPoll;
    savePrefs(prefs);
    if (currentSavePath) startWatcher(win, currentSavePath);
    return prefs.watchPoll;
  });

  ipcMain.handle('soh:get-custom-color', () => prefs.customColor || null);

  ipcMain.handle('soh:set-custom-color', async (_ev, color) => {
    if (color === null || color === undefined) {
      delete prefs.customColor;
    } else {
      prefs.customColor = String(color);
    }
    savePrefs(prefs);
    return { ok: true };
  });
}

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------

function buildMenu(win) {
  // Hide the native Electron menu bar — all file actions are in the
  // in-app navigation (Track-OOT's FILE dropdown).
  // Ctrl+O and Ctrl+R are still handled via accelerators registered below.
  Menu.setApplicationMenu(null);

  // Register accelerators on the window directly so Ctrl+O / Ctrl+R still work
  win.webContents.on('before-input-event', (event, input) => {
    if (!input.control || input.type !== 'keyDown') return;
    const key = (input.key || '').toLowerCase();
    if (key === 'o') {
      win.webContents.send('soh:trigger-pick-save');
      event.preventDefault();
    } else if (key === 'r') {
      (async () => {
        if (currentSavePath) {
          try {
            const state = await saveParser.parseSaveFile(currentSavePath);
            lastState = state;
            win.webContents.send('soh:state-update', state);
          } catch (e) { console.error('reload failed:', e); }
        }
      })();
      event.preventDefault();
    }
  });
}

// ---------------------------------------------------------------------------
// App lifecycle
// ---------------------------------------------------------------------------

app.whenReady().then(async () => {
  try {
    await startStaticServer();
  } catch (err) {
    dialog.showErrorBox('Server failed', `Could not start embedded web server:\n${err.message}`);
    app.quit();
    return;
  }
  const win = createWindow();
  setupIpc(win);
  buildMenu(win);

  win.webContents.on('did-finish-load', () => {
    // Start watching the configured save path if it's set
    if (prefs.savePath && fs.existsSync(prefs.savePath)) {
      startWatcher(win, prefs.savePath);
    }
  });
});

app.on('window-all-closed', () => {
  stopWatcher();
  app.quit();
});
