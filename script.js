// ==========================================
// CONFIGURACIÓN CENTRAL
// ==========================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwUjvErAGi6jvaglM1RSAZ44aC_A5bNvbFmdb-NrN3UAXfyAqwS2hEDHKkTGIWaRyAU/exec"; 
const CLAVE_STAFF = "76:676:6";

let currentFormType = 'jugador';

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    startCountdown();
    verificarEstadoInscripciones();
    updateCreatorFields();
});

// Panel de Staff Local
function abrirPanelStaff() {
    const passwordInput = prompt("🔑 Ingrese la contraseña de Staff:");
    if (!passwordInput) return;
    const claveProcesada = passwordInput.trim().split('').map(char => String.fromCharCode(char.charCodeAt(0) + 5)).join('');
    if (claveProcesada === CLAVE_STAFF) {
        actualizarModalUI();
        document.getElementById("staffModal").classList.remove("hidden");
    } else {
        alert("❌ Contraseña incorrecta.");
    }
}
function cerrarPanelStaff() { document.getElementById("staffModal").classList.add("hidden"); }
function actualizarModalUI() {
    const isOpen = localStorage.getItem("inscripcionesAbiertas") === "true" || localStorage.getItem("inscripcionesAbiertas") === null;
    const txtEstado = document.getElementById("txtEstadoFormulario");
    if (txtEstado) txtEstado.innerHTML = `Estado: <span class="${isOpen ? 'text-emerald-400':'text-rose-500'}">${isOpen ? 'Abierto':'Cerrado'}</span>`;
}
function cambiarEstadoInscripciones(nuevoEstado) {
    localStorage.setItem("inscripcionesAbiertas", nuevoEstado ? "true" : "false");
    actualizarModalUI();
    verificarEstadoInscripciones();
}

function verificarEstadoInscripciones() {
    const form = document.getElementById("registerForm");
    const isOpen = localStorage.getItem("inscripcionesAbiertas") === "true" || localStorage.getItem("inscripcionesAbiertas") === null;
    if (!form) return;
    if (!isOpen) {
        if (!window.originalFormHTML) window.originalFormHTML = form.innerHTML;
        form.innerHTML = `<div class="text-center py-8 text-zinc-400">🔒 Inscripciones Cerradas Temporalmente.</div>`;
    } else if (window.originalFormHTML) {
        form.innerHTML = window.originalFormHTML;
        window.originalFormHTML = null;
        lucide.createIcons();
    }
}

function switchForm(type) {
    currentFormType = type;
    document.getElementById("camposJugador").classList.toggle("hidden", type !== 'jugador');
    document.getElementById("camposCreador").classList.toggle("hidden", type === 'jugador');
}

function updateCreatorFields() {}

function startCountdown() {
    const targetDate = new Date("2026-07-17T20:00:00-03:00").getTime();
    setInterval(() => {
        const now = new Date().getTime();
        const diff = targetDate - now;
        if (diff < 0) return;
        document.getElementById("days").innerText = Math.floor(diff / (1000*60*60*24));
        document.getElementById("hours").innerText = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
        document.getElementById("minutes").innerText = Math.floor((diff % (1000*60*60)) / (1000*60));
        document.getElementById("seconds").innerText = Math.floor((diff % (1000*60)) / 1000);
    }, 1000);
}

// Envío unificado a Google Sheets
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btnEnviar = e.target.querySelector("button[type='submit']");
    btnEnviar.disabled = true;
    btnEnviar.innerText = "PROCESANDO ADMISIÓN...";

    let payload = {};

    if (currentFormType === 'jugador') {
        payload = {
            tipo: "jugador",
            nick: document.getElementById("playerNick").value.trim(),
            discord: document.getElementById("playerDiscord").value.trim()
        };
    } else {
        payload = {
            tipo: "creador",
            nick: document.getElementById("cNick1").value.trim(), // Líder
            discord: document.getElementById("cDiscord1").value.trim(),
            canal: document.getElementById("creatorChannel").value.trim(),
            actividad: document.getElementById("creatorActivity").value,
            integrantes: document.getElementById("creatorCount").value
        };
    }

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors", // Evita problemas de bloqueo en el navegador
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        alert("🚀 ¡Inscripción enviada con éxito! Se está procesando e ingresando en la lista de Discord.");
        document.getElementById("registerForm").reset();
    } catch (error) {
        alert("Hubo un problema al procesar tu inscripción.");
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.innerText = "ENVIAR ADMISIÓN";
    }
});