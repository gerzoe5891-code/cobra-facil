export function moneda(valor) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));
}

export function fechaCorta(valor) {
  if (!valor) return "-";
  const fecha = new Date(`${valor}T00:00:00`);
  return fecha.toLocaleDateString("es-AR");
}

export function diasDesde(valor) {
  if (!valor) return Infinity;
  const inicio = new Date(`${valor}T00:00:00`);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((hoy - inicio) / 86400000));
}

export function mesActual(valor) {
  if (!valor) return false;
  const fecha = new Date(`${valor}T00:00:00`);
  const hoy = new Date();
  return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
}
