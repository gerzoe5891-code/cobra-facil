import { useEffect, useState } from "react";
import { APP } from "../constants/app";
import "../styles/Header.css";

const TITULOS = {
  inicio: "Inicio",
  clientes: "Clientes",
  pedidos: "Pedidos",
  pagos: "Pagos",
  caja: "Caja diaria",
  cuentas: "Cuenta corriente",
  morosos: "Morosos",
  cobros: "Cobros",
  reportes: "Reportes",
  configuracion: "Configuración",
};

function obtenerFechaHora() {
  const ahora = new Date();

  return {
    fecha: ahora.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),

    hora: ahora.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export default function Header({
  pantalla,
  negocio,
}) {
  const [fechaHora, setFechaHora] = useState(
    obtenerFechaHora
  );

  useEffect(() => {
    const intervalo = setInterval(() => {
      setFechaHora(obtenerFechaHora());
    }, 60000);

    return () => clearInterval(intervalo);
  }, []);

  const titulo =
    TITULOS[pantalla] || "Inicio";

  const nombreNegocio =
    negocio?.nombre || "Mi negocio";

  return (
    <header className="app-header">
      <div className="app-header-info">
        <span className="app-header-seccion">
          {titulo}
        </span>

        <strong>{nombreNegocio}</strong>
      </div>

      <div className="app-header-derecha">
        <div className="app-header-fecha">
          <span className="app-header-hora">
            {fechaHora.hora}
          </span>

          <span className="app-header-dia">
            {fechaHora.fecha}
          </span>
        </div>

        <div
          className="app-header-version"
          title={`Versión ${APP.version}`}
        >
          v{APP.version}
        </div>
      </div>
    </header>
  );
}