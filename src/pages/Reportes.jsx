import {
  useMemo,
  useState,
} from "react";

import {
  moneda,
  fechaCorta,
} from "../utils/formatos";

import "../styles/Reportes.css";

export default function Reportes({
  clientes,
  pedidos,
  pagos,
}) {
  const [desde, setDesde] =
    useState("");

  const [hasta, setHasta] =
    useState("");

  const enRango = (fecha) => {
    if (!fecha) {
      return false;
    }

    if (
      desde &&
      fecha < desde
    ) {
      return false;
    }

    if (
      hasta &&
      fecha > hasta
    ) {
      return false;
    }

    return true;
  };

  const pedidosFiltrados =
    useMemo(
      () =>
        pedidos.filter((pedido) =>
          enRango(pedido.fecha)
        ),
      [
        pedidos,
        desde,
        hasta,
      ]
    );

  const pagosFiltrados =
    useMemo(
      () =>
        pagos.filter((pago) =>
          enRango(pago.fecha)
        ),
      [
        pagos,
        desde,
        hasta,
      ]
    );

  const resumen = useMemo(() => {
    const vendido =
      pedidosFiltrados.reduce(
        (suma, pedido) =>
          suma +
          Number(pedido.total || 0),
        0
      );

    const cobrado =
      pagosFiltrados.reduce(
        (suma, pago) =>
          suma +
          Number(pago.monto || 0),
        0
      );

    const diferencia = Math.max(
      0,
      vendido - cobrado
    );

    return {
      vendido,
      cobrado,
      diferencia,
      cantidadVentas:
        pedidosFiltrados.length,
      cantidadPagos:
        pagosFiltrados.length,
    };
  }, [
    pedidosFiltrados,
    pagosFiltrados,
  ]);

  function limpiar() {
    setDesde("");
    setHasta("");
  }

  function nombreCliente(id) {
    return (
      clientes.find(
        (cliente) =>
          cliente.id === id
      )?.nombre ||
      "Cliente eliminado"
    );
  }

  return (
    <section className="reportes-page">
      <div className="page-heading">
        <p className="eyebrow">
          Estadísticas
        </p>

        <h1>Reportes</h1>

        <p>
          Filtrá ventas y cobranzas
          por fecha.
        </p>
      </div>

      <div className="panel reportes-filtros">
        <label>
          Desde

          <input
            type="date"
            value={desde}
            onChange={(evento) =>
              setDesde(
                evento.target.value
              )
            }
          />
        </label>

        <label>
          Hasta

          <input
            type="date"
            value={hasta}
            onChange={(evento) =>
              setHasta(
                evento.target.value
              )
            }
          />
        </label>

        <button
          className="secondary"
          onClick={limpiar}
        >
          Limpiar filtro
        </button>
      </div>

      <div className="reportes-resumen">
        <article>
          <span>🛒</span>

          <div>
            <small>
              Vendido
            </small>

            <strong>
              {moneda(
                resumen.vendido
              )}
            </strong>
          </div>
        </article>

        <article>
          <span>💵</span>

          <div>
            <small>
              Cobrado
            </small>

            <strong>
              {moneda(
                resumen.cobrado
              )}
            </strong>
          </div>
        </article>

        <article>
          <span>💰</span>

          <div>
            <small>
              Diferencia
            </small>

            <strong>
              {moneda(
                resumen.diferencia
              )}
            </strong>
          </div>
        </article>

        <article>
          <span>📊</span>

          <div>
            <small>
              Movimientos
            </small>

            <strong>
              {
                resumen.cantidadVentas +
                resumen.cantidadPagos
              }
            </strong>
          </div>
        </article>
      </div>

      <div className="report-grid reportes-grid">
        <div className="panel reportes-panel">
          <div className="panel-title">
            <h2>Ventas</h2>

            <p>
              {
                resumen.cantidadVentas
              }{" "}
              registro(s) en el período.
            </p>
          </div>

          {pedidosFiltrados.length ===
          0 ? (
            <div className="reportes-vacio">
              <span>📦</span>

              <p>
                Sin ventas en el
                período seleccionado.
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Monto</th>
                  </tr>
                </thead>

                <tbody>
                  {pedidosFiltrados.map(
                    (pedido) => (
                      <tr
                        key={pedido.id}
                      >
                        <td>
                          {fechaCorta(
                            pedido.fecha
                          )}
                        </td>

                        <td>
                          <strong>
                            {nombreCliente(
                              pedido.clienteId
                            )}
                          </strong>
                        </td>

                        <td className="reporte-venta">
                          {moneda(
                            pedido.total
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel reportes-panel">
          <div className="panel-title">
            <h2>Cobranzas</h2>

            <p>
              {
                resumen.cantidadPagos
              }{" "}
              registro(s) en el período.
            </p>
          </div>

          {pagosFiltrados.length ===
          0 ? (
            <div className="reportes-vacio">
              <span>💵</span>

              <p>
                Sin pagos en el
                período seleccionado.
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Monto</th>
                  </tr>
                </thead>

                <tbody>
                  {pagosFiltrados.map(
                    (pago) => (
                      <tr key={pago.id}>
                        <td>
                          {fechaCorta(
                            pago.fecha
                          )}
                        </td>

                        <td>
                          <strong>
                            {nombreCliente(
                              pago.clienteId
                            )}
                          </strong>
                        </td>

                        <td className="amount-success">
                          {moneda(
                            pago.monto
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}