import {
  fechaCorta,
  moneda,
} from "../utils/formatos";

import {
  imprimirElemento,
} from "../utils/imprimirElemento";

import "../styles/ClienteDetalle.css";

function diasDesde(fecha) {
  if (!fecha) return null;

  const inicio = new Date(
    `${fecha}T00:00:00`
  );

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return Math.max(
    0,
    Math.floor(
      (hoy - inicio) / 86400000
    )
  );
}

function textoTiempo(fecha) {
  const dias = diasDesde(fecha);

  if (dias === null) {
    return "Sin registros";
  }

  if (dias === 0) {
    return "Hoy";
  }

  if (dias === 1) {
    return "Hace 1 día";
  }

  return `Hace ${dias} días`;
}

export default function ClienteDetalle({
  cliente,
  pedidos,
  pagos,
  negocio,
  onNuevoPedido,
  onNuevoPago,
  onEditar,
}) {
  const compras = pedidos
    .filter(
      (pedido) =>
        pedido.clienteId ===
        cliente.id
    )
    .sort(
      (a, b) =>
        new Date(b.fecha) -
        new Date(a.fecha)
    );

  const cobros = pagos
    .filter(
      (pago) =>
        pago.clienteId ===
        cliente.id
    )
    .sort(
      (a, b) =>
        new Date(b.fecha) -
        new Date(a.fecha)
    );

  const totalComprado =
    compras.reduce(
      (suma, pedido) =>
        suma +
        Number(pedido.total || 0),
      0
    );

  const totalPagado =
    cobros.reduce(
      (suma, pago) =>
        suma +
        Number(pago.monto || 0),
      0
    );

  const saldo = Math.max(
    0,
    totalComprado - totalPagado
  );

  const ultimaCompra =
    compras[0]?.fecha || "";

  const ultimoPago =
    cobros[0]?.fecha || "";

  const nombreNegocio =
    negocio?.nombre ||
    "Tu Propio Estilo";

  const movimientos = [
    ...compras.map((pedido) => ({
      id: `pedido-${pedido.id}`,
      fecha: pedido.fecha,
      tipo: "Compra",
      icono: "🛒",
      monto: Number(
        pedido.total || 0
      ),
      estado: pedido.estado,
      observaciones:
        pedido.observaciones || "",
      clase: "compra",
    })),

    ...cobros.map((pago) => ({
      id: `pago-${pago.id}`,
      fecha: pago.fecha,
      tipo: "Pago",
      icono: "💵",
      monto: Number(
        pago.monto || 0
      ),
      estado:
        pago.metodo || "Pago",
      observaciones:
        pago.observaciones || "",
      clase: "pago",
    })),
  ].sort(
    (a, b) =>
      new Date(b.fecha) -
      new Date(a.fecha)
  );

  async function copiarTexto(
    texto,
    mensaje
  ) {
    try {
      await navigator.clipboard
        .writeText(texto);

      alert(mensaje);
    } catch {
      const area =
        document.createElement(
          "textarea"
        );

      area.value = texto;

      document.body.appendChild(
        area
      );

      area.select();

      document.execCommand(
        "copy"
      );

      area.remove();

      alert(mensaje);
    }
  }

  function copiarResumen() {
    const resumen = [
      cliente.nombre,
      "",
      `Saldo pendiente: ${moneda(
        saldo
      )}`,
      `Total comprado: ${moneda(
        totalComprado
      )}`,
      `Total pagado: ${moneda(
        totalPagado
      )}`,
      `Última compra: ${fechaCorta(
        ultimaCompra
      )}`,
      `Último pago: ${fechaCorta(
        ultimoPago
      )}`,
      "",
      negocio
        ?.mensajeComprobante ||
        "Gracias por elegirnos.",
    ].join("\n");

    copiarTexto(
      resumen,
      "Resumen copiado correctamente."
    );
  }

  function copiarTelefono() {
    if (!cliente.telefono) {
      alert(
        "Este cliente no tiene teléfono cargado."
      );
      return;
    }

    copiarTexto(
      cliente.telefono,
      "Teléfono copiado correctamente."
    );
  }

  function imprimir() {
    imprimirElemento({
      selector:
        ".printable-cuenta-cliente",
      titulo:
        `Cuenta-${cliente.nombre}`,
    });
  }

  function abrirWhatsApp() {
    const telefono = (
      cliente.telefono || ""
    ).replace(/\D/g, "");

    if (!telefono) {
      alert(
        "Este cliente no tiene teléfono cargado."
      );
      return;
    }

    const mensaje = [
      `Hola ${cliente.nombre}.`,
      "",
      `Te enviamos el resumen de tu cuenta en ${nombreNegocio}:`,
      `Total comprado: ${moneda(
        totalComprado
      )}`,
      `Total pagado: ${moneda(
        totalPagado
      )}`,
      `Saldo pendiente: ${moneda(
        saldo
      )}`,
      "",
      negocio
        ?.mensajeComprobante ||
        "Muchas gracias.",
    ].join("\n");

    window.open(
      `https://wa.me/${telefono}?text=${encodeURIComponent(
        mensaje
      )}`,
      "_blank"
    );
  }

  return (
    <div className="cliente-ficha printable-cuenta-cliente">
      <header className="print-header">
        <div className="print-identidad">
          <div className="print-logo">
            {negocio?.logo ? (
              <img
                src={negocio.logo}
                alt={`Logo de ${nombreNegocio}`}
              />
            ) : (
              <span>👕</span>
            )}
          </div>

          <div>
            <div className="print-brand">
              {nombreNegocio.toUpperCase()}
            </div>

            <p>
              Cuenta corriente del cliente
            </p>

            {negocio?.telefono && (
              <p>
                Teléfono:{" "}
                {negocio.telefono}
              </p>
            )}

            {negocio?.ciudad && (
              <p>
                Ciudad:{" "}
                {negocio.ciudad}
              </p>
            )}

            {negocio?.instagram && (
              <p>
                {negocio.instagram}
              </p>
            )}
          </div>
        </div>

        <div className="print-date">
          Emitido:{" "}
          {new Date()
            .toLocaleDateString(
              "es-AR"
            )}
        </div>
      </header>

      <section
        className={
          saldo > 0
            ? "cliente-estado deuda"
            : "cliente-estado al-dia"
        }
      >
        <div>
          <span>
            {saldo > 0
              ? "🔴 SALDO PENDIENTE"
              : "🟢 CLIENTE AL DÍA"}
          </span>

          <strong>
            {moneda(saldo)}
          </strong>
        </div>

        <small>
          {saldo > 0
            ? "Este cliente todavía tiene saldo por pagar."
            : "No registra deuda pendiente."}
        </small>
      </section>

      <section className="cliente-encabezado">
        <div className="cliente-avatar">
          {cliente.nombre
            ?.trim()
            .charAt(0)
            .toUpperCase() || "C"}
        </div>

        <div className="cliente-datos">
          <h2>
            {cliente.nombre}
          </h2>

          <p>
            <strong>
              📞 Teléfono:
            </strong>{" "}
            {cliente.telefono ||
              "-"}
          </p>

          <p>
            <strong>
              📍 Ciudad:
            </strong>{" "}
            {cliente.ciudad || "-"}
          </p>

          {cliente.observaciones && (
            <p>
              <strong>
                📝 Observaciones:
              </strong>{" "}
              {
                cliente.observaciones
              }
            </p>
          )}
        </div>

        <div className="cliente-acciones no-print">
          <button
            className="secondary"
            onClick={onEditar}
          >
            ✏️ Editar
          </button>

          <button
            className="primary"
            onClick={onNuevoPedido}
          >
            📦 Nuevo pedido
          </button>

          <button
            className="primary success"
            onClick={onNuevoPago}
          >
            💵 Registrar pago
          </button>

          <button
            className="whatsapp-button"
            onClick={abrirWhatsApp}
          >
            🟢 WhatsApp
          </button>

          <button
            className="secondary"
            onClick={
              copiarTelefono
            }
          >
            📱 Copiar teléfono
          </button>

          <button
            className="secondary"
            onClick={
              copiarResumen
            }
          >
            📋 Copiar resumen
          </button>

          <button
            className="secondary"
            onClick={imprimir}
          >
            🖨️ Imprimir / PDF
          </button>
        </div>
      </section>

      <section className="cliente-resumen">
        <article>
          <span>🛒</span>

          <small>
            Total comprado
          </small>

          <strong>
            {moneda(
              totalComprado
            )}
          </strong>
        </article>

        <article>
          <span>💵</span>

          <small>
            Total pagado
          </small>

          <strong>
            {moneda(
              totalPagado
            )}
          </strong>
        </article>

        <article>
          <span>📦</span>

          <small>
            Cantidad de compras
          </small>

          <strong>
            {compras.length}
          </strong>
        </article>

        <article>
          <span>✅</span>

          <small>
            Cantidad de pagos
          </small>

          <strong>
            {cobros.length}
          </strong>
        </article>
      </section>

      <section className="cliente-ultimos">
        <article>
          <span>
            🛒 Última compra
          </span>

          <strong>
            {fechaCorta(
              ultimaCompra
            )}
          </strong>

          <small>
            {textoTiempo(
              ultimaCompra
            )}
          </small>
        </article>

        <article>
          <span>
            💵 Último pago
          </span>

          <strong>
            {fechaCorta(
              ultimoPago
            )}
          </strong>

          <small>
            {textoTiempo(
              ultimoPago
            )}
          </small>
        </article>
      </section>

      <section className="historial-seccion no-print">
        <div className="historial-titulo">
          <div>
            <h3>
              Historial completo
            </h3>

            <p>
              Compras y pagos ordenados
              desde el más reciente.
            </p>
          </div>

          <span>
            {movimientos.length}{" "}
            movimiento(s)
          </span>
        </div>

        {movimientos.length ===
        0 ? (
          <div className="historial-vacio">
            <span>📭</span>

            <p>
              No tiene movimientos
              registrados.
            </p>
          </div>
        ) : (
          <div className="historial-lista">
            {movimientos.map(
              (movimiento) => (
                <article
                  className={`historial-item ${movimiento.clase}`}
                  key={
                    movimiento.id
                  }
                >
                  <div className="historial-icono">
                    {
                      movimiento.icono
                    }
                  </div>

                  <div className="historial-contenido">
                    <div>
                      <strong>
                        {
                          movimiento.tipo
                        }
                      </strong>

                      <span>
                        {fechaCorta(
                          movimiento.fecha
                        )}
                      </span>
                    </div>

                    <p>
                      {
                        movimiento.estado
                      }
                    </p>

                    {movimiento.observaciones && (
                      <small>
                        {
                          movimiento
                            .observaciones
                        }
                      </small>
                    )}
                  </div>

                  <div className="historial-monto">
                    {movimiento.clase ===
                    "pago"
                      ? `-${moneda(
                          movimiento.monto
                        )}`
                      : moneda(
                          movimiento.monto
                        )}
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>

      <footer className="print-footer">
        <strong>
          Saldo pendiente:{" "}
          {moneda(saldo)}
        </strong>

        <span>
          {negocio
            ?.mensajeComprobante ||
            "Gracias por elegirnos."}
        </span>
      </footer>
    </div>
  );
}
