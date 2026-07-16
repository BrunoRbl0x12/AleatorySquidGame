// =========================================================================
// CONFIGURACIÓN CENTRAL ENCRIPTADA (SISTEMA ULTRA-SIMPLE)
// =========================================================================
const _SCRIPT_URL_CRYPT = "cexe/UAyRaWIGTkKHDEh2SwqAyfXAU3NrN-bdmFbvNb5A_Ca44ZASR1Mlgavj6iGArEvjUwbcyfKA/s/sorcam/moc.elgoog.tpircs//:sptth";

function url() {
    return SCRIPT_URL_CRYPT.split('').reverse().join('');
}

let currentFormType = 'jugador';

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    startCountdown();
    verificarEstadoInscripciones();
    updateCreatorFields(); 
    
    const creatorCountSelect = document.getElementById("creatorCount");
    if (creatorCountSelect) {
        creatorCountSelect.addEventListener("change", updateCreatorFields);
    }
});

// Panel de Staff Local (Validación segura de contraseña directamente en el servidor de Google)
async function abrirPanelStaff() {
    const passwordInput = prompt("🔑 Ingrese la contraseña de Staff:");
    if (!passwordInput) return;

    try {
        const response = await fetch(url(), {
            method: "POST",
            headers: { "Content-Type": "text/plain" }, 
            body: JSON.stringify({
                accion: "token",
                password: passwordInput.trim()
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            actualizarModalUI();
            document.getElementById("staffModal").classList.remove("hidden");
        } else {
            alert("❌ Contraseña incorrecta.");
        }
    } catch (error) {
        alert("❌ Error de conexión con el servidor de autenticación.");
        console.error(error);
    }
}

function cerrarPanelStaff() { 
    document.getElementById("staffModal").classList.add("hidden"); 
}

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

// Envío unificado a Google Sheets (procesamiento seguro de datos)
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
        
        const liderNick = document.getElementById("cNick1").value.trim();
        const liderDiscord = document.getElementById("cDiscord1").value.trim();

        let acompañantesParaDiscord = [];
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
            acompanantes: acompañantesParaDiscord,
            detallesIntegrantes: detallesIntegrantesExcel
        };
    }

    try {
        const response = await fetch(obtenerUrlReal(), {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload)
        });

        const resData = await response.json();

        if (resData.success) {
            alert("🚀 ¡Inscripción enviada con éxito! Se está procesando e ingresando en la lista de Discord.");
            document.getElementById("registerForm").reset();
            updateCreatorFields(); 
        } else if (resData.error === "duplicado") {
            alert("❌ Este nick de Minecraft ya se encuentra registrado en el evento.");
        } else {
            alert("❌ Hubo un error procesando tu inscripción.");
        }
    } catch (error) {
        alert("❌ Hubo un problema al conectar con el servidor.");
        console.error(error);
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.innerText = "ENVIAR ADMISIÓN";
    }
});

// ==========================================
// SEGURIDAD: ANTI-INSPECCIÓN DE ELEMENTOS
// ==========================================
document.addEventListener('contextmenu', (e) => e.preventDefault());

document.addEventListener('keydown', (e) => {
    if (e.keyCode === 123) {
        e.preventDefault();
        return false;
    }
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        return false;
    }
    if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
    }
});