// filtro.js

// Filtrar productos por categoría
function filtrarProductos(categoriaSeleccionada) {
    const productos = document.querySelectorAll(".producto");
    productos.forEach((producto) => {
      const categoriaProducto = producto.getAttribute("data-categoria");
      if (categoriaSeleccionada === "todos" || categoriaProducto === categoriaSeleccionada) {
        producto.style.display = "block";
      } else {
        producto.style.display = "none";
      }
    });
  }
  
  // Evento de clic en cada categoría
  document.querySelectorAll(".category").forEach((button) => {
    button.addEventListener("click", function () {
      const categoriaSeleccionada = this.getAttribute("data-categoria");
  
      document.querySelectorAll(".category").forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
  
      filtrarProductos(categoriaSeleccionada);
    });
  });
  