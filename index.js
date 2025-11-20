// index.js - Backend completo para contactos + servir frontend
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

// Configuración del servidor
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MySQL (Railway)
const db = mysql.createConnection(process.env.DATABASE_URL || "mysql://root:BxYhFVGXulexotzScQhFZhnkYSCTEaDo@trolley.proxy.rlwy.net:23821/railway");

db.connect(err => {
  if (err) {
    console.error('Error al conectar a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL correctamente.');
});

// Crear tabla si no existe
const createTableQuery = `
CREATE TABLE IF NOT EXISTS contactos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL,
  telefono VARCHAR(30),
  mensaje TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;
db.query(createTableQuery, (err) => {
  if (err) console.error('Error al crear/verificar tabla:', err);
  else console.log('Tabla contactos verificada/creada.');
});

// Rutas de la API
app.post('/api/contactos', (req, res) => {
  const { nombre, correo, telefono, mensaje } = req.body;
  console.log('POST /api/contactos body:', req.body);

  if (!nombre || !correo) {
    return res.status(400).json({ error: 'Nombre y correo son obligatorios' });
  }

  const sql = 'INSERT INTO contactos (nombre, correo, telefono, mensaje) VALUES (?, ?, ?, ?)';
  db.query(sql, [nombre, correo, telefono || '', mensaje || ''], (err, result) => {
    if (err) {
      console.error('Error al insertar:', err);
      return res.status(500).json({ error: 'Error al guardar en la base de datos' });
    }
    res.json({ insertId: result.insertId });
  });
});

// SERVIR FRONTEND
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Si no encuentra ruta, devuelve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`API escuchando en puerto ${PORT}`);
});
