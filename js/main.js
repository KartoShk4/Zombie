let gameStarted = false;

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

let footprints = [];

let wave = 1;
let isWaveActive = false;
let isWaveCooldown = false;
let waveCooldownTime = 3; // секунды
let waveTimer = 0;
let lightFlicker = 1;
let cameraShake = 0;
let cameraShakePower = 8;


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

}

// Туман
function renderFog(ctx) {
    ctx.save();
    ctx.fillStyle = "rgba(200, 200, 200, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

// Пиксельный HUD
function renderHUD(ctx) {
    ctx.save();
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillStyle = "white";
    ctx.textBaseline = "top";

    ctx.fillText("HP: " + player.health, 20, 20);
    ctx.fillText("Wave: " + wave, 20, 50);
    ctx.fillText("Score: " + score, 20, 80);

    ctx.restore();
}



function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#2b2b2b"; // тёмно-серый пиксельный фон
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    renderFog(ctx);

    ctx.save();
    ctx.globalAlpha = lightFlicker;

    if (cameraShake > 0) {
        const shakeX = (Math.random() - 0.5) * cameraShake;
        const shakeY = (Math.random() - 0.5) * cameraShake;
        ctx.translate(shakeX, shakeY);
        cameraShake *= 0.9;
    }

    if (muzzleFlash > 0) {
        ctx.save();
        ctx.globalAlpha = muzzleFlash / 3;
        ctx.fillStyle = "rgba(255, 255, 150, 0.8)";
        ctx.beginPath();
        ctx.arc(player.x, player.y, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        muzzleFlash -= 0.3;
    }

    renderFootprints(ctx);


    renderBlood(ctx);
    renderPlayer(ctx);
    renderZombies(ctx);
    renderBullets(ctx);
    renderHUD(ctx);

    // Левый джойстик
    ctx.fillStyle = 'rgba(116,116,116,0.3)';
    ctx.beginPath();
    ctx.arc(joystick.baseX, joystick.baseY, joystick.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(joystick.stickX, joystick.stickY, joystick.radius / 2, 0, Math.PI * 2);
    ctx.fill();

// Правый джойстик
    ctx.fillStyle = 'rgba(116,116,116,0.3)';
    ctx.beginPath();
    ctx.arc(aimJoystick.baseX, aimJoystick.baseY, aimJoystick.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(aimJoystick.stickX, aimJoystick.stickY, aimJoystick.radius / 2, 0, Math.PI * 2);
    ctx.fill();

    renderVignette(ctx);

    ctx.restore();
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


window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

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
    spawnWave(wave);
    gameLoop();
};
