const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let wave = 1;
let isWaveActive = false;
let isWaveCooldown = false;
let waveCooldownTime = 3; // секунды
let waveTimer = 0;

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
        waveTimer -= 1 / 60; // 60 FPS
        if (waveTimer <= 0) {
            isWaveCooldown = false;
            wave++;
            spawnWave(wave);
        }
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    renderPlayer(ctx);
    renderZombies(ctx);
    renderBullets(ctx);
    renderHUD(ctx);

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(joystick.baseX, joystick.baseY, joystick.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(joystick.stickX, joystick.stickY, joystick.radius / 2, 0, Math.PI * 2);
    ctx.fill();
}

function gameLoop() {
    update();

    if (isMouseDown) {
        shootBullet(mouseAim.x - player.x, mouseAim.y - player.y);
    }

    if (aimJoystick.vector.x !== 0 || aimJoystick.vector.y !== 0) {
        shootBullet(aimJoystick.vector.x, aimJoystick.vector.y);
    }

    render();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    player.x = canvas.width / 2;
    player.y = canvas.height / 2;

    joystick.baseY = canvas.height - 100;
    joystick.stickY = canvas.height - 100;

    aimJoystick.baseY = canvas.height - 100;
    aimJoystick.stickY = canvas.height - 100;
});

spawnWave(wave);
gameLoop();
