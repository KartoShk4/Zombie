let keys = {};

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

let mouseAim = {x: 0, y: 0};
let isMouseDown = false;

canvas.addEventListener('mousemove', e => {
    mouseAim.x = e.clientX;
    mouseAim.y = e.clientY;
});

canvas.addEventListener('mousedown', e => {
    isMouseDown = true;
    mouseAim.x = e.clientX;
    mouseAim.y = e.clientY;
    // сразу один выстрел
    tryShootBullet(mouseAim.x - player.x, mouseAim.y - player.y);
});

canvas.addEventListener('mouseup', () => isMouseDown = false);

canvas.addEventListener('mouseup', () => isMouseDown = false);
