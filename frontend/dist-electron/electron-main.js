import { app as n, BrowserWindow as t } from "electron";
import o from "node:path";
import { fileURLToPath as r } from "node:url";
const a = r(import.meta.url), s = o.dirname(a);
process.env.DIST = o.join(s, "../dist");
process.env.VITE_PUBLIC = n.isPackaged ? process.env.DIST || "" : o.join(process.env.DIST || "", "../public");
let e;
const i = process.env.VITE_DEV_SERVER_URL;
function l() {
  e = new t({
    icon: o.join(process.env.VITE_PUBLIC || "", "electron-vite.svg"),
    webPreferences: {
      preload: o.join(s, "electron-preload.js"),
      nodeIntegration: !0,
      contextIsolation: !1
    }
  }), e.webContents.on("did-finish-load", () => {
    e?.webContents.send("main-pro sage", (/* @__PURE__ */ new Date()).toLocaleString());
  }), i ? e.loadURL(i) : e.loadFile(o.join(process.env.DIST, "index.html"));
}
n.on("window-all-closed", () => {
  process.platform !== "darwin" && (n.quit(), e = null);
});
n.whenReady().then(l);
