import { useMemo, useState } from "react";
import Modal from "../components/Modal";
import ClienteDetalle from "../components/ClienteDetalle";
import { fechaCorta, moneda } from "../utils/formatos";
import "../styles/Clientes.css";

const vacio = {
  nombre: "",
  telefono: "",
  ciudad: "",
  observaciones: "",
};

export default function Clientes({
  clientes,
  setClientes,
  pedidos,
  pagos,
  negocio,
  onIrPedidos,
  onIrPagos,
}) {
  const [buscar, setBuscar] = useState("");
  const [formulario, setFormulario] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);

  const saldos = useMemo(() => {
    const mapa = {};

    clientes.forEach((cliente) => {
      mapa[cliente.id] = 0;
    });

    pedidos.forEach((pedido) => {
      mapa[pedido.clienteId] =
        (mapa[pedido.clienteId] || 0) +
        Number(pedido.total || 0);
    });

    pagos.forEach((pago) => {
      mapa[pago.clienteId] =
        (mapa[pago.clienteId] || 0) -
        Number(pago.monto || 0);
    });

    return mapa;
  }, [clientes, pedidos, pagos]);

  const resumen = useMemo(() => {
    const conDeuda = clientes.filter(
      (cliente) => Math.max(0, saldos[cliente.id] || 0) > 0
    ).length;

    const saldoTotal = clientes.reduce(
      (suma, cliente) =>
        suma + Math.max(0, saldos[cliente.id] || 0),
      0
    );

    return {
      total: clientes.length,
      alDia: clientes.length - conDeuda,
      conDeuda,
      saldoTotal,
    };
  }, [clientes, saldos]);

  const filtrados = clientes.filter((cliente) =>
    `${cliente.nombre} ${cliente.telefono} ${cliente.ciudad} ${cliente.observaciones}`
      .toLowerCase()
      .includes(buscar.toLowerCase())
  );

  function guardar(evento) {
    evento.preventDefault();

    if (!formulario.nombre.trim()) {
      alert("Ingresá el nombre del cliente.");
      return;
    }

    if (formulario.id) {
      setClientes((actuales) =>
        actuales.map((cliente) =>
          cliente.id === formulario.id
            ? formulario
            : cliente
        )
      );

      if (seleccionado?.id === formulario.id) {
        setSeleccionado(formulario);
      }
    } else {
      setClientes((actuales) => [
        ...actuales,
        {
          ...formulario,
          id: crypto.randomUUID(),
          fechaAlta: new Date()
            .toISOString()
            .slice(0, 10),
        },
      ]);
    }

    setFormulario(null);
  }

  function eliminar(cliente) {
    const tieneMovimientos =
      pedidos.some(
        (pedido) => pedido.clienteId === cliente.id
      ) ||
      pagos.some(
        (pago) => pago.clienteId === cliente.id
      );

    if (tieneMovimientos) {
      alert(
        "No se puede eliminar porque tiene pedidos o pagos registrados."
      );
      return;
    }

    if (
      confirm(
        `¿Seguro que querés eliminar a ${cliente.nombre}?`
      )
    ) {
      setClientes((actuales) =>
        actuales.filter(
          (actual) => actual.id !== cliente.id
        )
      );
    }
  }

  return (
    <section>
      <div className="page-heading split">
        <div>
          <p className="eyebrow">Administración</p>
          <h1>Clientes</h1>
          <p>
            Agregá, editá y consultá saldos e historial.
          </p>
        </div>

        <button
          className="primary"
          onClick={() => setFormulario({ ...vacio })}
        >
          ➕ Nuevo cliente
        </button>
      </div>

      <div className="clientes-resumen">
        <article>
          <span>👥</span>
          <div>
            <small>Clientes</small>
            <strong>{resumen.total}</strong>
          </div>
        </article>

        <article>
          <span>🟢</span>
          <div>
            <small>Al día</small>
            <strong>{resumen.alDia}</strong>
          </div>
        </article>

        <article>
          <span>🔴</span>
          <div>
            <small>Con deuda</small>
            <strong>{resumen.conDeuda}</strong>
          </div>
        </article>

        <article>
          <span>💰</span>
          <div>
            <small>Saldo total</small>
            <strong>{moneda(resumen.saldoTotal)}</strong>
          </div>
        </article>
      </div>

      <div className="panel">
        <div className="toolbar">
          <input
            className="search"
            value={buscar}
            onChange={(evento) =>
              setBuscar(evento.target.value)
            }
            placeholder="🔍 Buscar por nombre, teléfono, ciudad u observaciones"
          />

          <span>{filtrados.length} cliente(s)</span>
        </div>

        {filtrados.length === 0 ? (
          <div className="empty">
            <div>👥</div>
            <h3>No hay clientes</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Ciudad</th>
                  <th>Saldo</th>
                  <th>Estado</th>
                  <th>Alta</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filtrados.map((cliente) => {
                  const saldo = Math.max(
                    0,
                    saldos[cliente.id] || 0
                  );

                  return (
                    <tr key={cliente.id}>
                      <td>
                        <button
                          className="link-button"
                          onClick={() =>
                            setSeleccionado(cliente)
                          }
                        >
                          {cliente.nombre}
                        </button>

                        {cliente.observaciones && (
                          <small>{cliente.observaciones}</small>
                        )}
                      </td>

                      <td>{cliente.telefono || "-"}</td>
                      <td>{cliente.ciudad || "-"}</td>

                      <td
                        className={
                          saldo > 0
                            ? "amount-danger"
                            : "amount-success"
                        }
                      >
                        {moneda(saldo)}
                      </td>

                      <td>
                        {saldo > 0 ? (
                          <span className="badge cancelado">
                            🔴 Debe {moneda(saldo)}
                          </span>
                        ) : (
                          <span className="badge entregado">
                            🟢 Sin deuda
                          </span>
                        )}
                      </td>

                      <td>{fechaCorta(cliente.fechaAlta)}</td>

                      <td className="actions">
                        <button
                          onClick={() =>
                            setFormulario({ ...cliente })
                          }
                          title="Editar cliente"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() => eliminar(cliente)}
                          title="Eliminar cliente"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formulario && (
        <Modal
          titulo={
            formulario.id
              ? "Editar cliente"
              : "Nuevo cliente"
          }
          onCerrar={() => setFormulario(null)}
        >
          <form
            onSubmit={guardar}
            className="form-grid"
          >
            <label>
              Nombre completo *
              <input
                autoFocus
                value={formulario.nombre}
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    nombre: evento.target.value,
                  })
                }
              />
            </label>

            <label>
              Teléfono
              <input
                value={formulario.telefono}
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    telefono: evento.target.value,
                  })
                }
              />
            </label>

            <label>
              Ciudad
              <input
                value={formulario.ciudad}
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    ciudad: evento.target.value,
                  })
                }
              />
            </label>

            <label className="full">
              Observaciones
              <textarea
                rows="3"
                value={formulario.observaciones}
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    observaciones: evento.target.value,
                  })
                }
              />
            </label>

            <div className="form-actions full">
              <button
                type="button"
                className="secondary"
                onClick={() => setFormulario(null)}
              >
                Cancelar
              </button>

              <button className="primary">
                💾 Guardar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {seleccionado && (
        <Modal
          titulo={`Ficha de ${seleccionado.nombre}`}
          onCerrar={() => setSeleccionado(null)}
          ancho={1080}
        >
          <ClienteDetalle
            cliente={seleccionado}
            pedidos={pedidos}
            pagos={pagos}
            negocio={negocio}
            onEditar={() =>
              setFormulario({ ...seleccionado })
            }
            onNuevoPedido={() =>
              onIrPedidos(seleccionado.id)
            }
            onNuevoPago={() =>
              onIrPagos(seleccionado.id)
            }
          />
        </Modal>
      )}
    </section>
  );
}
