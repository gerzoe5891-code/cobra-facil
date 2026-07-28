import { useMemo, useState } from "react";
import { fechaCorta, moneda } from "../utils/formatos";
import "../styles/Caja.css";

export default function Caja({ clientes, pedidos, pagos, negocio }) {
  const hoy = new Date().toISOString().slice(0, 10);
  const [fecha, setFecha] = useState(hoy);

  const nombreCliente = (id) =>
    clientes.find((cliente) => cliente.id === id)?.nombre ||
    "Cliente eliminado";

  const datos = useMemo(() => {
    const pedidosDia = pedidos.filter(
      (pedido) => pedido.fecha === fecha
    );

    const pagosDia = pagos.filter(
      (pago) => pago.fecha === fecha
    );

    const totalVendido = pedidosDia.reduce(
      (suma, pedido) => suma + Number(pedido.total || 0),
      0
    );

    const totalCobrado = pagosDia.reduce(
      (suma, pago) => suma + Number(pago.monto || 0),
      0
    );

    const porMetodo = pagosDia.reduce((acumulado, pago) => {
      const metodo = pago.metodo || "Otro";
      acumulado[metodo] =
        (acumulado[metodo] || 0) + Number(pago.monto || 0);
      return acumulado;
    }, {});

    const clientesAtendidos = new Set([
      ...pedidosDia.map((pedido) => pedido.clienteId),
      ...pagosDia.map((pago) => pago.clienteId),
    ]).size;

    const movimientos = [
      ...pedidosDia.map((pedido) => ({
        id: `pedido-${pedido.id}`,
        tipo: "Pedido",
        icono: "🛒",
        cliente: nombreCliente(pedido.clienteId),
        metodo: "-",
        monto: Number(pedido.total || 0),
        clase: "venta",
        detalle: pedido.estado,
      })),

      ...pagosDia.map((pago) => ({
        id: `pago-${pago.id}`,
        tipo: "Pago",
        icono: "💵",
        cliente: nombreCliente(pago.clienteId),
        metodo: pago.metodo || "Otro",
        monto: Number(pago.monto || 0),
        clase: "pago",
        detalle: pago.observaciones || "",
      })),
    ];

    return {
      pedidosDia,
      pagosDia,
      totalVendido,
      totalCobrado,
      saldoGenerado: Math.max(0, totalVendido - totalCobrado),
      porMetodo,
      clientesAtendidos,
      movimientos,
    };
  }, [fecha, pedidos, pagos, clientes]);

  function imprimirCierre() {
    window.print();
  }

  return (
    <section className="caja-page printable-caja">
      <div className="caja-print-header">
        <div>
          <h1>{negocio?.nombre || "Tu Propio Estilo"}</h1>
          <p>Cierre diario de caja</p>

          {negocio?.telefono && (
            <small>Teléfono: {negocio.telefono}</small>
          )}

          {negocio?.ciudad && (
            <small>Ciudad: {negocio.ciudad}</small>
          )}
        </div>

        <div>
          <strong>Fecha</strong>
          <p>{fechaCorta(fecha)}</p>
        </div>
      </div>

      <div className="page-heading split no-print">
        <div>
          <p className="eyebrow">Resumen financiero</p>
          <h1>Caja diaria</h1>
          <p>
            Consultá ventas, cobranzas y medios de pago por día.
          </p>
        </div>

        <button
          className="primary"
          onClick={imprimirCierre}
        >
          🖨️ Imprimir cierre
        </button>
      </div>

      <div className="panel caja-filtros no-print">
        <label>
          Fecha a consultar
          <input
            type="date"
            value={fecha}
            onChange={(evento) =>
              setFecha(evento.target.value)
            }
          />
        </label>

        <button
          className="secondary"
          onClick={() => setFecha(hoy)}
        >
          Ver hoy
        </button>
      </div>

      <div className="caja-resumen-grid">
        <article className="stat-card">
          <span>🛒</span>
          <div>
            <small>Vendido</small>
            <strong>{moneda(datos.totalVendido)}</strong>
          </div>
        </article>

        <article className="stat-card">
          <span>💵</span>
          <div>
            <small>Cobrado</small>
            <strong>{moneda(datos.totalCobrado)}</strong>
          </div>
        </article>

        <article className="stat-card danger">
          <span>💰</span>
          <div>
            <small>Saldo generado</small>
            <strong>{moneda(datos.saldoGenerado)}</strong>
          </div>
        </article>

        <article className="stat-card">
          <span>👥</span>
          <div>
            <small>Clientes atendidos</small>
            <strong>{datos.clientesAtendidos}</strong>
          </div>
        </article>
      </div>

      <div className="caja-dos-columnas">
        <div className="panel">
          <div className="panel-title">
            <h2>Ingresos por medio de pago</h2>
            <p>Detalle de lo cobrado durante el día.</p>
          </div>

          <div className="metodos-grid">
            {[
              "Efectivo",
              "Transferencia",
              "Mercado Pago",
              "Tarjeta",
              "Otro",
            ].map((metodo) => (
              <article className="metodo-card" key={metodo}>
                <span>{metodo}</span>
                <strong>
                  {moneda(datos.porMetodo[metodo] || 0)}
                </strong>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <h2>Actividad del día</h2>
            <p>Cantidad de registros cargados.</p>
          </div>

          <div className="actividad-grid">
            <article>
              <span>📦 Pedidos</span>
              <strong>{datos.pedidosDia.length}</strong>
            </article>

            <article>
              <span>💵 Pagos</span>
              <strong>{datos.pagosDia.length}</strong>
            </article>
          </div>
        </div>
      </div>

      <div className="panel caja-movimientos">
        <div className="panel-title">
          <h2>Movimientos del día</h2>
          <p>{fechaCorta(fecha)}</p>
        </div>

        {datos.movimientos.length === 0 ? (
          <div className="empty">
            <div>📭</div>
            <h3>No hay movimientos en esta fecha</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Cliente</th>
                  <th>Detalle</th>
                  <th>Medio de pago</th>
                  <th>Importe</th>
                </tr>
              </thead>

              <tbody>
                {datos.movimientos.map((movimiento) => (
                  <tr key={movimiento.id}>
                    <td>
                      {movimiento.icono} {movimiento.tipo}
                    </td>

                    <td>
                      <strong>{movimiento.cliente}</strong>
                    </td>

                    <td>{movimiento.detalle || "-"}</td>

                    <td>{movimiento.metodo}</td>

                    <td
                      className={
                        movimiento.clase === "pago"
                          ? "amount-success"
                          : ""
                      }
                    >
                      {moneda(movimiento.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <footer className="caja-print-footer">
        <strong>
          Saldo generado: {moneda(datos.saldoGenerado)}
        </strong>

        <span>
          {negocio?.mensajeComprobante ||
            "Gracias por elegirnos."}
        </span>
      </footer>
    </section>
  );
}
