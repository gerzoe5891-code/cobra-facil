import {
  useMemo,
  useState,
} from "react";

import {
  diasDesde,
  fechaCorta,
  moneda,
} from "../utils/formatos";

import "../styles/Morosos.css";

export default function Morosos({
  clientes,
  pedidos,
  pagos,
}) {
  const [buscar, setBuscar] = useState("");

  const filas = useMemo(() => {
    return clientes
      .map((cliente) => {
        const ventas = pedidos.filter(
          (pedido) =>
            pedido.clienteId === cliente.id
        );

        const cobros = pagos.filter(
          (pago) =>
            pago.clienteId === cliente.id
        );

        const vendido = ventas.reduce(
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

        const ultimoPago = cobros
          .map((pago) => pago.fecha)
          .sort()
          .at(-1);

        const primeraVenta = ventas
          .map((pedido) => pedido.fecha)
          .sort()[0];

        const referencia =
          ultimoPago || primeraVenta;

        return {
          ...cliente,
          saldo: Math.max(
            0,
            vendido - cobrado
          ),
          ultimoPago,
          dias: diasDesde(referencia),
        };
      })
      .filter(
        (cliente) =>
          cliente.saldo > 0 &&
          cliente.dias > 30
      )
      .sort(
        (a, b) =>
          b.dias - a.dias
      );
  }, [clientes, pedidos, pagos]);

  const resumen = useMemo(() => {
    const deudaTotal = filas.reduce(
      (suma, cliente) =>
        suma + cliente.saldo,
      0
    );

    const promedioDias =
      filas.length > 0
        ? Math.round(
            filas.reduce(
              (suma, cliente) =>
                suma + cliente.dias,
              0
            ) / filas.length
          )
        : 0;

    const mayorDeuda =
      filas.length > 0
        ? Math.max(
            ...filas.map(
              (cliente) =>
                cliente.saldo
            )
          )
        : 0;

    return {
      cantidad: filas.length,
      deudaTotal,
      promedioDias,
      mayorDeuda,
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

  function claseAtraso(dias) {
    if (dias >= 90) {
      return "moroso-critico";
    }

    if (dias >= 60) {
      return "moroso-alto";
    }

    return "moroso-medio";
  }

  return (
    <section className="morosos-page">
      <div className="page-heading">
        <p className="eyebrow">
          Alertas
        </p>

        <h1>Morosos</h1>

        <p>
          Clientes con saldo pendiente y
          más de 30 días sin registrar pagos.
        </p>
      </div>

      <div className="morosos-resumen">
        <article>
          <span>🚨</span>

          <div>
            <small>
              Clientes morosos
            </small>

            <strong>
              {resumen.cantidad}
            </strong>
          </div>
        </article>

        <article>
          <span>💰</span>

          <div>
            <small>
              Deuda vencida
            </small>

            <strong>
              {moneda(
                resumen.deudaTotal
              )}
            </strong>
          </div>
        </article>

        <article>
          <span>📅</span>

          <div>
            <small>
              Promedio de atraso
            </small>

            <strong>
              {resumen.promedioDias} días
            </strong>
          </div>
        </article>

        <article>
          <span>⚠️</span>

          <div>
            <small>
              Mayor deuda
            </small>

            <strong>
              {moneda(
                resumen.mayorDeuda
              )}
            </strong>
          </div>
        </article>
      </div>

      <div className="panel morosos-panel">
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

          <span className="morosos-contador">
            {filtrados.length} moroso(s)
          </span>
        </div>

        {filtrados.length === 0 ? (
          <div className="empty">
            <div>✅</div>

            <h3>
              No hay morosos
            </h3>

            <p>
              No existen clientes con más
              de 30 días de atraso.
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Saldo</th>
                  <th>Último pago</th>
                  <th>Días sin pagar</th>
                  <th>Nivel</th>
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
                        {cliente.telefono ||
                          "-"}
                      </td>

                      <td className="amount-danger">
                        {moneda(
                          cliente.saldo
                        )}
                      </td>

                      <td>
                        {fechaCorta(
                          cliente.ultimoPago
                        )}
                      </td>

                      <td>
                        <span className="badge cancelado">
                          {cliente.dias} días
                        </span>
                      </td>

                      <td>
                        <span
                          className={`moroso-nivel ${claseAtraso(
                            cliente.dias
                          )}`}
                        >
                          {cliente.dias >= 90
                            ? "Crítico"
                            : cliente.dias >= 60
                            ? "Alto"
                            : "Atención"}
                        </span>
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