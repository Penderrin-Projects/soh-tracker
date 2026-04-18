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
const chokidar = require('chokidar');

const saveParser = require('./save-parser');

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

  // Load Track-OOT's index.html from dev/
  const indexPath = path.join(app.getAppPath(), 'dev', 'index.html');
  win.loadFile(indexPath).catch((err) => {
    console.error('Failed to load dev/index.html:', err);
    dialog.showErrorBox(
      'Build missing',
      `Could not find dev/index.html at:\n${indexPath}\n\n` +
      `Run the build step before starting the tracker:\n` +
      `  node ./soh-integration/dev-build.js`
    );
  });

  // Open devtools via F12
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
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Choose Save File...',
          accelerator: 'Ctrl+O',
          click: () => {
            win.webContents.send('soh:trigger-pick-save');
          },
        },
        { type: 'separator' },
        {
          label: 'Reload Save',
          accelerator: 'Ctrl+R',
          click: async () => {
            if (currentSavePath) {
              const state = await saveParser.parseSaveFile(currentSavePath);
              lastState = state;
              win.webContents.send('soh:state-update', state);
            }
          },
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(win, {
              type: 'info',
              title: 'SoH Rando Tracker',
              message: 'SoH Rando Tracker',
              detail:
                'Built on Track-OOT by Denis Weiß (ZidArgs) — MIT License.\n' +
                'https://bitbucket.org/zidargs/track-oot\n\n' +
                'This fork adds Ship of Harkinian save-file auto-tracking.',
            });
          },
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ---------------------------------------------------------------------------
// App lifecycle
// ---------------------------------------------------------------------------

app.whenReady().then(() => {
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
