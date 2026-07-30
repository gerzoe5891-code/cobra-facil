const {
  contextBridge,
  ipcRenderer,
} = require("electron");

contextBridge.exposeInMainWorld(
  "cobraFacil",
  {
    imprimirDocumento: (datos) =>
      ipcRenderer.invoke(
        "documento:imprimir",
        {
          html:
            typeof datos?.html ===
            "string"
              ? datos.html
              : "",

          titulo:
            typeof datos?.titulo ===
            "string"
              ? datos.titulo
              : "Cobra Fácil",
        }
      ),

    buscarActualizaciones: () =>
      ipcRenderer.invoke(
        "actualizaciones:buscar"
      ),
  }
);