let player = {
    width: config.player.width,
    height: config.player.height,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    health: config.player.health,
    speed: config.player.speed
};

let playerHitCooldown = 0;


function damagePlayer(amount) {
    if (playerHitCooldown > 0) return; // ← защита от спама урона

    player.health -= amount;
    playerHitCooldown = config.zombie.hitCooldown;

    if (player.health <= 0) {
        player.health = 0;
        gameOver();
    }
}


function updatePlayer() {
    // === 1. Управление джойстиком (телефон) ===
    if (joystick.vector.x !== 0 || joystick.vector.y !== 0) {
        player.x += joystick.vector.x * player.speed;
        player.y += joystick.vector.y * player.speed;
    }

    // === 2. Управление WASD (ПК) ===
    if (keys.w) player.y -= player.speed;
    if (keys.s) player.y += player.speed;
    if (keys.a) player.x -= player.speed;
    if (keys.d) player.x += player.speed;

    // === 3. Управление стрелками (альтернатива) ===
    if (keys.ArrowUp) player.y -= player.speed;
    if (keys.ArrowDown) player.y += player.speed;
    if (keys.ArrowLeft) player.x -= player.speed;
    if (keys.ArrowRight) player.x += player.speed;

    // === 4. Ограничения по краям экрана ===
    if (player.x < player.width / 2) player.x = player.width / 2;
    if (player.x > canvas.width - player.width / 2) player.x = canvas.width - player.width / 2;
    if (player.y < player.height / 2) player.y = player.height / 2;
    if (player.y > canvas.height - player.height / 2) player.y = canvas.height - player.height / 2;
}


function renderPlayer(ctx) {
    ctx.save();
    ctx.translate(player.x, player.y);

    // тело
    ctx.fillStyle = "#4a90e2";
    ctx.beginPath();
    ctx.arc(0, 0, player.width / 2, 0, Math.PI * 2);
    ctx.fill();

    // лицо
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(0, -player.height * 0.15, player.width * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // глаза
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(-player.width * 0.1, -player.height * 0.2, player.width * 0.05, 0, Math.PI * 2);
    ctx.arc(player.width * 0.1, -player.height * 0.2, player.width * 0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

