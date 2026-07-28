import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Modal from "../components/Modal";
import ComprobantePedido from "../components/ComprobantePedido";

import {
  fechaCorta,
  moneda,
} from "../utils/formatos";

import "../styles/Pedidos.css";

const crearVacio = (clienteId = "") => ({
  clienteId,
  fecha: new Date()
    .toISOString()
    .slice(0, 10),
  total: "",
  estado: "Pendiente",
  observaciones: "",
});

export default function Pedidos({
  clientes,
  pedidos,
  setPedidos,
  pagos,
  negocio,
  clienteInicial,
  limpiarClienteInicial,
}) {
  const [formulario, setFormulario] =
    useState(null);

  const [buscar, setBuscar] = useState("");

  const [comprobante, setComprobante] =
    useState(null);

  const nombre = (id) =>
    clientes.find(
      (cliente) => cliente.id === id
    )?.nombre || "Cliente eliminado";

  const obtenerCliente = (id) =>
    clientes.find(
      (cliente) => cliente.id === id
    );

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

  const resumen = useMemo(() => {
    const pendientes = pedidos.filter(
      (pedido) =>
        pedido.estado === "Pendiente"
    ).length;

    const entregados = pedidos.filter(
      (pedido) =>
        pedido.estado === "Entregado"
    ).length;

    const totalVendido = pedidos.reduce(
      (suma, pedido) =>
        suma + Number(pedido.total || 0),
      0
    );

    return {
      total: pedidos.length,
      pendientes,
      entregados,
      totalVendido,
    };
  }, [pedidos]);

  const filtrados = pedidos.filter(
    (pedido) =>
      nombre(pedido.clienteId)
        .toLowerCase()
        .includes(buscar.toLowerCase())
  );

  function guardar(evento) {
    evento.preventDefault();

    if (!formulario.clienteId) {
      alert("Seleccioná un cliente.");
      return;
    }

    if (Number(formulario.total) <= 0) {
      alert("Ingresá un monto válido.");
      return;
    }

    if (formulario.id) {
      setPedidos((actuales) =>
        actuales.map((pedido) =>
          pedido.id === formulario.id
            ? formulario
            : pedido
        )
      );
    } else {
      setPedidos((actuales) => [
        ...actuales,
        {
          ...formulario,
          id: crypto.randomUUID(),
        },
      ]);
    }

    setFormulario(null);
  }

  function cambiarEstado(pedidoId) {
    setPedidos((actuales) =>
      actuales.map((pedido) =>
        pedido.id === pedidoId
          ? {
              ...pedido,
              estado:
                pedido.estado === "Entregado"
                  ? "Pendiente"
                  : "Entregado",
            }
          : pedido
      )
    );
  }

  function eliminarPedido(pedido) {
    const confirmar = confirm(
      `¿Seguro que querés eliminar el pedido de ${nombre(
        pedido.clienteId
      )} por ${moneda(pedido.total)}?`
    );

    if (!confirmar) {
      return;
    }

    setPedidos((actuales) =>
      actuales.filter(
        (actual) =>
          actual.id !== pedido.id
      )
    );
  }

  return (
    <section className="pedidos-page">
      <div className="page-heading split">
        <div>
          <p className="eyebrow">
            Ventas
          </p>

          <h1>Pedidos</h1>

          <p>
            Cliente, fecha, monto total y
            estado.
          </p>
        </div>

        <button
          className="primary"
          onClick={() =>
            setFormulario(crearVacio())
          }
        >
          ➕ Nuevo pedido
        </button>
      </div>

      <div className="pedidos-resumen">
        <article>
          <span>📦</span>

          <div>
            <small>
              Pedidos
            </small>

            <strong>
              {resumen.total}
            </strong>
          </div>
        </article>

        <article>
          <span>🟡</span>

          <div>
            <small>
              Pendientes
            </small>

            <strong>
              {resumen.pendientes}
            </strong>
          </div>
        </article>

        <article>
          <span>🟢</span>

          <div>
            <small>
              Entregados
            </small>

            <strong>
              {resumen.entregados}
            </strong>
          </div>
        </article>

        <article>
          <span>💰</span>

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
      </div>

      <div className="panel pedidos-panel">
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

          <span className="pedidos-contador">
            {filtrados.length} pedido(s)
          </span>
        </div>

        {filtrados.length === 0 ? (
          <div className="empty">
            <div>📦</div>

            <h3>
              No hay pedidos
            </h3>

            <p>
              Registrá un pedido para
              comenzar.
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>
                    Observaciones
                  </th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {[...filtrados]
                  .reverse()
                  .map((pedido) => (
                    <tr key={pedido.id}>
                      <td>
                        <strong>
                          {nombre(
                            pedido.clienteId
                          )}
                        </strong>
                      </td>

                      <td>
                        {fechaCorta(
                          pedido.fecha
                        )}
                      </td>

                      <td className="pedido-monto">
                        {moneda(
                          pedido.total
                        )}
                      </td>

                      <td>
                        <button
                          className={
                            pedido.estado ===
                            "Entregado"
                              ? "status-button delivered"
                              : "status-button pending"
                          }
                          onClick={() =>
                            cambiarEstado(
                              pedido.id
                            )
                          }
                          title="Cambiar estado"
                        >
                          {pedido.estado ===
                          "Entregado"
                            ? "🟢 Entregado"
                            : "🟡 Pendiente"}
                        </button>
                      </td>

                      <td>
                        {pedido
                          .observaciones ||
                          "-"}
                      </td>

                      <td className="actions">
                        <button
                          onClick={() =>
                            setComprobante(
                              pedido
                            )
                          }
                          title="Ver comprobante"
                        >
                          🧾
                        </button>

                        <button
                          onClick={() =>
                            setFormulario({
                              ...pedido,
                            })
                          }
                          title="Editar pedido"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() =>
                            eliminarPedido(
                              pedido
                            )
                          }
                          title="Eliminar pedido"
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
              ? "Editar pedido"
              : "Nuevo pedido"
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
              Monto total *

              <input
                type="number"
                min="1"
                value={
                  formulario.total
                }
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    total:
                      evento.target
                        .value,
                  })
                }
              />
            </label>

            <label>
              Estado

              <select
                value={
                  formulario.estado
                }
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    estado:
                      evento.target
                        .value,
                  })
                }
              >
                <option>
                  Pendiente
                </option>

                <option>
                  Entregado
                </option>
              </select>
            </label>

            <label className="full">
              Observaciones

              <textarea
                rows="3"
                placeholder="Ej.: Entrega el viernes, paga la semana que viene..."
                value={
                  formulario
                    .observaciones ||
                  ""
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

              <button className="primary">
                💾 Guardar pedido
              </button>
            </div>
          </form>
        </Modal>
      )}

      {comprobante &&
        obtenerCliente(
          comprobante.clienteId
        ) && (
          <Modal
            titulo="Comprobante de compra"
            onCerrar={() =>
              setComprobante(null)
            }
            ancho={820}
          >
            <ComprobantePedido
              pedido={comprobante}
              cliente={obtenerCliente(
                comprobante.clienteId
              )}
              pedidos={pedidos}
              pagos={pagos}
              negocio={negocio}
            />
          </Modal>
        )}
    </section>
  );
}