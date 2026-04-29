(function () {
  const URL_SCRIPT =
    "https://script.google.com/macros/s/AKfycbzuNqjTKeMwG53sc7IU-CZaaxbLvYJr-VhHBgypELsndqXN_sGJJxjkvfFiVMfjDL6d/exec";

  const mensajeEl = document.getElementById("mensaje");
  const accionesEl = document.getElementById("cotizacion-acciones");
  const whatsappEl = document.getElementById("cotizacion-whatsapp");

  function setMensaje(texto, tipo) {
    if (!mensajeEl) return;
    const variant = tipo || "info";
    mensajeEl.textContent = texto;
    mensajeEl.classList.remove(
      "d-none",
      "alert-info",
      "alert-success",
      "alert-warning",
      "alert-danger"
    );
    mensajeEl.classList.add("alert", `alert-${variant}`);
  }

  function limpiarMensaje() {
    if (!mensajeEl) return;
    mensajeEl.textContent = "";
    mensajeEl.classList.add("d-none");
    mensajeEl.classList.remove(
      "alert-info",
      "alert-success",
      "alert-warning",
      "alert-danger"
    );
  }

  function ocultarAcciones() {
    if (!accionesEl) return;
    accionesEl.classList.add("d-none");
  }

  function mostrarAcciones(url) {
    if (!accionesEl || !whatsappEl) return;
    whatsappEl.href = url;
    accionesEl.classList.remove("d-none");
  }

  function buildWhatsappUrl({ tipoServicio, descripcion, ubicacion, nombre, telefono, email, modo }) {
    const parts = [];
    if (nombre) parts.push(`Hola, soy ${nombre}.`);

    if (modo === "confirmar") {
      parts.push("Solicité una cotización");
      if (tipoServicio) parts.push(`para ${tipoServicio}.`);
      if (descripcion) parts.push(`Descripción: ${descripcion}.`);
      if (ubicacion) parts.push(`Ubicación: ${ubicacion}.`);
      parts.push("¿Me confirmás por favor?");
    } else {
      parts.push("Quisiera solicitar una cotización para movimientos de suelos.");
      if (tipoServicio) parts.push(`Servicio: ${tipoServicio}.`);
      if (descripcion) parts.push(`Descripción: ${descripcion}.`);
      if (ubicacion) parts.push(`Ubicación: ${ubicacion}.`);
    }

    if (telefono) parts.push(`Tel: ${telefono}.`);
    if (email) parts.push(`Email: ${email}.`);

    const text = parts.join(" ").replace(/\s+/g, " ").trim();
    return `https://wa.me/5492994649110?text=${encodeURIComponent(text)}`;
  }

  function cotizar() {
    const tipoServicio = document.getElementById("tipo-servicio")?.value;
    const descripcion = document.getElementById("descripcion")?.value;
    const ubicacion = document.getElementById("ubicacion-proyecto")?.value;
    const nombre = document.getElementById("nombre")?.value;
    const telefono = document.getElementById("telefono")?.value;
    const email = document.getElementById("email")?.value;

    ocultarAcciones();

    if (!tipoServicio || !descripcion || !ubicacion || !nombre || !telefono || !email) {
      setMensaje("Completá todos los campos para solicitar la cotización.", "warning");
      return;
    }

    setMensaje("Enviando solicitud...", "info");

    const btnCotizar = document.getElementById("btnCotizar");
    if (btnCotizar) {
      btnCotizar.disabled = true;
      btnCotizar.setAttribute("aria-busy", "true");
    }

    const datos = new FormData();
    datos.append("tipo_servicio", tipoServicio);
    datos.append("descripcion", descripcion);
    datos.append("ubicacion", ubicacion);
    datos.append("nombre", nombre);
    datos.append("telefono", telefono);
    datos.append("email", email);

    fetch(URL_SCRIPT, {
      method: "POST",
      body: datos,
    })
      .then((res) => res.text())
      .then((res) => {
        const text = String(res).trim();

        if (text === "ok") {
          setMensaje("Cotización solicitada correctamente. ¡Gracias!", "success");

          const url = buildWhatsappUrl({
            tipoServicio,
            descripcion,
            ubicacion,
            nombre,
            telefono,
            email,
            modo: "confirmar",
          });
          mostrarAcciones(url);

          if (typeof window.launchConfetti === "function") {
            window.launchConfetti({ count: 110 });
          }
          return;
        }

        setMensaje(
          "No pudimos enviar la solicitud desde la web. Probá de nuevo o escribinos por WhatsApp.",
          "danger"
        );

        const fallback = buildWhatsappUrl({
          tipoServicio,
          descripcion,
          ubicacion,
          nombre,
          telefono,
          email,
          modo: "ayuda",
        });
        mostrarAcciones(fallback);
      })
      .catch((error) => {
        console.error(error);
        setMensaje(
          "Ocurrió un error al enviar. Probá de nuevo o escribinos por WhatsApp.",
          "danger"
        );

        const fallback = buildWhatsappUrl({
          tipoServicio,
          descripcion,
          ubicacion,
          nombre,
          telefono,
          email,
          modo: "ayuda",
        });
        mostrarAcciones(fallback);
      })
      .finally(() => {
        if (btnCotizar) {
          btnCotizar.disabled = false;
          btnCotizar.removeAttribute("aria-busy");
        }
      });
  }

  // Necesario para el onclick="cotizar()" del botón
  window.cotizar = cotizar;
})();