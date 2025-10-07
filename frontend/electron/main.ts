import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import dotenv from 'dotenv';
import {
  initializeDatabase,
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from './database.js'

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Determine the correct .env file to load
const envFile =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
// Construct a reliable path to the .env file, going up two directories from dist/electron
const envPath = path.join(__dirname, '..', '..', envFile)
dotenv.config({ path: envPath })

console.log(`Loading env from: ${envPath}`)
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('VITE_PORT:', process.env.VITE_PORT)

const VITE_DEV_SERVER_PORT = process.env.VITE_PORT
  ? Number(process.env.VITE_PORT)
  : 3000
const isDevelopment = process.argv.includes('--dev');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // nodeIntegration should be false when contextIsolation is true
      contextIsolation: true,
    },
  });

  if (isDevelopment) {
    // Load from the Vite dev server in development
    mainWindow.loadURL(`http://localhost:${VITE_DEV_SERVER_PORT}`);
    mainWindow.webContents.openDevTools();
  } else {
    // Hide the menu bar in production
    mainWindow.setMenu(null);
    // Load the index.html of the app in production
    mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));
  }
}

app.whenReady().then(async () => {

  await initializeDatabase();
  createWindow();

  ipcMain.handle('get-todos', async () => getTodos());
  ipcMain.handle('create-todo', async (event, data) => createTodo(data));
  ipcMain.handle('update-todo', async (event, id, updates) => updateTodo(id, updates));
  ipcMain.handle('delete-todo', async (event, id) => deleteTodo(id));
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
