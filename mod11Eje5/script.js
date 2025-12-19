// Configuración de acceso
const PROXY_URL = "https://api.allorigins.win/get?url=";
const BCB_WSDL = "https://indicadores.bcb.gob.bo/ServiciosBCB/indicadores";

// Valores iniciales (Tasas oficiales base)
let tasaCompra = 6.86;
let tasaVenta = 6.96;

async function fetchBCBRates() {
    const rateDisplay = document.getElementById('rateDisplay');
    
    // 1. Crear un Timeout de 4 segundos para no bloquear la app
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const soapMessage = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <getTipoCambio xmlns="http://tempuri.org/">
          <moneda>1</moneda> 
        </getTipoCambio>
      </soap:Body>
    </soap:Envelope>`;

    try {
        // Usamos AllOrigins para saltar el CORS de GitHub Pages
        const response = await fetch(`${PROXY_URL}${encodeURIComponent(BCB_WSDL)}`, {
            signal: controller.signal
        });

        if (!response.ok) throw new Error("Network Error");

        const data = await response.json();
        const xmlText = data.contents;

        if (!xmlText) throw new Error("Empty Data");

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const result = xmlDoc.getElementsByTagName("getTipoCambioResult")[0];

        if (result && result.textContent) {
            const apiVal = parseFloat(result.textContent);
            if (!isNaN(apiVal) && apiVal > 0) {
                tasaCompra = apiVal;
                tasaVenta = apiVal + 0.10;
                rateDisplay.innerHTML = "CONNECTION: ESTABLISHED";
                rateDisplay.style.color = "#00ff41";
            }
        }
        clearTimeout(timeoutId);
        updateUI();

    } catch (error) {
        clearTimeout(timeoutId);
        console.warn("Usando modo offline debido a restricciones de red o BCB.");
        rateDisplay.innerHTML = "STATUS: OFFLINE MODE";
        rateDisplay.style.color = "#ffba00"; // Naranja de advertencia
        updateUI();
    }
}

function updateUI() {
    document.getElementById('compraVal').textContent = tasaCompra.toFixed(2);
    document.getElementById('ventaVal').textContent = tasaVenta.toFixed(2);
}

// Botón COMPRAR USD
document.getElementById('btnBuy').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('amountInput').value);
    if (!amount) return;
    const total = amount / tasaVenta;
    displayResult(`ACQUIRED: $${total.toFixed(2)} USD`);
});

// Botón VENDER USD (Cambiar a BOB)
document.getElementById('btnSell').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('amountInput').value);
    if (!amount) return;
    const total = amount * tasaCompra;
    displayResult(`RECEIVED: Bs ${total.toFixed(2)} BOB`);
});

function displayResult(text) {
    const calcRes = document.getElementById('calcResult');
    calcRes.textContent = text;
    // Efecto visual de "hackeo"
    calcRes.style.opacity = "0.5";
    setTimeout(() => calcRes.style.opacity = "1", 100);
}

// Ejecutar al cargar
fetchBCBRates();