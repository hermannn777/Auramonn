"use strict";

/* =========================================================
   CONFIGURACIÓN
   ========================================================= */
const CONFIG = {
    // Las rutas reales están en la raíz del proyecto.
    API_REGISTER: "./register.php",
    API_LOGIN: "./login.php",
    API_PROGRESS: "./progreso.php",
    TOKEN_KEY: "auramon_token",
    USER_KEY: "auramon_user",
    WAVE_MUSIC_KEY: "auramon_wave_music_enabled",
    BUDGET: 10,
    MAX_TEAM: 6,
    LAST_WAVE: 50
};

/* =========================================================
   BASE DE DATOS DE ESPECIES (30)
   Formato: [nombre, tipo1, tipo2, hp, atk, def, vel, coste, emoji]
   ========================================================= */
const RAW_SPECIES = [
    ["Charmander", "Fire", "", 39, 52, 43, 65, 3, "🦎"],
    ["Squirtle", "Water", "", 44, 48, 65, 43, 3, "🐢"],
    ["Bulbasaur", "Grass", "", 45, 49, 49, 45, 3, "🌱"],
    ["Pikachu", "Electric", "", 35, 55, 40, 90, 3, "🐭"],
    ["Rattata", "Normal", "", 30, 56, 35, 72, 3, "🐀"],
    ["Pidgey", "Normal", "Flying", 40, 45, 40, 56, 3, "🐦"],
    ["Geodude", "Rock", "", 40, 80, 100, 20, 3, "🪨"],
    ["Machop", "Fighting", "", 70, 80, 50, 35, 3, "💪"],
    ["Abra", "Psychic", "", 25, 20, 15, 90, 3, "🔮"],
    ["Gastly", "Ghost", "", 30, 35, 30, 80, 3, "👻"],
    ["Dratini", "Dragon", "", 41, 64, 45, 50, 3, "🐉"],
    ["Magnemite", "Electric", "Steel", 25, 35, 70, 45, 3, "🧲"],
    ["Clefairy", "Fairy", "", 70, 45, 48, 35, 3, "🌙"],
    ["Zubat", "Poison", "Flying", 40, 45, 35, 55, 3, "🦇"],
    ["Growlithe", "Fire", "", 55, 70, 45, 60, 3, "🐕"],
    ["Eevee", "Normal", "", 55, 55, 50, 55, 3, "🦊"],
    ["Aurafox", "Aura", "", 60, 75, 60, 80, 6, "🔆"],
    ["Lumiwisp", "Ghost", "Aura", 55, 70, 55, 85, 6, "🕯️"],
    ["Sigilmoth", "Bug", "Aura", 65, 80, 60, 70, 6, "🦋"],
    ["Pulsehound", "Fire", "Aura", 70, 90, 60, 75, 6, "🐺"],
    ["Noctaura", "Dark", "Aura", 65, 85, 65, 80, 6, "🌑"],
    ["Halowyrm", "Dragon", "Aura", 75, 90, 70, 65, 6, "🐲"],
    ["Zenaur", "Psychic", "Aura", 70, 80, 70, 85, 6, "🧘"],
    ["Spectraura", "Ghost", "Aura", 60, 95, 50, 90, 6, "💀"],
    ["Ferraura", "Steel", "Aura", 80, 85, 100, 50, 6, "🛡️"],
    ["Vitalis", "Fairy", "Aura", 90, 65, 80, 60, 6, "🧚"],
    ["Floraviga", "Grass", "Aura", 85, 85, 80, 60, 6, "🌿"],
    ["Aurachnid", "Electric", "Aura", 75, 95, 70, 95, 6, "🕷️"],
    ["Auroryx", "Aura", "", 95, 100, 85, 80, 6, "🦌"],
    ["Chronaura", "Water", "Aura", 80, 80, 80, 75, 6, "⌛"]
];

const TYPE_COLORS = {
    Fire: "#ff7a59",
    Water: "#4aa3ff",
    Grass: "#5adf7d",
    Electric: "#ffd857",
    Psychic: "#d98cff",
    Ghost: "#9d9ae8",
    Dragon: "#7f84ff",
    Steel: "#c6d6df",
    Fairy: "#ffb2d9",
    Dark: "#46535d",
    Rock: "#c6a66d",
    Bug: "#9cd74d",
    Normal: "#d9d4b8",
    Flying: "#a4d4ff",
    Poison: "#bf7ae9",
    Aura: "#ffd166"
};

function makeSpriteDataUri(emoji) {
    const svg = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">',
        '<text x="64" y="68" text-anchor="middle" font-size="76" dominant-baseline="middle">' + emoji + '</text>',
        '</svg>'
    ].join('');
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const SP = RAW_SPECIES.map((r, i) => ({
    id: i + 1,
    name: r[0],
    t1: r[1],
    t2: r[2],
    hp: r[3],
    atk: r[4],
    def: r[5],
    spd: r[6],
    cost: r[7],
    emoji: r[8],
    image: "imagenes/auramons/" + r[0].toLowerCase() + ".png",
    fallbackSprite: makeSpriteDataUri(r[8])
}));

/* Tabla de tipos (ataque -> defensa -> multiplicador) */
const CH = {
    Aura: { Psychic: 2, Ghost: 2, Dragon: 2 },
    Steel: { Aura: 2, Fairy: 2, Rock: 2 },
    Fairy: { Aura: 2, Dragon: 2, Fighting: 2, Steel: 0.5, Fire: 0.5 },
    Electric: { Aura: 0.5, Water: 2, Flying: 2, Grass: 0.5, Electric: 0.5 },
    Grass: { Aura: 0.5, Water: 2, Rock: 2, Fire: 0.5, Grass: 0.5, Flying: 0.5 },
    Fire: { Grass: 2, Steel: 2, Water: 0.5, Fire: 0.5 },
    Water: { Fire: 2, Rock: 2, Grass: 0.5, Water: 0.5 },
    Psychic: { Fighting: 2, Poison: 2, Steel: 0.5 },
    Ghost: { Psychic: 2, Ghost: 2 },
    Fighting: { Normal: 2, Rock: 2, Steel: 2, Psychic: 0.5, Fairy: 0.5 },
    Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0.5 },
    Rock: { Fire: 2, Flying: 2 },
    Normal: { Rock: 0.5, Steel: 0.5 },
    Flying: { Grass: 2, Fighting: 2 },
    Poison: { Grass: 2, Fairy: 2 }
};

const ITEMS = {
    pot: { n: "Poción", d: "+30 HP", c: 30, w: 5 },
    rev: { n: "Revivir", d: "Revive con 50% HP", c: 80, w: 2 },
    ber: { n: "Baya", d: "+20 HP y +5 PP", c: 20, w: 4 },
    aur: { n: "Potenciador Aura", d: "Ataques Aura +25% (permanente)", c: 60, w: 2 }
};

/* =========================================================
   UTILIDADES Y ESTADO GLOBAL
   ========================================================= */
const $ = (selector) => document.querySelector(selector);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const eff = (t, d) => (CH[t] && CH[t][d]) || 1;

let USER = null;   // usuario con sesión activa
let SAVE = null;   // progreso persistente del usuario
let R = null;      // partida en curso (run)
let B = null;      // combate actual
let waveMusicEnabled = localStorage.getItem(CONFIG.WAVE_MUSIC_KEY) !== "false";
let D = { sel: [] };
let IT = { k: null, ctx: null, forced: false };

const saveKey = () => "auramon_save_" + USER;
const runKey = () => "auramon_run_" + USER;
const defaultSave = () => ({ unlocked: [0, 1, 2, 3, 4, 5, 16], best: 0, medals: [], runs: 0 });

function loadProfile(username) {
    USER = username;
    try {
        SAVE = JSON.parse(localStorage.getItem(saveKey())) || defaultSave();
    } catch (error) {
        SAVE = defaultSave();
    }
}

function store() {
    localStorage.setItem(saveKey(), JSON.stringify(SAVE));
    syncProgress();
}

function saveRun() {
    localStorage.setItem(runKey(), JSON.stringify(R));
    syncProgress();
}

function clearRun() {
    localStorage.removeItem(runKey());
    syncProgress();
}

/* ----- Sincronización con la base de datos ----- */
function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem(CONFIG.TOKEN_KEY)
    };
}

function serializeRun(run) {
    return {
        team: run.team.map((m) => ({
            s: m.s,
            lv: m.lv,
            ab: m.ab,
            hp: m.hp,
            pp: m.mv.map((move) => move.pp)
        })),
        inv: run.inv,
        balls: run.balls,
        money: run.money,
        wave: run.wave,
        act: run.act,
        caught: run.caught,
        capNames: run.capNames,
        phase: run.phase,
        shop: run.shop || []
    };
}

function hydrateRun(raw) {
    const run = Object.assign({}, raw);
    run.team = raw.team.map((t) => {
        const m = mk(t.s, t.lv);
        m.hp = Math.min(t.hp, m.mhp);
        m.ab = t.ab;
        m.mv.forEach((move, i) => {
            move.pp = Math.min(move.mx, t.pp[i]);
        });
        return m;
    });
    return run;
}

async function syncProgress() {
    if (!localStorage.getItem(CONFIG.TOKEN_KEY) || !SAVE) {
        return;
    }
    const hasRun = R && localStorage.getItem(runKey());
    try {
        await fetch(CONFIG.API_PROGRESS, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ save: SAVE, run: hasRun ? serializeRun(R) : null })
        });
    } catch (error) {
        // Sin conexión: el progreso queda en la caché local y se enviará en el próximo guardado.
    }
}

async function fetchProgress() {
    const response = await fetch(CONFIG.API_PROGRESS, { headers: authHeaders() });
    if (response.status === 401) {
        return "expired";
    }
    if (!response.ok) {
        return "error";
    }

    const data = await response.json();
    SAVE = {
        unlocked: data.save.unlocked.length ? data.save.unlocked : defaultSave().unlocked,
        best: data.save.best,
        medals: data.save.medals,
        runs: data.save.runs
    };
    localStorage.setItem(saveKey(), JSON.stringify(SAVE));

    if (data.run) {
        localStorage.setItem(runKey(), JSON.stringify(hydrateRun(data.run)));
    } else {
        localStorage.removeItem(runKey());
    }
    return "ok";
}

const act = () => R.team[R.act];
const tys = (m) => [SP[m.s].t1, SP[m.s].t2].filter(Boolean).join("/");

function show(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
        screen.classList.toggle("active", screen.id === id);
    });
    if (id === "menu") {
        playMenuMusic();
    } else if (id === "battle") {
        playWaveMusic();
    } else {
        pauseMenuMusic();
        pauseWaveMusic();
    }
}

function updateMusicButton(label, title, playing) {
    const button = $(".music-btn");
    button.textContent = label;
    button.title = title;
    button.setAttribute("aria-pressed", String(playing));
}

function playMenuMusic() {
    pauseWaveMusic();
    const music = $("#menuMusic");
    music.volume = 0.35;
    const playback = music.play();
    if (playback) {
        playback.then(() => {
            updateMusicButton("♫ Música: Activada", "Pausar música del menú", true);
        }).catch(() => {
            updateMusicButton("♫ Activar música", "El navegador requiere un clic para reproducir audio", false);
        });
    }
}

function pauseMenuMusic() {
    const music = $("#menuMusic");
    music.pause();
    updateMusicButton("♫ Música: Pausada", "Reproducir música del menú", false);
}

function playWaveMusic() {
    pauseMenuMusic();
    const music = $("#waveMusic");
    if (!waveMusicEnabled) {
        music.pause();
        return;
    }
    music.volume = 0.35;
    const playback = music.play();
    if (playback) {
        playback.catch((error) => {
            if (error.name !== "AbortError") {
                console.warn("No se pudo reproducir audio/musica-oleada.mp3.", error);
            }
        });
    }
}

function pauseWaveMusic() {
    $("#waveMusic").pause();
}

function updateWaveMusicButton() {
    const button = $(".battle-music-toggle");
    if (!button) {
        return;
    }
    button.textContent = waveMusicEnabled ? "♫ Música: Activada" : "♫ Música: Desactivada";
    button.title = waveMusicEnabled ? "Desactivar música de oleada" : "Activar música de oleada";
    button.setAttribute("aria-pressed", String(waveMusicEnabled));
}

function ov(html, panelClass) {
    const panel = $("#panel");
    panel.className = "panel" + (panelClass ? " " + panelClass : "");
    panel.innerHTML = html;
    $("#overlay").classList.add("on");
}

function hideOv() {
    $("#overlay").classList.remove("on");
}

function refreshMenu() {
    $("#userLabel").textContent = "Entrenador: " + USER;
    $("#btnCont").style.display = localStorage.getItem(runKey()) ? "block" : "none";
}

/* Imagen individual de cada Pokémon con respaldo en emoji si falta el archivo */
function sprite(index, extraClass) {
    const d = SP[index];
    return '<img class="sprite ' + (extraClass || "") + '" src="' + d.image +
        '" alt="' + d.name + '" data-fallback="' + d.fallbackSprite +
        '" data-emoji="' + d.emoji + '">';
}

document.addEventListener("error", (event) => {
    const img = event.target;
    if (img && img.tagName === "IMG" && img.classList.contains("battle-panel-image")) {
        img.parentElement.classList.add("image-error");
        img.remove();
        return;
    }
    if (img && img.tagName === "IMG" && img.classList.contains("auth-background-image")) {
        img.remove();
        return;
    }
    if (img && img.tagName === "IMG" && img.classList.contains("auth-button-image")) {
        img.classList.add("image-missing");
        img.closest("button").classList.add("image-error");
        return;
    }
    if (img && img.tagName === "IMG" && img.classList.contains("menu-button-image")) {
        img.closest(".menu-buttons .btn-aura").classList.add("image-error");
        return;
    }
    if (img && img.tagName === "IMG" && img.classList.contains("dex-background-image")) {
        img.closest(".dex-screen").classList.add("image-error");
        img.remove();
        return;
    }
    if (img && img.tagName === "IMG" && img.classList.contains("dex-close-image")) {
        img.closest(".dex-close").classList.add("image-error");
        img.remove();
        return;
    }
    if (img && img.tagName === "IMG" && img.classList.contains("draft-background-image")) {
        img.remove();
        return;
    }
    if (img && img.tagName === "IMG" && img.classList.contains("draft-button-image")) {
        img.classList.add("image-missing");
        img.closest(".btn-aura").classList.add("image-error");
        return;
    }
    if (img && img.tagName === "IMG" && img.classList.contains("battle-button-image")) {
        img.classList.add("image-missing");
        img.closest(".battle-button").classList.add("image-error");
        return;
    }
    if (img && img.tagName === "IMG" && img.dataset.emoji) {
        if (img.dataset.fallback) {
            img.src = img.dataset.fallback;
            delete img.dataset.fallback;
            return;
        }
        const span = document.createElement("span");
        span.className = "emo";
        span.textContent = img.dataset.emoji;
        img.replaceWith(span);
    }
}, true);

/* =========================================================
   AUTENTICACIÓN (fetch + async/await)
   ========================================================= */
function setAuthMsg(text, ok) {
    const box = $("#authMsg");
    box.textContent = text;
    box.classList.toggle("ok", !!ok);
}

function setAuthBusy(busy) {
    $("#loginSubmit").disabled = busy;
    $("#registerSubmit").disabled = busy;
}

async function apiPost(url, payload) {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    let data = {};
    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }
    return { ok: response.status === 200, status: response.status, data: data };
}

async function registerUser(username, password) {
    return apiPost(CONFIG.API_REGISTER, { username: username, password: password });
}

async function loginUser(username, password) {
    return apiPost(CONFIG.API_LOGIN, { username: username, password: password });
}

function startSession(token, username) {
    localStorage.setItem(CONFIG.TOKEN_KEY, token);
    localStorage.setItem(CONFIG.USER_KEY, username);
    enterMenu(username);
}

async function enterMenu(username) {
    loadProfile(username);

    let status = "error";
    try {
        status = await fetchProgress();
    } catch (error) {
        status = "error";
    }

    if (status === "expired") {
        logout();
        setAuthMsg("Tu sesión expiró. Inicia sesión de nuevo.", false);
        return;
    }

    refreshMenu();
    show("menu");
}

async function handleLogin() {
    const username = $("#loginUser").value.trim();
    const password = $("#loginPass").value;

    if (!username || !password) {
        setAuthMsg("Introduce usuario y contraseña.", false);
        return;
    }

    setAuthBusy(true);
    setAuthMsg("Conectando...", true);
    try {
        const result = await loginUser(username, password);
        if (result.ok && result.data.token) {
            startSession(result.data.token, username);
            $("#loginPass").value = "";
            setAuthMsg("", true);
        } else {
            setAuthMsg(result.data.message || "Credenciales inválidas (estado " + result.status + ").", false);
        }
    } catch (error) {
        setAuthMsg("No se pudo conectar con el servidor.", false);
    }
    setAuthBusy(false);
}

async function handleRegister() {
    const username = $("#regUser").value.trim();
    const password = $("#regPass").value;
    const password2 = $("#regPass2").value;

    if (username.length < 3) {
        setAuthMsg("El usuario debe tener al menos 3 caracteres.", false);
        return;
    }
    if (password.length < 6) {
        setAuthMsg("La contraseña debe tener al menos 6 caracteres.", false);
        return;
    }
    if (password !== password2) {
        setAuthMsg("Las contraseñas no coinciden.", false);
        return;
    }

    setAuthBusy(true);
    setAuthMsg("Creando cuenta...", true);
    try {
        const result = await registerUser(username, password);
        if (result.ok) {
            if (result.data.token) {
                startSession(result.data.token, username);
                setAuthMsg("", true);
            } else {
                ACT.tab("login");
                $("#loginUser").value = username;
                setAuthMsg("Cuenta creada. Ya puedes iniciar sesión.", true);
            }
            $("#regPass").value = "";
            $("#regPass2").value = "";
        } else {
            setAuthMsg(result.data.message || "No se pudo registrar (estado " + result.status + ").", false);
        }
    } catch (error) {
        setAuthMsg("No se pudo conectar con el servidor.", false);
    }
    setAuthBusy(false);
}

function logout() {
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.USER_KEY);
    USER = null;
    SAVE = null;
    R = null;
    B = null;
    hideOv();
    setAuthMsg("", true);
    show("auth");
}

/* =========================================================
   CRIATURAS
   ========================================================= */
function calc(m) {
    const b = SP[m.s];
    const l = m.lv;
    m.mhp = Math.floor(b.hp * l / 50) + l + 10;
    m.atk = Math.floor(b.atk * l / 50) + 5;
    m.def = Math.floor(b.def * l / 50) + 5;
    m.spd = Math.floor(b.spd * l / 50) + 5;
}

function mk(s, lv) {
    const d = SP[s];
    const m = { s: s, lv: lv, ab: 1 };
    calc(m);
    m.hp = m.mhp;
    m.mv = [
        { n: "Impacto " + d.t1, t: d.t1, p: 60, pp: 12, mx: 12 },
        d.t2
            ? { n: "Impacto " + d.t2, t: d.t2, p: 60, pp: 12, mx: 12 }
            : { n: "Placaje", t: "Normal", p: 40, pp: 20, mx: 20 }
    ];
    return m;
}

function levelTo(m, lv) {
    if (lv <= m.lv) {
        return;
    }
    const old = m.mhp;
    m.lv = lv;
    calc(m);
    if (m.hp > 0) {
        m.hp += m.mhp - old;
    }
}

function card(m, cls) {
    const low = m.hp / m.mhp < 0.25;
    const frame = cls === "enemy" ? "fondo-rival.png" : "fondo-jugador.png";
    return '<div class="mon ' + cls + '">' +
        '<img class="battle-panel-image" src="imagenes/combate/' + frame + '" alt="" aria-hidden="true">' +
        '<div class="mon-content">' + sprite(m.s) +
        '<div class="info"><div class="mon-heading"><b>' + SP[m.s].name + '</b>' +
        '<span class="mon-level">Nv.' + m.lv + '</span></div>' +
        '<div class="bar ' + (low ? "low" : "") + '"><i style="width:' + (100 * m.hp / m.mhp) + '%"></i></div>' +
        '</div></div></div>';
}

/* =========================================================
   DRAFT
   ========================================================= */
const spent = () => D.sel.reduce((total, s) => total + SP[s].cost, 0);

function renderDraft() {
    const left = CONFIG.BUDGET - spent();
    let slots = "";

    SAVE.unlocked.forEach((s) => {
        const on = D.sel.includes(s);
        const off = !on && SP[s].cost > left;
        slots += '<div class="slot ' + (on ? "sel" : "") + ' ' + (off ? "off" : "") +
            '" data-a="pick" data-v="' + s + '">' + sprite(s) +
            '<br><b>' + SP[s].name + '</b><small>' + tys({ s: s }) + '</small>' +
            '<small>Coste ' + SP[s].cost + '</small></div>';
    });

    $("#draft").innerHTML =
        '<div class="draft-panel">' +
        '<img class="draft-background-image" src="imagenes/seleccion/fondo-equipo.png" alt="" aria-hidden="true">' +
        '<div class="draft-content">' +
        '<div class="draft-status">' +
        '<span class="draft-points-counter" aria-label="Puntos restantes: ' + left + ' de ' + CONFIG.BUDGET + '">' +
        left + '/' + CONFIG.BUDGET + '</span>' +
        '<span class="draft-team-counter" aria-label="Auramons elegidos: ' + D.sel.length + '">' +
        D.sel.length + '</span></div>' +
        '<div class="grid draft-grid">' + slots + '</div>' +
        '<div class="draft-actions">' +
        '<button type="button" class="btn-aura sm draft-button" data-a="go" ' +
        (D.sel.length ? "" : "disabled") + ' aria-label="Comenzar Oleada 1">' +
        '<img class="draft-button-image" src="imagenes/seleccion/comenzar-oleada.png" alt="">' +
        '<span class="draft-button-label">Comenzar Oleada</span></button>' +
        '<button type="button" class="btn-aura sm draft-button" data-a="menu" aria-label="Volver">' +
        '<img class="draft-button-image" src="imagenes/seleccion/volver.png" alt="">' +
        '<span class="draft-button-label">Volver</span></button>' +
        '</div></div></div>';
}

/* =========================================================
   OLEADAS
   ========================================================= */
function waveEnemies(w) {
    const lv = 6 + Math.floor(w / 2);
    const auraPool = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 29];

    if (w === 20) {
        return { t: { n: "Líder Silas", medal: "Raíz" }, l: [mk(2, 14), mk(26, 16)] };
    }
    if (w === 50) {
        return { t: { n: "Líder Zeo", medal: "Centella" }, l: [mk(3, 29), mk(27, 31)] };
    }
    if (w === 45) {
        const alpha = mk(28, lv + 3);
        alpha.mhp = Math.floor(alpha.mhp * 1.5);
        alpha.hp = alpha.mhp;
        alpha.atk = Math.floor(alpha.atk * 1.2);
        return { t: null, l: [alpha], alpha: true };
    }

    const species = w < 20 ? rnd(0, 15) : auraPool[rnd(0, auraPool.length - 1)];
    return { t: null, l: [mk(species, lv + rnd(-1, 1))] };
}

function startWave() {
    R.phase = "battle";
    saveRun();

    const w = waveEnemies(R.wave);
    if (R.team[R.act].hp <= 0) {
        R.act = R.team.findIndex((m) => m.hp > 0);
    }

    B = {
        e: w.l.shift(),
        q: w.l,
        t: w.t,
        wild: !w.t,
        menu: "main",
        busy: false,
        log: []
    };

    if (w.t) {
        B.log.push("¡" + w.t.n + " te desafía!");
    } else if (w.alpha) {
        B.log.push("¡Un Alfa Aura bloquea el paso!");
    } else {
        B.log.push("¡Un " + SP[B.e.s].name + " salvaje aparece!");
    }

    renderBattle();
    show("battle");
}

function renderBattle() {
    const p = act();
    const main =
        '<button type="button" class="btn-aura sm battle-button" data-a="atk" aria-label="Atacar">' +
        '<img class="battle-button-image" src="imagenes/combate/atacar.png" alt="">' +
        '<span class="battle-button-label">Atacar</span></button>' +
        '<button type="button" class="btn-aura sm battle-button" data-a="item" aria-label="Objeto">' +
        '<img class="battle-button-image" src="imagenes/combate/objeto.png" alt="">' +
        '<span class="battle-button-label">Objeto</span></button>' +
        '<button type="button" class="btn-aura sm battle-button" data-a="ball" ' +
        (B.wild ? "" : "disabled") + ' aria-label="Capturar (' + R.balls + ')">' +
        '<img class="battle-button-image" src="imagenes/combate/capturar.png" alt="">' +
        '<span class="battle-button-label">Capturar (' + R.balls + ')</span></button>' +
        '<button type="button" class="btn-aura sm battle-button" data-a="flee" ' +
        (B.wild ? "" : "disabled") + ' aria-label="Huir">' +
        '<img class="battle-button-image" src="imagenes/combate/huir.png" alt="">' +
        '<span class="battle-button-label">Huir</span></button>' +
        '<button type="button" class="btn-aura sm battle-button" data-a="team" aria-label="Equipo">' +
        '<img class="battle-button-image" src="imagenes/combate/equipo.png" alt="">' +
        '<span class="battle-button-label">Equipo</span></button>';

    const moves = p.mv.map((m, i) =>
        '<button type="button" class="btn-aura sm" data-a="move" data-v="' + i + '" ' +
        (m.pp <= 0 ? "disabled" : "") + '>' + m.n + ' (' + m.pp + '/' + m.mx + ')</button>'
    ).join("") + '<button type="button" class="btn-aura sm" data-a="back">Atrás</button>';

    $("#battle").innerHTML =
        '<div class="top"><span>Oleada ' + R.wave + '/' + CONFIG.LAST_WAVE + (B.t ? " · " + B.t.n : "") +
        '</span><span>$' + R.money + '</span>' +
        '<button type="button" class="link-btn battle-music-toggle" data-a="waveMusic" aria-pressed="' +
        waveMusicEnabled + '">' + (waveMusicEnabled ? "♫ Música: Activada" : "♫ Música: Desactivada") + '</button></div>' +
        card(B.e, "enemy") + card(p, "player") +
        '<div class="log"><img class="battle-panel-image" src="imagenes/combate/fondo-movimientos.png" ' +
        'alt="" aria-hidden="true"><div class="log-content">' + B.log.slice(-4).join("<br>") + '</div></div>' +
        '<div class="acts" style="' + (B.busy ? "pointer-events:none;opacity:.5" : "") + '">' +
        (B.menu === "main" ? main : moves) + '</div>';
}

async function hit(a, d, mv) {
    const attacker = SP[a.s];
    const defender = SP[d.s];
    const move = mv || { n: "Forcejeo", t: "Normal", p: 35 };

    B.log.push((a === act() ? "" : "Rival ") + attacker.name + " usa " + move.n + ".");

    const effectiveness = eff(move.t, defender.t1) * (defender.t2 ? eff(move.t, defender.t2) : 1);
    const stab = (attacker.t1 === move.t || attacker.t2 === move.t) ? 1.3 : 1;
    const auraBoost = move.t === "Aura" ? a.ab : 1;
    const base = ((2 * a.lv / 5 + 2) * move.p * a.atk / d.def / 50 + 2);
    const damage = Math.max(1, Math.floor(base * effectiveness * stab * auraBoost * rnd(85, 100) / 100));

    d.hp = Math.max(0, d.hp - damage);

    if (effectiveness > 1) {
        B.log.push("¡Es súper eficaz!");
    } else if (effectiveness < 1) {
        B.log.push("No es muy eficaz...");
    }
    if (d.hp <= 0) {
        B.log.push(defender.name + " se debilita.");
    }

    renderBattle();
    await sleep(750);
}

function enemyMove(e) {
    const usable = e.mv.filter((m) => m.pp > 0);
    if (!usable.length) {
        return null;
    }
    const chosen = usable[rnd(0, usable.length - 1)];
    chosen.pp--;
    return chosen;
}

async function turn(kind, mv) {
    if (B.busy) {
        return;
    }
    B.busy = true;
    renderBattle();

    const p = act();
    let order = ["e"];
    if (kind === "move") {
        order = p.spd >= B.e.spd ? ["p", "e"] : ["e", "p"];
    }

    for (const side of order) {
        if (p.hp <= 0 || B.e.hp <= 0) {
            break;
        }
        if (side === "p") {
            await hit(p, B.e, mv);
        } else {
            await hit(B.e, p, enemyMove(B.e));
        }
    }

    B.busy = false;

    if (B.e.hp <= 0) {
        if (B.q.length) {
            B.e = B.q.shift();
            B.log.push(B.t.n + " envía a " + SP[B.e.s].name + ".");
            B.menu = "main";
            renderBattle();
            return;
        }
        winBattle(false);
        return;
    }
    if (p.hp <= 0) {
        playerFaint();
        return;
    }

    B.menu = "main";
    renderBattle();
}

function playerFaint() {
    if (!R.team.some((m) => m.hp > 0)) {
        permadeath();
        return;
    }
    B.log.push("Elige a otro Auramon.");
    B.menu = "main";
    renderBattle();
    openTeam(true);
}

function winBattle(captured) {
    pauseWaveMusic();
    const gold = captured ? 10 : (B.wild ? 15 : 60) + R.wave * 3;
    R.money += gold;
    R.balls += B.t ? 3 : 1;

    if (B.t && !SAVE.medals.includes(B.t.medal)) {
        SAVE.medals.push(B.t.medal);
    }

    const lv = 5 + Math.floor(R.wave / 2);
    R.team.forEach((m) => levelTo(m, lv));
    SAVE.best = Math.max(SAVE.best, R.wave);
    store();

    if (R.wave >= CONFIG.LAST_WAVE) {
        victory();
        return;
    }

    R.phase = "shop";
    R.shop = pick3();
    saveRun();

    ov('<h2>¡Oleada ' + R.wave + ' superada!</h2>' +
        '<p>Ganas $' + gold + (B.t ? " y la Medalla " + B.t.medal : "") + '. Tu equipo sube a Nv.' + lv + '.</p>' +
        '<div class="row"><button type="button" class="btn-aura sm" data-a="shop" style="width:18cqw">Ir a la tienda</button></div>');
}

function victory() {
    clearRun();
    SAVE.runs++;
    store();
    ov('<h2>¡Valle sincronizado!</h2>' +
        '<p>Derrotaste al Líder Zeo y completaste las 50 oleadas. Capturas: ' + R.caught +
        '. Medallas: ' + SAVE.medals.join(", ") + '.</p>' +
        '<div class="row"><button type="button" class="btn-aura sm" data-a="menu" style="width:18cqw">Menú principal</button></div>');
}

function permadeath() {
    pauseWaveMusic();
    clearRun();
    SAVE.runs++;
    SAVE.best = Math.max(SAVE.best, R.wave);
    store();
    ov('<h2>Muerte permanente</h2>' +
        '<p>Tu equipo cayó en la oleada ' + R.wave + '. La partida se ha borrado.</p>' +
        '<p>Capturas del intento: ' + R.caught +
        (R.capNames.length ? " (" + R.capNames.join(", ") + ") — desbloqueadas para siempre." : ".") + '</p>' +
        '<div class="row"><button type="button" class="btn-aura sm" data-a="menu" style="width:18cqw">Menú principal</button></div>');
}

/* =========================================================
   CAPTURA, HUIDA Y EQUIPO
   ========================================================= */
function ball() {
    if (B.busy) {
        return;
    }
    if (R.balls < 1) {
        B.log.push("No te quedan Pokéballs.");
        renderBattle();
        return;
    }
    if (R.team.length >= CONFIG.MAX_TEAM) {
        B.log.push("Tu equipo está lleno.");
        renderBattle();
        return;
    }

    R.balls--;
    const e = B.e;
    const chance = Math.min(0.85, Math.max(0.1, 0.15 + (1 - e.hp / e.mhp) * 0.6));
    B.log.push("¡Lanzas una Pokéball!");

    if (Math.random() < chance) {
        B.log.push("¡" + SP[e.s].name + " fue capturado!");
        R.team.push(e);
        R.caught++;
        R.capNames.push(SP[e.s].name);
        if (!SAVE.unlocked.includes(e.s)) {
            SAVE.unlocked.push(e.s);
            store();
        }
        renderBattle();
        saveRun();
        winBattle(true);
        return;
    }

    B.log.push("¡Se escapó de la Pokéball!");
    turn("ball");
}

function flee() {
    if (B.busy) {
        return;
    }
    const chance = Math.min(0.95, Math.max(0.25, 0.5 + (act().spd - B.e.spd) / 100));

    if (Math.random() < chance) {
        B.log.push("¡Escapas sin problemas!");
        pauseWaveMusic();
        R.phase = "shop";
        R.shop = pick3();
        saveRun();
        renderBattle();
        ov('<h2>Has huido</h2><p>Sin recompensa esta vez.</p>' +
            '<div class="row"><button type="button" class="btn-aura sm" data-a="shop" style="width:18cqw">Ir a la tienda</button></div>');
    } else {
        B.log.push("¡No puedes escapar!");
        turn("flee");
    }
}

function openTeam(forced) {
    IT.forced = forced;
    const rows = R.team.map((m, i) =>
        '<div class="item ' + (m.hp <= 0 ? "dim" : "") + '"><span>' + sprite(m.s) + ' ' + SP[m.s].name +
        ' Nv.' + m.lv + ' — ' + m.hp + '/' + m.mhp + ' HP</span>' +
        '<button type="button" class="btn-aura sm" style="width:12cqw" data-a="sw" data-v="' + i + '" ' +
        (m.hp <= 0 || i === R.act ? "disabled" : "") + '>Enviar</button></div>'
    ).join("");

    ov('<h2>Equipo</h2>' + rows +
        (forced ? "" : '<button type="button" class="btn-aura sm" data-a="close" style="width:12cqw">Cerrar</button>'));
}

/* =========================================================
   OBJETOS
   ========================================================= */
function openItems(ctx) {
    IT = { k: null, ctx: ctx, forced: false };
    const rows = Object.keys(ITEMS).map((k) =>
        '<div class="item"><span><b>' + ITEMS[k].n + '</b> x' + R.inv[k] + '<small>' + ITEMS[k].d + '</small></span>' +
        '<button type="button" class="btn-aura sm" style="width:12cqw" data-a="useItem" data-v="' + k + '" ' +
        (R.inv[k] < 1 ? "disabled" : "") + '>Usar</button></div>'
    ).join("");

    ov('<h2>Objetos</h2>' + rows +
        '<button type="button" class="btn-aura sm" data-a="close" style="width:12cqw">Cerrar</button>');
}

function chooseTarget(k) {
    IT.k = k;
    const rows = R.team.map((m, i) => {
        let ok;
        if (k === "rev") {
            ok = m.hp <= 0;
        } else if (k === "aur") {
            ok = true;
        } else if (k === "ber") {
            ok = m.hp > 0;
        } else {
            ok = m.hp > 0 && m.hp < m.mhp;
        }
        return '<div class="item ' + (ok ? "" : "dim") + '"><span>' + sprite(m.s) + ' ' + SP[m.s].name +
            ' — ' + m.hp + '/' + m.mhp + ' HP ' +
            (m.ab > 1 ? "· Aura +" + Math.round((m.ab - 1) * 100) + "%" : "") + '</span>' +
            '<button type="button" class="btn-aura sm" style="width:12cqw" data-a="useOn" data-v="' + i + '" ' +
            (ok ? "" : "disabled") + '>Elegir</button></div>';
    }).join("");

    ov('<h2>Usar ' + ITEMS[k].n + '</h2>' + rows +
        '<button type="button" class="btn-aura sm" data-a="item2" style="width:12cqw">Atrás</button>');
}

function useOn(i) {
    const m = R.team[i];
    const k = IT.k;

    if (k === "pot") {
        m.hp = Math.min(m.mhp, m.hp + 30);
    } else if (k === "rev") {
        m.hp = Math.ceil(m.mhp / 2);
    } else if (k === "ber") {
        m.hp = Math.min(m.mhp, m.hp + 20);
        m.mv.forEach((x) => {
            x.pp = Math.min(x.mx, x.pp + 5);
        });
    } else {
        m.ab = +(m.ab + 0.25).toFixed(2);
    }

    R.inv[k]--;
    saveRun();

    if (IT.ctx === "battle") {
        B.log.push("Usas " + ITEMS[k].n + " en " + SP[m.s].name + ".");
        hideOv();
        turn("item");
    } else {
        openItems("shop");
        renderShop();
    }
}

/* =========================================================
   TIENDA
   ========================================================= */
function pick3() {
    const bag = [];
    Object.keys(ITEMS).forEach((k) => {
        for (let i = 0; i < ITEMS[k].w; i++) {
            bag.push(k);
        }
    });
    return [0, 1, 2].map(() => ({ k: bag[rnd(0, bag.length - 1)], sold: false }));
}

function renderShop() {
    show("shop");

    const offers = R.shop.map((s, i) =>
        '<div class="item"><span><b>' + ITEMS[s.k].n + '</b> — $' + ITEMS[s.k].c +
        '<small>' + ITEMS[s.k].d + '</small></span>' +
        '<button type="button" class="btn-aura sm" style="width:14cqw" data-a="buy" data-v="' + i + '" ' +
        (s.sold || R.money < ITEMS[s.k].c ? "disabled" : "") + '>' + (s.sold ? "Vendido" : "Comprar") + '</button></div>'
    ).join("");

    const team = R.team.map((m) =>
        '<div class="slot ' + (m.hp <= 0 ? "dim" : "") + '"><b>' + sprite(m.s) + ' ' + SP[m.s].name + '</b>' +
        '<div class="bar"><i style="width:' + (100 * m.hp / m.mhp) + '%"></i></div>' +
        '<small>' + m.hp + '/' + m.mhp + '</small></div>'
    ).join("");

    $("#shop").innerHTML =
        '<div class="pane"><h2>Tienda · tras la oleada ' + R.wave + '</h2>' +
        '<div class="top"><span>Dinero: $' + R.money + '</span><span>Pokéballs: ' + R.balls + '</span></div>' +
        offers +
        '<div class="grid" style="grid-template-columns:repeat(3,1fr);max-height:14cqw">' + team + '</div>' +
        '<div class="row"><button type="button" class="btn-aura sm" data-a="item" data-v="shop" style="width:18cqw">Usar objetos</button>' +
        '<button type="button" class="btn-aura sm" data-a="next" style="width:18cqw">Siguiente oleada</button></div></div>';
}

/* =========================================================
   ELENCO DE AURAMONS
   ========================================================= */
function openDex() {
    const renderSlot = (d, i, area) => {
        if (SAVE.unlocked.includes(i)) {
            return '<div class="dex-slot ' + area + '">' + sprite(i) + '<b>' + d.name + '</b><small>' + tys({ s: i }) + '</small></div>';
        }
        return '<div class="dex-slot ' + area + ' dim"><div class="e">?</div><b>???</b></div>';
    };
    const mainSlots = SP.map((d, i) => renderSlot(d, i, "dex-slot-card")).join("");

    ov('<div class="dex-screen">' +
        '<img class="dex-background-image" src="imagenes/auramons/fondo-pokedex.png" alt="" aria-hidden="true">' +
        '<p class="dex-count">DESCUBIERTOS ' + SAVE.unlocked.length + '/30</p>' +
        '<div class="dex-grid">' + mainSlots + '</div>' +
        '<button type="button" class="btn-aura sm dex-close" data-a="close" aria-label="Cerrar Pokédex">' +
        '<img class="dex-close-image" src="imagenes/auramons/cerrar.png" alt="">' +
        '<span class="dex-close-label">Cerrar</span>' +
        '</button>' +
        '</div>', "dex-panel");
}

/* =========================================================
   CONTROLADOR DE ACCIONES
   ========================================================= */
const ACT = {
    tab(v) {
        const login = v === "login";
        $(".auth-box").classList.toggle("login-mode", login);
        $(".auth-box").classList.toggle("register-mode", !login);
        $("#loginForm").classList.toggle("hidden", !login);
        $("#registerForm").classList.toggle("hidden", login);
        $("#tabLogin").classList.toggle("active", login);
        $("#tabRegister").classList.toggle("active", !login);
        setAuthMsg("", true);
    },

    logout: logout,

    start() {
        D = { sel: [] };
        renderDraft();
        show("draft");
    },

    cont() {
        R = JSON.parse(localStorage.getItem(runKey()));
        if (R.phase === "shop") {
            renderShop();
        } else {
            startWave();
        }
    },

    dex: openDex,
    close: hideOv,

    music() {
        const music = $("#menuMusic");
        if (music.paused) {
            playMenuMusic();
        } else {
            pauseMenuMusic();
        }
    },

    waveMusic() {
        waveMusicEnabled = !waveMusicEnabled;
        localStorage.setItem(CONFIG.WAVE_MUSIC_KEY, String(waveMusicEnabled));
        if (waveMusicEnabled) {
            playWaveMusic();
        } else {
            pauseWaveMusic();
        }
        updateWaveMusicButton();
    },

    menu() {
        hideOv();
        refreshMenu();
        show("menu");
    },

    pick(v) {
        const s = +v;
        const i = D.sel.indexOf(s);
        if (i >= 0) {
            D.sel.splice(i, 1);
        } else if (spent() + SP[s].cost <= CONFIG.BUDGET && D.sel.length < CONFIG.MAX_TEAM) {
            D.sel.push(s);
        }
        renderDraft();
    },

    go() {
        R = {
            team: D.sel.map((s) => mk(s, 5)),
            inv: { pot: 1, rev: 0, ber: 1, aur: 0 },
            balls: 5,
            money: 50,
            wave: 1,
            act: 0,
            caught: 0,
            capNames: []
        };
        D.sel.forEach((s) => {
            if (!SAVE.unlocked.includes(s)) {
                SAVE.unlocked.push(s);
            }
        });
        store();
        startWave();
    },

    atk() {
        B.menu = "moves";
        renderBattle();
    },

    back() {
        B.menu = "main";
        renderBattle();
    },

    move(v) {
        const m = act().mv[+v];
        if (m.pp <= 0 || B.busy) {
            return;
        }
        m.pp--;
        turn("move", m);
    },

    item(v) {
        if (B && B.busy) {
            return;
        }
        openItems(v === "shop" ? "shop" : "battle");
    },

    item2() {
        openItems(IT.ctx);
    },

    useItem: chooseTarget,
    useOn: (v) => useOn(+v),
    ball: ball,
    flee: flee,

    team() {
        if (!B.busy) {
            openTeam(false);
        }
    },

    sw(v) {
        const forced = IT.forced;
        R.act = +v;
        hideOv();
        if (forced) {
            B.log.push("¡Adelante, " + SP[act().s].name + "!");
            renderBattle();
        } else {
            B.log.push("Cambias a " + SP[act().s].name + ".");
            turn("switch");
        }
    },

    shop() {
        hideOv();
        renderShop();
    },

    buy(v) {
        const s = R.shop[+v];
        const cost = ITEMS[s.k].c;
        if (s.sold || R.money < cost) {
            return;
        }
        R.money -= cost;
        R.inv[s.k]++;
        s.sold = true;
        saveRun();
        renderShop();
    },

    next() {
        R.wave++;
        startWave();
    }
};

document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-a]");
    if (button && ACT[button.dataset.a]) {
        ACT[button.dataset.a](button.dataset.v);
    }
});

$("#menuMusic").addEventListener("error", () => {
    updateMusicButton("♫ Audio no disponible", "No se encontró audio/musica-menu.mp3", false);
});

$("#waveMusic").addEventListener("error", () => {
    console.error("No se pudo cargar audio/musica-oleada.mp3.");
});

document.addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.target.id === "loginForm") {
        handleLogin();
    } else if (event.target.id === "registerForm") {
        handleRegister();
    }
});

/* =========================================================
   ARRANQUE: restaurar sesión guardada o mostrar autenticación
   ========================================================= */
(function boot() {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    const username = localStorage.getItem(CONFIG.USER_KEY);
    if (token && username) {
        enterMenu(username);
    } else {
        show("auth");
    }
})();
