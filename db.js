// db.js
const mysql = require('mysql2');

// Crear y exportar la conexión
const connection = mysql.createConnection({
  host: 'localhost', 
  user: 'root',           
  password: '',            
  database: 'digitalvideogames'
});

module.exports = connection;
