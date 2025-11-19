
const LLAVE_MOVIMIENTOS = "movimientos";

document.addEventListener("DOMContentLoaded", () => {
  inicializarEventos();
  representarTodo();
});

function inicializarEventos() {
  document.querySelectorAll(".btn-denom").forEach(boton => {
    boton.addEventListener("click", () => {
      const monto = parseFloat(boton.dataset.monto);
      if (!isNaN(monto) && monto > 0) {
        agregarDeposito(monto);
      }
    });
  });

  document.getElementById("formularioRetiro")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("montoRetiro");
      const monto = parseFloat(input.value);
      if (isNaN(monto) || monto <= 0) {
        alert("Ingresa una cantidad válida mayor que 0.");
        return;
      }
      agregarRetiro(monto);
      input.value = "";
    });

  document.getElementById("btnLimpiar").addEventListener("click", () => {
    if (confirm("¿Deseas eliminar todo el historial de movimientos? Esta acción no se puede deshacer.")) {
      localStorage.removeItem(LLAVE_MOVIMIENTOS);
      representarTodo();
    }
  });
}

function leerMovimientos() {
  const raw = localStorage.getItem(LLAVE_MOVIMIENTOS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error parseando movimientos:", err);
    return [];
  }
}

function guardarMovimientos(lista) {
  localStorage.setItem(LLAVE_MOVIMIENTOS, JSON.stringify(lista));
}

function calcularSaldo(lista) {
  return lista.reduce((acc, m) => acc + (m.tipo === "deposito" ? Number(m.monto) : -Number(m.monto)), 0);
}

function agregarDeposito(monto) {
  const lista = leerMovimientos();
  lista.push({
    tipo: "deposito",
    monto: redondear2(monto),
    fecha: new Date().toISOString()
  });
  guardarMovimientos(lista);
  representarTodo();
}

function agregarRetiro(monto) {
  const lista = leerMovimientos();
  const saldo = calcularSaldo(lista);

  if (lista.length === 0 || saldo <= 0) {
    alert("No hay ahorros disponibles para retirar.");
    return;
  }

  if (monto > saldo) {
    alert("Saldo insuficiente. No puedes retirar más de lo disponible.");
    return;
  }

  lista.push({
    tipo: "retiro",
    monto: redondear2(monto),
    fecha: new Date().toISOString()
  });
  guardarMovimientos(lista);
  representarTodo();
}

function representarTodo() {
  const lista = leerMovimientos();
  const saldo = calcularSaldo(lista);
  document.getElementById("saldoTotal").textContent = formatearMoneda(saldo);
  renderizarTabla(lista);
}

function renderizarTabla(lista) {
  const cuerpo = document.getElementById("cuerpoMovimientos");
  cuerpo.innerHTML = "";

  if (lista.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 3;
    td.className = "text-muted";
    td.textContent = "No hay movimientos aún.";
    tr.appendChild(td);
    cuerpo.appendChild(tr);
    return;
  }

  // mostrar último movimiento primero
  const copia = [...lista].reverse();
  copia.forEach(m => {
    const tr = document.createElement("tr");

    const tdFecha = document.createElement("td");
    tdFecha.textContent = formatearFechaHora(m.fecha);

    const tdTipo = document.createElement("td");
    tdTipo.textContent = (m.tipo === "deposito") ? "Depósito" : "Retiro";
    tdTipo.className = (m.tipo === "deposito") ? "tipo-deposito" : "tipo-retiro";

    const tdMonto = document.createElement("td");
    tdMonto.className = "text-end";
    tdMonto.textContent = formatearMoneda(m.monto);

    tr.appendChild(tdFecha);
    tr.appendChild(tdTipo);
    tr.appendChild(tdMonto);

    cuerpo.appendChild(tr);
  });
}

function formatearMoneda(valor) {
  const v = Number(valor) || 0;
  return v.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

function formatearFechaHora(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-MX');
  } catch (e) {
    return iso;
  }
}

function redondear2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}