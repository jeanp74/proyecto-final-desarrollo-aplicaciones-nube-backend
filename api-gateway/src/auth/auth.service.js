// api-gateway/src/auth/auth.service.js
import bcrypt from "bcrypt";

// === Usuarios de prueba (mock) ===
// Contraseña: "admin"

export const demoUsers = [
  {
    id: 1,
    name: "Administrador",
    email: "admin@example.com",
    password: await bcrypt.hash("admin", 10),
    role: "admin",
  },
  {
    id: 2,
    name: "Doctor de prueba",
    email: "doctor@example.com",
    password: await bcrypt.hash("doctor", 10),
    role: "doctor",
  },
  {
    id: 3,
    name: "Paciente de prueba",
    email: "patient@example.com",
    password: await bcrypt.hash("patient", 10),
    role: "patient",
  }
];

// === Almacenamiento temporal de tokens de refresh ===
export const refreshStore = new Map();