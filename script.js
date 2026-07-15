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
    updateCreatorFields(); // Inicializa los campos de creador
    
    // Escuchar cambios en el selector de cantidad de integrantes
    const creatorCountSelect = document.getElementById("creatorCount");
    if (creatorCountSelect) {
        creatorCountSelect.addEventListener("change", updateCreatorFields);
    }
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
    if (type === 'creador') {
        updateCreatorFields();
    }
}

// Muestra u oculta los integrantes según el número seleccionado
function updateCreatorFields() {
    const countSelect = document.getElementById("creatorCount");
    if (!countSelect) return;
    const count = parseInt(countSelect.value);
    
    for (let i = 1; i <= 10; i++) {
        const targetBox = document.getElementById(`boxIntegrante${i}`);
        if (targetBox) {
            if (i <= count) {
                targetBox.classList.remove("hidden");
            } else {
                targetBox.classList.add("hidden");
            }
        }
    }
}

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

// Envío unificado a Google Sheets + Discord
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
        const integrantesCount = parseInt(document.getElementById("creatorCount").value);
        
        // Obtenemos el líder (Integrante 1)
        const liderNick = document.getElementById("cNick1").value.trim();
        const liderDiscord = document.getElementById("cDiscord1").value.trim();

        // ARREGLADO: Recopilamos la información estructurada e individual para Discord y Sheets
        let acompanantesParaDiscord = [];
        let otrosIntegrantesTexto = [];

        for (let i = 2; i <= integrantesCount; i++) {
            const nInput = document.getElementById(`cNick${i}`);
            const dInput = document.getElementById(`cDiscord${i}`);
            
            const n = nInput ? nInput.value.trim() : "";
            const d = dInput ? dInput.value.trim() : "";
            
            if (n && d) {
                acompanantesParaDiscord.push({ nick: n, discord: d });
                otrosIntegrantesTexto.push(`${n} (${d})`);
            }
        }

        // Formato compacto para almacenar cómodamente en una sola celda del Sheets
        const detallesIntegrantesExcel = otrosIntegrantesTexto.length > 0 
            ? `Líder: ${liderNick}. Acompañantes: ${otrosIntegrantesTexto.join(", ")}`
            : `Líder: ${liderNick}`;

        payload = {
            tipo: "creador",
            nick: liderNick, 
            discord: liderDiscord,
            canal: document.getElementById("creatorChannel").value.trim(),
            actividad: document.getElementById("creatorActivity").value,
            integrantes: integrantesCount,
            acompanantes: acompanantesParaDiscord, // Envía la lista detallada e individual para Discord
            detallesIntegrantes: detallesIntegrantesExcel // Envía la celda compacta para Google Sheets
        };
    }

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        alert("🚀 ¡Inscripción enviada con éxito! Se está procesando e ingresando en la lista de Discord.");
        document.getElementById("registerForm").reset();
        updateCreatorFields(); // Resetea las cajas visibles a solo 1 integrante
    } catch (error) {
        alert("Hubo un problema al procesar tu inscripción.");
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.innerText = "ENVIAR ADMISIÓN";
    }
});