const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar Base de Datos SQLite
const db = new sqlite3.Database('./agenda.db', (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite (agenda.db)');
  }
});

// Crear la tabla "contacto" si no existe
db.run(`
  CREATE TABLE IF NOT EXISTS contacto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombres TEXT NOT NULL,
    genero TEXT,
    fecha_nacimiento DATE,
    telefono TEXT,
    email TEXT,
    linkedin TEXT,
    tipo_sangre TEXT
  )
`);

// ================= RUTA DE LA API (CRUD) =================

// 1. OBTENER TODOS LOS CONTACTOS (READ)
app.get('/api/contactos', (req, res) => {
  const sql = 'SELECT * FROM contacto ORDER BY id DESC';
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 2. CREAR UN NUEVO CONTACTO (CREATE)
app.post('/api/contactos', (req, res) => {
  const { nombres, genero, fecha_nacimiento, telefono, email, linkedin, tipo_sangre } = req.body;
  const sql = `
    INSERT INTO contacto (nombres, genero, fecha_nacimiento, telefono, email, linkedin, tipo_sangre)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [nombres, genero, fecha_nacimiento, telefono, email, linkedin, tipo_sangre];
  
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, ...req.body });
  });
});

// 3. ACTUALIZAR UN CONTACTO EXISTENTE (UPDATE)
app.put('/api/contactos/:id', (req, res) => {
  const { id } = req.params;
  const { nombres, genero, fecha_nacimiento, telefono, email, linkedin, tipo_sangre } = req.body;
  const sql = `
    UPDATE contacto 
    SET nombres = ?, genero = ?, fecha_nacimiento = ?, telefono = ?, email = ?, linkedin = ?, tipo_sangre = ?
    WHERE id = ?
  `;
  const params = [nombres, genero, fecha_nacimiento, telefono, email, linkedin, tipo_sangre, id];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Contacto actualizado exitosamente', changes: this.changes });
  });
});

// 4. ELIMINAR UN CONTACTO (DELETE)
app.delete('/api/contactos/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM contacto WHERE id = ?';
  db.run(sql, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Contacto eliminado', changes: this.changes });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});