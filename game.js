// ======== Canvas и игрок ========
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Canvas на весь экран
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let nextZombieId = 4;



// ======== Очки ========
let score = 0;


// меньше очков
let scorePerZombie = 1;
// считаем убитых в текущей волне
let zombiesKilled = 0;
// меньше зомби для волны
let zombiesPerWave = 5;


canvas.addEventListener('mousedown', e => shoot(e.clientX, e.clientY));
canvas.addEventListener('touchstart', e => { const t = e.touches[0]; shoot(t.clientX, t.clientY); });







// ======== Resize ========
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = canvas.width/2;
    player.y = canvas.height/2;
    joystick.baseY = canvas.height - 100;
    joystick.stickY = canvas.height - 100;
});

// ======== Update ========
function update(){
    // Движение игрока (клавиши)
    if(keys.ArrowUp) player.y -= player.speed;
    if(keys.ArrowDown) player.y += player.speed;
    if(keys.ArrowLeft) player.x -= player.speed;
    if(keys.ArrowRight) player.x += player.speed;

    // Движение игрока (джойстик)
    player.x += joystick.vector.x * player.speed;
    player.y += joystick.vector.y * player.speed;

    // Ограничение границ
    if(player.x < player.width/2) player.x = player.width/2;
    if(player.x > canvas.width-player.width/2) player.x = canvas.width-player.width/2;
    if(player.y < player.height/2) player.y = player.height/2;
    if(player.y > canvas.height-player.height/2) player.y = canvas.height-player.height/2;



    // Движение пуль и столкновение
    for(let i=bullets.length-1; i>=0; i--){
        let b = bullets[i];
        b.x += b.dx*b.speed;
        b.y += b.dy*b.speed;

        // Столкновение с зомби
        for(let j=zombies.length-1; j>=0; j--){
            let z = zombies[j];
            if(b.x > z.x-z.width/2 && b.x < z.x+z.width/2 &&
                b.y > z.y-z.height/2 && b.y < z.y+z.height/2){
                z.health -= 25;
                bullets.splice(i,1);
                if(z.health <= 0) zombies.splice(j,1);
                // Добавляем очки
                score += 1;
                zombiesKilled++;
                if(zombiesKilled >= zombiesPerWave){
                    wave++;
                    zombiesKilled = 0;
                    spawnWave(wave);
                }
                break;
            }
        }

        // Удаляем пули за экраном
        if(b.x<0 || b.x>canvas.width || b.y<0 || b.y>canvas.height){
            bullets.splice(i,1);
        }
    }
}

// ======== Render ========
function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Игрок
    ctx.fillStyle='green';
    ctx.fillRect(player.x-player.width/2, player.y-player.height/2, player.width, player.height);

    // HUD здоровья
    ctx.fillStyle='black';
    ctx.fillRect(18,18,104,14);
    ctx.fillStyle='red';
    ctx.fillRect(20,20,player.health,10);
    ctx.fillStyle='white';
    ctx.font="20px Arial";
    ctx.fillText(player.health,20,30);

    // Зомби
    for(let i=0; i<zombies.length; i++){
        const z = zombies[i];
        ctx.fillStyle='purple';
        ctx.fillRect(z.x-z.width/2, z.y-z.height/2, z.width, z.height);
    }

    // Пули
    ctx.fillStyle='yellow';
    for(let i=0;i<bullets.length;i++){
        const b = bullets[i];
        ctx.fillRect(b.x-3, b.y-3, 6, 6);
    }

    // Отображение волны
    ctx.fillText("Wave: " + wave, canvas.width - 120, 60);

    // Отображение очков
    ctx.fillStyle = 'black';
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, canvas.width - 120, 30);

    // Джойстик
    ctx.fillStyle='rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(joystick.baseX, joystick.baseY, joystick.radius,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(joystick.stickX, joystick.stickY, joystick.radius/2,0,Math.PI*2);
    ctx.fill();
}

// ======== Игровой цикл ========
function gameLoop(){
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Запуск игры
gameLoop();
