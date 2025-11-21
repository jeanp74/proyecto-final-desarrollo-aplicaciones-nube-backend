// gateway/gateway.service.js
import fetch from "node-fetch";

/**
 * Construye el mapa de servicios a partir de las variables de entorno
 * Ejemplo en env: API_APPOINTMENTS=https://appointments-api.azurewebsites.net  
 */
export function buildServiceMap(env = process.env) {
  const map = {};
  for (const k of Object.keys(env)) {
    if (k.startsWith("API_")) {
      const svc = k.slice("API_".length).toLowerCase();
      map[svc] = env[k];
    }
  }
  return map;
}

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
    finalPath = ""; // Si es exactamente el nombre del servicio, usar raíz
  }

  return finalPath ? `${cleanedRoot}/${finalPath}` : cleanedRoot;
}

/**
 * Construye las opciones para fetch a partir del request original.
 * No envía headers peligrosos (host, content-length) y fija content-type si hay body.
 */
export function buildFetchOptions(req) {
  const headers = { ...req.headers };

  // node-fetch expects lower-case header names sometimes; ensure host is removed
  delete headers.host;
  delete headers["content-length"];

  const opts = {
    method: req.method,
    headers,
    redirect: "manual",
  };

  // No body for GET/HEAD
  if (req.method !== "GET" && req.method !== "HEAD") {
    if (req.body !== undefined) {
      opts.body = JSON.stringify(req.body);
      opts.headers = { ...opts.headers, "content-type": "application/json" };
    }
  }

  return opts;
}

/**
 * Realiza el forward con node-fetch y devuelve un objeto con status, headers y body (en texto).
 */
export async function forwardRequestToTarget(targetUrl, fetchOpts, timeoutMs = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(targetUrl, { ...fetchOpts, signal: controller.signal });
    clearTimeout(id);
    const text = await r.text();
    const respHeaders = {};
    r.headers.forEach((v, k) => {
      respHeaders[k] = v;
    });
    let body = text;
    try {
      body = JSON.parse(text);
    } catch (e) {
      // body queda como texto
    }
    return { status: r.status, headers: respHeaders, body };
  } catch (err) {
    clearTimeout(id);
    if (err.name === "AbortError") {
      throw new Error("Timeout contacting backend service");
    }
    throw err;
  }
}

/**
 * Envia la respuesta "proxy" al cliente replicando código y headers básicos.
 */
export function sendForwardedResponse(res, forwarded) {
  if (forwarded.headers) {
    for (const [k, v] of Object.entries(forwarded.headers)) {
      if (["transfer-encoding", "content-length", "connection"].includes(k.toLowerCase())) continue;
      try {
        res.setHeader(k, v);
      } catch (e) {
        // ignore header setting errors
      }
    }
  }

  if (typeof forwarded.body === "object") {
    res.status(forwarded.status).json(forwarded.body);
  } else {
    res.status(forwarded.status).send(forwarded.body);
  }
}