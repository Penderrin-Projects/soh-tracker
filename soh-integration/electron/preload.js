/**
 * Electron preload script.
 *
 * Runs in an isolated context with Node.js available but before the renderer's
 * JavaScript loads. Exposes a narrow, safe API to the renderer via
 * contextBridge. The renderer (Track-OOT) is otherwise unmodified and has no
 * direct access to Node.js.
 */

'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Whitelist of allowed channels for renderer -> main calls
const INVOKE_CHANNELS = new Set([
  'soh:get-prefs',
  'soh:set-save-path',
  'soh:pick-save-file',
  'soh:get-last-state',
  'soh:reload',
  'soh:toggle-poll',
  'soh:get-custom-color',
  'soh:set-custom-color',
]);

// Whitelist of main -> renderer events the renderer can subscribe to
const EVENT_CHANNELS = new Set([
  'soh:state-update',
  'soh:watch-error',
  'soh:trigger-pick-save',
]);

contextBridge.exposeInMainWorld('sohTracker', {
  /**
   * Call a main-process handler and await the result.
   * @param {string} channel
   * @param {any} [payload]
   */
  invoke(channel, payload) {
    if (!INVOKE_CHANNELS.has(channel)) {
      return Promise.reject(new Error(`Channel not allowed: ${channel}`));
    }
    return ipcRenderer.invoke(channel, payload);
  },

  /**
   * Subscribe to an event pushed from the main process.
   * Returns an unsubscribe function.
   * @param {string} channel
   * @param {(payload: any) => void} handler
   */
  on(channel, handler) {
    if (!EVENT_CHANNELS.has(channel)) {
      throw new Error(`Event channel not allowed: ${channel}`);
    }
    const wrapped = (_event, payload) => handler(payload);
    ipcRenderer.on(channel, wrapped);
    return () => ipcRenderer.removeListener(channel, wrapped);
  },

  // Convenience helpers that renderers will typically use
  getPrefs: () => ipcRenderer.invoke('soh:get-prefs'),
  getLastState: () => ipcRenderer.invoke('soh:get-last-state'),
  pickSaveFile: () => ipcRenderer.invoke('soh:pick-save-file'),
  setSavePath: (p) => ipcRenderer.invoke('soh:set-save-path', p),
  reload: () => ipcRenderer.invoke('soh:reload'),
  togglePoll: () => ipcRenderer.invoke('soh:toggle-poll'),
  getCustomColor: () => ipcRenderer.invoke('soh:get-custom-color'),
  setCustomColor: (color) => ipcRenderer.invoke('soh:set-custom-color', color),

  onStateUpdate(handler) {
    const wrapped = (_event, state) => handler(state);
    ipcRenderer.on('soh:state-update', wrapped);
    return () => ipcRenderer.removeListener('soh:state-update', wrapped);
  },

  onWatchError(handler) {
    const wrapped = (_event, err) => handler(err);
    ipcRenderer.on('soh:watch-error', wrapped);
    return () => ipcRenderer.removeListener('soh:watch-error', wrapped);
  },

  onTriggerPickSave(handler) {
    const wrapped = () => handler();
    ipcRenderer.on('soh:trigger-pick-save', wrapped);
    return () => ipcRenderer.removeListener('soh:trigger-pick-save', wrapped);
  },
});
