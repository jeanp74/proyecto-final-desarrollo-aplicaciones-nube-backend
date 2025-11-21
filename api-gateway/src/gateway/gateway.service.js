/**
 * Resuelve la URL objetivo para un servicio y un path interno.
 * - service: nombre short (e.g. 'appointments', 'doctors')
 * - restPath: ruta relativa (e.g. 'health' o 'appointments/123')
 * Retorna null si no existe el servicio.
 */
export function getTargetUrl(serviceMap, service, restPath = "") {
  const root = serviceMap[service?.toLowerCase()];
  if (!root) return null;

  const cleanedRoot = root.replace(/\/$/, "");         // remove trailing slash
  let finalPath = (restPath || "").replace(/^\//, ""); // remove leading slash

  // ✅ Si la ruta ya empieza con el nombre del servicio, no lo dupliquemos
  if (finalPath.startsWith(service + "/")) {
    finalPath = finalPath.substring(service.length + 1); // +1 para el "/"
  } else if (finalPath === service) {
    // ✅ Si es exactamente el nombre del servicio, usar la raíz del servicio (ej: /pharmacy)
    return `${cleanedRoot}/${service}`;
  }

  // ✅ Si finalPath no empieza con el nombre del servicio, agregarlo
  if (finalPath && !finalPath.startsWith(service)) {
    return `${cleanedRoot}/${service}/${finalPath}`;
  }

  // ✅ Si no hay finalPath, usar solo el nombre del servicio
  if (!finalPath) {
    return `${cleanedRoot}/${service}`;
  }

  // ✅ Si ya tiene el nombre del servicio, usar tal cual
  return `${cleanedRoot}/${finalPath}`;
}