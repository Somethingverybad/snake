const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gridSize = 10;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let direction = { x: 0, y: 0 };
let gameOver = false;
let score = 0;


const isVibrationSupported = 'vibrate' in navigator;
const eatSound = new Audio('z_uk-metronom.mp3');
const gameOverSound = new Audio('bell_metal_hit_01.mp3');
// Управление стрелками (для компьютеров)

const messages = [
    "Отлично!",
    "Так держать!",
    "Ты крут!",
    "Уровень бог!",
    "Невероятно!",
    "Прямо как профи!",
    "Змейке нравится :)",
    "Рекорд близко!",
    "Гоняй змею!",
    "ХОРОШ!",
    "МЕГАХОРОШ!",
    "АХУИТЕЛЕН!",
    "ЧТО ОН ТВОРИТ?",
    "КАК ДЕТЕЙ",
    "ПОЩЕЛКАЛ КАК ОРЕШКИ",
    "Я В ИНВИЗ ПРЯЧУСЬ",
    "ВКИНУЛСЯ И ПОГНАЛ",
    "ВЫЕБАЛ!",
    "ТЕСТОСТЕРОН!",
    "СКАЛА!",
    "ЗДОРОВЯК!",
    "МАСТЕР ЗМЕЙ!",
    "ДУШИ УДАВА!"
];

const backgroundMusic = new Audio('soundtrack.mp3');
backgroundMusic.loop = true; // Зацикливаем музыку
backgroundMusic.volume = 0.3; // Уменьшаем громкость (0.5 = 50%)
function initAudioOnInteraction() {
    backgroundMusic.play().catch(e => console.log("Автозапуск отклонён:", e));
    document.removeEventListener('click', initAudioOnInteraction);
    document.removeEventListener('keydown', initAudioOnInteraction);
    document.removeEventListener('touchstart', initAudioOnInteraction);
}

// Запускаем после первого взаимодействия
document.addEventListener('click', initAudioOnInteraction);
document.addEventListener('keydown', initAudioOnInteraction);
document.addEventListener('touchstart', initAudioOnInteraction);

// Функция для управления фоновой музыкой
function toggleBackgroundMusic() {
    if (backgroundMusic.paused) {
        backgroundMusic.play().catch(e => console.log("Не удалось воспроизвести музыку:", e));
    } else {
        backgroundMusic.pause();
    }
}
document.getElementById('musicToggle').addEventListener('click', toggleBackgroundMusic);
// Функция для показа анимированного сообщения
function showAnimatedMessage() {
    const message = messages[Math.floor(Math.random() * messages.length)];

    const msgElement = document.createElement('div');
    msgElement.textContent = message;
    msgElement.style.position = 'absolute';
    msgElement.style.top = '50%';
    msgElement.style.left = '50%';
    msgElement.style.transform = 'translate(-50%, -50%)';
    msgElement.style.padding = '20px';
    msgElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    msgElement.style.borderRadius = '10px';
    msgElement.style.fontSize = '24px';
    msgElement.style.fontWeight = 'bold';
    msgElement.style.zIndex = '1000';
    msgElement.style.opacity = '1';
    msgElement.style.transition = 'opacity 1s ease-out, transform 1s ease-out';

    document.body.appendChild(msgElement);

    // Анимация исчезновения
    setTimeout(() => {
        msgElement.style.opacity = '0';
        msgElement.style.transform = 'translate(-50%, -70%)';
    }, 1000);

    // Удаляем элемент после анимации
    setTimeout(() => {
        document.body.removeChild(msgElement);
    }, 2000);
}
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) direction = { x: 0, y: -1 }; break;
        case 'ArrowDown': if (direction.y === 0) direction = { x: 0, y: 1 }; break;
        case 'ArrowLeft': if (direction.x === 0) direction = { x: -1, y: 0 }; break;
        case 'ArrowRight': if (direction.x === 0) direction = { x: 1, y: 0 }; break;
    }
});

let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    const swipeThreshold = 30; // Минимальное расстояние для свайпа

    if (Math.max(absDx, absDy) < swipeThreshold) return;

    if (absDx > absDy) {
        if (dx > 0 && direction.x === 0) direction = { x: 1, y: 0 };
        else if (dx < 0 && direction.x === 0) direction = { x: -1, y: 0 };
    } else {
        if (dy > 0 && direction.y === 0) direction = { x: 0, y: 1 };
        else if (dy < 0 && direction.y === 0) direction = { x: 0, y: -1 };
    }

    // Сбросим начальные координаты
    touchStartX = 0;
    touchStartY = 0;
}, { passive: false });


// Виртуальные кнопки (для мобилок)
document.getElementById('up').addEventListener('click', () => {
    if (direction.y === 0) direction = { x: 0, y: -1 };
});
document.getElementById('down').addEventListener('click', () => {
    if (direction.y === 0) direction = { x: 0, y: 1 };
});
document.getElementById('left').addEventListener('click', () => {
    if (direction.x === 0) direction = { x: -1, y: 0 };
});
document.getElementById('right').addEventListener('click', () => {
    if (direction.x === 0) direction = { x: 1, y: 0 };
});



// Главный игровой цикл
function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '40px Impact';
        ctx.fillText('Вы потрачено!', canvas.width / 4, canvas.height / 2);

        // Показываем кнопку рестарта
        document.getElementById('restartBtn').style.display = 'block';
        document.body.classList.add('restart-mode');

        return;
    }else{

        document.getElementById('restartBtn').style.display = 'none';
        // Когда пользователь начинает новую игру (например, после нажатия на кнопку)
        document.body.classList.remove('restart-mode');

    }


    setTimeout(() => {
        clearCanvas();
        drawFood();
        moveSnake();
        drawSnake();
        checkCollision();
        gameLoop();
    }, 80);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Очищает канвас, оставляя фон прозрачным
}

function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? 'lime' : 'green';
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
}



function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.borderRadius = 20;
    ctx.borderColor = 'white';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = `Очки: ${score}`;
        if (score % 10 === 0 && score > 0) {
            showAnimatedMessage();
        }
        if (isVibrationSupported) navigator.vibrate(100);
        eatSound.currentTime = 0; eatSound.play(); // Звук монетки
        spawnFood();
    } else {
        snake.pop();
    }
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };

    // Проверяем, чтобы еда не появилась внутри змейки
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            spawnFood();
        }
    });
}

function checkCollision() {
    const head = snake[0];

    // Стены
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver = true;
        if (isVibrationSupported) navigator.vibrate([100, 50, 100]); // Двойной импульс
    }
    if (gameOver) {
        if (isVibrationSupported) navigator.vibrate([100, 50, 100]);
        gameOverSound.currentTime = 0; gameOverSound.play(); // Звук проигрыша
    }

    // Сама в себя
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
            if (isVibrationSupported) navigator.vibrate([100, 50, 100]);
        }
    }
}

// Старт игры
spawnFood();
gameLoop();

document.getElementById('restartBtn').addEventListener('click', restartGame);

function restartGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    food = { x: 5, y: 5 };
    score = 0;
    scoreElement.textContent = `Очки: ${score}`;
    gameOver = false;
    spawnFood();
    gameLoop(); // Перезапускаем цикл
}
