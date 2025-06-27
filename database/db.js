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
      calle TEXT NOT NULL,
      sector TEXT NOT NULL,
      estado TEXT NOT NULL,
      pais TEXT NOT NULL,
      numero_casa TEXT NOT NULL,
      referencia TEXT,
      LAT REAL,
      LON REAL
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
      FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE
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
      FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
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
      FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE
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
        FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
        FOREIGN KEY (id_pregunta) REFERENCES preguntas_seguridad(id)
    );
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS solicitudCambioVehiculo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_empleado INTEGER NOT NULL,
      id_vehiculo INTEGER NOT NULL,
      fecha_solicitud TEXT DEFAULT (datetime('now')),
      estado TEXT DEFAULT 'pendiente',
      FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
      FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id_vehiculo)
    );
  `);

  // db.run(`
  //   INSERT OR IGNORE INTO direccion (calle, sector, estado, pais, numero_casa, referencia, LAT, LON) VALUES
  //   ('Av. 14', 'Comunidad Cardon', 'Falcón', 'Venezuela', '101', 'Frente a la cancha comunitaria', 11.650002055199668, -70.21932362969456),
  //   ('Av. 12', 'Comunidad Cardon', 'Falcón', 'Venezuela', '102', 'Casa amarilla cerca de la bodega', 11.6499923563871, -70.22194628651313),
  //   ('Av. 6', 'Comunidad Cardon', 'Falcón', 'Venezuela', '103', 'Frente al CDI de la zona', 11.65172086808045, -70.21991048008732),
  //   ('Av. 11', 'Comunidad Cardon', 'Falcón', 'Venezuela', '104', 'Cerca de la estación de servicio', 11.65097244786617, -70.21428912883599),
  //   ('Av. 15', 'Comunidad Cardon', 'Falcón', 'Venezuela', '105', 'Casa blanca con portón negro', 11.64899845713972, -70.21681938651359),
  //   ('20 Av. 12', 'Comunidad Cardon', 'Falcón', 'Venezuela', '106', 'Esquina con callejón sin salida', 11.646087911525546, -70.225211842328),
  //   ('Avenida 8', 'Comunidad Cardon', 'Falcón', 'Venezuela', '107', 'Casa azul, frente a la iglesia', 11.65285390023109, -70.21431325092604),
  //   ('Av. 13', 'Comunidad Cardon', 'Falcón', 'Venezuela', '108', 'Casa con mata de mango al frente', 11.64962482532468, -70.21430102883603),
  //   ('Avenida 9', 'Comunidad Cardon', 'Falcón', 'Venezuela', '109', 'Diagonal al abasto Maraven', 11.65278083884915, -70.21678329999996),
  //   ('Av. 16', 'Comunidad Cardon', 'Falcón', 'Venezuela', '110', 'Frente al módulo policial', 11.648429696993162, -70.21894567117174),
  //   ('Av. 18', 'Punta Cardón', 'Falcón', 'Venezuela', '111', 'Al lado del centro vecinal', 11.644631916637174, -70.22184433069205),
  //   ('23 De Enero', 'Punta Cardón', 'Falcón', 'Venezuela', '112', 'Casa con rejas verdes', 11.63669816671115, -70.2070716153455),
  //   ('Av. Ollarvides', 'Punta Cardón', 'Falcón', 'Venezuela', '113', 'Frente a la cancha deportiva', 11.634655225972786, -70.20690110186027),
  //   ('C. Bobare', 'Punta Cardón', 'Falcón', 'Venezuela', '114', 'Casa con mural patriótico', 11.64147066511533, -70.2004431558254),
  //   ('Callejon Uribante', 'Punta Cardón', 'Falcón', 'Venezuela', '115', 'Casa blanca con portón azul', 11.643291072636986, -70.20199878651079),
  //   ('Puerta Maraven', 'Punta Cardón', 'Falcón', 'Venezuela', '116', 'Frente a la plaza Bolívar', 11.645289579955264, -70.20253174907762),
  //   ('Av. Gral. Pelayo', 'Punta Cardón', 'Falcón', 'Venezuela', '117', 'Casa con jardín amplio', 11.64953083226877, -70.20126215092891),
  //   ('C. Tinaco', 'Punta Cardón', 'Falcón', 'Venezuela', '118', 'Detrás del ambulatorio', 11.641987338067946, -70.20535422209457),
  //   ('C. Bucaral', 'Punta Cardón', 'Falcón', 'Venezuela', '119', 'Frente al mercadito local', 11.639282738560189, -70.20550075952933),
  //   ('Urb. España', 'Punta Cardón', 'Falcón', 'Venezuela', '120', 'Casa de techo rojo', 11.639691203573198, -70.20240456418641),
  //   ('C. Adícora', 'Punta Cardón', 'Falcón', 'Venezuela', '121', 'Cerca del Simoncito', 11.651356600962187, -70.19029302699091),
  //   ('C. Tocuyo', 'Punta Cardón', 'Falcón', 'Venezuela', '122', 'Frente al galpón abandonado', 11.650472601400217, -70.19236793069521),
  //   ('C. Sta. Bárbara', 'Punta Cardón', 'Falcón', 'Venezuela', '123', 'Casa de esquina con grafiti', 11.648889988689975, -70.19234348651592),
  //   ('C. Trompillo', 'Punta Cardón', 'Falcón', 'Venezuela', '124', 'Cerca del kiosko de empanadas', 11.65136545535353, -70.19423977302102),
  //   ('Av. España', 'Punta Cardón', 'Falcón', 'Venezuela', '125', 'Casa frente a la iglesia cristiana', 11.652782338687086, -70.19624970000267),
  //   ('Av. Tucacas', 'Punta Cardón', 'Falcón', 'Venezuela', '126', 'Diagonal al liceo técnico', 11.655535514667287, -70.19154443558526),
  //   ('C. Las Vegas', 'Punta Cardón', 'Falcón', 'Venezuela', '127', 'Casa con portón verde', 11.656454399221708, -70.19193030000227),
  //   ('Puerta Maraven', 'Punta Cardón', 'Falcón', 'Venezuela', '128', 'Casa esquinera frente al abasto', 11.649107542662149, -70.18805896441994),
  //   ('C. Dabajuro', 'Punta Cardón', 'Falcón', 'Venezuela', '129', 'Casa con fachada de ladrillos', 11.651897184850666, -70.18793300674841),
  //   ('Av. Gral. Pelayo', 'Punta Cardón', 'Falcón', 'Venezuela', '130', 'Al lado del centro cultural', 11.658788452390677, -70.19703787116401);
  //   `);




  db.run(`INSERT OR IGNORE INTO clientes (id_cliente, nombre1, nombre2, apellido1, apellido2, telefono, id_direccion) VALUES
    (26457896, 'Juan', 'Carlos', 'Pérez', 'González', '04126893378', 1),
    (18765432, 'María', 'Alejandra', 'Rodríguez', 'López', '04246304379', 2),
    (20987654, 'Luis', 'Alberto', 'García', 'Martínez', '04121002225', 3),
    (23456789, 'Ana', 'Isabel', 'Hernández', 'Díaz', '04146574687', 4),
    (15678923, 'Carlos', 'Andrés', 'Sánchez', 'Ramírez', '04246215665', 5),
    (28976543, 'José', 'Manuel', 'Torres', 'Flores', '04126893378', 6),
    (19876543, 'Rosa', 'María', 'Vargas', 'Rojas', '04246304379', 7),
    (21345678, 'Pedro', 'Antonio', 'Mendoza', 'Castillo', '04121002225', 8),
    (17654329, 'Carmen', 'Luisa', 'Jiménez', 'Morales', '04146574687', 9),
    (22567891, 'Francisco', 'Javier', 'Ortiz', 'Silva', '04246215665', 10),
    (19456782, 'Isabel', 'Carolina', 'Fernández', 'Gómez', '04126893378', 11),
    (20765432, 'Miguel', 'Enrique', 'Alvarado', 'Blanco', '04246304379', 12),
    (18654327, 'Luisa', 'Fernanda', 'Castro', 'Contreras', '04121002225', 13),
    (23678945, 'Alejandro', 'Ricardo', 'Delgado', 'Escobar', '04146574687', 14),
    (16543298, 'Patricia', 'Gabriela', 'Guzmán', 'Herrera', '04246215665', 15),
    (21987654, 'Jorge', 'Rafael', 'León', 'Medina', '04126893378', 16),
    (20345678, 'Daniela', 'Victoria', 'Núñez', 'Peña', '04121002225', 17),
    (19567823, 'Eduardo', 'Fernando', 'Quintero', 'Reyes', '04146574687', 18),
    (24678912, 'Beatriz', 'Claudia', 'Suárez', 'Valdez', '04146574687', 19),
    (17543296, 'Roberto', 'Javier', 'Zambrano', 'Aguilar', '04246215665', 20),
    (22876543, 'Teresa', 'Diana', 'Pérez', 'González', '04126893378', 21),
    (19765438, 'Ricardo', 'Alberto', 'Rodríguez', 'López', '04246304379', 22),
    (21456789, 'Gloria', 'Marta', 'García', 'Martínez', '04121002225', 23),
    (18567923, 'Manuel', 'Francisco', 'Hernández', 'Díaz', '04146574687', 24),
    (23567891, 'Sofía', 'Adriana', 'Sánchez', 'Ramírez', '04246215665', 25),
    (16453297, 'Javier', 'Andrés', 'Torres', 'Flores', '04126893378', 26),
    (22987654, 'Elena', 'Beatriz', 'Vargas', 'Rojas', '04246304379', 27),
    (19876534, 'Antonio', 'José', 'Mendoza', 'Castillo', '04121002225', 28),
    (21678945, 'Carolina', 'Patricia', 'Jiménez', 'Morales', '04146574687', 29),
    (18456792, 'Fernando', 'Miguel', 'Ortiz', 'Silva', '04246215665', 30)
  `);

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

//generarPaquetesAleatorios(20);

module.exports = db;