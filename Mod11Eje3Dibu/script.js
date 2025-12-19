const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const lineWidth = document.getElementById('lineWidth');
const wLabel = document.getElementById('wLabel');
const imageLoader = document.getElementById('imageLoader');
const downloadBtn = document.getElementById('downloadBtn');
const tools = document.querySelectorAll('.tool');

// Configuración inicial
let isDrawing = false;
let startX, startY;
let currentTool = 'brush';
let snapshot; // Para previsualizar formas sin borrar lo anterior

// Ajustar tamaño del lienzo al cargar
window.addEventListener('load', () => {
    canvas.width = canvas.parentElement.offsetWidth - 40;
    canvas.height = canvas.parentElement.offsetHeight - 40;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    fillCanvasWhite();
});

function fillCanvasWhite() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// === LÓGICA DE HERRAMIENTAS ===

tools.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.tool.active').classList.remove('active');
        btn.classList.add('active');
        currentTool = btn.dataset.tool;
    });
});

lineWidth.addEventListener('input', (e) => {
    wLabel.textContent = e.target.value;
});

// === DIBUJO ===

const startDraw = (e) => {
    isDrawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
    ctx.beginPath();
    ctx.lineWidth = lineWidth.value;
    ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : colorPicker.value;
    ctx.fillStyle = colorPicker.value;
    
    // Guardamos el estado del canvas para previsualizar formas (rect/círculo)
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const drawing = (e) => {
    if (!isDrawing) return;
    
    // Si no es el pincel o borrador, restauramos el canvas antes de redibujar la forma
    if (currentTool !== 'brush' && currentTool !== 'eraser') {
        ctx.putImageData(snapshot, 0, 0);
    }

    if (currentTool === 'brush' || currentTool === 'eraser') {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    } else if (currentTool === 'rectangle') {
        ctx.strokeRect(e.offsetX, e.offsetY, startX - e.offsetX, startY - e.offsetY);
    } else if (currentTool === 'circle') {
        let radius = Math.sqrt(Math.pow((startX - e.offsetX), 2) + Math.pow((startY - e.offsetY), 2));
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }
};

const stopDraw = () => {
    isDrawing = false;
};

// === FILTROS (PRO) ===

const applyFilter = (filterType) => {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = pixels.data;

    for (let i = 0; i < d.length; i += 4) {
        let r = d[i], g = d[i + 1], b = d[i + 2];

        if (filterType === 'gray') {
            let avg = (r + g + b) / 3;
            d[i] = d[i+1] = d[i+2] = avg;
        } else if (filterType === 'invert') {
            d[i] = 255 - r;
            d[i+1] = 255 - g;
            d[i+2] = 255 - b;
        } else if (filterType === 'sepia') {
            d[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
            d[i+1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
            d[i+2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
        }
    }
    ctx.putImageData(pixels, 0, 0);
};

// === ARCHIVOS Y CARGA ===

imageLoader.addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.onload = () => {
            // Limpiar y dibujar imagen centrada
            fillCanvasWhite();
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(e.target.files[0]);
});

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `persona-masterpiece-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
});

// Eventos de botones de filtros
document.getElementById('filterGray').addEventListener('click', () => applyFilter('gray'));
document.getElementById('filterInvert').addEventListener('click', () => applyFilter('invert'));
document.getElementById('filterSepia').addEventListener('click', () => applyFilter('sepia'));

// Eventos de mouse
canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', drawing);
canvas.addEventListener('mouseup', stopDraw);
canvas.addEventListener('mouseleave', stopDraw);