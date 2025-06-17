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

  db.run(`
    INSERT OR IGNORE INTO direccion (calle, sector, estado, pais, numero_casa, referencia, LAT, LON) VALUES
    ('Calle Progreso', 'Punto Fijo', 'Falcón', 'Venezuela', '12', 'Casa roja con azul', 11.68889634103253, -70.20155342048898),
    ('C. los Jabillos', 'Punto Fijo', 'Falcón', 'Venezuela', '8', 'Frente a la panadería', 11.70816182734095, -70.19445410030877),
    ('Libertador', 'Punto Fijo', 'Falcón', 'Venezuela', '15', 'Al lado del banco', 11.713557623227912, -70.20077224029568),
    ('Urbanización Las Adjuntas', 'Punto Fijo', 'Falcón', 'Venezuela', '21', 'Cerca del parque infantil', 11.703281441303954, -70.17263772586142),
    ('Urdaneta', 'Punto Fijo', 'Falcón', 'Venezuela', '7', 'Frente a la iglesia', 11.676346986012781, -70.18296797411423),
    ('C. Falcón', 'Punto Fijo', 'Falcón', 'Venezuela', '19', 'Casa esquina', 11.676004786247187, -70.18741777596908),
    ('Miranda', 'Punto Fijo', 'Falcón', 'Venezuela', '10', 'Cerca del colegio', 11.72633192390973, -70.17412064895362),
    ('Av. 2', 'Punto Fijo', 'Falcón', 'Venezuela', '5', 'Frente a la plaza Bolívar', 11.721848539873028, -70.19020493713694),
    ('Libertad', 'Punto Fijo', 'Falcón', 'Venezuela', '18', 'Detrás del centro comercial', 11.727546660514237, -70.17500958596737),
    ('Sector Universitario', 'Punto Fijo', 'Falcón', 'Venezuela', '3', 'Cerca de la universidad', 11.695096327115184, -70.16559732806195),
    ('Urbanización Las Adjuntas', 'Punto Fijo', 'Falcón', 'Venezuela', '14', 'Frente a la cancha', 11.703803559768144, -70.17156064156553),
    ('C. Adaure', 'Punto Fijo', 'Falcón', 'Venezuela', '6', 'Cerca del hospital', 11.71262051539352, -70.20247993171283),
    ('Miranda', 'Punto Fijo', 'Falcón', 'Venezuela', '9', 'Al lado de la iglesia', 11.718127231398007, -70.21999059448902),
    ('Av. Los Claveles', 'Punto Fijo', 'Falcón', 'Venezuela', '11', 'Frente al mercado', 11.693287821041661, -70.19392926015813),
    ('Calle Brisas del Nte.', 'Punto Fijo', 'Falcón', 'Venezuela', '16', 'Casa con mural', 11.67868738027452, -70.21205177880064),
    ('Calle Arismendi', 'Punto Fijo', 'Falcón', 'Venezuela', '4', 'Esquina con calle principal', 11.694055320711232, -70.20385303991368),
    ('C. Garces', 'Punto Fijo', 'Falcón', 'Venezuela', '13', 'Casa con árbol grande', 11.690940311028909, -70.2153863368299),
    ('Calle Altagracia', 'Punto Fijo', 'Falcón', 'Venezuela', '2', 'Cerca del ambulatorio', 11.689052351932386, -70.2154432411277),
    ('Calle Uruguay', 'Punto Fijo', 'Falcón', 'Venezuela', '20', 'Casa con cerca blanca', 11.68803499890612, -70.21472643007304),
    ('Calle Peninsular', 'Punto Fijo', 'Falcón', 'Venezuela', '17', 'Portón marrón', 11.686498991824662, -70.2115615767036),
    ('Calle Democracia', 'Punto Fijo', 'Falcón', 'Venezuela', '22', 'Frente al banco', 11.68444802137291, -70.2126663930996),
    ('C. Chile', 'Punto Fijo', 'Falcón', 'Venezuela', '1', 'Casa con balcón', 11.680463799974344, -70.21546869020385),
    ('Bolvar', 'Punto Fijo', 'Falcón', 'Venezuela', '23', 'Diagonal a la plaza', 11.702197264234933, -70.18324032456225),
    ('Comercio', 'Punto Fijo', 'Falcón', 'Venezuela', '24', 'Frente al centro comercial', 11.700107314945651, -70.18438324112262),
    ('Av. 11', 'Comunidad Cardon', 'Falcón', 'Venezuela', '25', 'Cerca de la estación de servicio', 11.651646309461134, -70.21897769148272),
    ('Av. 14', 'Punta Cardón', 'Falcón', 'Venezuela', '26', 'Al lado del colegio', 11.642962188920313, -70.22501603319091),
    ('Av. 3', 'Punta Cardón', 'Falcón', 'Venezuela', '27', 'Frente a la plaza', 11.658572221180126, -70.21680994666299),
    ('Avenida 2', 'Punta Cardón', 'Falcón', 'Venezuela', '28', 'Cerca del abasto', 11.657875735380916, -70.21982017797819),
    ('C. Sta. Bárbara', 'Punta Cardón', 'Falcón', 'Venezuela', '29', 'Detrás de la iglesia', 11.645835312564985, -70.19362508119504),
    ('Los Rosales', 'Punta Cardón', 'Falcón', 'Venezuela', '30', 'Cerca del parque', 11.624056102965021, -70.21039690703799)`
  );



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

// generarPaquetesAleatorios(10);

module.exports = db;