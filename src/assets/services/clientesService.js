const CLAVE_CLIENTES = "clientes";

export function obtenerClientes() {
  const datos = localStorage.getItem(CLAVE_CLIENTES);

  if (!datos) {
    return [];
  }

  return JSON.parse(datos);
}

export function guardarClientes(clientes) {
  localStorage.setItem(CLAVE_CLIENTES, JSON.stringify(clientes));
}

export function agregarCliente(cliente) {
  const clientes = obtenerClientes();

  clientes.push(cliente);

  guardarClientes(clientes);
}

export function eliminarCliente(id) {
  const clientes = obtenerClientes().filter(
    (cliente) => cliente.id !== id
  );

  guardarClientes(clientes);
}

export function buscarCliente(id) {
  return obtenerClientes().find(
    (cliente) => cliente.id === id
  );
}