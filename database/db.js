const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Conectado con exito a la BD de PathFinder.');
        db.run('PRAGMA foreign_keys = ON;');
    }
});

/* ESTRUCTURA DE LA DE BD



*/

db.serialize(() => {
  
  db.run(`
    CREATE TABLE IF NOT EXISTS direccion (
      id_direccion INTEGER PRIMARY KEY AUTOINCREMENT,
      sector TEXT NOT NULL,
      urbanizacion TEXT NOT NULL,
      calle TEXT NOT NULL,
      numero_casa TEXT NOT NULL,
      referencia TEXT
    );
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS empleados (
      id_empleado INTEGER PRIMARY KEY,
      nombre1 TEXT NOT NULL,
      nombre2 TEXT,
      apellido1 TEXT NOT NULL,
      apellido2 TEXT NOT NULL,
      telefono TEXT,
      correo TEXT UNIQUE
    );
  `);

  db.run(
    `
    INSERT OR IGNORE INTO empleados (id_empleado, nombre1, nombre2, apellido1, apellido2, telefono, correo)
    VALUES
    (1, 'Juan', 'Carlos', 'Pérez', 'Gómez', '0987654321', 'JUAN@GMAIL.COM');`
  );

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
      id_empleado INTEGER,
      nombre_usuario TEXT UNIQUE NOT NULL,
      contraseña TEXT NOT NULL,
      rol TEXT NOT NULL,
      FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado)
    );
  `);

  db.run(`
    INSERT OR IGNORE INTO usuarios (id_empleado, nombre_usuario, contraseña, rol)
    VALUES
    (1, 'admin', 'admin123', 'administrador');
    ` );

  db.run(`
    CREATE TABLE IF NOT EXISTS vehiculos (
      id_vehiculo INTEGER PRIMARY KEY AUTOINCREMENT,
      placa TEXT NOT NULL UNIQUE,
      marca TEXT,
      modelo TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS empleado_vehiculo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_empleado INTEGER,
      id_vehiculo INTEGER,
      nota TEXT,
      fecha_asignacion TEXT,
      FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado),
      FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id_vehiculo)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id_cliente INTEGER PRIMARY KEY,
      nombre1 TEXT NOT NULL,
      nombre2 TEXT,
      apellido1 TEXT NOT NULL,
      apellido2 TEXT NOT NULL,
      telefono TEXT,
      id_direccion INTEGER,
      FOREIGN KEY (id_direccion) REFERENCES direccion(id_direccion)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS paquetes (
      id_paquete INTEGER PRIMARY KEY AUTOINCREMENT,
      id_cliente INTEGER,
      fecha_envio TEXT,
      estado TEXT DEFAULT 'pendiente',
      FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS destinos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_paquete INTEGER,
      id_direccion INTEGER,
      FOREIGN KEY (id_paquete) REFERENCES paquetes(id_paquete),
      FOREIGN KEY (id_direccion) REFERENCES direccion(id_direccion)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS viajes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_empleado INTEGER,
      fecha TEXT,
      FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS viaje_detalles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_viaje INTEGER,
      id_destino INTEGER,
      orden_entrega INTEGER,
      estado TEXT DEFAULT 'pendiente',
      eta_estimada TEXT,
      observacion TEXT,
      FOREIGN KEY (id_viaje) REFERENCES viajes(id),
      FOREIGN KEY (id_destino) REFERENCES destinos(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS preguntas_seguridad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pregunta TEXT NOT NULL UNIQUE
    );
  `)

  db.run(`
    INSERT OR IGNORE INTO preguntas_seguridad (pregunta) VALUES
    ('¿Cuál es el nombre de tu mascota?'),
    ('¿Cuál es tu pasatiempo favorito?'),
    ('¿Cuál es el nombre de tu madre?'),
    ('¿Qué deporte te gusta practicar?'),
    ('¿Cuál es tu comida favorita?'),
    ('¿Cuál es el nombre de tu mejor amigo?'),
    ('¿Cuál es tu libro favorito?'),
    ('¿Cuál es tu película favorita?');
  `)

  db.run(`
      CREATE TABLE IF NOT EXISTS respuestas_seguridad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_empleado INTEGER NOT NULL,
    id_pregunta INTEGER NOT NULL,
    respuesta TEXT NOT NULL,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id),
    FOREIGN KEY (id_pregunta) REFERENCES preguntas_seguridad(id)
    );
  `)



});

function generarPaquetesAleatorios(cantidad = 30) {
  db.all(`SELECT id_cliente, id_direccion FROM clientes`, (err, clientes) => {
    if (err) {
      console.error('Error al obtener clientes:', err.message);
      return;
    }

    if (!clientes.length) {
      console.warn(' No hay clientes en la base de datos.');
      return;
    }

    for (let i = 0; i < cantidad; i++) {
      const clienteRandom = clientes[Math.floor(Math.random() * clientes.length)];

      db.run(`
        INSERT INTO paquetes (id_cliente, fecha_envio)
        VALUES (?, datetime('now'))
      `, [clienteRandom.id_cliente], function (err) {
        if (err) {
          console.error('Error al insertar paquete:', err.message);
          return;
        }

        const idPaquete = this.lastID;

        db.run(`
          INSERT INTO destinos (id_paquete, id_direccion)
          VALUES (?, ?)
        `, [idPaquete, clienteRandom.id_direccion], (err) => {
          if (err) {
            console.error('Error al insertar destino:', err.message);
          } else {
            console.log(` Paquete #${idPaquete} asignado al cliente ${clienteRandom.id_cliente}`);
          }
        });
      });
    }
  });
}

// generarPaquetesAleatorios(10);



module.exports = db;


