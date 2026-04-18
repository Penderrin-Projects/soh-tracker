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

function serveFile(req, res) {
  try {
    // Strip query string, decode URL
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

    // Prevent path traversal
    const safePath = path.posix.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(DEV_ROOT, safePath);
    if (!filePath.startsWith(DEV_ROOT)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found: ' + urlPath);
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Content-Length': stat.size,
        'Cache-Control': 'no-store',
      });
      fs.createReadStream(filePath).pipe(res);
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
