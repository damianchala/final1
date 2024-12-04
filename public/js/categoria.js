// categoria.js

// Mostrar el formulario de agregar categoría cuando el usuario haga clic en "Agregar Categoría"
document.getElementById("nueva-categoria").addEventListener("click", function () {
    document.getElementById("modal-agregar-categoria").style.display = "flex";
  });
  
  // Cerrar el modal de agregar categoría
  document.getElementById("cerrar-modal-categoria").addEventListener("click", function () {
    document.getElementById("modal-agregar-categoria").style.display = "none";
  });
  
  // Manejar el envío del formulario para agregar la categoría
  document.getElementById("agregarCategoriaForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const categoriaNombre = document.getElementById("categoriaNombre").value;
  
    fetch("/agregar-categoria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: categoriaNombre }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        window.location.reload();
      } else {
        alert("Error al agregar la categoría");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  });
  