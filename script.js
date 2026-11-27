// ===== Пути к картинкам (положите файлы в папку images/) =====
const IMAGES = {
    solider: 'images/solider.jpg',   // кружок-солдат
    maiones: 'images/maiones.jpg',    // кнопка-майонез
    field: 'images/fueld.jpg'
};

// Подставляем картинки через CSS-переменные
document.documentElement.style.setProperty('--solider-img', `url("${IMAGES.solider}")`);
document.documentElement.style.setProperty('--maiones-img', `url("${IMAGES.maiones}")`);
document.documentElement.style.setProperty('--field-img', `url("${IMAGES.field}")`);

// ===== Константы =====
const GRID_SIZE = 16;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

const START_SPAWN_INTERVAL = 2000;      // 2 секунды
const INTERVAL_STEP = 100;              // -0.1 сек
const INTERVAL_STEP_PERIOD = 60000;     // каждые 60 секунд игры
const MIN_SPAWN_INTERVAL = 300;

const ENERGY_PER_CLICK = 0.5;

// ===== Состояние =====
let state = {
    score: 0,
    energy: 0,
    cells: [],
    circlesCount: 0,
    spawnTimerId: null,
    gameOver: false,
    gameStartTime: 0,
    currentInterval: START_SPAWN_INTERVAL
};

// ===== DOM =====
const gridEl = document.getElementById('grid');
const scoreEl = document.getElementById('score');
const energyEl = document.getElementById('energy');
const multiplierEl = document.getElementById('multiplier');
const panelArrow = document.getElementById('panel-arrow');
const bottomMenu = document.getElementById('bottom-menu');
const bigEnergyBtn = document.getElementById('big-energy-btn');
const gameOverEl = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// ===== Инициализация сетки =====
function initGrid() {
    gridEl.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < TOTAL_CELLS; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        fragment.appendChild(cell);
    }
    gridEl.appendChild(fragment);
    state.cells = Array.from(gridEl.children);
}

// ===== Расчёт интервала (минус 0.1 каждые 60 секунд игры) =====
function getCurrentInterval() {
    const elapsed = Date.now() - state.gameStartTime;
    const steps = Math.floor(elapsed / INTERVAL_STEP_PERIOD);
    const interval = START_SPAWN_INTERVAL - steps * INTERVAL_STEP;
    return Math.max(MIN_SPAWN_INTERVAL, interval);
}

// ===== Планирование =====
function scheduleNextSpawn() {
    if (state.gameOver) return;

    if (state.spawnTimerId) {
        clearTimeout(state.spawnTimerId);
        state.spawnTimerId = null;
    }

    state.currentInterval = getCurrentInterval();
    updateSpeedDisplay();

    state.spawnTimerId = setTimeout(() => {
        state.spawnTimerId = null;
        spawnCircle();
        scheduleNextSpawn();
    }, state.currentInterval);
}

// ===== Появление солдата =====
function spawnCircle() {
    if (state.gameOver) return;

    const emptyCells = state.cells.filter(cell => !cell.firstChild);
    if (emptyCells.length === 0) return;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const circle = document.createElement('div');
    circle.classList.add('circle');
    randomCell.appendChild(circle);

    state.circlesCount++;

    if (state.circlesCount > TOTAL_CELLS / 2) {
        triggerGameOver();
    }
}

// ===== Клик по сетке =====
function onGridClick(e) {
    if (state.gameOver) return;
    const cell = e.target.closest('.cell');
    if (!cell) return;
    const circle = cell.querySelector('.circle');
    if (!circle) return;

    if (state.energy < 1) {
        flashEnergyWarning();
        return;
    }

    state.energy -= 1;
    cell.removeChild(circle);
    state.circlesCount--;
    state.score += 1;
    updateUI();
}

// ===== Майонез =====
function onBigEnergyClick() {
    if (state.gameOver) return;
    state.energy += ENERGY_PER_CLICK;
    updateUI();
    bigEnergyBtn.style.transform = 'scale(0.9)';
    setTimeout(() => { bigEnergyBtn.style.transform = ''; }, 100);
}

// ===== UI =====
function updateUI() {
    scoreEl.textContent = state.score;
    energyEl.textContent = state.energy.toFixed(1);
    updateSpeedDisplay();
}

function updateSpeedDisplay() {
    const seconds = (state.currentInterval / 1000).toFixed(1);
    multiplierEl.textContent = `1 круг / ${seconds}с`;
}

function flashEnergyWarning() {
    const el = energyEl.parentElement;
    el.style.transition = 'background 0.1s';
    el.style.background = '#c0392b';
    setTimeout(() => { el.style.background = ''; }, 200);
}

// ===== Меню =====
function toggleBottomMenu() {
    const isOpen = bottomMenu.classList.toggle('open');
    panelArrow.classList.toggle('open', isOpen);
}

// ===== Проигрыш =====
function triggerGameOver() {
    state.gameOver = true;
    if (state.spawnTimerId) {
        clearTimeout(state.spawnTimerId);
        state.spawnTimerId = null;
    }
    finalScoreEl.textContent = state.score;
    gameOverEl.classList.remove('hidden');
}

// ===== Перезапуск =====
function restartGame() {
    if (state.spawnTimerId) {
        clearTimeout(state.spawnTimerId);
        state.spawnTimerId = null;
    }

    state.score = 0;
    state.energy = 0;
    state.circlesCount = 0;
    state.gameOver = false;
    state.currentInterval = START_SPAWN_INTERVAL;
    state.gameStartTime = Date.now();

    gameOverEl.classList.add('hidden');
    bottomMenu.classList.remove('open');
    panelArrow.classList.remove('open');

    initGrid();
    updateUI();

    spawnCircle();
    scheduleNextSpawn();
}

// ===== Запуск =====
function init() {
    initGrid();
    updateUI();

    gridEl.addEventListener('click', onGridClick);
    bigEnergyBtn.addEventListener('click', onBigEnergyClick);
    panelArrow.addEventListener('click', toggleBottomMenu);
    restartBtn.addEventListener('click', restartGame);

    state.gameStartTime = Date.now();

    spawnCircle();
    scheduleNextSpawn();
}

document.addEventListener('DOMContentLoaded', init);