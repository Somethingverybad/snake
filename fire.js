const fireCanvas = document.getElementById('fireCanvas');
const fireCtx = fireCanvas.getContext('2d');

const fireWidth = fireCanvas.width;
const fireHeight = fireCanvas.height;

const firePixels = new Array(fireWidth * fireHeight).fill(0);
const fireColorsPalette = [
    '#070707', '#1f0707', '#2f0f07', '#470f07', '#571707', '#671f07',
    '#771f07', '#8f2707', '#9f2f07', '#af3f07', '#bf4707', '#c74707',
    '#DF4F07', '#DF5707', '#DF5707', '#D75F07', '#D7670F', '#cf6f0f',
    '#cf770f', '#cf7f0f', '#cf8717', '#c78717', '#C78F17', '#C7971F',
    '#BF9F1F', '#BF9F1F', '#BFA727', '#BFA727', '#BFAF2F', '#B7AF2F',
    '#B7B72F', '#B7B737', '#CFCF6F', '#DFDF9F', '#EFEFC7', '#FFFFFF'
];

const border = 350; // Ширина рамки

// Сдвиг канваса по осям X и Y
const offsetX = 0; // сдвиг по оси X
const offsetY = 0; // сдвиг по оси Y

function isBorderPixel(x, y) {
    return (
        x < border || x >= fireWidth - border ||
        y < border || y >= fireHeight - border
    );
}

function updateFire() {
    for (let x = 0; x < fireWidth; x++) {
        for (let y = 1; y < fireHeight; y++) {
            const src = y * fireWidth + x;
            const decay = Math.floor(Math.random() * 3);
            const dst = src - decay + 1 - fireWidth;

            if (dst >= 0 && dst < firePixels.length) {
                firePixels[dst] = Math.max(firePixels[src] - decay, 0);
            }
        }
    }

    // Генерация огня по краям
    for (let x = 0; x < fireWidth; x++) {
        if (x < border || x >= fireWidth - border) {
            firePixels[(fireHeight - 1) * fireWidth + x] = 36; // нижняя рамка
            firePixels[x] = 36; // верхняя рамка
        }
    }

    // Генерация огня по бокам
    for (let y = 0; y < fireHeight; y++) {
        const left = y * fireWidth;
        const right = y * fireWidth + (fireWidth - 1);

        if (y < border || y >= fireHeight - border) {
            firePixels[left] = 36; // левая рамка
            firePixels[right] = 36; // правая рамка
        }
    }

    // Генерация огня в верхней строке (инициализация огня)
    for (let x = 0; x < fireWidth; x++) {
        firePixels[x] = 36; // Верхняя строка (максимальная температура)
    }
}

function drawFire() {
    const imageData = fireCtx.createImageData(fireWidth, fireHeight);
    for (let i = 0; i < firePixels.length; i++) {
        const colorIndex = firePixels[i];
        const hex = fireColorsPalette[colorIndex];
        const color = hex ? hexToRgb(hex) : { r: 0, g: 0, b: 0 };

        const index = i * 4;
        imageData.data[index + 0] = color.r;
        imageData.data[index + 1] = color.g;
        imageData.data[index + 2] = color.b;
        imageData.data[index + 3] = 255;
    }

    // Применяем сдвиг канваса
    fireCtx.clearRect(0, 0, fireCanvas.width, fireCanvas.height); // Очищаем канвас перед рисованием
    fireCtx.putImageData(imageData, offsetX, offsetY); // Сдвигаем огонь по осям X и Y
}

function loop() {
    updateFire();
    drawFire();
    requestAnimationFrame(loop);
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

loop();
