import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // We can expose any Electron APIs here.
  // For example, we can expose a function to read a file:
  // readFile: (path) => ipcRenderer.invoke('read-file', path),
});
