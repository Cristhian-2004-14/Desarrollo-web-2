// NOTA: Necesitas una API key de OpenWeatherMap (gratuita)
// Registrate en: https://openweathermap.org/api
const API_KEY = 'a5d33dc29984c0c6e0a5e76c33c549c3'; // Reemplaza con tu API key
const API_BASE = 'https://api.openweathermap.org/data/2.5';

// Estado de la aplicación
let currentUnit = 'metric'; // metric = Celsius, imperial = Fahrenheit
let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];

// Elementos DOM
const currentWeatherDiv = document.getElementById('currentWeather');
const forecastGrid = document.getElementById('forecastGrid');
const favoritesList = document.getElementById('favoritesList');
const citySearch = document.getElementById('citySearch');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const unitToggle = document.getElementById('unitToggle');
const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');

/**
 * Obtener clima por ciudad
 */
async function getWeatherByCity(city) {
    try {
        showLoading();
        const response = await fetch(
            `${API_BASE}/weather?q=${city}&units=${currentUnit}&appid=${API_KEY}&lang=es`
        );
        
        if (!response.ok) {
            throw new Error('Ciudad no encontrada');
        }
        
        const data = await response.json();
        displayCurrentWeather(data);
        getForecast(data.coord.lat, data.coord.lon);
    } catch (error) {
        showError(error.message);
    }
}

/**
 * Obtener clima por coordenadas
 */
async function getWeatherByCoords(lat, lon) {
    try {
        showLoading();
        const response = await fetch(
            `${API_BASE}/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}&lang=es`
        );
        
        const data = await response.json();
        displayCurrentWeather(data);
        getForecast(lat, lon);
    } catch (error) {
        showError(error.message);
    }
}

/**
 * Obtener pronóstico de 5 días
 */
async function getForecast(lat, lon) {
    try {
        const response = await fetch(
            `${API_BASE}/forecast?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}&lang=es`
        );
        
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error('Error al obtener pronóstico:', error);
    }
}

/**
 * Mostrar clima actual
 */
function displayCurrentWeather(data) {
   const isFavorite = favorites.some(fav => fav.id === data.id);
    const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';
    const speedUnit = currentUnit === 'metric' ? 'km/h' : 'mph';
    
    currentWeatherDiv.innerHTML = `
        <div class="weather-main">
            <div class="weather-info">
                <h2>${data.name}, ${data.sys.country}</h2>
                <div class="weather-temp">${Math.round(data.main.temp)}${unitSymbol}</div>
                <div class="weather-description">${data.weather[0].description}</div>
                <button class="fav-btn" onclick="toggleFavorite(${data.id}, '${data.name}')">
                    ${isFavorite ? '⭐ Eliminar de favoritos' : '☆ Añadir a favoritos'}
                </button>
            </div>
            <div class="weather-icon">
                <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" 
                     alt="${data.weather[0].description}">
            </div>
        </div>
        <div class="weather-details">
            <div class="detail-item">
                <strong>Sensación térmica</strong>
                ${Math.round(data.main.feels_like)}${unitSymbol}
            </div>
            <div class="detail-item">
                <strong>Humedad</strong>
                ${data.main.humidity}%
            </div>
            <div class="detail-item">
                <strong>Viento</strong>
                ${Math.round(data.wind.speed)} ${speedUnit}
            </div>
            <div class="detail-item">
                <strong>Presión</strong>
                ${data.main.pressure} hPa
            </div>
        </div>
    `;
}

/**
 * Mostrar pronóstico
 */
function displayForecast(data) {
    // Obtener un pronóstico por día (mediodía)
    const dailyForecasts = data.list.filter(item => 
        item.dt_txt.includes('12:00:00')
    ).slice(0, 5);
    
    const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';
    
    forecastGrid.innerHTML = dailyForecasts.map(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('es', { weekday: 'short' });
        
        return `
            <div class="forecast-card">
                <div class="day">${dayName}</div>
                <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" 
                     alt="${day.weather[0].description}">
                <div class="temp">${Math.round(day.main.temp)}${unitSymbol}</div>
                <div class="description">${day.weather[0].description}</div>
            </div>
        `;
    }).join('');
}

/**
 * Usar geolocalización
 */
function useGeolocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                getWeatherByCoords(
                    position.coords.latitude,
                    position.coords.longitude
                );
            },
            (error) => {
                showError('No se pudo obtener la ubicación: ' + error.message);
            }
        );
    } else {
        showError('Geolocalización no soportada en este navegador');
   }
}

/**
 * Alternar favorito
 */
function toggleFavorite(id, name) {
    const index = favorites.findIndex(fav => fav.id === id);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push({ id, name });
    }
    
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    displayFavorites();
    
    // Recargar clima actual para actualizar botón
    getWeatherByCity(name);
}

/**
 * Mostrar favoritos
 */
function displayFavorites() {
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-state">No hay ciudades favoritas aún</p>';
        return;
    }
    
    favoritesList.innerHTML = favorites.map(fav => `
        <div class="favorite-item" onclick="getWeatherByCity('${fav.name}')">
            <span>${fav.name}</span>
            <button onclick="event.stopPropagation(); toggleFavorite(${fav.id}, '${fav.name}')">
                ✕
            </button>
        </div>
    `).join('');
}

/**
 * Cambiar unidades
 */
function toggleUnits() {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    unitToggle.textContent = currentUnit === 'metric' ? '°C' : '°F';
    
    // Recargar clima si hay una ciudad buscada
    const cityName = currentWeatherDiv.querySelector('h2')?.textContent.split(',')[0];
    if (cityName) {
        getWeatherByCity(cityName);
    }
}

/**
 * Mostrar loading
 */
function showLoading() {
    currentWeatherDiv.innerHTML = '<div class="loading">Cargando...</div>';
}

/**
 * Mostrar error
 */
function showError(message) {
    errorMessage.textContent = message;
    errorModal.classList.add('active');
    currentWeatherDiv.innerHTML = '<div class="loading">❌ Error al cargar datos</div>';
}

// Event listeners
searchBtn.addEventListener('click', () => {
    const city = citySearch.value.trim();
    if (city) {
        getWeatherByCity(city);
    }
});

citySearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = citySearch.value.trim();
        if (city) {
            getWeatherByCity(city);
        }
    }
});

locationBtn.addEventListener('click', useGeolocation);
unitToggle.addEventListener('click', toggleUnits);

// Inicializar
displayFavorites();

// Cargar clima de una ciudad por defecto
if (favorites.length > 0) {
    getWeatherByCity(favorites[0].name);
} else {
    useGeolocation();
}
