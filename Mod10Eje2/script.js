// === ELEMENTOS DEL DOM ===
const form = document.getElementById('imcForm');
const pesoInput = document.getElementById('peso');
const alturaInput = document.getElementById('altura');
const edadInput = document.getElementById('edad');
const resultSection = document.getElementById('resultSection');
const imcValue = document.getElementById('imcValue');
const imcCategory = document.getElementById('imcCategory');
const imcIndicator = document.getElementById('imcIndicator');
const recommendationText = document.getElementById('recommendationText');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// Cargar historial al inicio
let history = JSON.parse(localStorage.getItem('imcHistory')) || [];

// === LÓGICA DE CÁLCULO ===

const calcularIMC = (peso, alturaCm) => {
    const alturaM = alturaCm / 100;
    return peso / (alturaM * alturaM);
};

const obtenerCategoria = (imc) => {
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25) return 'Normal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidad';
};

const obtenerColor = (imc) => {
    if (imc < 18.5) return '#3498db'; // Azul
    if (imc < 25) return '#000000';    // Negro (Estilo P5 "Perfect")
    if (imc < 30) return '#f39c12';    // Naranja
    return '#d31212';                 // Rojo (Danger)
};

const obtenerRecomendaciones = (categoria) => {
    const mensajes = {
        'Bajo peso': '¡Nivel de HP bajo! Necesitas aumentar tus estadísticas de nutrición. Considera un plan de alimentación más pesado.',
        'Normal': '¡ESTADÍSTICAS PERFECTAS! Estás en forma para cualquier palacio. Mantén ese ritmo, Joker.',
        'Sobrepeso': '¡CUIDADO! Tus movimientos podrían ser más lentos. Una dieta balanceada te devolverá la agilidad.',
        'Obesidad': '¡EMERGENCIA! Tus estadísticas de salud están en estado crítico. Consulta a un médico (o a Takemi) de inmediato.'
    };
    return mensajes[categoria] || '';
};

// === INTERFAZ VISUAL ===

const posicionarIndicador = (imc) => {
    let porcentaje;
    if (imc < 18.5) {
        porcentaje = (imc / 18.5) * 25;
    } else if (imc < 25) {
        porcentaje = 25 + ((imc - 18.5) / (25 - 18.5)) * 25;
    } else if (imc < 30) {
        porcentaje = 50 + ((imc - 25) / (30 - 25)) * 25;
    } else {
        porcentaje = 75 + Math.min(((imc - 30) / 15) * 25, 25);
    }
    
    // Asegurar que no se salga de la barra
    porcentaje = Math.max(5, Math.min(95, porcentaje));
    imcIndicator.style.left = `${porcentaje}%`;
};

const mostrarResultado = (imc, categoria) => {
    // Actualizar Textos
    imcValue.textContent = imc.toFixed(1);
    imcCategory.textContent = categoria;
    
    // Estilo Persona 5: Fondo negro y texto blanco para la categoría
    imcCategory.style.background = obtenerColor(imc);
    imcCategory.style.color = (imc >= 18.5 && imc < 25) ? '#ffffff' : '#ffffff';

    posicionarIndicador(imc);
    recommendationText.textContent = obtenerRecomendaciones(categoria);

    // Animación de entrada
    resultSection.style.display = 'block';
    resultSection.classList.add('p5-appear-animation'); // Asegúrate de tener esta clase en CSS
    
    window.scrollTo({
        top: resultSection.offsetTop - 100,
        behavior: 'smooth'
    });
};

// === GESTIÓN DE HISTORIAL ===

const guardarEnHistorial = (peso, altura, imc, categoria) => {
    const nuevoRegistro = {
        peso,
        altura,
        imc: imc.toFixed(1),
        categoria,
        fecha: new Date().toLocaleDateString()
    };

    history.unshift(nuevoRegistro);
    history = history.slice(0, 5); // Solo guardamos los últimos 5 para estilo limpio
    localStorage.setItem('imcHistory', JSON.stringify(history));
    renderizarHistorial();
};

const renderizarHistorial = () => {
    if (!historyList) return;

    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-history">SIN DATOS PREVIOS</p>';
        clearHistoryBtn.style.display = 'none';
        return;
    }

    clearHistoryBtn.style.display = 'block';
    historyList.innerHTML = history.map(item => `
        <div class="history-item" style="border-left: 10px solid ${obtenerColor(parseFloat(item.imc))}">
            <div class="history-info">
                <strong>${item.imc} IMC</strong> - ${item.categoria}<br>
                <small>${item.fecha} | ${item.peso}kg - ${item.altura}cm</small>
            </div>
        </div>
    `).join('');
};

// === VALIDACIÓN Y EVENTOS ===

const validarCampo = (input) => {
    const errorSpan = input.parentElement.querySelector('.error-message');
    const valor = parseFloat(input.value);

    if (!input.value || isNaN(valor) || valor <= 0) {
        if (errorSpan) errorSpan.textContent = "VALOR INVÁLIDO";
        input.classList.add('invalid');
        return false;
    }

    if (errorSpan) errorSpan.textContent = "";
    input.classList.remove('invalid');
    input.classList.add('valid');
    return true;
};

// El evento corregido
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const esPesoValido = validarCampo(pesoInput);
    const esAlturaValida = validarCampo(alturaInput);

    if (esPesoValido && esAlturaValida) {
        const peso = parseFloat(pesoInput.value);
        const altura = parseFloat(alturaInput.value);

        const imc = calcularIMC(peso, altura);
        const categoria = obtenerCategoria(imc);

        mostrarResultado(imc, categoria);
        guardarEnHistorial(peso, altura, imc, categoria);
        
        console.log("Calculado: " + imc);
    } else {
        // Efecto visual de error
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 500);
    }
});

clearHistoryBtn.addEventListener('click', () => {
    if (confirm("¿BORRAR EXPEDIENTES?")) {
        history = [];
        localStorage.removeItem('imcHistory');
        renderizarHistorial();
    }
});

// Inicialización
renderizarHistorial();