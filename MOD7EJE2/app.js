// 1. Capturamos los elementos del DOM
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
const currentTheme = localStorage.getItem('theme');

// 2. Verificamos si hay una preferencia guardada al cargar la página
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}

// 3. Función para cambiar el tema
function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark'); // Guardamos en localStorage
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light'); // Guardamos en localStorage
    }    
}

// 4. Escuchamos el evento 'change' (click en el switch)
toggleSwitch.addEventListener('change', switchTheme, false);