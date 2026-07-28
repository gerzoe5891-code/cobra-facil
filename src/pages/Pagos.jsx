import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Modal from "../components/Modal";

import {
  fechaCorta,
  moneda,
} from "../utils/formatos";

import "../styles/Pagos.css";

const crearVacio = (clienteId = "") => ({
  clienteId,
  fecha: new Date()
    .toISOString()
    .slice(0, 10),
  monto: "",
  metodo: "Efectivo",
  observaciones: "",
});

export default function Pagos({
  clientes,
  pagos,
  setPagos,
  pedidos,
  clienteInicial,
  limpiarClienteInicial,
}) {
  const [formulario, setFormulario] =
    useState(null);

  const [buscar, setBuscar] = useState("");

  const nombre = (id) =>
    clientes.find(
      (cliente) => cliente.id === id
    )?.nombre || "Cliente eliminado";

  useEffect(() => {
    if (clienteInicial) {
      setFormulario(
        crearVacio(clienteInicial)
      );

      limpiarClienteInicial();
    }
  }, [
    clienteInicial,
    limpiarClienteInicial,
  ]);

  function saldoCliente(id) {
    const vendido = pedidos
      .filter(
        (pedido) =>
          pedido.clienteId === id
      )
      .reduce(
        (suma, pedido) =>
          suma + Number(pedido.total || 0),
        0
      );

    const cobrado = pagos
      .filter(
        (pago) =>
          pago.clienteId === id
      )
      .reduce(
        (suma, pago) =>
          suma + Number(pago.monto || 0),
        0
      );

    return Math.max(
      0,
      vendido - cobrado
    );
  }

  const resumen = useMemo(() => {
    const totalCobrado = pagos.reduce(
      (suma, pago) =>
        suma + Number(pago.monto || 0),
      0
    );

    const efectivo = pagos
      .filter(
        (pago) =>
          pago.metodo === "Efectivo"
      )
      .reduce(
        (suma, pago) =>
          suma + Number(pago.monto || 0),
        0
      );

    const digitales = pagos
      .filter(
        (pago) =>
          pago.metodo !== "Efectivo"
      )
      .reduce(
        (suma, pago) =>
          suma + Number(pago.monto || 0),
        0
      );

    return {
      cantidad: pagos.length,
      totalCobrado,
      efectivo,
      digitales,
    };
  }, [pagos]);

  const filtrados = pagos.filter((pago) =>
    nombre(pago.clienteId)
      .toLowerCase()
      .includes(buscar.toLowerCase())
  );

  function guardar(evento) {
    evento.preventDefault();

    if (!formulario.clienteId) {
      alert("Seleccioná un cliente.");
      return;
    }

    if (Number(formulario.monto) <= 0) {
      alert("Ingresá un monto válido.");
      return;
    }

    if (formulario.id) {
      setPagos((actuales) =>
        actuales.map((pago) =>
          pago.id === formulario.id
            ? formulario
            : pago
        )
      );
    } else {
      setPagos((actuales) => [
        ...actuales,
        {
          ...formulario,
          id: crypto.randomUUID(),
        },
      ]);
    }

    setFormulario(null);
  }

  function eliminarPago(pago) {
    const confirmar = confirm(
      `¿Eliminar el pago de ${nombre(
        pago.clienteId
      )} por ${moneda(pago.monto)}?`
    );

    if (!confirmar) {
      return;
    }

    setPagos((actuales) =>
      actuales.filter(
        (actual) =>
          actual.id !== pago.id
      )
    );
  }

  return (
    <section className="pagos-page">
      <div className="page-heading split">
        <div>
          <p className="eyebrow">
            Cobranzas
          </p>

          <h1>Pagos</h1>

          <p>
            Registrá entregas parciales o
            cancelaciones.
          </p>
        </div>

        <button
          className="primary success"
          onClick={() =>
            setFormulario(crearVacio())
          }
        >
          ➕ Registrar pago
        </button>
      </div>

      <div className="pagos-resumen">
        <article>
          <span>💵</span>

          <div>
            <small>
              Pagos registrados
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
          <span>💵</span>

          <div>
            <small>
              En efectivo
            </small>

            <strong>
              {moneda(
                resumen.efectivo
              )}
            </strong>
          </div>
        </article>

        <article>
          <span>📲</span>

          <div>
            <small>
              Otros medios
            </small>

            <strong>
              {moneda(
                resumen.digitales
              )}
            </strong>
          </div>
        </article>
      </div>

      <div className="panel pagos-panel">
        <div className="toolbar">
          <input
            className="search"
            value={buscar}
            onChange={(evento) =>
              setBuscar(
                evento.target.value
              )
            }
            placeholder="🔍 Buscar por cliente"
          />

          <span className="pagos-contador">
            {filtrados.length} pago(s)
          </span>
        </div>

        {filtrados.length === 0 ? (
          <div className="empty">
            <div>💵</div>

            <h3>No hay pagos</h3>

            <p>
              Registrá un pago para
              comenzar.
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
                  <th>Método</th>
                  <th>
                    Observaciones
                  </th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {[...filtrados]
                  .reverse()
                  .map((pago) => (
                    <tr key={pago.id}>
                      <td>
                        {fechaCorta(
                          pago.fecha
                        )}
                      </td>

                      <td>
                        <strong>
                          {nombre(
                            pago.clienteId
                          )}
                        </strong>
                      </td>

                      <td className="pago-monto">
                        {moneda(
                          pago.monto
                        )}
                      </td>

                      <td>
                        <span className="pago-metodo">
                          {pago.metodo}
                        </span>
                      </td>

                      <td>
                        {pago.observaciones ||
                          "-"}
                      </td>

                      <td className="actions">
                        <button
                          onClick={() =>
                            setFormulario({
                              ...pago,
                            })
                          }
                          title="Editar pago"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() =>
                            eliminarPago(pago)
                          }
                          title="Eliminar pago"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formulario && (
        <Modal
          titulo={
            formulario.id
              ? "Editar pago"
              : "Registrar pago"
          }
          onCerrar={() =>
            setFormulario(null)
          }
        >
          <form
            onSubmit={guardar}
            className="form-grid"
          >
            <label>
              Cliente *

              <select
                value={
                  formulario.clienteId
                }
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    clienteId:
                      evento.target
                        .value,
                  })
                }
              >
                <option value="">
                  Seleccionar...
                </option>

                {clientes.map(
                  (cliente) => (
                    <option
                      key={cliente.id}
                      value={cliente.id}
                    >
                      {cliente.nombre}
                      {" — Debe "}
                      {moneda(
                        saldoCliente(
                          cliente.id
                        )
                      )}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              Fecha

              <input
                type="date"
                value={
                  formulario.fecha
                }
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    fecha:
                      evento.target
                        .value,
                  })
                }
              />
            </label>

            <label>
              Monto *

              <input
                type="number"
                min="1"
                value={
                  formulario.monto
                }
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    monto:
                      evento.target
                        .value,
                  })
                }
              />
            </label>

            <label>
              Forma de pago

              <select
                value={
                  formulario.metodo
                }
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    metodo:
                      evento.target
                        .value,
                  })
                }
              >
                <option>
                  Efectivo
                </option>

                <option>
                  Transferencia
                </option>

                <option>
                  Mercado Pago
                </option>

                <option>
                  Tarjeta
                </option>

                <option>
                  Otro
                </option>
              </select>
            </label>

            <label className="full">
              Observaciones

              <textarea
                rows="2"
                value={
                  formulario
                    .observaciones
                }
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    observaciones:
                      evento.target
                        .value,
                  })
                }
              />
            </label>

            <div className="form-actions full">
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  setFormulario(null)
                }
              >
                Cancelar
              </button>

              <button className="primary success">
                💾 Guardar pago
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}