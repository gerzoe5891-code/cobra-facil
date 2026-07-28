import {
  useEffect,
  useRef,
  useState,
} from "react";

import { storage } from "../services/storage";
import { APP } from "../constants/app";
import "../styles/Configuracion.css";

const CLAVE_ULTIMO_BACKUP =
  "tpe_ultimo_backup";

const TAMANO_MAXIMO_LOGO =
  2 * 1024 * 1024;

const NEGOCIO_INICIAL = {
  nombre: "Tu Propio Estilo",
  telefono: "",
  ciudad: "",
  instagram: "",
  mensajeComprobante:
    "Gracias por elegirnos.",
  logo: "",
};

export default function Configuracion({
  negocio,
  setNegocio,
  sistema,
}) {
  const archivoRef = useRef(null);
  const logoRef = useRef(null);

  const [formulario, setFormulario] =
    useState({
      ...NEGOCIO_INICIAL,
      ...negocio,
    });

  const [ultimoBackup, setUltimoBackup] =
    useState(
      localStorage.getItem(
        CLAVE_ULTIMO_BACKUP
      ) || ""
    );

  useEffect(() => {
    setFormulario({
      ...NEGOCIO_INICIAL,
      ...negocio,
    });
  }, [negocio]);

  const tieneLogo =
    Boolean(formulario.logo);

  const negocioConfigurado =
    Boolean(
      formulario.nombre?.trim()
    );

  const modoSistema =
    sistema?.modo || "Local";

  function actualizarCampo(
    campo,
    valor
  ) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function guardarNegocio(evento) {
    evento.preventDefault();

    const nombre =
      formulario.nombre.trim();

    if (!nombre) {
      alert(
        "Ingresá el nombre del negocio."
      );

      return;
    }

    const datosActualizados = {
      ...formulario,
      nombre,
      telefono:
        formulario.telefono?.trim() ||
        "",
      ciudad:
        formulario.ciudad?.trim() ||
        "",
      instagram:
        formulario.instagram?.trim() ||
        "",
    };

    setNegocio(datosActualizados);

    alert(
      "Datos e identidad del negocio guardados correctamente."
    );
  }

  function seleccionarLogo() {
    logoRef.current?.click();
  }

  function cargarLogo(evento) {
    const archivo =
      evento.target.files?.[0];

    if (!archivo) {
      return;
    }

    const formatosPermitidos = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (
      !formatosPermitidos.includes(
        archivo.type
      )
    ) {
      alert(
        "Seleccioná una imagen PNG, JPG, JPEG o WebP."
      );

      evento.target.value = "";
      return;
    }

    if (
      archivo.size >
      TAMANO_MAXIMO_LOGO
    ) {
      alert(
        "El logo no puede superar los 2 MB."
      );

      evento.target.value = "";
      return;
    }

    const lector = new FileReader();

    lector.onload = () => {
      actualizarCampo(
        "logo",
        lector.result
      );
    };

    lector.onerror = () => {
      alert(
        "No se pudo leer la imagen seleccionada."
      );
    };

    lector.readAsDataURL(archivo);

    evento.target.value = "";
  }

  function quitarLogo() {
    if (
      formulario.logo &&
      !confirm(
        "¿Querés quitar el logo actual?"
      )
    ) {
      return;
    }

    actualizarCampo("logo", "");
  }

  function descargarBackup() {
    try {
      const datos =
        storage.exportarTodo();

      const contenido =
        JSON.stringify(
          datos,
          null,
          2
        );

      const blob = new Blob(
        [contenido],
        {
          type: "application/json",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const enlace =
        document.createElement("a");

      enlace.href = url;

      enlace.download =
        `cobra-facil-backup-${new Date()
          .toISOString()
          .slice(0, 10)}.json`;

      document.body.appendChild(
        enlace
      );

      enlace.click();
      enlace.remove();

      URL.revokeObjectURL(url);

      const fecha =
        new Date().toLocaleString(
          "es-AR"
        );

      localStorage.setItem(
        CLAVE_ULTIMO_BACKUP,
        fecha
      );

      setUltimoBackup(fecha);

      alert(
        "Copia de seguridad creada correctamente."
      );
    } catch (error) {
      alert(
        error?.message ||
          "No se pudo crear la copia de seguridad."
      );
    }
  }

  function seleccionarArchivo() {
    archivoRef.current?.click();
  }

  function restaurarBackup(evento) {
    const archivo =
      evento.target.files?.[0];

    if (!archivo) {
      return;
    }

    if (
      !confirm(
        "Restaurar una copia reemplazará los datos actuales por los contenidos en el respaldo. ¿Querés continuar?"
      )
    ) {
      evento.target.value = "";
      return;
    }

    const lector = new FileReader();

    lector.onload = () => {
      try {
        const datos = JSON.parse(
          lector.result
        );

        storage.importarTodo(datos);

        alert(
          "Copia restaurada correctamente. Cobra Fácil se actualizará ahora."
        );

        window.location.reload();
      } catch (error) {
        alert(
          error?.message ||
            "No se pudo restaurar la copia seleccionada."
        );
      }
    };

    lector.onerror = () => {
      alert(
        "No se pudo leer el archivo seleccionado."
      );
    };

    lector.readAsText(archivo);

    evento.target.value = "";
  }

  return (
    <section className="configuracion-page">
      <div className="page-heading">
        <p className="eyebrow">
          Personalización y seguridad
        </p>

        <h1>Configuración</h1>

        <p>
          Personalizá Cobra Fácil y
          administrá la seguridad de
          tus datos.
        </p>
      </div>

      <div className="config-resumen">
        <article>
          <span>🏪</span>

          <div>
            <small>
              Negocio
            </small>

            <strong>
              {negocioConfigurado
                ? formulario.nombre
                : "Sin configurar"}
            </strong>
          </div>
        </article>

        <article>
          <span>
            {tieneLogo
              ? "✅"
              : "🖼️"}
          </span>

          <div>
            <small>
              Logo
            </small>

            <strong>
              {tieneLogo
                ? "Configurado"
                : "Sin logo"}
            </strong>
          </div>
        </article>

        <article>
          <span>💾</span>

          <div>
            <small>
              Último respaldo
            </small>

            <strong className="config-backup-fecha">
              {ultimoBackup ||
                "Sin respaldo"}
            </strong>
          </div>
        </article>

        <article>
          <span>💻</span>

          <div>
            <small>
              Modo
            </small>

            <strong>
              {modoSistema}
            </strong>
          </div>
        </article>
      </div>

      <div className="panel business-settings">
        <div className="panel-title">
          <h2>
            🏪 Identidad del negocio
          </h2>

          <p>
            Estos datos aparecen en
            comprobantes, impresiones y
            distintas secciones de la
            aplicación.
          </p>
        </div>

        <form
          className="form-grid business-form"
          onSubmit={guardarNegocio}
        >
          <div className="logo-configuracion full">
            <div className="logo-vista-previa">
              {formulario.logo ? (
                <img
                  src={formulario.logo}
                  alt="Logo del negocio"
                />
              ) : (
                <div className="logo-placeholder">
                  <span>🏪</span>

                  <small>
                    Sin logo cargado
                  </small>
                </div>
              )}
            </div>

            <div className="logo-controles">
              <h3>
                Logo del negocio
              </h3>

              <p>
                PNG, JPG, JPEG o WebP.
                Tamaño máximo: 2 MB.
              </p>

              <div className="logo-botones">
                <button
                  type="button"
                  className="primary"
                  onClick={
                    seleccionarLogo
                  }
                >
                  📷 Seleccionar imagen
                </button>

                {formulario.logo && (
                  <button
                    type="button"
                    className="secondary"
                    onClick={
                      quitarLogo
                    }
                  >
                    🗑️ Quitar logo
                  </button>
                )}
              </div>

              <input
                ref={logoRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={cargarLogo}
              />
            </div>
          </div>

          <label>
            Nombre del negocio *

            <input
              value={
                formulario.nombre
              }
              onChange={(evento) =>
                actualizarCampo(
                  "nombre",
                  evento.target.value
                )
              }
            />
          </label>

          <label>
            Teléfono

            <input
              value={
                formulario.telefono
              }
              onChange={(evento) =>
                actualizarCampo(
                  "telefono",
                  evento.target.value
                )
              }
            />
          </label>

          <label>
            Ciudad

            <input
              value={
                formulario.ciudad
              }
              onChange={(evento) =>
                actualizarCampo(
                  "ciudad",
                  evento.target.value
                )
              }
            />
          </label>

          <label>
            Instagram o red social

            <input
              placeholder="@tunegocio"
              value={
                formulario.instagram
              }
              onChange={(evento) =>
                actualizarCampo(
                  "instagram",
                  evento.target.value
                )
              }
            />
          </label>

          <label className="full">
            Mensaje para el comprobante

            <textarea
              rows="3"
              placeholder="Ej.: Gracias por elegirnos."
              value={
                formulario
                  .mensajeComprobante
              }
              onChange={(evento) =>
                actualizarCampo(
                  "mensajeComprobante",
                  evento.target.value
                )
              }
            />
          </label>

          <div className="form-actions full">
            <button
              className="primary"
              type="submit"
            >
              💾 Guardar identidad
            </button>
          </div>
        </form>
      </div>

      <div className="config-seccion-titulo">
        <div>
          <p className="eyebrow">
            Seguridad
          </p>

          <h2>
            Copias de seguridad
          </h2>

          <p>
            Protegé clientes, pedidos,
            pagos y configuración del
            negocio.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        <article className="panel settings-card config-backup-card">
          <div className="settings-icon">
            💾
          </div>

          <h2>
            Crear respaldo
          </h2>

          <p>
            Guardá todos los datos de
            Cobra Fácil en un único
            archivo.
          </p>

          <button
            className="primary"
            onClick={
              descargarBackup
            }
          >
            Descargar respaldo
          </button>

          <div className="backup-status">
            <strong>
              Última copia:
            </strong>{" "}

            {ultimoBackup ||
              "Todavía no se creó ninguna"}
          </div>
        </article>

        <article className="panel settings-card config-restore-card">
          <div className="settings-icon">
            📂
          </div>

          <h2>
            Restaurar respaldo
          </h2>

          <p>
            Recuperá clientes, pedidos,
            pagos y configuración desde
            una copia anterior.
          </p>

          <button
            className="secondary"
            onClick={
              seleccionarArchivo
            }
          >
            Seleccionar respaldo
          </button>

          <input
            ref={archivoRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={
              restaurarBackup
            }
          />

          <div className="config-advertencia">
            ⚠️ Restaurar reemplaza los
            datos actuales.
          </div>
        </article>
      </div>
            <div className="config-seccion-titulo">
        <div>
          <p className="eyebrow">
            Sistema
          </p>

          <h2>
            Actualizaciones
          </h2>

          <p>
            Consultá la versión instalada
            y verificá futuras actualizaciones
            de Cobra Fácil.
          </p>
        </div>
      </div>

      <div className="panel update-panel">
        <div className="update-info">
          <div className="update-icon">
            🔄
          </div>

          <div>
            <small>
              Versión instalada
            </small>

            <strong>
              v{APP.version}
            </strong>

            <p>
              Cobra Fácil Desktop
            </p>
          </div>
        </div>

        <div className="update-actions">
          <span className="update-status">
            ✅ Aplicación actualizada
          </span>

          <button
            type="button"
            className="secondary"
            onClick={() =>
              alert(
                `Tenés instalada la versión ${APP.version}. La búsqueda automática de actualizaciones estará disponible próximamente.`
              )
            }
          >
            🔍 Buscar actualizaciones
          </button>
        </div>
      </div>

      <div className="panel warning-panel">
        <strong>
          Recomendación:
        </strong>{" "}
        realizá una copia de seguridad
        periódicamente, especialmente
        antes de actualizar Cobra Fácil
        o restaurar información.
      </div>
    </section>
  );
}