let zombies = [];
let nextZombieId = 1;

function spawnWave(wave) {
    if (isWaveActive || isWaveCooldown) return;

    isWaveActive = true;

    const SAFE_RADIUS = 200; // радиус безопасной зоны вокруг игрока
    const count = config.wave.baseZombies + wave;

    for (let i = 0; i < count; i++) {

        let x, y;
        let attempts = 0;

        do {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;

            const dx = x - player.x;
            const dy = y - player.y;
            const dist = Math.hypot(dx, dy);

            // если слишком близко — повторяем
            if (dist > SAFE_RADIUS) break;

            attempts++;
        } while (attempts < 50);

        zombies.push({
            id: nextZombieId++,
            width: config.zombie.width,
            height: config.zombie.height,
            x,
            y,
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
