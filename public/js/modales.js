// modales.js

// Modal de agregar videojuego
document.getElementById("agregar-videojuego").addEventListener("click", function () {
    document.getElementById("modal-agregar").style.display = "flex";
  });
  
  // Modal de editar videojuego
  document.getElementById("editar-videojuego").addEventListener("click", function () {
    document.getElementById("modal-editar").style.display = "flex";
  });
  
  // Modal de eliminar videojuego
  document.getElementById("eliminar-videojuego").addEventListener("click", function () {
    document.getElementById("modal-eliminar").style.display = "flex";
  });
  
  // Cerrar modales
  document.getElementById("cerrar-modal").addEventListener("click", function () {
    document.getElementById("modal-agregar").style.display = "none";
  });
  document.getElementById("cerrar-modal-editar").addEventListener("click", function () {
    document.getElementById("modal-editar").style.display = "none";
  });
  document.getElementById("cerrar-modal-eliminar").addEventListener("click", function () {
    document.getElementById("modal-eliminar").style.display = "none";
  });
  