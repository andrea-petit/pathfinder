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

  db.run(`CREATE TABLE IF NOT EXISTS direccion_lat_long (
    id_direccion INTEGER PRIMARY KEY,
    latitud REAL NOT NULL,
    longitud REAL NOT NULL,
    FOREIGN KEY (id_direccion) REFERENCES direccion(id_direccion)
  );`);

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
      modelo TEXT,
      estado TEXT DEFAULT 'disponible'
    );
  `);

  db.run(`
    INSERT OR IGNORE INTO vehiculos (placa, marca, modelo, estado) VALUES
      ('MTO123A', 'Bajaj', 'Pulsar NS125', 'disponible'),
      ('MTO456B', 'Zontes', 'Zontes 125', 'disponible'),
      ('MTO789C', 'Yamaha', 'YBR 125', 'disponible'),
      ('MTO234D', 'Bajaj', 'Boxer 150', 'disponible'),
      ('MTO567E', 'Zontes', 'Zontes 155', 'disponible'),
      ('CAR123F', 'Chevrolet', 'Spark', 'disponible'),
      ('CAR456G', 'Hyundai', 'Accent', 'disponible'),
      ('CAR789H', 'Toyota', 'Corolla', 'disponible'),
      ('CAM123I', 'Mitsubishi', 'L200', 'disponible'),
      ('CAM456J', 'Toyota', 'Hilux', 'disponible');
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
        FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado),
        FOREIGN KEY (id_pregunta) REFERENCES preguntas_seguridad(id)
    );
`)



  // db.run(`INSERT INTO direccion (sector, urbanizacion, calle, numero_casa, referencia) VALUES
  //   ('Centro', 'Bella Vista', 'Comercio', '12-34', 'Frente a la Plaza Bolívar'),
  //   ('Amuay', 'Las Palmas', 'Principal', '23-45', 'Cerca de la entrada a Cardón'),
  //   ('Pueblo Nuevo', 'Los Médanos', '5 de Julio', '56-78', 'Al lado de la escuela'),
  //   ('La Vela', 'Costa Azul', 'Miranda', '34-56', 'Detrás del supermercado'),
  //   ('Judibana', 'Las Dunas', 'Falcón', '67-89', 'Frente a la clínica'),
  //   ('Centro', 'El Progreso', 'Zamora', '45-67', 'Esquina de la farmacia'),
  //   ('Punta Cardón', 'El Cardonal', 'Bolívar', '78-90', 'Al lado de la iglesia'),
  //   ('Carirubana', 'Los Olivos', 'Sucre', '90-12', 'Frente al abasto'),
  //   ('Pueblo Nuevo', 'Las Margaritas', 'Urdaneta', '12-34', 'Cerca del estacionamiento'),
  //   ('Amuay', 'Los Cocos', 'Páez', '23-45', 'Detrás del banco'),
  //   ('La Vela', 'Bahía', 'Guzmán', '34-56', 'Al final de la calle'),
  //   ('Judibana', 'Las Acacias', 'Mariño', '67-89', 'Frente a la panadería'),
  //   ('Centro', 'El Mirador', 'Ayacucho', '45-67', 'Entre carrera 3 y 4'),
  //   ('Punta Cardón', 'El Paraíso', 'Baralt', '78-90', 'Casa de dos pisos'),
  //   ('Carirubana', 'Los Girasoles', 'Rojas', '90-12', 'Portón negro'),
  //   ('Pueblo Nuevo', 'Las Gardenias', 'Andrés Bello', '12-34', 'Al lado de la ferretería'),
  //   ('Amuay', 'Los Mangos', 'Carvajal', '23-45', 'Frente a la plaza'),
  //   ('La Vela', 'Las Palmitas', 'Colón', '34-56', 'Cerca del ambulatorio'),
  //   ('Judibana', 'Las Brisas', 'Pichincha', '67-89', 'Casa amarilla'),
  //   ('Centro', 'La Loma', 'Junín', '45-67', 'Esquina principal'),
  //   ('Punta Cardón', 'El Portón', 'Boyacá', '78-90', 'Detrás del liceo'),
  //   ('Carirubana', 'Los Robles', 'Ayacucho', '90-12', 'Frente al restaurante'),
  //   ('Pueblo Nuevo', 'Las Azucenas', 'Sucre', '12-34', 'Al lado de la peluquería'),
  //   ('Amuay', 'Los Almendros', 'Bolívar', '23-45', 'Cerca de la bomba'),
  //   ('La Vela', 'Las Mercedes', 'Miranda', '34-56', 'Portón rojo'),
  //   ('Judibana', 'Los Pinos', 'Guzmán', '67-89', 'Frente a la bodega'),
  //   ('Centro', 'La Colina', 'Zamora', '45-67', 'Casa con jardín'),
  //   ('Punta Cardón', 'El Jardín', 'Páez', '78-90', 'Al lado del taller'),
  //   ('Carirubana', 'Los Naranjos', 'Urdaneta', '90-12', 'Esquina de la panadería'),
  //   ('Pueblo Nuevo', 'Las Orquídeas', '5 de Julio', '12-34', 'Frente al cyber')
  // `);

  // db.run(`INSERT INTO clientes (id_cliente, nombre1, nombre2, apellido1, apellido2, telefono, id_direccion) VALUES
  //   (26457896, 'Juan', 'Carlos', 'Pérez', 'González', '04126893378', 1),
  //   (18765432, 'María', 'Alejandra', 'Rodríguez', 'López', '04246304379', 2),
  //   (20987654, 'Luis', 'Alberto', 'García', 'Martínez', '04121002225', 3),
  //   (23456789, 'Ana', 'Isabel', 'Hernández', 'Díaz', '04146574687', 4),
  //   (15678923, 'Carlos', 'Andrés', 'Sánchez', 'Ramírez', '04246215665', 5),
  //   (28976543, 'José', 'Manuel', 'Torres', 'Flores', '04126893378', 6),
  //   (19876543, 'Rosa', 'María', 'Vargas', 'Rojas', '04246304379', 7),
  //   (21345678, 'Pedro', 'Antonio', 'Mendoza', 'Castillo', '04121002225', 8),
  //   (17654329, 'Carmen', 'Luisa', 'Jiménez', 'Morales', '04146574687', 9),
  //   (22567891, 'Francisco', 'Javier', 'Ortiz', 'Silva', '04246215665', 10),
  //   (19456782, 'Isabel', 'Carolina', 'Fernández', 'Gómez', '04126893378', 11),
  //   (20765432, 'Miguel', 'Enrique', 'Alvarado', 'Blanco', '04246304379', 12),
  //   (18654327, 'Luisa', 'Fernanda', 'Castro', 'Contreras', '04121002225', 13),
  //   (23678945, 'Alejandro', 'Ricardo', 'Delgado', 'Escobar', '04146574687', 14),
  //   (16543298, 'Patricia', 'Gabriela', 'Guzmán', 'Herrera', '04246215665', 15),
  //   (21987654, 'Jorge', 'Rafael', 'León', 'Medina', '04126893378', 16),
  //   (20345678, 'Daniela', 'Victoria', 'Núñez', 'Peña', '04246304379', 17),
  //   (19567823, 'Eduardo', 'Fernando', 'Quintero', 'Reyes', '04121002225', 18),
  //   (24678912, 'Beatriz', 'Claudia', 'Suárez', 'Valdez', '04146574687', 19),
  //   (17543296, 'Roberto', 'Javier', 'Zambrano', 'Aguilar', '04246215665', 20),
  //   (22876543, 'Teresa', 'Diana', 'Pérez', 'González', '04126893378', 21),
  //   (19765438, 'Ricardo', 'Alberto', 'Rodríguez', 'López', '04246304379', 22),
  //   (21456789, 'Gloria', 'Marta', 'García', 'Martínez', '04121002225', 23),
  //   (18567923, 'Manuel', 'Francisco', 'Hernández', 'Díaz', '04146574687', 24),
  //   (23567891, 'Sofía', 'Adriana', 'Sánchez', 'Ramírez', '04246215665', 25),
  //   (16453297, 'Javier', 'Andrés', 'Torres', 'Flores', '04126893378', 26),
  //   (22987654, 'Elena', 'Beatriz', 'Vargas', 'Rojas', '04246304379', 27),
  //   (19876534, 'Antonio', 'José', 'Mendoza', 'Castillo', '04121002225', 28),
  //   (21678945, 'Carolina', 'Patricia', 'Jiménez', 'Morales', '04146574687', 29),
  //   (18456792, 'Fernando', 'Miguel', 'Ortiz', 'Silva', '04246215665', 30)
  // `);



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

//generarPaquetesAleatorios(10);

module.exports = db;