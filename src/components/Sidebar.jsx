import { APP } from "../constants/app";
const opciones = [
  ["inicio", "🏠", "Inicio"],
  ["clientes", "👥", "Clientes"],
  ["pedidos", "📦", "Pedidos"],
  ["pagos", "💵", "Pagos"],
  ["caja", "💰", "Caja diaria"],
  ["cuentas", "📋", "Cuenta corriente"],
  ["morosos", "🚨", "Morosos"],
  ["cobros", "📅", "Cobros"],
  ["reportes", "📊", "Reportes"],
  ["configuracion", "⚙️", "Configuración"],
];

export default function Sidebar({
  pantalla,
  onCambiar,
  negocio,
}) {
  const nombreNegocio =
  negocio?.nombre || "Mi negocio";

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          {negocio?.logo ? (
            <img
              src={negocio.logo}
              alt={`Logo de ${nombreNegocio}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "10px",
              }}
            />
          ) : (
            "👕"
          )}
        </div>

        <div>
          <strong>{nombreNegocio}</strong>
          <span>
  {APP.nombre} {APP.modo} v{APP.version}
</span>
        </div>
      </div>

      <nav className="nav">
        {opciones.map(([id, icono, texto]) => (
          <button
            key={id}
            className={`nav-item ${
              pantalla === id ? "active" : ""
            }`}
            onClick={() => onCambiar(id)}
          >
            <span>{icono}</span>
            {texto}
          </button>
        ))}
      </nav>
    </aside>
  );
}