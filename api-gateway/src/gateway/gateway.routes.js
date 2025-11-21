import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { buildServiceMap, getTargetUrl, buildFetchOptions, forwardRequestToTarget, sendForwardedResponse } from "./gateway.service.js";

const router = Router();
const serviceMap = buildServiceMap();

// === RUTA: Obtener módulos permitidos según el rol ===
router.get("/modules", authenticateToken, (req, res) => {
  const { role } = req.user;

  const ROLE_MODULES = {
    admin: ["appointments", "doctors", "patients", "pharmacy"],
    doctor: ["appointments", "doctors", "pharmacy"],
    patient: ["appointments", "patients", "pharmacy"],
  };

  const allowed = ROLE_MODULES[role] || [];

  return res.json({
    role,
    modules: allowed,
    user: req.user
  });
});

// === RUTAS DINÁMICAS: Proxy a servicios backend ===
const services = ["appointments", "doctors", "patients", "pharmacy"];

for (const service of services) {
  router.use(`/${service}`, authenticateToken, async (req, res) => {
    // ✅ Agregar logs para debuggear
    console.log("=== GATEWAY DEBUG ===");
    console.log("Service:", service);
    console.log("req.params[0]:", req.params[0]);
    console.log("req.path:", req.path);
    console.log("req.baseUrl:", req.baseUrl);

    const targetUrl = getTargetUrl(serviceMap, service, req.params[0]);
    console.log("Target URL:", targetUrl);

    if (!targetUrl) return res.status(500).json({ error: "Service not configured" });

    const opts = buildFetchOptions(req);
    try {
      const result = await forwardRequestToTarget(targetUrl, opts);
      console.log("Response from backend:", result);
      sendForwardedResponse(res, result);
    } catch (e) {
      console.error("Gateway error:", e);
      res.status(500).json({ error: e.message });
    }
  });
}

export default router;