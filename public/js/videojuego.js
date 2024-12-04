// Agregar videojuego
document
  .getElementById("form-agregar-videojuego")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    fetch("/agregar-videojuego", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const nuevoVideojuego = data.videojuego;
          const nuevoProducto = document.createElement("div");
          nuevoProducto.classList.add("producto");
          nuevoProducto.dataset.id = nuevoVideojuego.id;
          nuevoProducto.innerHTML = `
          <img class="producto-imagen" src="${nuevoVideojuego.imagen}" alt="${nuevoVideojuego.titulo}" />
          <div class="producto-detalles">
            <h3 class="producto-titulo">${nuevoVideojuego.titulo}</h3>
            <p class="producto-precio">${nuevoVideojuego.precio}</p>
            <button class="add-button" data-id="${nuevoVideojuego.id}">Agregar</button>
          </div>`;
          document
            .getElementById("contenedor-productos")
            .appendChild(nuevoProducto);
          document.getElementById("modal-agregar").style.display = "none"; // Cerrar modal
          document.getElementById("form-agregar-videojuego").reset(); // Resetear el formulario
        } else {
          alert("Error al agregar el videojuego.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Hubo un error al agregar el videojuego.");
      });
  });

// Editar videojuego
document
  .getElementById("form-editar-videojuego")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    // Obtener la URL de la imagen actual, si existe
    const imagePreview = document.querySelector("#image-preview");
    const imagenActual = imagePreview ? imagePreview.src : ""; // Si no existe la imagen, asignar cadena vacía

    // Verificar si se seleccionó una nueva imagen
    const formData = new FormData(this);
    if (!formData.has("imagen") && imagenActual) {
      formData.append("imagen", imagenActual); // Mantener la imagen actual si no hay una nueva
    }

    fetch("/editar-videojuego", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Actualiza el videojuego directamente en el DOM
          const videojuegoEditado = data.videojuego;
          const productoEditado = document.querySelector(
            `.producto[data-id="${videojuegoEditado.id}"]`
          );

          // Actualizar los detalles del videojuego editado
          if (productoEditado) {
            productoEditado.querySelector(".producto-titulo").textContent =
              videojuegoEditado.titulo;
            productoEditado.querySelector(".producto-precio").textContent =
              videojuegoEditado.precio;

            // Si hay una nueva imagen, actualízala
            if (videojuegoEditado.imagen) {
              productoEditado.querySelector(".producto-imagen").src =
                videojuegoEditado.imagen;
            }
          }

          document.getElementById("modal-editar").style.display = "none"; // Cerrar modal
        } else {
          alert("Error al actualizar el videojuego.");
        }
      })
      .catch((error) => console.error("Error:", error));
  });



// Esto deberia traer los datos del videojuego
document
  .getElementById("videojuego-select")
  .addEventListener("change", function (event) {
    const selectedOption = event.target.options[event.target.selectedIndex];

    const videojuegoId = selectedOption.value;
    const titulo = selectedOption.getAttribute("data-titulo");
    const precio = selectedOption.getAttribute("data-precio");
    const categoria = selectedOption.getAttribute("data-categoria");
    const imagen = selectedOption.getAttribute("data-imagen");

    document.getElementById("videojuego-id").value = videojuegoId;
    document.getElementById("titulo-editar").value = titulo;
    document.getElementById("precio-editar").value = precio;
    document.getElementById("categoria-editar").value = categoria;

    const imagePreview = document.getElementById("image-preview");
    if (imagen) {
      imagePreview.src = imagen;
      document.getElementById("image-preview-container").style.display =
        "block";
    } else {
      document.getElementById("image-preview-container").style.display = "none";
    }
  });

// Eliminar videojuego
document
  .getElementById("eliminar-seleccionado")
  .addEventListener("click", function () {
    const videojuegoId = document.getElementById("select-videojuego").value;
    if (videojuegoId) {
      fetch("/eliminar-videojuego", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: videojuegoId }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Eliminar del DOM
            const productoEliminado = document.querySelector(
              `.producto[data-id="${videojuegoId}"]`
            );
            if (productoEliminado) {
              productoEliminado.remove();
            }

            // Actualizar el select de videojuegos
            const select = document.getElementById("select-videojuego");
            const option = select.querySelector(
              `option[value="${videojuegoId}"]`
            );
            if (option) {
              option.remove();
            }

            document.getElementById("modal-eliminar").style.display = "none";
          } else {
            alert("No se pudo eliminar el videojuego.");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Hubo un error al eliminar el videojuego.");
        });
    }
  });
