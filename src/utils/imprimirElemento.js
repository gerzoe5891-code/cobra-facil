function obtenerEstilosDocumento() {
  const estilos = [];

  for (const hoja of Array.from(document.styleSheets)) {
    try {
      const reglas = Array.from(hoja.cssRules || [])
        .map((regla) => regla.cssText)
        .join("\n");
      estilos.push(reglas);
    } catch {
      // Algunas hojas externas no permiten leer sus reglas.
    }
  }

  return estilos.join("\n");
}

function escaparTitulo(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function crearDocumentoHTML({ elemento, titulo }) {
  const estilos = obtenerEstilosDocumento();

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escaparTitulo(titulo)}</title>
  <style>
    ${estilos}
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: white !important;
      color: #111827;
      font-family: Arial, Helvetica, sans-serif;
    }
    body { width: 100%; }
    .no-print, .comprobante-acciones, button { display: none !important; }
    .printable-comprobante, .printable {
      display: grid !important;
      width: 100% !important;
      max-width: 180mm !important;
      margin: 0 auto !important;
      padding: 0 !important;
      overflow: visible !important;
      position: static !important;
      transform: none !important;
    }
    .comprobante-encabezado,
    .print-header,
    .comprobante-cliente,
    .comprobante-compra,
    .comprobante-cuenta,
    .cliente-estado,
    .cliente-encabezado,
    .cliente-resumen article,
    .historial-item {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>${elemento.outerHTML}</body>
</html>`;
}

export async function imprimirElemento({ selector, titulo = "Cobra Fácil" }) {
  const elemento = document.querySelector(selector);

  if (!elemento) {
    alert("No se encontró el documento para imprimir.");
    return;
  }

  if (!window.cobraFacil?.imprimirDocumento) {
    alert("La impresión nativa no está disponible. Cerrá la aplicación y volvé a abrirla con npm start.");
    return;
  }

  const html = crearDocumentoHTML({ elemento, titulo });

  try {
    await window.cobraFacil.imprimirDocumento({ html, titulo });
  } catch (error) {
    const mensaje = error?.message || "No se pudo imprimir el documento.";
    if (!mensaje.toLowerCase().includes("cancel")) alert(mensaje);
  }
}
