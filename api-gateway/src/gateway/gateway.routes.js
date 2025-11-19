import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

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
