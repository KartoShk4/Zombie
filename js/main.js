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

    player.x = canvas.width / 2;
    player.y = canvas.height / 2;

    joystick.baseY = canvas.height - 100;
    joystick.stickY = canvas.height - 100;

    aimJoystick.baseY = canvas.height - 100;
    aimJoystick.stickY = canvas.height - 100;
});

window.onload = () => {
    spawnWave(wave);
    gameLoop();
};
