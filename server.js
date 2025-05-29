const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const sql = require('mssql');
const dbConfig = {
  user: 'sa',
  password: 'renato2002',
  server: 'DESKTOP-7P4JJKS',
  database: 'RegistroTI',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
async function testConnections() {
  try {
    let pool = await sql.connect(dbConfig);
    console.log('✅ Conectado a la base de datos.');
    pool.close();
  } catch (err) {
    console.error('❌ Error de conexión:', err);
  }
}
testConnections();
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
app.get('/buscarColaborador/:nombre', async (req, res) => {
  try {
    const nombre = req.params.nombre;
    let pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('Nombre', sql.VarChar, nombre)
      .query(`SELECT Id, Nombre, Departamento, area, Modalidad, Email, Estado, Pais, Lugar FROM UsuariosExistentes WHERE Nombre = @Nombre`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset[0]);
    } else {
      res.status(404).json({ error: 'Colaborador no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar colaborador', detalles: err.message });
  }
});
app.get('/buscarInventario/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('id', sql.VarChar, id)
      .query('SELECT * FROM NotebooksExistentes WHERE id = @id');

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset[0]);
    } else {
      res.status(404).json({ error: 'Equipo no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar inventario', detalles: err.message });
  }
});
app.post('/guardarAsignacion', async (req, res) => {
  try {
    const datos = req.body;
    const pool = await sql.connect(dbConfig);

    const USE = datos['USE'] || '';
    const nombreFinal = datos['Nombre'];

    const request = pool.request();
    request.input('Id', sql.VarChar, USE);
    request.input('Nombre', sql.VarChar, nombreFinal);
    request.input('Departamento', sql.VarChar, datos['Departamento']);
    request.input('Area', sql.VarChar, datos['Area']);
    request.input('Modalidad', sql.VarChar, datos['Modalidad']);
    request.input('Email', sql.VarChar, datos['Email']);
    request.input('Estado_colaborador', sql.VarChar, datos['Estado_colaborador']);
    request.input('Pais_colaborador', sql.VarChar, datos['Pais_colaborador']);
    request.input('Lugar', sql.VarChar, datos['Lugar']);
    request.input('ID_Equipo', sql.VarChar, datos['id']);
    request.input('Marca', sql.VarChar, datos['Marca']);
    request.input('Modelo', sql.VarChar, datos['Modelo']);
    request.input('RAM', sql.VarChar, datos['RAM']);
    request.input('Procesador', sql.VarChar, datos['Procesador']);
    request.input('Almacenamiento', sql.VarChar, datos['Almacenamiento']);
    request.input('Grafica', sql.VarChar, datos['Grafica']);
    request.input('MAC', sql.VarChar, datos['MAC']);
    request.input('Serie', sql.VarChar, datos['Serie']);
    request.input('PAIS_equipo', sql.VarChar, datos['Pais']);

    await request.query(`INSERT INTO asignacion_activos (
      [Id], [Nombre], [Departamento], [Area], [Modalidad], [Email], [Estado_colaborador],
      [Pais_colaborador], [Lugar], [ID_Equipo], [Marca], [Modelo], [RAM],
      [Procesador], [Almacenamiento], [Grafica], [MAC], [Serie], [PAIS_equipo]
    ) VALUES (
      @Id, @Nombre, @Departamento, @Area, @Modalidad, @Email, @Estado_colaborador,
      @Pais_colaborador, @Lugar, @ID_Equipo, @Marca, @Modelo, @RAM,
      @Procesador, @Almacenamiento, @Grafica, @MAC, @Serie, @PAIS_equipo
    )`);

    res.status(200).send('Asignación registrada correctamente');
  } catch (err) {
    console.error("❌ Error al guardar en asignacion_activos:", err);
    res.status(500).send('Error al guardar asignación');
  }
});
app.get('/ultimoIdUsuario', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT TOP 1 Id FROM UsuariosExistentes ORDER BY Id DESC
    `);
    if (result.recordset.length > 0) {
      res.status(200).json({ ultimoId: result.recordset[0].Id });
    } else {
      res.status(200).json({ ultimoId: null });
    }
  } catch (err) {
    console.error("❌ Error al obtener el último ID de usuario:", err.message);
    res.status(500).json({ error: 'No se pudo obtener el último ID de usuario' });
  }
});
app.post('/submit1', async (req, res) => {
  try {
    const datos = req.body;
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    request.input('Id', sql.VarChar, datos['id']);
    request.input('Nombre', sql.VarChar, datos['Nombre']);
    request.input('Departamento', sql.VarChar, datos['Departamento']);
    request.input('area', sql.VarChar, datos['area']);
    request.input('Modalidad', sql.VarChar, datos['Modalidad']);
    request.input('Email', sql.VarChar, datos['Email']);
    request.input('Estado', sql.VarChar, datos['Estado']);
    request.input('Pais', sql.VarChar, datos['Pais']);
    request.input('Lugar', sql.VarChar, datos['Lugar']);

    await request.query(`
      INSERT INTO UsuariosExistentes (
        Id, Nombre, Departamento, area, Modalidad, Email, Estado, Pais, Lugar
      ) VALUES (
        @Id, @Nombre, @Departamento, @area, @Modalidad, @Email, @Estado, @Pais, @Lugar
      )
    `);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ mensaje: 'Colaborador registrado correctamente', id: datos['id'] });
  } catch (err) {
    console.error("❌ Error al guardar colaborador:", err.message);
    res.status(500).send('Error al registrar colaborador');
  }
});
app.get('/ultimoIdInventario', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT TOP 1 id
      FROM NotebooksExistentes
      WHERE ISNUMERIC(SUBSTRING(id, 4, LEN(id))) = 1
      ORDER BY CAST(SUBSTRING(id, 4, LEN(id)) AS INT) DESC
    `);

    if (result.recordset.length > 0) {
      res.status(200).json({ ultimoId: result.recordset[0].id });
    } else {
      res.status(200).json({ ultimoId: null });
    }
  } catch (err) {
    console.error("❌ Error al obtener el último ID de inventario:", err.message);
    res.status(500).json({ error: 'No se pudo obtener el último ID de inventario' });
  }
});
app.post('/submit2', async (req, res) => {
  try {
    const datos = req.body;
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    request.input('id', sql.VarChar, datos['id']);
    request.input('Marca', sql.VarChar, datos['Marca']);
    request.input('Modelo', sql.VarChar, datos['Modelo']);
    request.input('RAM', sql.VarChar, datos['RAM']);
    request.input('Procesador', sql.VarChar, datos['Procesador']);
    request.input('Almacenamiento', sql.VarChar, datos['Almacenamiento']);
    request.input('OS', sql.VarChar, datos['OS']);
    request.input('Pantalla', sql.VarChar, datos['Pantalla']);
    request.input('Grafica', sql.VarChar, datos['Grafica']);
    request.input('MAC', sql.VarChar, datos['MAC']);
    request.input('Serie', sql.VarChar, datos['Serie']);
    request.input('Numero_Equipo', sql.VarChar, datos['Numero_Equipo']);
    request.input('Estado', sql.VarChar, datos['Estado']);
    request.input('Garantia', sql.VarChar, datos['Garantia']);
    request.input('Garantia_Caduca', sql.Date, datos['Garantia_Caduca']);
    request.input('PAIS', sql.VarChar, datos['PAIS']);
    request.input('Mueble', sql.VarChar, datos['Mueble']);
    request.input('Bodega', sql.VarChar, datos['Bodega']);
    request.input('oficina', sql.VarChar, datos['oficina']);

    await request.query(`
      INSERT INTO NotebooksExistentes (
        id, Marca, Modelo, RAM, Procesador, Almacenamiento, OS,
        Pantalla, Grafica, MAC, Serie, Numero_Equipo, Estado,
        Garantia, Garantia_Caduca, PAIS, Mueble, Bodega, oficina, FechaRegistro
      ) VALUES (
        @id, @Marca, @Modelo, @RAM, @Procesador, @Almacenamiento, @OS,
        @Pantalla, @Grafica, @MAC, @Serie, @Numero_Equipo, @Estado,
        @Garantia, @Garantia_Caduca, @PAIS, @Mueble, @Bodega, @oficina, GETDATE()
      )
    `);

    res.status(200).json({ mensaje: 'Equipo registrado correctamente', id: datos['id'] });
  } catch (err) {
    console.error("❌ Error al guardar equipo:", err.message);
    res.status(500).send('Error al registrar equipo');
  }
});
app.get('/buscar_usuario', async (req, res) => {
  const nombre = req.query.nombre;
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('nombre', sql.VarChar, `%${nombre}%`)
      .query("SELECT * FROM UsuariosExistentes WHERE Nombre LIKE @nombre");
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error al buscar usuario:", err);
    res.status(500).send("Error en búsqueda de usuario");
  }
});
app.get('/buscar_notebook', async (req, res) => {
  const id = req.query.id;
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('id', sql.VarChar, id)
      .query("SELECT * FROM NotebooksExistentes WHERE id = @id");
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error al buscar notebook:", err);
    res.status(500).send("Error en búsqueda de notebook");
  }
});
app.post('/editar_usuario', async (req, res) => {
  try {
    const datos = req.body;
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input('Id', sql.VarChar, datos.id_usuario)
      .input('Nombre', sql.VarChar, datos.nombre)
      .input('Departamento', sql.VarChar, datos.departamento)
      .input('Modalidad', sql.VarChar, datos.modalidad)
      .input('Estado', sql.VarChar, datos.estado)
      .input('Pais', sql.VarChar, datos.pais)
      .input('Lugar', sql.VarChar, datos.lugar)
      .input('Area', sql.VarChar, datos.area)
      .input('Email', sql.VarChar, datos.email)
      .query(`
        UPDATE UsuariosExistentes SET
          Nombre = @Nombre,
          Departamento = @Departamento,
          Modalidad = @Modalidad,
          Estado = @Estado,
          Pais = @Pais,
          Lugar = @Lugar,
          Area = @Area,
          Email = @Email
        WHERE Id = @Id
      `);

    res.status(200).send('✅ Usuario actualizado correctamente');
  } catch (err) {
    console.error("❌ Error al actualizar usuario:", err.message);
    res.status(500).send('Error al actualizar usuario');
  }
});
app.post('/editar_notebook', async (req, res) => {
  const d = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('ID', sql.VarChar, d.ID)
      .input('Marca', sql.VarChar, d.Marca)
      .input('Modelo', sql.VarChar, d.Modelo)
      .input('RAM', sql.VarChar, d.RAM)
      .input('Procesador', sql.VarChar, d.Procesador)
      .input('Almacenamiento', sql.VarChar, d.Almacenamiento)
      .input('OS', sql.VarChar, d.OS)
      .input('Pantalla', sql.VarChar, d.Pantalla)
      .input('Grafica', sql.VarChar, d.Grafica)
      .input('MAC', sql.VarChar, d.MAC)
      .input('Serie', sql.VarChar, d.Serie)
      .input('Numero_Equipo', sql.VarChar, d.Numero_Equipo)
      .input('Estado', sql.VarChar, d.Estado)
      .input('Garantia', sql.VarChar, d.Garantia)
      .input('Garantia_Caduca', sql.VarChar, d.Garantia_Caduca)
      .input('Mueble', sql.VarChar, d.Mueble)
      .input('Bodega', sql.VarChar, d.Bodega)
      .input('Pais', sql.VarChar, d.Pais)
      .input('Oficina', sql.VarChar, d.oficina)
      .input('FechaRegistro', sql.VarChar, d.FechaRegistro)
      .query(`
        UPDATE NotebooksExistentes SET
          Marca = @Marca,
          Modelo = @Modelo,
          RAM = @RAM,
          Procesador = @Procesador,
          Almacenamiento = @Almacenamiento,
          OS = @OS,
          Pantalla = @Pantalla,
          Grafica = @Grafica,
          MAC = @MAC,
          Serie = @Serie,
          Numero_Equipo = @Numero_Equipo,
          Estado = @Estado,
          Garantia = @Garantia,
          Garantia_Caduca = @Garantia_Caduca,
          Mueble = @Mueble,
          Bodega = @Bodega,
          Pais = @Pais,
          Oficina = @Oficina,
          FechaRegistro = @FechaRegistro
        WHERE ID = @ID
      `);

    res.send('✅ Notebook actualizado');
  } catch (err) {
    console.error("❌ Error al actualizar notebook:", err.message);
    res.status(500).send('Error en actualización');
  }
});

app.get('/buscar_notebook2', async (req, res) => {
  const id = req.query.id?.trim();
  const serie = req.query.serie?.trim();

  try {
    const pool = await sql.connect(dbConfig);
    let result;

    if (id) {
      result = await pool.request()
        .input('id', sql.VarChar, id)
        .query('SELECT * FROM NotebooksExistentes WHERE ID = @id');
    } else if (serie) {
      result = await pool.request()
        .input('serie', sql.VarChar, `%${serie}%`)
        .query('SELECT * FROM NotebooksExistentes WHERE Serie LIKE @serie');
    } else {
      return res.status(400).send('❌ Debes proporcionar un ID o una Serie.');
    }

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error al buscar notebook:", err);
    res.status(500).send("Error en búsqueda de notebook");
  }
});

app.get('/buscarAsignacion', async (req, res) => {
  const id = req.query.id?.trim();
  const nombre = req.query.nombre?.trim();

  try {
    const pool = await sql.connect(dbConfig);
    let result;

    if (id) {
      result = await pool.request()
        .input('ID_Equipo', sql.VarChar, id)
        .query('SELECT * FROM asignacion_activos WHERE ID_Equipo = @ID_Equipo');
    } else if (nombre) {
      result = await pool.request()
        .input('Nombre', sql.VarChar, `%${nombre}%`)
        .query('SELECT * FROM asignacion_activos WHERE Nombre LIKE @Nombre');
    } else {
      return res.status(400).send('Debe proporcionar ID de equipo o nombre');
    }

    if (result.recordset.length > 0) {
      res.json(result.recordset);
    } else {
      res.status(404).send('Asignación no encontrada');
    }
  } catch (err) {
    console.error('❌ Error al buscar asignación:', err);
    res.status(500).send('Error en búsqueda');
  }
});

app.get('/buscarInventario/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('ID_Equipo', sql.VarChar, id)
      .query(`
        SELECT Marca, Modelo, RAM, Procesador, Almacenamiento, Grafica, MAC, Serie, Pais, FechaRegistro
        FROM NotebooksExistentes
        WHERE ID = @ID
      `);
    
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Equipo no encontrado');
    }
  } catch (err) {
    console.error('❌ Error buscarInventario:', err);
    res.status(500).send('Error al buscar inventario');
  }
});

// Actualizar asignación
app.post('/actualizarAsignacion', async (req, res) => {
  const d = req.body;
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('Id', sql.VarChar, d.USE)
      .input('Nombre', sql.VarChar, d.Nombre)
      .input('Departamento', sql.VarChar, d.Departamento)
      .input('Modalidad', sql.VarChar, d.Modalidad)
      .input('Estado_colaborador', sql.VarChar, d.Estado_colaborador)
      .input('Pais_colaborador', sql.VarChar, d.Pais_colaborador)
      .input('Lugar', sql.VarChar, d.Lugar)
      .input('ID_Equipo', sql.VarChar, d.id)
      .input('Marca', sql.VarChar, d.Marca)
      .input('Modelo', sql.VarChar, d.Modelo)
      .input('RAM', sql.VarChar, d.RAM)
      .input('Procesador', sql.VarChar, d.Procesador)
      .input('Almacenamiento', sql.VarChar, d.Almacenamiento)
      .input('Grafica', sql.VarChar, d.Grafica)
      .input('MAC', sql.VarChar, d.MAC)
      .input('Serie', sql.VarChar, d.Serie)
      .input('PAIS_equipo', sql.VarChar, d.Pais)
      .input('FechaRegistro', sql.VarChar, d.FechaRegistro)
      .query(`
        UPDATE asignacion_activos SET
          Nombre = @Nombre,
          Departamento = @Departamento,
          Modalidad = @Modalidad,
          Estado_colaborador = @Estado_colaborador,
          Pais_colaborador = @Pais_colaborador,
          Lugar = @Lugar,
          ID_Equipo = @ID_Equipo,
          Marca = @Marca,
          Modelo = @Modelo,
          RAM = @RAM,
          Procesador = @Procesador,
          Almacenamiento = @Almacenamiento,
          Grafica = @Grafica,
          MAC = @MAC,
          Serie = @Serie,
          PAIS_equipo = @PAIS_equipo,
          FechaRegistro = @FechaRegistro
        WHERE Id = @Id
      `);
    res.send('✅ Asignación actualizada');
  } catch (err) {
    console.error('❌ Error actualizarAsignacion:', err);
    res.status(500).send('Error al actualizar asignación');
  }
});


// Eliminar asignación por ID
app.delete('/eliminarAsignacion/:id_equipo', async (req, res) => {
  const idEquipo = req.params.id_equipo;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('ID_Equipo', sql.VarChar, idEquipo)
      .query('DELETE FROM asignacion_activos WHERE ID_Equipo = @ID_Equipo');

    res.send('Asignación eliminada');
  } catch (err) {
    console.error('❌ Error al eliminar asignación:', err);
    res.status(500).send('Error al eliminar asignación');
  }
});


