import packageInfo from "../../package.json";
const CLAVES = {
  clientes: "tpe_clientes_v2",
  pedidos: "tpe_pedidos_v2",
  pagos: "tpe_pagos_v2",
  negocio: "tpe_negocio_v1",
  sistema: "cobra_facil_sistema_v1",
};

const VERSION_SOFTWARE = packageInfo.version;
const VERSION_BACKUP = "2.0";

const NEGOCIO_PREDETERMINADO = {
  nombre: "Tu Propio Estilo",
  responsable: "",
  telefono: "",
  whatsapp: "",
  email: "",
  ciudad: "",
  direccion: "",
  instagram: "",
  facebook: "",
  sitioWeb: "",
  mensajeComprobante: "Gracias por elegirnos.",
  logo: "",
};

const SISTEMA_PREDETERMINADO = {
  configuracionInicialCompletada: false,

  almacenamiento: {
    modo: "local",
    nubeActiva: false,
  },

  apariencia: {
    tema: "claro",
    colorPrincipal: "#2563eb",
    colorSecundario: "#1d4ed8",
  },

  licencia: {
    estado: "sin-activar",
    codigo: "",
    plan: "Local",
    fechaActivacion: "",
    fechaVencimiento: "",
  },

  aplicacion: {
    version: VERSION_SOFTWARE,
    ultimaActualizacion: "",
  },
};

function clonar(valor) {
  return JSON.parse(JSON.stringify(valor));
}

function esObjeto(valor) {
  return (
    valor !== null &&
    typeof valor === "object" &&
    !Array.isArray(valor)
  );
}

function combinarObjetos(
  predeterminado,
  guardado
) {
  if (!esObjeto(predeterminado)) {
    return guardado ?? predeterminado;
  }

  const resultado = {
    ...clonar(predeterminado),
  };

  if (!esObjeto(guardado)) {
    return resultado;
  }

  Object.keys(guardado).forEach((clave) => {
    if (
      esObjeto(predeterminado[clave]) &&
      esObjeto(guardado[clave])
    ) {
      resultado[clave] = combinarObjetos(
        predeterminado[clave],
        guardado[clave]
      );
    } else {
      resultado[clave] = guardado[clave];
    }
  });

  return resultado;
}

function leer(
  clave,
  valorPredeterminado = []
) {
  try {
    const valor = localStorage.getItem(clave);

    if (!valor) {
      return clonar(valorPredeterminado);
    }

    return JSON.parse(valor);
  } catch (error) {
    console.error(
      `Error al leer la clave ${clave}:`,
      error
    );

    return clonar(valorPredeterminado);
  }
}

function guardar(clave, datos) {
  try {
    localStorage.setItem(
      clave,
      JSON.stringify(datos)
    );

    return true;
  } catch (error) {
    console.error(
      `Error al guardar la clave ${clave}:`,
      error
    );

    throw new Error(
      "No se pudieron guardar los datos."
    );
  }
}

function obtenerLista(clave) {
  const datos = leer(clave, []);
  return Array.isArray(datos) ? datos : [];
}

function obtenerNegocio() {
  const guardado = leer(
    CLAVES.negocio,
    {}
  );

  return combinarObjetos(
    NEGOCIO_PREDETERMINADO,
    guardado
  );
}

function obtenerSistema() {
  const guardado = leer(
    CLAVES.sistema,
    {}
  );

  const sistema = combinarObjetos(
    SISTEMA_PREDETERMINADO,
    guardado
  );

  sistema.aplicacion.version =
    VERSION_SOFTWARE;

  return sistema;
}

function validarRespaldo(datos) {
  if (!datos || typeof datos !== "object") {
    throw new Error(
      "El archivo de respaldo no es válido."
    );
  }

  if (!Array.isArray(datos.clientes)) {
    throw new Error(
      "El respaldo no contiene clientes válidos."
    );
  }

  if (!Array.isArray(datos.pedidos)) {
    throw new Error(
      "El respaldo no contiene pedidos válidos."
    );
  }

  if (!Array.isArray(datos.pagos)) {
    throw new Error(
      "El respaldo no contiene pagos válidos."
    );
  }
}

export const storage = {
  versiones: {
    software: VERSION_SOFTWARE,
    backup: VERSION_BACKUP,
  },

  clientes: {
    obtener: () =>
      obtenerLista(CLAVES.clientes),

    guardar: (datos) => {
      if (!Array.isArray(datos)) {
        throw new Error(
          "Los clientes deben guardarse como una lista."
        );
      }

      return guardar(
        CLAVES.clientes,
        datos
      );
    },
  },

  pedidos: {
    obtener: () =>
      obtenerLista(CLAVES.pedidos),

    guardar: (datos) => {
      if (!Array.isArray(datos)) {
        throw new Error(
          "Los pedidos deben guardarse como una lista."
        );
      }

      return guardar(
        CLAVES.pedidos,
        datos
      );
    },
  },

  pagos: {
    obtener: () =>
      obtenerLista(CLAVES.pagos),

    guardar: (datos) => {
      if (!Array.isArray(datos)) {
        throw new Error(
          "Los pagos deben guardarse como una lista."
        );
      }

      return guardar(
        CLAVES.pagos,
        datos
      );
    },
  },

  negocio: {
    obtener: obtenerNegocio,

    guardar: (datos) => {
      const negocioCompleto =
        combinarObjetos(
          NEGOCIO_PREDETERMINADO,
          datos
        );

      return guardar(
        CLAVES.negocio,
        negocioCompleto
      );
    },

    predeterminado: () =>
      clonar(NEGOCIO_PREDETERMINADO),
  },

  sistema: {
    obtener: obtenerSistema,

    guardar: (datos) => {
      const sistemaCompleto =
        combinarObjetos(
          SISTEMA_PREDETERMINADO,
          datos
        );

      sistemaCompleto.aplicacion.version =
        VERSION_SOFTWARE;

      return guardar(
        CLAVES.sistema,
        sistemaCompleto
      );
    },

    predeterminado: () =>
      clonar(SISTEMA_PREDETERMINADO),
  },

  exportarTodo() {
    return {
      tipo: "cobra-facil-backup",
      backupVersion: VERSION_BACKUP,
      softwareVersion: VERSION_SOFTWARE,
      fecha: new Date().toISOString(),

      clientes: obtenerLista(
        CLAVES.clientes
      ),

      pedidos: obtenerLista(
        CLAVES.pedidos
      ),

      pagos: obtenerLista(
        CLAVES.pagos
      ),

      negocio: obtenerNegocio(),
      sistema: obtenerSistema(),
    };
  },

  importarTodo(datos) {
    validarRespaldo(datos);

    guardar(
      CLAVES.clientes,
      datos.clientes
    );

    guardar(
      CLAVES.pedidos,
      datos.pedidos
    );

    guardar(
      CLAVES.pagos,
      datos.pagos
    );

    const negocioImportado =
      combinarObjetos(
        NEGOCIO_PREDETERMINADO,
        datos.negocio || {}
      );

    guardar(
      CLAVES.negocio,
      negocioImportado
    );

    const sistemaImportado =
      combinarObjetos(
        SISTEMA_PREDETERMINADO,
        datos.sistema || {}
      );

    sistemaImportado.aplicacion.version =
      VERSION_SOFTWARE;

    guardar(
      CLAVES.sistema,
      sistemaImportado
    );

    return true;
  },

  reiniciarConfiguracion() {
    guardar(
      CLAVES.negocio,
      NEGOCIO_PREDETERMINADO
    );

    guardar(
      CLAVES.sistema,
      SISTEMA_PREDETERMINADO
    );
  },
};