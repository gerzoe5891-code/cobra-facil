import {
  diasDesde,
  fechaCorta,
  moneda,
  mesActual,
} from "../utils/formatos";

import "../styles/Inicio.css";

function obtenerSaludo() {
  const hora = new Date().getHours();

  if (hora < 12) {
    return "Buenos días";
  }

  if (hora < 19) {
    return "Buenas tardes";
  }

  return "Buenas noches";
}

function nombreCliente(clientes, clienteId) {
  return (
    clientes.find(
      (cliente) => cliente.id === clienteId
    )?.nombre || "Cliente eliminado"
  );
}

export default function Inicio({
  clientes,
  pedidos,
  pagos,
  onIr,
}) {
  const hoy = new Date()
    .toISOString()
    .slice(0, 10);

  const totalVendido = pedidos.reduce(
    (suma, pedido) =>
      suma + Number(pedido.total || 0),
    0
  );

  const totalCobrado = pagos.reduce(
    (suma, pago) =>
      suma + Number(pago.monto || 0),
    0
  );

  const saldoPendiente = Math.max(
    0,
    totalVendido - totalCobrado
  );

  const pedidosPendientes = pedidos.filter(
    (pedido) =>
      pedido.estado === "Pendiente"
  );

  const pedidosHoy = pedidos.filter(
    (pedido) => pedido.fecha === hoy
  );

  const pagosHoy = pagos.filter(
    (pago) => pago.fecha === hoy
  );

  const vendidoHoy = pedidosHoy.reduce(
    (suma, pedido) =>
      suma + Number(pedido.total || 0),
    0
  );

  const cobradoHoy = pagosHoy.reduce(
    (suma, pago) =>
      suma + Number(pago.monto || 0),
    0
  );

  const pedidosMes = pedidos.filter(
    (pedido) => mesActual(pedido.fecha)
  );

  const pagosMes = pagos.filter(
    (pago) => mesActual(pago.fecha)
  );

  const vendidoMes = pedidosMes.reduce(
    (suma, pedido) =>
      suma + Number(pedido.total || 0),
    0
  );

  const cobradoMes = pagosMes.reduce(
    (suma, pago) =>
      suma + Number(pago.monto || 0),
    0
  );

  const clientesNuevosMes = clientes.filter(
    (cliente) =>
      cliente.fechaAlta &&
      mesActual(cliente.fechaAlta)
  ).length;

  const cuentas = clientes.map((cliente) => {
    const compras = pedidos.filter(
      (pedido) =>
        pedido.clienteId === cliente.id
    );

    const cobros = pagos.filter(
      (pago) =>
        pago.clienteId === cliente.id
    );

    const comprado = compras.reduce(
      (suma, pedido) =>
        suma + Number(pedido.total || 0),
      0
    );

    const pagado = cobros.reduce(
      (suma, pago) =>
        suma + Number(pago.monto || 0),
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

    return {
      ...cliente,
      comprado,
      pagado,
      saldo: Math.max(0, comprado - pagado),
      diasSinPagar: fechaReferencia
        ? diasDesde(fechaReferencia)
        : 0,
      ultimoPago,
    };
  });

  const clientesConDeuda = cuentas.filter(
    (cliente) => cliente.saldo > 0
  );

  const alertasCobro = cuentas
    .filter(
      (cliente) =>
        cliente.saldo > 0 &&
        cliente.diasSinPagar > 30
    )
    .sort(
      (a, b) =>
        b.diasSinPagar -
        a.diasSinPagar
    );

  const movimientos = [
    ...pedidos.map((pedido) => ({
      id: `pedido-${pedido.id}`,
      fecha: pedido.fecha,
      tipo: "Pedido",
      icono: "🛒",
      cliente: nombreCliente(
        clientes,
        pedido.clienteId
      ),
      monto: Number(pedido.total || 0),
      detalle: pedido.estado,
      clase: "venta",
    })),

    ...pagos.map((pago) => ({
      id: `pago-${pago.id}`,
      fecha: pago.fecha,
      tipo: "Pago",
      icono: "💵",
      cliente: nombreCliente(
        clientes,
        pago.clienteId
      ),
      monto: Number(pago.monto || 0),
      detalle: pago.metodo || "Pago",
      clase: "pago",
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.fecha) -
        new Date(a.fecha)
    )
    .slice(0, 8);

  const recordatorios = [
    ...alertasCobro.slice(0, 4).map(
      (cliente) => ({
        id: `cobro-${cliente.id}`,
        icono: "🔴",
        titulo: cliente.nombre,
        texto: `Debe ${moneda(
          cliente.saldo
        )} y hace ${
          cliente.diasSinPagar
        } días que no paga.`,
        accion: "Ver cobros",
        destino: "cobros",
      })
    ),

    ...(pedidosPendientes.length > 0
      ? [
          {
            id: "pedidos-pendientes",
            icono: "📦",
            titulo: `${pedidosPendientes.length} pedido(s) pendiente(s)`,
            texto:
              "Revisá las entregas pendientes.",
            accion: "Ver pedidos",
            destino: "pedidos",
          },
        ]
      : []),
  ].slice(0, 5);

  return (
    <section className="inicio-inteligente">
      <div className="inicio-saludo">
        <div>
          <p className="eyebrow">
            Panel principal
          </p>

          <h1>
            {obtenerSaludo()}, Germán
          </h1>

          <p>
            Este es el resumen actual de
            Tu Propio Estilo.
          </p>
        </div>

        <div className="inicio-fecha">
          <span>📅</span>

          <div>
            <small>Hoy</small>

            <strong>
              {new Date().toLocaleDateString(
                "es-AR",
                {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }
              )}
            </strong>
          </div>
        </div>
      </div>

      {alertasCobro.length > 0 && (
        <div className="notification-banner">
          <div>
            <strong>
              🔔 Tenés {alertasCobro.length}{" "}
              cliente(s) para contactar
            </strong>

            <span>
              Hay cuentas con más de 30 días
              sin registrar pagos.
            </span>
          </div>

          <button
            className="secondary"
            onClick={() => onIr("cobros")}
          >
            Ver agenda de cobros
          </button>
        </div>
      )}

      <div className="inicio-resumen-principal">
        <article>
          <span>🛒</span>

          <div>
            <small>Vendido hoy</small>
            <strong>
              {moneda(vendidoHoy)}
            </strong>
          </div>
        </article>

        <article>
          <span>💵</span>

          <div>
            <small>Cobrado hoy</small>
            <strong>
              {moneda(cobradoHoy)}
            </strong>
          </div>
        </article>

        <article>
          <span>📦</span>

          <div>
            <small>
              Pedidos pendientes
            </small>
            <strong>
              {pedidosPendientes.length}
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
              {clientesConDeuda.length}
            </strong>
          </div>
        </article>
      </div>

      <div className="inicio-dos-columnas">
        <div className="panel">
          <div className="panel-title">
            <h2>Resumen del mes</h2>
            <p>
              Ventas y cobranzas del mes actual.
            </p>
          </div>

          <div className="inicio-mes-grid">
            <article>
              <span>📈</span>
              <small>
                Vendido este mes
              </small>
              <strong>
                {moneda(vendidoMes)}
              </strong>
            </article>

            <article>
              <span>✅</span>
              <small>
                Cobrado este mes
              </small>
              <strong>
                {moneda(cobradoMes)}
              </strong>
            </article>

            <article>
              <span>👥</span>
              <small>
                Clientes nuevos
              </small>
              <strong>
                {clientesNuevosMes}
              </strong>
            </article>

            <article>
              <span>💰</span>
              <small>
                Saldo pendiente total
              </small>
              <strong>
                {moneda(saldoPendiente)}
              </strong>
            </article>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <h2>Acciones rápidas</h2>
            <p>
              Ingresá a las funciones más usadas.
            </p>
          </div>

          <div className="inicio-acciones">
            <button
              onClick={() =>
                onIr("clientes")
              }
            >
              ➕ Nuevo cliente
            </button>

            <button
              onClick={() =>
                onIr("pedidos")
              }
            >
              📦 Registrar pedido
            </button>

            <button
              onClick={() =>
                onIr("pagos")
              }
            >
              💵 Registrar pago
            </button>

            <button
              onClick={() =>
                onIr("cobros")
              }
            >
              📅 Agenda de cobros
            </button>

            <button
              onClick={() =>
                onIr("caja")
              }
            >
              💰 Caja diaria
            </button>

            <button
              onClick={() =>
                onIr("configuracion")
              }
            >
              💾 Crear respaldo
            </button>
          </div>
        </div>
      </div>

      <div className="inicio-dos-columnas">
        <div className="panel">
          <div className="panel-title">
            <h2>Recordatorios</h2>
            <p>
              Lo que necesita atención.
            </p>
          </div>

          {recordatorios.length === 0 ? (
            <div className="inicio-vacio">
              <span>✅</span>
              <p>
                No hay recordatorios pendientes.
              </p>
            </div>
          ) : (
            <div className="inicio-recordatorios">
              {recordatorios.map(
                (recordatorio) => (
                  <article
                    key={recordatorio.id}
                  >
                    <span>
                      {recordatorio.icono}
                    </span>

                    <div>
                      <strong>
                        {recordatorio.titulo}
                      </strong>

                      <p>
                        {recordatorio.texto}
                      </p>
                    </div>

                    <button
                      className="secondary"
                      onClick={() =>
                        onIr(
                          recordatorio.destino
                        )
                      }
                    >
                      {recordatorio.accion}
                    </button>
                  </article>
                )
              )}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-title">
            <h2>Últimos movimientos</h2>
            <p>
              Pedidos y pagos registrados
              recientemente.
            </p>
          </div>

          {movimientos.length === 0 ? (
            <div className="inicio-vacio">
              <span>📭</span>

              <p>
                Todavía no hay movimientos.
              </p>
            </div>
          ) : (
            <div className="recent-movements">
              {movimientos.map(
                (movimiento) => (
                  <article
                    className="recent-movement"
                    key={movimiento.id}
                  >
                    <div className="recent-icon">
                      {movimiento.icono}
                    </div>

                    <div className="recent-info">
                      <strong>
                        {movimiento.cliente}
                      </strong>

                      <small>
                        {movimiento.tipo} ·{" "}
                        {fechaCorta(
                          movimiento.fecha
                        )}
                      </small>

                      <span>
                        {movimiento.detalle}
                      </span>
                    </div>

                    <div
                      className={`recent-amount ${movimiento.clase}`}
                    >
                      {moneda(
                        movimiento.monto
                      )}
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div className="inicio-totales-generales">
        <span>
          Total histórico vendido:{" "}
          <strong>
            {moneda(totalVendido)}
          </strong>
        </span>

        <span>
          Total histórico cobrado:{" "}
          <strong>
            {moneda(totalCobrado)}
          </strong>
        </span>

        <span>
          Clientes registrados:{" "}
          <strong>
            {clientes.length}
          </strong>
        </span>
      </div>
    </section>
  );
}
