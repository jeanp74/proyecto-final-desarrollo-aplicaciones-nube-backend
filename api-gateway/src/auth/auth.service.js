// api-gateway/src/auth/auth.service.js
import bcrypt from "bcrypt";

// === Usuarios de prueba (mock) ===
// Contraseña: "admin"
const hashedPassword = await bcrypt.hash("admin", 10);

export const demoUsers = [
  {
    id: 1,
    name: "Administrador",
    email: "admin@example.com",
    password: hashedPassword,
    role: "admin",
  },
  {
    id: 2,
    name: "Doctor de prueba",
    email: "doctor@example.com",
    password: await bcrypt.hash("doctor123", 10),
    role: "doctor",
  },
  {
    id: 3,
    name: "Paciente de prueba",
    email: "patient@example.com",
    password: await bcrypt.hash("patient123", 10),
    role: "patient",
  }
];

// === Almacenamiento temporal de tokens de refresh ===
export const refreshStore = new Map();