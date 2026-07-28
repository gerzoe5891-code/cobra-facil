import { fechaCorta, moneda } from "../utils/formatos";
import { imprimirElemento } from "../utils/imprimirElemento";
import "../styles/ComprobantePedido.css";

function numeroComprobante(pedido) {
  const corto = String(pedido.id || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-6)
    .toUpperCase();
  return corto || "000001";
}

export default function ComprobantePedido({ pedido, cliente, pedidos, pagos, negocio }) {
  const pedidosCliente = pedidos.filter((actual) => actual.clienteId === cliente.id);
  const pagosCliente = pagos.filter((actual) => actual.clienteId === cliente.id);

  const totalComprado = pedidosCliente.reduce(
    (suma, actual) => suma + Number(actual.total || 0),
    0
  );

  const totalPagado = pagosCliente.reduce(
    (suma, actual) => suma + Number(actual.monto || 0),
    0
  );

  const saldoActual = Math.max(0, totalComprado - totalPagado);
  const nombreNegocio = negocio?.nombre || "Tu Propio Estilo";

  function imprimir() {
    imprimirElemento({
      selector: ".printable-comprobante",
      titulo: `Comprobante-${cliente.nombre}`,
    });
  }

  function abrirWhatsApp() {
    const telefono = (cliente.telefono || "").replace(/\D/g, "");
    if (!telefono) return alert("Este cliente no tiene teléfono cargado.");

    const mensaje = [
      `Hola ${cliente.nombre}.`,
      "",
      `Te enviamos el comprobante de tu compra en ${nombreNegocio}.`,
      `Comprobante: ${numeroComprobante(pedido)}`,
      `Fecha: ${fechaCorta(pedido.fecha)}`,
      `Monto de la compra: ${moneda(pedido.total)}`,
      `Estado del pedido: ${pedido.estado}`,
      "",
      `Saldo actual de la cuenta: ${moneda(saldoActual)}`,
      "",
      negocio?.mensajeComprobante || "Gracias por elegirnos.",
    ].join("\n");

    window.open(
      `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );
  }

  return (
    <div className="comprobante-pedido printable-comprobante">
      <header className="comprobante-encabezado">
        <div className="comprobante-identidad">
          <div className="comprobante-logo">
            {negocio?.logo ? (
              <img src={negocio.logo} alt={`Logo de ${nombreNegocio}`} />
            ) : (
              <span>👕</span>
            )}
          </div>

          <div className="comprobante-negocio">
            <div className="comprobante-marca">{nombreNegocio.toUpperCase()}</div>
            <p>Comprobante de compra</p>
            {negocio?.telefono && <small>Teléfono: {negocio.telefono}</small>}
            {negocio?.ciudad && <small>Ciudad: {negocio.ciudad}</small>}
            {negocio?.instagram && <small>{negocio.instagram}</small>}
          </div>
        </div>

        <div className="comprobante-numero">
          <span>Comprobante</span>
          <strong>N.º {numeroComprobante(pedido)}</strong>
          <small>{fechaCorta(pedido.fecha)}</small>
        </div>
      </header>

      <section className="comprobante-cliente">
        <h3>Cliente</h3>
        <div className="comprobante-datos-grid">
          <p><span>Nombre</span><strong>{cliente.nombre}</strong></p>
          <p><span>Teléfono</span><strong>{cliente.telefono || "-"}</strong></p>
          <p><span>Ciudad</span><strong>{cliente.ciudad || "-"}</strong></p>
        </div>
      </section>

      <section className="comprobante-compra">
        <div className="comprobante-fila">
          <div>
            <span>Compra registrada</span>
            <small>{pedido.observaciones || "Sin observaciones"}</small>
          </div>
          <strong>{moneda(pedido.total)}</strong>
        </div>
        <div className="comprobante-estado">
          <span>Estado del pedido</span>
          <strong>{pedido.estado}</strong>
        </div>
      </section>

      <section className="comprobante-cuenta">
        <h3>Estado actual de la cuenta</h3>
        <div className="comprobante-resumen">
          <article><small>Total comprado</small><strong>{moneda(totalComprado)}</strong></article>
          <article><small>Total pagado</small><strong className="positivo">{moneda(totalPagado)}</strong></article>
          <article>
            <small>Saldo pendiente</small>
            <strong className={saldoActual > 0 ? "pendiente" : "positivo"}>
              {moneda(saldoActual)}
            </strong>
          </article>
        </div>
      </section>

      <footer className="comprobante-pie">
        <span>{negocio?.mensajeComprobante || "Gracias por elegirnos."}</span>
        <small>Este comprobante no reemplaza una factura fiscal.</small>
      </footer>

      <div className="comprobante-acciones no-print">
        <button className="secondary" onClick={imprimir}>🖨️ Imprimir / Guardar PDF</button>
        <button className="whatsapp-button" onClick={abrirWhatsApp}>🟢 Enviar resumen por WhatsApp</button>
      </div>
    </div>
  );
}
