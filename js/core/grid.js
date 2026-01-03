/* ============================================
   SPATIAL GRID — ускорение столкновений
   ============================================ */

const GRID_CELL = 250; // размер ячейки
const GRID_COLS = Math.ceil(3000 / GRID_CELL);
const GRID_ROWS = Math.ceil(3000 / GRID_CELL);

// Сетка: массив массивов
let grid = [];

/** Очистка сетки */
function gridClear() {
    grid = [];
    for (let i = 0; i < GRID_COLS * GRID_ROWS; i++) {
        grid[i] = [];
    }
}

/** Получить индекс ячейки по координатам */
function gridIndex(x, y) {
    const cx = Math.floor(x / GRID_CELL);
    const cy = Math.floor(y / GRID_CELL);
    if (cx < 0 || cy < 0 || cx >= GRID_COLS || cy >= GRID_ROWS) return -1;
    return cy * GRID_COLS + cx;
}

/** Добавить объект в сетку */
function gridAdd(obj) {
    const idx = gridIndex(obj.x, obj.y);
    if (idx >= 0) grid[idx].push(obj);
}

/** Получить соседние ячейки (для пуль и зомби) */
function gridGetNeighbors(x, y) {
    const cx = Math.floor(x / GRID_CELL);
    const cy = Math.floor(y / GRID_CELL);

    const result = [];

    for (let iy = -1; iy <= 1; iy++) {
        for (let ix = -1; ix <= 1; ix++) {
            const nx = cx + ix;
            const ny = cy + iy;
            if (nx >= 0 && ny >= 0 && nx < GRID_COLS && ny < GRID_ROWS) {
                const idx = ny * GRID_COLS + nx;
                result.push(...grid[idx]);
            }
        }
    }

    return result;
}
