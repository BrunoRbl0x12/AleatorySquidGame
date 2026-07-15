// ==========================================
// CONFIGURACIÓN CENTRAL DEL EVENTO
// ==========================================
const WEBHOOK_JUGADORES = "https://discord.com/api/webhooks/1527041809212244069/f7B1iTApLoWgezqU3vfbymnurCFw9CZN_LQTGCUIp1DWmDYe1aLFekjdXPx3nNatTecR";
const WEBHOOK_CREADORES = "https://discord.com/api/webhooks/1527042276352721026/PWRArtV9-AMY8yfl2Jms6hXPHzK-2oNkWt5v0pTwwICZy0hTFVJ5lcZhouryXFu54Ij1";
const WEBHOOK_ESTADISTICAS = "https://discord.com/api/webhooks/1527044798807150742/2VHdgDMhkQduP5YnNNq-43hsnu0N1x_b2QiX_Tx5d_dtyhFYa6ZVWBONtsTAfq9N302I";

const CLAVE_STAFF = "76:676:6";

// ==========================================
// LOGICA INTERNA DEL SISTEMA
// ==========================================
let currentFormType = 'jugador';

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    startCountdown();
    
    inicializarBaseDeDatos();
    
    verificarEstadoInscripciones();
    
    updateCreatorFields();
});

function inicializarBaseDeDatos() {
    if (!localStorage.getItem("totalJugadores")) localStorage.setItem("totalJugadores", "0");
    if (!localStorage.getItem("totalCreadores")) localStorage.setItem("totalCreadores", "0");
    if (!localStorage.getItem("listaProyectos")) localStorage.setItem("listaProyectos", JSON.stringify([]));
    if (!localStorage.getItem("nicksRegistrados")) localStorage.setItem("nicksRegistrados", JSON.stringify([]));
    if (localStorage.getItem("inscripcionesAbiertas") === null) localStorage.setItem("inscripcionesAbiertas", "true");
}

// ==========================================
// CONTROL DEL MENU DE STAFF
// ==========================================
function abrirPanelStaff() {
    playClick();
    const passwordInput = prompt("🔑 Ingrese la contraseña de Staff:");
    if (!passwordInput) return;

    // Procesamiento matemático para enmascarar la contraseña ingresada
    const claveProcesada = passwordInput.trim()
        .split('')
        .map(char => String.fromCharCode(char.charCodeAt(0) + 5))
        .join('');

    // Verificación
    if (claveProcesada === CLAVE_STAFF) {
        actualizarModalUI();
        document.getElementById("staffModal").classList.remove("hidden");
    } else {
        alert("❌ Contraseña incorrecta. Acceso denegado.");
    }
}

function cerrarPanelStaff() {
    document.getElementById("staffModal").classList.add("hidden");
}

function actualizarModalUI() {
    const isOpen = localStorage.getItem("inscripcionesAbiertas") === "true";
    const txtEstado = document.getElementById("txtEstadoFormulario");
    const btnAbrir = document.getElementById("btnAbrirForm");
    const btnCerrar = document.getElementById("btnCerrarForm");

    if (!txtEstado || !btnAbrir || !btnCerrar) return;

    if (isOpen) {
        txtEstado.innerHTML = `Estado de formulario: <span class="text-emerald-400">Abierto</span>`;
        btnAbrir.disabled = true;
        btnCerrar.disabled = false;
    } else {
        txtEstado.innerHTML = `Estado de formulario: <span class="text-rose-500">Cerrado</span>`;
        btnAbrir.disabled = false;
        btnCerrar.disabled = true;
    }
}

function cambiarEstadoInscripciones(nuevoEstado) {
    playClick();
    
    localStorage.setItem("inscripcionesAbiertas", nuevoEstado ? "true" : "false");
    
    actualizarModalUI();
    verificarEstadoInscripciones();
    
    alert(`📢 Formulario configurado exitosamente como: ${nuevoEstado ? 'ABIERTO' : 'CERRADO'}`);
}

// ==========================================
// Boton de reinicio de formularios (Local)
// ==========================================
async function reiniciarBaseDeDatos() {
    playClick();
    const confirmar1 = confirm("⚠️ ¿ESTÁS ABSOLUTAMENTE SEGURO? Se vaciarán los contadores, nicks duplicados y la lista de proyectos de tu navegador.");
    if (!confirmar1) return;

    localStorage.clear();
    inicializarBaseDeDatos();
    cerrarPanelStaff();
    
    alert("🔄 Tu base de datos local ha sido limpiada.");
    window.location.reload();
}

function verificarEstadoInscripciones() {
    const form = document.getElementById("registerForm");
    const isOpen = localStorage.getItem("inscripcionesAbiertas") === "true";
    
    if (!form) return;

    if (!isOpen) {
        if (!window.originalFormHTML) window.originalFormHTML = form.innerHTML;
        
        form.innerHTML = `
            <div class="text-center py-8 space-y-4">
                <div class="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-squidRosa mx-auto animate-bounce">
                    <i data-lucide="lock" class="w-8 h-8"></i>
                </div>
                <h3 class="font-pixel text-sm text-white uppercase tracking-wider">Inscripciones Cerradas</h3>
                <p class="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    El cupo máximo ha sido alcanzado o el tiempo de admisión ha finalizado. ¡Gracias a todos por participar!
                </p>
                <div class="pt-4">
                    <a href="https://discord.gg/BqP2xc8UZB" target="_blank" class="inline-flex bg-[#5865F2] hover:bg-[#4752C4] text-white font-pixel text-[9px] px-6 py-3 rounded border-b-4 border-[#3c45a0] active:border-b-0 transition-all gap-2 mx-auto">
                        <i data-lucide="message-square" class="w-3.5 h-3.5"></i> VER EN DISCORD
                    </a>
                </div>
            </div>
        `;
        lucide.createIcons();
    } else if (window.originalFormHTML) {
        form.innerHTML = window.originalFormHTML;
        window.originalFormHTML = null;
        lucide.createIcons();
        switchForm(currentFormType);
    }
}

function playClick() {
    const audio = document.getElementById("clickSound");
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }
}

function switchForm(type) {
    if (localStorage.getItem("inscripcionesAbiertas") !== "true") return;
    
    currentFormType = type;
    const tabJugador = document.getElementById("tabJugador");
    const tabCreador = document.getElementById("tabCreador");
    const camposJugador = document.getElementById("camposJugador");
    const camposCreador = document.getElementById("camposCreador");

    const activeClasses = ["border-squidRosa", "text-white"];
    const inactiveClasses = ["border-transparent", "text-zinc-500", "hover:text-zinc-300"];

    if (type === 'jugador') {
        if(tabJugador) {
            tabJugador.classList.add(...activeClasses);
            tabJugador.classList.remove(...inactiveClasses);
        }
        if(tabCreador) {
            tabCreador.classList.add(...inactiveClasses);
            tabCreador.classList.remove(...activeClasses);
        }
        if(camposJugador) camposJugador.classList.remove("hidden");
        if(camposCreador) camposCreador.classList.add("hidden");
    } else {
        if(tabCreador) {
            tabCreador.classList.add(...activeClasses);
            tabCreador.classList.remove(...inactiveClasses);
        }
        if(tabJugador) {
            tabJugador.classList.add(...inactiveClasses);
            tabJugador.classList.remove(...activeClasses);
        }
        if(camposCreador) camposCreador.classList.remove("hidden");
        if(camposJugador) camposJugador.classList.add("hidden");
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

function toggleAccordion(id) {
    const content = document.getElementById(`content-${id}`);
    const icon = document.getElementById(`icon-${id}`);
    if (content.classList.contains("hidden")) {
        content.classList.remove("hidden");
        icon.style.transform = "rotate(180deg)";
    } else {
        content.classList.add("hidden");
        icon.style.transform = "rotate(0deg)";
    }
}

// Contador optimizado sin provocar lag en navegadores lentos o móviles
function startCountdown() {
    const targetDate = new Date("2026-07-17T20:00:00-03:00").getTime();
    
    const dEl = document.getElementById("days");
    const hEl = document.getElementById("hours");
    const mEl = document.getElementById("minutes");
    const sEl = document.getElementById("seconds");

    if (!dEl && !hEl && !mEl && !sEl) return;

    const interval = setInterval(() => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference < 0) {
            clearInterval(interval);
            if (dEl) dEl.innerText = "00";
            if (hEl) hEl.innerText = "00";
            if (mEl) mEl.innerText = "00";
            if (sEl) sEl.innerText = "00";
            return;
        }

        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);

        if (dEl) dEl.innerText = d < 10 ? "0" + d : d;
        if (hEl) hEl.innerText = h < 10 ? "0" + h : h;
        if (mEl) mEl.innerText = m < 10 ? "0" + m : m;
        if (sEl) sEl.innerText = s < 10 ? "0" + s : s;
    }, 1000);
}

// ==========================================
// CONTROL DEL FORMULARIO Y REGISTROS
// ==========================================
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (localStorage.getItem("inscripcionesAbiertas") !== "true") return;

    let webhookUrl = "";
    let embedData = {};

    if (currentFormType === 'jugador') {
        const nick = document.getElementById("playerNick").value.trim();
        const discord = document.getElementById("playerDiscord").value.trim();

        if (!nick || !discord) {
            alert("❌ Error: No puedes dejar los campos obligatorios vacíos.");
            return;
        }

        webhookUrl = WEBHOOK_JUGADORES;

        embedData = {
            title: `▲ SOLICITUD DE JUGADOR INDIVIDUAL`,
            color: 16711807,
            thumbnail: { url: `https://minotar.net/helm/${nick}/64.png` },
            fields: [
                { name: "👤 Nick Minecraft", value: `\`${nick}\``, inline: true },
                { name: "💬 Discord", value: `\`${discord}\``, inline: true }
            ],
            timestamp: new Date().toISOString()
        };
    } else {
        const channel = document.getElementById("creatorChannel").value.trim();
        const integrantesCount = parseInt(document.getElementById("creatorCount").value);
        const activity = document.getElementById("creatorActivity").value;

        if (!channel) {
            alert("❌ Error: Por favor indica el nombre de tu canal o proyecto.");
            return;
        }

        let listaIntegrantesCampos = [];
        for (let i = 1; i <= integrantesCount; i++) {
            const n = document.getElementById(`cNick${i}`).value.trim();
            const d = document.getElementById(`cDiscord${i}`).value.trim();

            if (!n || !d) {
                alert(`❌ Error: El Integrante ${i} posee campos vacíos.`);
                return;
            }
            listaIntegrantesCampos.push({ nick: n, discord: d });
        }

        webhookUrl = WEBHOOK_CREADORES;

        let fields = [
            { name: "📺 Canal / Proyecto", value: `**${channel}**`, inline: false },
            { name: "🎬 Actividad planeada", value: `\`${activity}\``, inline: false },
            { name: "👥 Cantidad Integrantes", value: `${integrantesCount} Persona(s)`, inline: false }
        ];

        listaIntegrantesCampos.forEach((integ, index) => {
            fields.push({
                name: `👤 Integrante ${index + 1}`,
                value: `Nick: \`${integ.nick}\` | Discord: \`${integ.discord}\``,
                inline: false
            });
        });

        const mainNick = listaIntegrantesCampos[0].nick;

        embedData = {
            title: `■ SOLICITUD DE CREADOR DE CONTENIDO`,
            color: 14454,
            thumbnail: { url: `https://minotar.net/helm/${mainNick}/64.png` },
            fields: fields,
            timestamp: new Date().toISOString()
        };
    }

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embeds: [embedData] })
        });
        
        if (response.ok) {
            alert("¡Tu admisión ha sido enviada con éxito! Revisa nuestro Discord para la lista de aprobados.");
            document.getElementById("registerForm").reset();
            switchForm(currentFormType);
        } else {
            alert("Hubo un problema al enviar los datos.");
        }
    } catch (error) {
        alert("Error de red al conectar con Discord.");
    }
});

// ==========================================
// ANTI F12/INSPECCIONAR 
// ==========================================
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'F12') {
        e.preventDefault();
        return false;
    }

    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
    }

    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
    }

    if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
    }
});