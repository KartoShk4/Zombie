const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Глобальные переменные управления (страховка, если input.js загрузится позже)
let isMouseDown = false;
let mouseAim = {x: 0, y: 0};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let wave = 1;
let isWaveActive = false;
let isWaveCooldown = false;
let waveCooldownTime = 3; // секунды
let waveTimer = 0;

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
}


function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

}


function gameLoop() {
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
    alert("Game Over!");
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
