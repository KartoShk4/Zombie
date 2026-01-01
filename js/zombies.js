let zombies = [];
let nextZombieId = 1;

function spawnWave(wave) {
    if (isWaveActive || isWaveCooldown) return;

    isWaveActive = true;

    const count = config.wave.baseZombies + wave;

    for (let i = 0; i < count; i++) {
        zombies.push({
            id: nextZombieId++,
            width: config.zombie.width,
            height: config.zombie.height,
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            health: config.zombie.health,
            speed: config.zombie.speed
        });
    }
}


function updateZombies() {
    for (let z of zombies) {
        const dx = player.x - z.x;
        const dy = player.y - z.y;
        const dist = Math.hypot(dx, dy);
        if (dist === 0) continue;

        z.x += (dx / dist) * z.speed;
        z.y += (dy / dist) * z.speed;
    }
}

function renderZombies(ctx) {
    ctx.fillStyle = 'purple';
    for (let z of zombies) {
        ctx.fillRect(z.x - z.width / 2, z.y - z.height / 2, z.width, z.height);
    }
}
