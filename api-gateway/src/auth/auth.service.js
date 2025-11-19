// api-gateway/src/auth/auth.service.js
import bcrypt from "bcrypt";

// CREAR VARIABLES DE ENTORNO PARA OBTENER LOS DOCTORES Y PACIENTES CREADOS
// const API_APPOINTMENTS = process.env.API_APPOINTMENTS;
// const API_PHARMACY = process.env.API_PHARMACY;
const API_DOCTORS = process.env.API_DOCTORS;
const API_PATIENTS = process.env.API_PATIENTS;

// === Usuarios de prueba (mock) ===
// Contraseña: "admin"

export async function getDoctors() {
  const url = joinUrl(API_DOCTORS, "/doctors");
  const resp = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error || "Error al iniciar sesión");
  return data;
}

export async function getPatients() {
  const url = joinUrl(API_DOCTORS, "/patients");
  const resp = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error || "Error al iniciar sesión");
  return data;
}

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