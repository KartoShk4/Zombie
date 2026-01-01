let keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();

    if (k === "w") keys.w = true;
    if (k === "a") keys.a = true;
    if (k === "s") keys.s = true;
    if (k === "d") keys.d = true;

    if (e.key === "ArrowUp") keys.ArrowUp = true;
    if (e.key === "ArrowDown") keys.ArrowDown = true;
    if (e.key === "ArrowLeft") keys.ArrowLeft = true;
    if (e.key === "ArrowRight") keys.ArrowRight = true;
});

window.addEventListener('keyup', e => {
    const k = e.key.toLowerCase();

    if (k === "w") keys.w = false;
    if (k === "a") keys.a = false;
    if (k === "s") keys.s = false;
    if (k === "d") keys.d = false;

    if (e.key === "ArrowUp") keys.ArrowUp = false;
    if (e.key === "ArrowDown") keys.ArrowDown = false;
    if (e.key === "ArrowLeft") keys.ArrowLeft = false;
    if (e.key === "ArrowRight") keys.ArrowRight = false;
});
