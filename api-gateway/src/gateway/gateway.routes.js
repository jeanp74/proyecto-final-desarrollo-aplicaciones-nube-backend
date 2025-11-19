import { Router } from "express";
import fetch from "node-fetch";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Construir URLs desde variables SERVICE_*
const SERVICE_MAP = {};
for (const key of Object.keys(process.env)) {
  if (key.startsWith("SERVICE_")) {
    const svc = key.slice(8).toLowerCase();
    SERVICE_MAP[svc] = process.env[key];
  }
}

// router.all("/:service/*", authenticateToken, async (req, res) => {
//   const { service } = req.params;
//   const base = SERVICE_MAP[service];
//   if (!base) return res.status(404).json({ error: "Servicio no encontrado" });

//   const path = req.params[0];
//   const url = `${base}/${path}`;
//   try {
//     const response = await fetch(url, {
//       method: req.method,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: req.headers.authorization
//       },
//       body: req.method === "GET" ? undefined : JSON.stringify(req.body)
//     });

//     const data = await response.text();
//     res.status(response.status).send(data);
//   } catch (err) {
//     console.error(err);
//     res.status(502).json({ error: "Error al conectar con servicio destino" });
//   }
// });

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

export default router;
