const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const connection = require("./db");

const app = express();
const port = 3000;

// Configuración de multer para almacenar las imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    ); // Nombre único
  },
});

const upload = multer({ storage: storage });

// Establecer EJS como motor de plantillas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, "public")));

// Ruta para mostrar la tienda (GET)
app.get("/", (req, res) => {
  const productosSql = "SELECT * FROM videojuegos";
  const categoriasSql = "SELECT * FROM categorias";

  // Ejecutar ambas consultas en paralelo
  connection.query(productosSql, (err, productos) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Error al obtener productos" });
    }

    connection.query(categoriasSql, (err, categorias) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Error al obtener categorías" });
      }

      // Renderizar la vista de la tienda con los productos y las categorías
      res.render("tienda", { productos, categorias });
    });
  });
});

// Ruta para la tienda (tienda.ejs)
app.get('/tienda', (req, res) => {
  // Consulta para obtener los videojuegos
  connection.query('SELECT * FROM videojuegos', (err, productos) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      return res.status(500).send('Error al obtener productos');
    }

    // Consulta para obtener las categorías
    connection.query('SELECT * FROM categorias', (err, categorias) => {
      if (err) {
        console.error('Error al obtener categorías:', err);
        return res.status(500).send('Error al obtener categorías');
      }

      // Renderizamos la vista de tienda y pasamos los productos y categorías
      res.render('tienda', {
        productos,
        categorias
      });
    });
  });
});

// Ruta para agregar un videojuego (incluye manejo de imagen)
app.post("/agregar-videojuego", upload.single("imagen"), (req, res) => {
  const { titulo, categoria, precio } = req.body;
  const imagen = req.file ? "/uploads/" + req.file.filename : null;

  // Validar que la categoría existe en la base de datos
  const categoriaId = parseInt(categoria);

  if (isNaN(categoriaId)) {
    return res.status(400).json({
      success: false,
      message: "ID de categoría no válido",
    });
  }

  // Verificar si la categoría existe
  const sqlCategoria = "SELECT * FROM categorias WHERE id_categoria = ?";
  connection.query(sqlCategoria, [categoriaId], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al consultar la categoría",
      });
    }

    if (results.length === 0) {
      return res.status(400).json({
        success: false,
        message: "La categoría seleccionada no existe",
      });
    }

    // Crear un ID único (esto lo podrías cambiar según tus necesidades)
    const id = Date.now().toString();

    // Consulta SQL para insertar el videojuego
    const sql =
      "INSERT INTO videojuegos (id, titulo, imagen, categoria, precio) VALUES (?, ?, ?, ?, ?)";

    connection.query(
      sql,
      [id, titulo, imagen, categoriaId, precio],
      (err, results) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Error en la consulta" });
        }

        // Devolver el videojuego recién agregado en la respuesta
        const nuevoVideojuego = {
          id,
          titulo,
          imagen,
          categoria: categoriaId,
          precio,
        };
        res.json({
          success: true,
          message: "Videojuego agregado correctamente",
          videojuego: nuevoVideojuego,
        });
      }
    );
  });
});

// Obtener los detalles de un videojuego
app.get("/obtener-videojuego", (req, res) => {
  const videojuegoId = req.query.id;
  console.log("ID del videojuego recibido:", videojuegoId);

  // Verificar que el ID no esté vacío y sea un número
  if (!videojuegoId || isNaN(videojuegoId)) {
    return res
      .status(400)
      .json({ success: false, message: "ID de videojuego no válido" });
  }

  const sql = "SELECT * FROM videojuegos WHERE id = ?";
  connection.query(sql, [videojuegoId], (err, results) => {
    if (err || results.length === 0) {
      console.log(
        "Error al obtener videojuego o no encontrado",
        err || "No se encontró"
      );
      return res
        .status(500)
        .json({ success: false, message: "Error al obtener el videojuego" });
    }

    const videojuego = results[0];
    console.log("Videojuego encontrado:", videojuego);
    res.json({ videojuego });
  });
});

// Editar un videojuego
app.post("/editar-videojuego", upload.single("imagen"), (req, res) => {
  const { id, titulo, categoria, precio } = req.body;
  let imagen = req.file ? "/uploads/" + req.file.filename : null;

  // Consulta SQL para actualizar el videojuego
  let sql =
    "UPDATE videojuegos SET titulo = ?, categoria = ?, precio = ? WHERE id = ?";
  let params = [titulo, categoria, precio, id];

  // Si hay una nueva imagen, también la actualizamos
  if (imagen) {
    sql =
      "UPDATE videojuegos SET titulo = ?, categoria = ?, precio = ?, imagen = ? WHERE id = ?";
    params = [titulo, categoria, precio, imagen, id];
  }

  connection.query(sql, params, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Error al editar el videojuego" });
    }

    res.json({
      success: true,
      message: "Videojuego actualizado correctamente",
      videojuego: { id, titulo, categoria, precio, imagen },
    });
  });
});

// Ruta para eliminar un videojuego y su imagen
app.post("/eliminar-videojuego", (req, res) => {
  const { id } = req.body;

  // Consulta SQL para obtener la ruta de la imagen asociada al videojuego
  const sql = "SELECT imagen FROM videojuegos WHERE id = ?";

  connection.query(sql, [id], (err, results) => {
    if (err || results.length === 0) {
      return res
        .status(500)
        .json({ success: false, message: "Error al obtener el videojuego" });
    }

    const imagen = results[0].imagen;

    // Si hay una imagen asociada, eliminarla del sistema de archivos
    if (imagen) {
      const imagePath = path.join(__dirname, "public", imagen);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error al eliminar la imagen:", err);
          return res
            .status(500)
            .json({ success: false, message: "Error al eliminar la imagen" });
        }
        console.log("Imagen eliminada correctamente");
      });
    }

    // Ahora eliminamos el videojuego de la base de datos
    const deleteSql = "DELETE FROM videojuegos WHERE id = ?";
    connection.query(deleteSql, [id], (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Error al eliminar el videojuego" });
      }

      res.json({
        success: true,
        message: "Videojuego eliminado correctamente",
      });
    });
  });
});

// Ruta para agregar una nueva categoría
app.post("/agregar-categoria", (req, res) => {
  const { nombre } = req.body;

  // Consulta SQL para agregar la nueva categoría
  const sql = "INSERT INTO categorias (nombre) VALUES (?)";

  connection.query(sql, [nombre], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Error al agregar categoría" });
    }

    res.json({ success: true, message: "Categoría agregada correctamente" });
  });
});

// Ruta para mostrar el carrito
app.get('/carrito', (req, res) => {
  connection.query('SELECT * FROM carrito', (err, productos) => {
    if (err) {
      console.error('Error al obtener productos del carrito:', err);
      return res.status(500).send('Error al obtener productos del carrito');
    }

    // Calcular el total del carrito
    const total = productos.reduce((acc, producto) => acc + parseFloat(producto.precio), 0).toFixed(2);

    // Determinar si se ha comprado algo
    const comprado = productos.length === 0 ? false : true;

    // Renderizar la vista de carrito con los productos
    res.render('carrito', {
      productos,
      total,
      comprado
    });
  });
});

// Ruta para agregar al carrito
app.post('/agregar-al-carrito', (req, res) => {
  const productoId = req.body.id;  // Tomamos el id del producto desde el cuerpo de la solicitud

  // Primero, obtendremos los datos del producto con ese id
  connection.query('SELECT * FROM videojuegos WHERE id = ?', [productoId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Error en la base de datos' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    const producto = results[0];  // El primer resultado (solo debería haber uno)

    // Ahora insertamos este producto en la tabla carrito
    const query = 'INSERT INTO carrito (id, titulo, imagen, categoria, precio) VALUES (?, ?, ?, ?, ?)';
    const values = [producto.id, producto.titulo, producto.imagen, producto.categoria, producto.precio];

    connection.query(query, values, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error al agregar al carrito' });
      }

      return res.status(200).json({ success: true, message: 'Producto agregado al carrito' });
    });
  });
});

// Vaciar el carrito
app.post('/vaciar-carrito', (req, res) => {
  connection.query('DELETE FROM carrito', (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al vaciar el carrito' });
    }
    res.json({ success: true });
  });
});

// Comprar el carrito
app.post('/comprar-carrito', (req, res) => {
  connection.query('DELETE FROM carrito', (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al realizar la compra' });
    }
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
