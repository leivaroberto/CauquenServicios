(function () {
  function formatDateISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // "YYYY-MM-DD" -> Date en horario local (evita corrimiento por UTC)
  function parseISODateToLocalDate(iso) {
    const parts = String(iso).split("-");
    if (parts.length !== 3) return new Date(NaN);
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    return new Date(y, m - 1, d);
  }

  function formatDateAR(iso) {
    const parts = String(iso).split("-");
    if (parts.length !== 3) return iso;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  }

  // feriados
  const feriados = [
    "2026-01-01",
    "2026-03-24",
    "2026-04-02",
    "2026-05-01",
    "2026-05-25",
    "2026-06-20",
    "2026-07-09",
    "2026-08-17",
    "2026-10-12",
    "2026-11-20",
    "2026-12-08",
    "2026-12-25",
  ];

  const URL_SCRIPT =
    "https://script.google.com/macros/s/AKfycbzuNqjTKeMwG53sc7IU-CZaaxbLvYJr-VhHBgypELsndqXN_sGJJxjkvfFiVMfjDL6d/exec";

  const mensajeEl = document.getElementById("mensaje");
  const accionesEl = document.getElementById("reserva-acciones");
  const whatsappEl = document.getElementById("reserva-whatsapp");

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

  function buildWhatsappUrl({ fecha, hora, nombre, telefono, email, modo }) {
    const fechaAR = fecha ? formatDateAR(fecha) : "";

    const parts = [];
    if (nombre) parts.push(`Hola, soy ${nombre}.`);

    if (modo === "confirmar") {
      parts.push("Reservé una entrevista");
      if (fechaAR && hora) parts.push(`para el ${fechaAR} a las ${hora}.`);
      else if (fechaAR) parts.push(`para el ${fechaAR}.`);
      else parts.push("desde la web.");
      parts.push("¿Me confirmás por favor?");
    } else {
      parts.push("Quisiera coordinar una entrevista para conocer el jardín.");
      if (fechaAR && hora) parts.push(`Me interesa el ${fechaAR} a las ${hora}.`);
      else if (fechaAR) parts.push(`Me interesa el ${fechaAR}.`);
    }

    if (telefono) parts.push(`Tel: ${telefono}.`);
    if (email) parts.push(`Email: ${email}.`);

    const text = parts.join(" ").replace(/\s+/g, " ").trim();
    return `https://wa.me/5492994649110?text=${encodeURIComponent(text)}`;
  }

  function reservar() {
    const fecha = document.getElementById("fecha")?.value;
    const horaSelect = document.getElementById("hora");
    const hora = horaSelect?.value;
    const nombre = document.getElementById("nombre")?.value;
    const telefono = document.getElementById("telefono")?.value;
    const email = document.getElementById("email")?.value;

    ocultarAcciones();

    if (!fecha || !hora || !nombre || !telefono || !email) {
      setMensaje("Completá todos los campos para reservar.", "warning");
      return;
    }

    const opcionSeleccionada =
      horaSelect?.selectedOptions && horaSelect.selectedOptions[0]
        ? horaSelect.selectedOptions[0]
        : null;
    if (opcionSeleccionada && opcionSeleccionada.disabled) {
      setMensaje("Ese horario ya no está disponible. Elegí otro.", "warning");
      return;
    }

    setMensaje("Reservando...", "info");

    const btnReservar = document.getElementById("btnReservar");
    if (btnReservar) {
      btnReservar.disabled = true;
      btnReservar.setAttribute("aria-busy", "true");
    }

    const datos = new FormData();
    datos.append("fecha", fecha);
    datos.append("hora", hora);
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
          setMensaje("Entrevista reservada correctamente. ¡Gracias!", "success");

          const url = buildWhatsappUrl({
            fecha,
            hora,
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

        if (text === "ocupado") {
          setMensaje("Ese horario ya está reservado. Elegí otro.", "warning");
          return;
        }

        setMensaje(
          "No pudimos reservar desde la web. Probá de nuevo o escribinos por WhatsApp.",
          "danger"
        );

        const fallback = buildWhatsappUrl({
          fecha,
          hora,
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
          "Ocurrió un error al reservar. Probá de nuevo o escribinos por WhatsApp.",
          "danger"
        );

        const fallback = buildWhatsappUrl({
          fecha,
          hora,
          nombre,
          telefono,
          email,
          modo: "ayuda",
        });
        mostrarAcciones(fallback);
      })
      .finally(() => {
        if (btnReservar) {
          btnReservar.disabled = false;
          btnReservar.removeAttribute("aria-busy");
        }
      });
  }

  function cargarHorariosOcupados(fecha) {
    const select = document.getElementById("hora");
    if (!select) return;

    const opciones = select.options;
    select.disabled = true;

    select.value = "";

    if (opciones && opciones.length > 0) {
      opciones[0].textContent = "Cargando horarios...";
    }

    fetch(URL_SCRIPT + "?fecha=" + encodeURIComponent(fecha))
      .then((res) => res.json())
      .then((horasOcupadas) => {
        if (!Array.isArray(horasOcupadas)) horasOcupadas = [];
        horasOcupadas = horasOcupadas.map((h) => String(h).trim());
        const ocupadas = new Set(horasOcupadas);

        for (let i = 0; i < opciones.length; i++) {
          if (opciones[i].value === "") continue;
          opciones[i].disabled = false;
          if (ocupadas.has(opciones[i].value)) {
            opciones[i].disabled = true;
          }
        }

        const hayDisponibles = Array.from(opciones).some(
          (opt) => opt.value !== "" && !opt.disabled
        );
        if (!hayDisponibles) {
          setMensaje(
            "No hay horarios disponibles para esa fecha. Elegí otro día o escribinos por WhatsApp.",
            "warning"
          );
        }

        if (select.value && ocupadas.has(select.value)) {
          select.value = "";
          setMensaje("El horario que habías elegido ya está ocupado.", "warning");
        }
      })
      .catch((error) => {
        console.error(error);
        setMensaje(
          "No se pudieron cargar los horarios ocupados. Probá nuevamente.",
          "warning"
        );
      })
      .finally(() => {
        if (opciones && opciones.length > 0) {
          opciones[0].textContent = "Seleccionar horario";
        }
        select.disabled = false;
      });
  }

  // Necesario para el onclick="reservar()" del botón
  window.reservar = reservar;

  const fechaInput = document.getElementById("fecha");
  if (!fechaInput) return;

  const hoy = formatDateISO(new Date());
  fechaInput.min = hoy;

  fechaInput.addEventListener("change", function () {
    limpiarMensaje();
    ocultarAcciones();

    const fechaSeleccionada = this.value;
    const fecha = parseISODateToLocalDate(fechaSeleccionada);
    const dia = fecha.getDay();

    if (dia === 0 || dia === 6) {
      alert("Las entrevistas se realizan solo de lunes a viernes");
      this.value = "";
      return;
    }

    if (feriados.includes(fechaSeleccionada)) {
      alert("Ese día es feriado");
      this.value = "";
      return;
    }

    cargarHorariosOcupados(fechaSeleccionada);
  });
})();