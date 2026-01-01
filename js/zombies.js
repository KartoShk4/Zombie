let zombies = [];
let blood = [];
let nextZombieId = 1;

function spawnWave(wave) {

    const types = [
        {color: "#4f6f4f", size: 40, speed: 0.7, health: 3}, // обычный
        {color: "#7a7a7a", size: 30, speed: 1.4, health: 2}, // быстрый
        {color: "#3b4f3b", size: 55, speed: 0.4, health: 6}, // толстяк
    ];

    if (isWaveActive || isWaveCooldown) return;

    isWaveActive = true;

    const SAFE_RADIUS = 200;
    const count = config.wave.baseZombies + wave;

    for (let i = 0; i < count; i++) {

        // выбираем тип КАЖДОМУ зомби отдельно
        const t = types[Math.floor(Math.random() * types.length)];

        let x, y;
        let attempts = 0;

        do {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;

            const dx = x - player.x;
            const dy = y - player.y;
            const dist = Math.hypot(dx, dy);

            if (dist > SAFE_RADIUS) break;

            attempts++;
        } while (attempts < 50);

        zombies.push({
            id: nextZombieId++,
            size: t.size,
            width: t.size,
            height: t.size,
            x,
            y,
            color: t.color,
            health: t.health,
            speed: t.speed,
            damage: config.zombie.damage,
            step: 0, // фаза шага
        });
    }
}

function updateZombies() {
    let hitsThisFrame = 0;
    const MAX_HITS_PER_FRAME = 1;

    for (let z of zombies) {
        const dx = player.x - z.x;
        const dy = player.y - z.y;
        const dist = Math.hypot(dx, dy);

        if (dist === 0) continue;

        // движение к игроку
        z.x += (dx / dist) * z.speed;
        z.y += (dy / dist) * z.speed;

        // анимация шага (покачивание)
        z.step += 0.1;
        z.y += Math.sin(z.step) * 0.3;

        // столкновение с игроком
        if (dist < (player.width / 2 + z.width / 2)) {
            if (hitsThisFrame < MAX_HITS_PER_FRAME) {
                damagePlayer(z.damage);
                hitsThisFrame++;
            }
        }
    }
}

function renderBlood(ctx) {
    blood.forEach(b => {
        ctx.save();
        ctx.globalAlpha = b.alpha;

        ctx.fillStyle = "#7a0000";
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        b.alpha -= 0.02;
    });

    blood = blood.filter(b => b.alpha > 0);
}

function renderZombies(ctx) {
    zombies.forEach(z => {
        ctx.save();
        ctx.translate(z.x, z.y);

        const r = z.size / 2;

        // тело
        ctx.fillStyle = z.color;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // глаза (красные)
        ctx.fillStyle = "#ff2b2b";
        ctx.beginPath();
        ctx.arc(-r * 0.3, -r * 0.25, r * 0.18, 0, Math.PI * 2);
        ctx.arc(r * 0.3, -r * 0.25, r * 0.18, 0, Math.PI * 2);
        ctx.fill();

        // зрачки — смотрят на игрока
        const angle = Math.atan2(player.y - z.y, player.x - z.x);
        const px = Math.cos(angle) * r * 0.1;
        const py = Math.sin(angle) * r * 0.1;

        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(-r * 0.3 + px, -r * 0.25 + py, r * 0.07, 0, Math.PI * 2);
        ctx.arc(r * 0.3 + px, -r * 0.25 + py, r * 0.07, 0, Math.PI * 2);
        ctx.fill();

        // рот
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(0, r * 0.25, r * 0.45, 0, Math.PI);
        ctx.fill();

        // зубы
        ctx.fillStyle = "#fff";
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(i * r * 0.12, r * 0.25);
            ctx.lineTo(i * r * 0.12 + r * 0.05, r * 0.35);
            ctx.lineTo(i * r * 0.12 - r * 0.05, r * 0.35);
            ctx.fill();
        }

        ctx.restore();
    });
}
