const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);

let gameStarted = false;
let camera = { x: 0, y: 0 };

const WORLD_WIDTH = 3000;
const WORLD_HEIGHT = 3000;

function startGame() {
    document.getElementById("main-menu").classList.add("hidden");
    gameStarted = true;
}

function openSettings() {
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("settings-menu").classList.remove("hidden");
}

function closeSettings() {
    document.getElementById("settings-menu").classList.add("hidden");
    document.getElementById("main-menu").classList.remove("hidden");
}

function openHowToPlay() {
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("howto-menu").classList.remove("hidden");
}

function closeHowToPlay() {
    document.getElementById("howto-menu").classList.add("hidden");
    document.getElementById("main-menu").classList.remove("hidden");
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Глобальные переменные управления (страховка, если input.js загрузится позже)
let isMouseDown = false;
let mouseAim = {x: 0, y: 0};

let muzzleFlash = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let backgroundCanvas = document.createElement("canvas");
let backgroundCtx = backgroundCanvas.getContext("2d");
backgroundCanvas.width = canvas.width;
backgroundCanvas.height = canvas.height;

let footprints = [];

let wave = 1;
let isWaveActive = false;
let isWaveCooldown = false;
let waveCooldownTime = 3; // секунды
let waveTimer = 0;
let lightFlicker = 1;
let cameraShake = 0;
let cameraShakePower = 8;
let lastShotAngle = 0;


function renderFootprints(ctx) {
    footprints.forEach(f => {
        ctx.save();
        ctx.globalAlpha = f.alpha;
        ctx.fillStyle = "#3a3a3a";
        ctx.beginPath();
        ctx.arc(f.x, f.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        f.alpha -= 0.005;
    });

    footprints = footprints.filter(f => f.alpha > 0);
}

function renderVignette(ctx) {
    let gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.2,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );

    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.6)");

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

function checkOrientation() {
    const warning = document.getElementById("rotate-warning");

    const isPortrait =
        window.innerHeight > window.innerWidth ||
        (screen.orientation && screen.orientation.type.startsWith("portrait"));

    if (isPortrait) {
        warning.style.display = "flex";
        canvas.style.display = "none";
    } else {
        warning.style.display = "none";
        canvas.style.display = "block";
    }
}

// Проверяем ориентацию сразу после загрузки
window.addEventListener("load", () => {
    setTimeout(checkOrientation, 50);
});

window.addEventListener("resize", checkOrientation);
window.addEventListener("orientationchange", checkOrientation);

const fullscreenBtn = document.getElementById("fullscreen-btn");

fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        fullscreenBtn.textContent = "⤢"; // кнопка "выйти"
    } else {
        document.exitFullscreen();
        fullscreenBtn.textContent = "⛶"; // кнопка "войти"
    }
});

function requestFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.warn("Fullscreen blocked by browser:", err);
        });
    }
}

window.addEventListener("click", requestFullscreen, {once: true});

checkOrientation();

function startWaveCooldown() {
    isWaveActive = false;
    isWaveCooldown = true;
    waveTimer = waveCooldownTime;
}

function update() {
    updatePlayer();
    updateZombies();
    updateBullets();

    if (isWaveCooldown) {
        waveTimer -= 1 / 60;
        if (waveTimer <= 0) {
            isWaveCooldown = false;
            wave++;
            spawnWave(wave);
        }
    }

    // кулдаун урона игроку
    if (playerHitCooldown > 0) {
        playerHitCooldown -= 1 / 60;
        if (playerHitCooldown < 0) playerHitCooldown = 0;
    }

    lightFlicker = 0.9 + Math.random() * 0.2;

    // === ОБНОВЛЕНИЕ КАМЕРЫ ===
    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;

    // ограничиваем камеру, чтобы не выходила за мир
    camera.x = Math.max(0, Math.min(camera.x, WORLD_WIDTH - canvas.width));
    camera.y = Math.max(0, Math.min(camera.y, WORLD_HEIGHT - canvas.height));

}

// Туман
function renderFog(ctx) {
    ctx.save();
    ctx.fillStyle = "rgba(200, 200, 200, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

function render() {
    // 1. Фон (первый слой)
    ctx.drawImage(backgroundCanvas, -camera.x, -camera.y);

    // 2. Туман
    renderFog(ctx);

    // 3. Эффекты сцены (камера, вспышка)
    ctx.save();

    // смещение камеры
    ctx.translate(-camera.x, -camera.y);

    // мерцание света
    ctx.globalAlpha = lightFlicker;

    // дрожание камеры
    if (cameraShake > 0) {
        const shakeX = (Math.random() - 0.5) * cameraShake;
        const shakeY = (Math.random() - 0.5) * cameraShake;
        ctx.translate(shakeX, shakeY);
        cameraShake *= 0.9;
    }

    // вспышка при выстреле
    if (muzzleFlash > 0) {
        ctx.save();

        ctx.translate(player.x, player.y);
        ctx.rotate(lastShotAngle);

        ctx.globalAlpha = muzzleFlash / 3;

        ctx.fillStyle = "#ffe066";
        ctx.fillRect(25, -4, 16, 8);

        ctx.fillStyle = "#ffea99";
        ctx.fillRect(35, -2, 10, 4);

        ctx.fillStyle = "#ffd42a";
        ctx.fillRect(20, -6, 8, 12);

        ctx.restore();

        muzzleFlash -= 0.3;
    }

    // 4. Следы, кровь, игрок, зомби, пули
    renderFootprints(ctx);
    renderBlood(ctx);
    renderPlayer(ctx);
    renderZombies(ctx);
    renderBullets(ctx);

    ctx.restore(); // ← HUD рисуем ПОСЛЕ restore()

    // 5. HUD (всегда поверх всего)
    renderHUD(ctx);

    // 6. Джойстики
    ctx.fillStyle = 'rgba(116,116,116,0.3)';
    ctx.beginPath();
    ctx.arc(joystick.baseX, joystick.baseY, joystick.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(joystick.stickX, joystick.stickY, joystick.radius / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(116,116,116,0.3)';
    ctx.beginPath();
    ctx.arc(aimJoystick.baseX, aimJoystick.baseY, aimJoystick.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(aimJoystick.stickX, aimJoystick.stickY, aimJoystick.radius / 2, 0, Math.PI * 2);
    ctx.fill();

    // 7. Виньетка (самый верхний слой)
    renderVignette(ctx);
}

function gameLoop() {
    if (!gameStarted) {
        requestAnimationFrame(gameLoop);
        return;
    }


    update();

    // стрельба мышью — автоогонь, но с ограниченным темпом
    if (isMouseDown) {
        tryShootBullet(mouseAim.x - player.x, mouseAim.y - player.y);
    }

    // стрельба джойстиком прицела
    if (aimJoystick.vector.x !== 0 || aimJoystick.vector.y !== 0) {
        tryShootBullet(aimJoystick.vector.x, aimJoystick.vector.y);
    }

    render();
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameStarted = false;
    document.getElementById("game-over").classList.remove("hidden");
    document.getElementById("final-score").innerText = "Счёт: " + score;
}

function restartGame() {
    location.reload();
}

function generateStaticBackground() {
    const ctx = backgroundCtx;
    const w = backgroundCanvas.width;
    const h = backgroundCanvas.height;

    // === БАЗОВЫЙ ГРАДИЕНТ ЗЕМЛИ ===
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#5c8a3e");
    grd.addColorStop(1, "#4f6b32");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // === МЯГКИЕ ПЯТНА ТРАВЫ ===
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 20 + Math.random() * 40;

        ctx.fillStyle = `rgba(80, 120, 50, ${0.05 + Math.random() * 0.05})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // === ПЯТНА ЗЕМЛИ ===
    for (let i = 0; i < 150; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 15 + Math.random() * 30;

        ctx.fillStyle = `rgba(90, 70, 40, ${0.05 + Math.random() * 0.05})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // === КАМНИ ===
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 6 + Math.random() * 10;

        ctx.fillStyle = `rgba(120, 120, 120, ${0.2 + Math.random() * 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(200, 200, 200, 0.2)`;
        ctx.beginPath();
        ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // пересоздаём фон
    backgroundCanvas.width = WORLD_WIDTH;
    backgroundCanvas.height = WORLD_HEIGHT;
    generateStaticBackground();

    // Центрируем игрока (если нужно)
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;

    // Левый джойстик (движение)
    joystick.baseX = 120;
    joystick.baseY = canvas.height - 120;
    joystick.stickX = joystick.baseX;
    joystick.stickY = joystick.baseY;

    // Правый джойстик (прицел)
    aimJoystick.baseX = canvas.width - 120;
    aimJoystick.baseY = canvas.height - 120;
    aimJoystick.stickX = aimJoystick.baseX;
    aimJoystick.stickY = aimJoystick.baseY;
});

window.onload = () => {
    generateStaticBackground();
    spawnWave(wave);
    gameLoop();
};
