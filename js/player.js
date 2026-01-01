let player = {
    width: config.player.width,
    height: config.player.height,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    health: config.player.health,
    speed: config.player.speed
};

function updatePlayer() {
    if (keys.ArrowUp) player.y -= player.speed;
    if (keys.ArrowDown) player.y += player.speed;
    if (keys.ArrowLeft) player.x -= player.speed;
    if (keys.ArrowRight) player.x += player.speed;

    player.x += joystick.vector.x * player.speed;
    player.y += joystick.vector.y * player.speed;

    if (player.x < player.width / 2) player.x = player.width / 2;
    if (player.x > canvas.width - player.width / 2) player.x = canvas.width - player.width / 2;
    if (player.y < player.height / 2) player.y = player.height / 2;
    if (player.y > canvas.height - player.height / 2) player.y = canvas.height - player.height / 2;
}

function renderPlayer(ctx) {
    ctx.fillStyle = 'green';
    ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
}
