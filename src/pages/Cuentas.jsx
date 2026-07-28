import { useMemo, useState } from "react";

import {
  fechaCorta,
  moneda,
} from "../utils/formatos";

import "../styles/Cuentas.css";

export default function Cuentas({
  clientes,
  pedidos,
  pagos,
}) {
  const [buscar, setBuscar] = useState("");

  const filas = useMemo(
    () =>
      clientes.map((cliente) => {
        const compras = pedidos.filter(
          (pedido) =>
            pedido.clienteId === cliente.id
        );

        const cobros = pagos.filter(
          (pago) =>
            pago.clienteId === cliente.id
        );

        const vendido = compras.reduce(
          (suma, pedido) =>
            suma +
            Number(pedido.total || 0),
          0
        );

        const cobrado = cobros.reduce(
          (suma, pago) =>
            suma +
            Number(pago.monto || 0),
          0
        );

        const ultimaCompra = compras
          .map((pedido) => pedido.fecha)
          .sort()
          .at(-1);

        const ultimoPago = cobros
          .map((pago) => pago.fecha)
          .sort()
          .at(-1);

        return {
          ...cliente,
          vendido,
          cobrado,
          saldo: Math.max(
            0,
            vendido - cobrado
          ),
          ultimaCompra,
          ultimoPago,
        };
      }),
    [clientes, pedidos, pagos]
  );

  const resumen = useMemo(() => {
    const totalVendido = filas.reduce(
      (suma, cliente) =>
        suma + cliente.vendido,
      0
    );

    const totalCobrado = filas.reduce(
      (suma, cliente) =>
        suma + cliente.cobrado,
      0
    );

    const saldoTotal = filas.reduce(
      (suma, cliente) =>
        suma + cliente.saldo,
      0
    );

    const clientesConDeuda =
      filas.filter(
        (cliente) =>
          cliente.saldo > 0
      ).length;

    return {
      totalVendido,
      totalCobrado,
      saldoTotal,
      clientesConDeuda,
    };
  }, [filas]);

  const filtrados = filas.filter(
    (cliente) =>
      `${cliente.nombre} ${
        cliente.telefono || ""
      } ${cliente.ciudad || ""}`
        .toLowerCase()
        .includes(
          buscar.toLowerCase()
        )
  );

  return (
    <section className="cuentas-page">
      <div className="page-heading">
        <p className="eyebrow">
          Resumen financiero
        </p>

        <h1>Cuenta corriente</h1>

        <p>
          Consultá lo vendido, cobrado
          y pendiente por cliente.
        </p>
      </div>

      <div className="cuentas-resumen">
        <article>
          <span>🛒</span>

          <div>
            <small>
              Total vendido
            </small>

            <strong>
              {moneda(
                resumen.totalVendido
              )}
            </strong>
          </div>
        </article>

        <article>
          <span>💵</span>

          <div>
            <small>
              Total cobrado
            </small>

            <strong>
              {moneda(
                resumen.totalCobrado
              )}
            </strong>
          </div>
        </article>

        <article>
          <span>💰</span>

          <div>
            <small>
              Saldo pendiente
            </small>

            <strong>
              {moneda(
                resumen.saldoTotal
              )}
            </strong>
          </div>
        </article>

        <article>
          <span>🔴</span>

          <div>
            <small>
              Clientes con deuda
            </small>

            <strong>
              {
                resumen
                  .clientesConDeuda
              }
            </strong>
          </div>
        </article>
      </div>

      <div className="panel cuentas-panel">
        <div className="toolbar">
          <input
            className="search"
            value={buscar}
            onChange={(evento) =>
              setBuscar(
                evento.target.value
              )
            }
            placeholder="🔍 Buscar por cliente, teléfono o ciudad"
          />

          <span className="cuentas-contador">
            {filtrados.length} cliente(s)
          </span>
        </div>

        {filtrados.length === 0 ? (
          <div className="empty">
            <div>📒</div>

            <h3>
              No hay cuentas para mostrar
            </h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>
                    Total vendido
                  </th>
                  <th>
                    Cobrado total
                  </th>
                  <th>
                    Saldo pendiente
                  </th>
                  <th>
                    Última compra
                  </th>
                  <th>
                    Último pago
                  </th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {filtrados.map(
                  (cliente) => (
                    <tr key={cliente.id}>
                      <td>
                        <strong>
                          {cliente.nombre}
                        </strong>

                        {cliente.ciudad && (
                          <small>
                            {cliente.ciudad}
                          </small>
                        )}
                      </td>

                      <td>
                        {moneda(
                          cliente.vendido
                        )}
                      </td>

                      <td className="amount-success">
                        {moneda(
                          cliente.cobrado
                        )}
                      </td>

                      <td
                        className={
                          cliente.saldo > 0
                            ? "amount-danger"
                            : "amount-success"
                        }
                      >
                        {moneda(
                          cliente.saldo
                        )}
                      </td>

                      <td>
                        {fechaCorta(
                          cliente.ultimaCompra
                        )}
                      </td>

                      <td>
                        {fechaCorta(
                          cliente.ultimoPago
                        )}
                      </td>

                      <td>
                        {cliente.saldo >
                        0 ? (
                          <span className="badge cancelado">
                            🔴 Debe{" "}
                            {moneda(
                              cliente.saldo
                            )}
                          </span>
                        ) : (
                          <span className="badge entregado">
                            🟢 Al día
                          </span>
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
    </section>
  );
}