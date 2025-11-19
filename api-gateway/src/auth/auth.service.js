// api-gateway/src/auth/auth.service.js
import bcrypt from "bcrypt";

// Variables de entorno (URLs reales)
const API_DOCTORS = process.env.API_DOCTORS;
const API_PATIENTS = process.env.API_PATIENTS;

// === Fetch helpers ===
function joinUrl(base, path) {
  return base.endsWith("/") ? base + path.slice(1) : base + path;
}

export async function getDoctors() {
  const url = joinUrl(API_DOCTORS, "/doctors");
  const resp = await fetch(url);
  const data = await resp.json();

  if (!resp.ok) throw new Error(data?.error || "Error al obtener doctores");
  return data;
}

export async function getPatients() {
  const url = joinUrl(API_PATIENTS, "/patients");
  const resp = await fetch(url);
  const data = await resp.json();

  if (!resp.ok) throw new Error(data?.error || "Error al obtener pacientes");
  return data;
}

// === Usuarios base de prueba ===
const baseDemoUsers = [
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

// === Aquí guardaremos TODOS los usuarios cargados ===
export let demoUsers = []; // <-- Será llenado vía loadUsers()

// === Función para cargar usuarios reales + demo ===
export async function loadUsers() {
  const doctors = await getDoctors();
  const patients = await getPatients();

  console.log(doctors);
  console.log(patients);

  const mappedDoctors = doctors.map(doc => ({
    id: doc.id,
    name: doc.fullName ?? doc.name,
    email: doc.email,
    password: bcrypt.hashSync("doctor123", 10), // contraseñas para login
    role: "doctor",
  }));

  const mappedPatients = patients.map(p => ({
    id: p.id,
    name: p.fullName ?? p.name,
    email: p.email,
    password: bcrypt.hashSync("patient123", 10),
    role: "patient",
  }));

  demoUsers = [
    ...baseDemoUsers,
    ...mappedDoctors,
    ...mappedPatients,
  ];

  console.log(`Usuarios listos: ${demoUsers.length} cargados`);
}

// === Store tokens refresh ===
export const refreshStore = new Map();