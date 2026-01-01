let keys = {};

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

let mouseAim = { x: 0, y: 0 };
let isMouseDown = false;

canvas.addEventListener('mousemove', e => {
    mouseAim.x = e.clientX;
    mouseAim.y = e.clientY;
});

canvas.addEventListener('mousedown', () => isMouseDown = true);
canvas.addEventListener('mouseup', () => isMouseDown = false);
