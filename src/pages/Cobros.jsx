import {
  useMemo,
  useState,
} from "react";

import Modal from "../components/Modal";

import {
  diasDesde,
  fechaCorta,
  moneda,
} from "../utils/formatos";

import "../styles/Cobros.css";

function crearPago(clienteId = "") {
  return {
    clienteId,
    fecha: new Date()
      .toISOString()
      .slice(0, 10),
    monto: "",
    metodo: "Efectivo",
    observaciones: "",
  };
}

export default function Cobros({
  clientes,
  pedidos,
  pagos,
  setPagos,
  negocio,
}) {
  const [filtro, setFiltro] =
    useState("todos");

  const [buscar, setBuscar] =
    useState("");

  const [
    formularioPago,
    setFormularioPago,
  ] = useState(null);

  const cuentas = useMemo(() => {
    return clientes.map((cliente) => {
      const compras = pedidos.filter(
        (pedido) =>
          pedido.clienteId === cliente.id
      );

      const cobros = pagos.filter(
        (pago) =>
          pago.clienteId === cliente.id
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

      const ultimoPago = cobros
        .map((pago) => pago.fecha)
        .sort()
        .at(-1);

      const primeraCompra = compras
        .map((pedido) => pedido.fecha)
        .sort()[0];

      const fechaReferencia =
        ultimoPago || primeraCompra;

      const diasSinPagar =
        fechaReferencia
          ? diasDesde(fechaReferencia)
          : 0;

      const saldo = Math.max(
        0,
        totalComprado - totalPagado
      );

      let prioridad = "aldia";
      let prioridadTexto = "Al día";

      if (
        saldo > 0 &&
        diasSinPagar > 30
      ) {
        prioridad = "urgente";
        prioridadTexto = "Urgente";
      } else if (
        saldo > 0 &&
        diasSinPagar >= 15
      ) {
        prioridad = "proximo";
        prioridadTexto =
          "Cobrar pronto";
      } else if (saldo > 0) {
        prioridad = "seguimiento";
        prioridadTexto = "Seguimiento";
      }

      return {
        ...cliente,
        saldo,
        totalComprado,
        totalPagado,
        ultimoPago,
        diasSinPagar,
        prioridad,
        prioridadTexto,
      };
    });
  }, [
    clientes,
    pedidos,
    pagos,
  ]);

  const resumen = useMemo(() => {
    const urgentes = cuentas.filter(
      (cliente) =>
        cliente.prioridad === "urgente"
    ).length;

    const proximos = cuentas.filter(
      (cliente) =>
        cliente.prioridad === "proximo"
    ).length;

    const seguimiento = cuentas.filter(
      (cliente) =>
        cliente.prioridad ===
        "seguimiento"
    ).length;

    const saldoTotal = cuentas.reduce(
      (suma, cliente) =>
        suma +
        Number(cliente.saldo || 0),
      0
    );

    return {
      urgentes,
      proximos,
      seguimiento,
      saldoTotal,
    };
  }, [cuentas]);

  const filtrados = cuentas
    .filter((cliente) => {
      const texto = `${
        cliente.nombre || ""
      } ${
        cliente.telefono || ""
      } ${
        cliente.ciudad || ""
      }`.toLowerCase();

      if (
        !texto.includes(
          buscar.toLowerCase()
        )
      ) {
        return false;
      }

      switch (filtro) {
        case "urgente":
          return (
            cliente.prioridad ===
            "urgente"
          );

        case "proximo":
          return (
            cliente.prioridad ===
            "proximo"
          );

        case "seguimiento":
          return (
            cliente.prioridad ===
            "seguimiento"
          );

        case "con-deuda":
          return cliente.saldo > 0;

        case "al-dia":
          return cliente.saldo === 0;

        default:
          return true;
      }
    })
    .sort((a, b) => {
      const orden = {
        urgente: 1,
        proximo: 2,
        seguimiento: 3,
        aldia: 4,
      };

      if (
        orden[a.prioridad] !==
        orden[b.prioridad]
      ) {
        return (
          orden[a.prioridad] -
          orden[b.prioridad]
        );
      }

      if (
        b.diasSinPagar !==
        a.diasSinPagar
      ) {
        return (
          b.diasSinPagar -
          a.diasSinPagar
        );
      }

      return b.saldo - a.saldo;
    });

  const cuentaPago = formularioPago
    ? cuentas.find(
        (cliente) =>
          cliente.id ===
          formularioPago.clienteId
      )
    : null;

  function abrirWhatsApp(cliente) {
    const telefono = (
      cliente.telefono || ""
    ).replace(/\D/g, "");

    if (!telefono) {
      alert(
        "Este cliente no tiene teléfono cargado."
      );
      return;
    }

    const nombreNegocio =
      negocio?.nombre ||
      "Cobra Fácil";

    const mensaje = [
      `Hola ${cliente.nombre} 👋`,
      "",
      `Te escribimos de ${nombreNegocio} para recordarte el estado de tu cuenta.`,
      `Saldo pendiente: ${moneda(
        cliente.saldo
      )}`,
      cliente.ultimoPago
        ? `Último pago: ${fechaCorta(
            cliente.ultimoPago
          )}`
        : "Todavía no registra pagos.",
      "",
      negocio?.mensajeComprobante ||
        "Muchas gracias.",
    ].join("\n");

    window.open(
      `https://wa.me/${telefono}?text=${encodeURIComponent(
        mensaje
      )}`,
      "_blank"
    );
  }

  function guardarPago(evento) {
    evento.preventDefault();

    if (
      !formularioPago?.clienteId
    ) {
      alert(
        "Seleccioná un cliente."
      );
      return;
    }

    const monto = Number(
      formularioPago.monto
    );

    if (
      !Number.isFinite(monto) ||
      monto <= 0
    ) {
      alert(
        "Ingresá un monto válido."
      );
      return;
    }

    const cuenta = cuentas.find(
      (cliente) =>
        cliente.id ===
        formularioPago.clienteId
    );

    if (!cuenta) {
      alert(
        "No se encontró la cuenta del cliente."
      );
      return;
    }

    if (cuenta.saldo <= 0) {
      alert(
        "Este cliente no tiene saldo pendiente."
      );
      return;
    }

    if (monto > cuenta.saldo) {
      alert(
        `El pago no puede superar el saldo pendiente de ${moneda(
          cuenta.saldo
        )}.`
      );
      return;
    }

    setPagos((actuales) => [
      ...actuales,
      {
        ...formularioPago,
        monto,
        id: crypto.randomUUID(),
      },
    ]);

    setFormularioPago(null);

    alert(
      "Pago registrado correctamente."
    );
  }

  function iconoPrioridad(
    prioridad
  ) {
    if (prioridad === "urgente") {
      return "🔴";
    }

    if (prioridad === "proximo") {
      return "🟠";
    }

    if (
      prioridad === "seguimiento"
    ) {
      return "🟡";
    }

    return "🟢";
  }

  return (
    <section className="cobros-page">
      <div className="page-heading">
        <p className="eyebrow">
          Seguimiento
        </p>

        <h1>
          Agenda inteligente de cobros
        </h1>

        <p>
          Cobra Fácil ordena
          automáticamente a quién
          conviene contactar primero.
        </p>
      </div>

      <div className="cobros-resumen">
        <article>
          <span>🔴</span>

          <div>
            <small>Urgentes</small>

            <strong>
              {resumen.urgentes}
            </strong>
          </div>
        </article>

        <article>
          <span>🟠</span>

          <div>
            <small>
              Cobrar pronto
            </small>

            <strong>
              {resumen.proximos}
            </strong>
          </div>
        </article>

        <article>
          <span>🟡</span>

          <div>
            <small>
              Seguimiento
            </small>

            <strong>
              {resumen.seguimiento}
            </strong>
          </div>
        </article>

        <article>
          <span>💰</span>

          <div>
            <small>
              Saldo por cobrar
            </small>

            <strong>
              {moneda(
                resumen.saldoTotal
              )}
            </strong>
          </div>
        </article>
      </div>

      <div className="panel cobros-panel">
        <div className="toolbar cobros-toolbar">
          <input
            className="search"
            value={buscar}
            onChange={(evento) =>
              setBuscar(
                evento.target.value
              )
            }
            placeholder="🔍 Buscar cliente"
          />

          <select
            className="filter-select"
            value={filtro}
            onChange={(evento) =>
              setFiltro(
                evento.target.value
              )
            }
          >
            <option value="todos">
              Todos
            </option>

            <option value="con-deuda">
              Todos los que deben
            </option>

            <option value="urgente">
              Urgentes
            </option>

            <option value="proximo">
              Cobrar pronto
            </option>

            <option value="seguimiento">
              Seguimiento
            </option>

            <option value="al-dia">
              Al día
            </option>
          </select>

          <span>
            {filtrados.length} cliente(s)
          </span>
        </div>

        {filtrados.length === 0 ? (
          <div className="empty">
            <div>✅</div>

            <h3>
              No hay clientes para este
              filtro
            </h3>
          </div>
        ) : (
          <div className="cobros-lista">
            {filtrados.map(
              (cliente) => (
                <article
                  className={`cobro-card ${cliente.prioridad}`}
                  key={cliente.id}
                >
                  <div className="cobro-card-prioridad">
                    <span>
                      {iconoPrioridad(
                        cliente.prioridad
                      )}
                    </span>

                    <strong>
                      {
                        cliente.prioridadTexto
                      }
                    </strong>
                  </div>

                  <div className="cobro-card-cliente">
                    <h3>
                      {cliente.nombre}
                    </h3>

                    <p>
                      📞{" "}
                      {cliente.telefono ||
                        "Sin teléfono"}
                    </p>

                    <p>
                      📍{" "}
                      {cliente.ciudad ||
                        "Sin ciudad"}
                    </p>
                  </div>

                  <div className="cobro-card-datos">
                    <div>
                      <small>
                        Saldo pendiente
                      </small>

                      <strong
                        className={
                          cliente.saldo >
                          0
                            ? "amount-danger"
                            : "amount-success"
                        }
                      >
                        {moneda(
                          cliente.saldo
                        )}
                      </strong>
                    </div>

                    <div>
                      <small>
                        Último pago
                      </small>

                      <strong>
                        {cliente.ultimoPago
                          ? fechaCorta(
                              cliente.ultimoPago
                            )
                          : "Sin pagos"}
                      </strong>
                    </div>

                    <div>
                      <small>
                        Días sin pagar
                      </small>

                      <strong>
                        {cliente.saldo >
                        0
                          ? `${cliente.diasSinPagar} días`
                          : "Al día"}
                      </strong>
                    </div>
                  </div>

                  <div className="cobro-card-acciones">
                    {cliente.telefono && (
                      <button
                        className="whatsapp-small"
                        onClick={() =>
                          abrirWhatsApp(
                            cliente
                          )
                        }
                      >
                        🟢 WhatsApp
                      </button>
                    )}

                    {cliente.saldo >
                      0 && (
                      <button
                        className="primary success"
                        onClick={() =>
                          setFormularioPago(
                            crearPago(
                              cliente.id
                            )
                          )
                        }
                      >
                        💵 Registrar pago
                      </button>
                    )}
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </div>

      {formularioPago && (
        <Modal
          titulo="Registrar pago desde Cobros"
          onCerrar={() =>
            setFormularioPago(null)
          }
        >
          <form
            onSubmit={guardarPago}
            className="form-grid"
          >
            <label>
              Cliente

              <select
                value={
                  formularioPago.clienteId
                }
                onChange={(evento) =>
                  setFormularioPago({
                    ...formularioPago,
                    clienteId:
                      evento.target
                        .value,
                  })
                }
              >
                <option value="">
                  Seleccionar...
                </option>

                {cuentas
                  .filter(
                    (cliente) =>
                      cliente.saldo > 0
                  )
                  .map(
                    (cliente) => (
                      <option
                        key={
                          cliente.id
                        }
                        value={
                          cliente.id
                        }
                      >
                        {
                          cliente.nombre
                        }{" "}
                        — Debe{" "}
                        {moneda(
                          cliente.saldo
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
                  formularioPago.fecha
                }
                onChange={(evento) =>
                  setFormularioPago({
                    ...formularioPago,
                    fecha:
                      evento.target
                        .value,
                  })
                }
              />
            </label>

            <label>
              Monto

              <input
                type="number"
                min="1"
                max={
                  cuentaPago?.saldo ||
                  undefined
                }
                value={
                  formularioPago.monto
                }
                onChange={(evento) =>
                  setFormularioPago({
                    ...formularioPago,
                    monto:
                      evento.target
                        .value,
                  })
                }
              />

              {cuentaPago && (
                <small>
                  Saldo disponible:{" "}
                  {moneda(
                    cuentaPago.saldo
                  )}
                </small>
              )}
            </label>

            <label>
              Forma de pago

              <select
                value={
                  formularioPago.metodo
                }
                onChange={(evento) =>
                  setFormularioPago({
                    ...formularioPago,
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
                  formularioPago
                    .observaciones
                }
                onChange={(evento) =>
                  setFormularioPago({
                    ...formularioPago,
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
                  setFormularioPago(null)
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