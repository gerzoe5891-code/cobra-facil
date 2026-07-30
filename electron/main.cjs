const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
} = require("electron");

const {
  autoUpdater,
} = require("electron-updater");

const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");

const esDesarrollo = !app.isPackaged;

function crearVentana() {
  const ventana = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    show: false,
    backgroundColor: "#f4f7fb",
    title: "Tu Propio Estilo - Cobra Fácil",
    icon: path.join(
      __dirname,
      "..",
      "build",
      "icon.ico"
    ),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(
        __dirname,
        "preload.cjs"
      ),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  ventana.once(
    "ready-to-show",
    () => {
      ventana.maximize();
      ventana.show();
    }
  );

  ventana.webContents.setWindowOpenHandler(
    ({ url }) => {
      shell.openExternal(url);

      return {
        action: "deny",
      };
    }
  );

  if (esDesarrollo) {
    ventana.loadURL(
      "http://localhost:5173"
    );
  } else {
    ventana.loadFile(
      path.join(
        __dirname,
        "..",
        "dist",
        "index.html"
      )
    );
  }
}

async function imprimirDocumento(
  _evento,
  datos
) {
  const html =
    typeof datos?.html === "string"
      ? datos.html
      : "";

  if (!html.trim()) {
    throw new Error(
      "El documento para imprimir está vacío."
    );
  }

  const titulo =
    typeof datos?.titulo === "string" &&
    datos.titulo.trim()
      ? datos.titulo.trim()
      : "Cobra Fácil";

  const rutaTemporal = path.join(
    os.tmpdir(),
    `cobra-facil-${crypto.randomUUID()}.html`
  );

  await fs.promises.writeFile(
    rutaTemporal,
    html,
    "utf8"
  );

  const ventanaImpresion =
    new BrowserWindow({
      show: false,
      width: 900,
      height: 1200,
      title: titulo,
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

  try {
    await ventanaImpresion.loadFile(
      rutaTemporal
    );

    await new Promise((resolve) =>
      setTimeout(resolve, 400)
    );

    return await new Promise(
      (resolve, reject) => {
        ventanaImpresion.webContents.print(
          {
            silent: false,
            printBackground: true,
            color: true,
            margins: {
              marginType: "default",
            },
            pageSize: "A4",
            landscape: false,
          },
          (exito, motivo) => {
            if (exito) {
              resolve({
                ok: true,
              });
            } else {
              reject(
                new Error(
                  motivo ||
                    "La impresión fue cancelada."
                )
              );
            }
          }
        );
      }
    );
  } finally {
    if (
      !ventanaImpresion.isDestroyed()
    ) {
      ventanaImpresion.close();
    }

    fs.promises
      .unlink(rutaTemporal)
      .catch(() => {});
  }
}

async function buscarActualizaciones() {
  if (esDesarrollo) {
    return {
      ok: true,
      desarrollo: true,
      versionActual:
        app.getVersion(),
      mensaje:
        "La búsqueda real de actualizaciones funciona en la versión instalada de Cobra Fácil.",
    };
  }

  try {
    const resultado =
      await autoUpdater.checkForUpdates();

    const versionDisponible =
      resultado?.updateInfo?.version ||
      app.getVersion();

    return {
      ok: true,
      desarrollo: false,
      versionActual:
        app.getVersion(),
      versionDisponible,
      hayActualizacion:
        versionDisponible !==
        app.getVersion(),
    };
  } catch (error) {
    console.error(
      "Error al buscar actualizaciones:",
      error
    );

    return {
      ok: false,
      desarrollo: false,
      versionActual:
        app.getVersion(),
      mensaje:
        error?.message ||
        "No se pudo buscar actualizaciones.",
    };
  }
}

app.whenReady().then(() => {
  app.setAppUserModelId(
    "com.tupropioestilo.cobrafacil"
  );

  /*
   * Por ahora solo buscamos y detectamos.
   * No descargamos ni instalamos
   * automáticamente.
   */
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit =
    false;

  ipcMain.removeHandler(
    "documento:imprimir"
  );

  ipcMain.handle(
    "documento:imprimir",
    imprimirDocumento
  );

  ipcMain.removeHandler(
    "actualizaciones:buscar"
  );

  ipcMain.handle(
    "actualizaciones:buscar",
    buscarActualizaciones
  );

  crearVentana();

  app.on("activate", () => {
    if (
      BrowserWindow.getAllWindows()
        .length === 0
    ) {
      crearVentana();
    }
  });
});

app.on(
  "window-all-closed",
  () => {
    if (
      process.platform !== "darwin"
    ) {
      app.quit();
    }
  }
);