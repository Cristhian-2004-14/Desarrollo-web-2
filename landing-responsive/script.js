const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

menuToggle.addEventListener('click', () => {
    // Esto añade o quita la clase 'active' al menú
    navMenu.classList.toggle('active');
});