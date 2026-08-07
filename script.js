/**
 * Lightweight Theme & Filter Controller
 * ewasion137 Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Switcher Logic
    const themeStylesheet = document.getElementById('theme-stylesheet');
    const themeButtons = document.querySelectorAll('.theme-btn');

    // Restore saved theme from LocalStorage or default to Brutal (style.css)
    const savedTheme = localStorage.getItem('selected-theme') || 'style.css';
    setTheme(savedTheme);

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const themeFile = btn.getAttribute('data-theme');
            setTheme(themeFile);
        });
    });

    function setTheme(themeFile) {
        if (themeStylesheet) {
            themeStylesheet.setAttribute('href', themeFile);
        }
        localStorage.setItem('selected-theme', themeFile);

        themeButtons.forEach(btn => {
            if (btn.getAttribute('data-theme') === themeFile) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // 2. Project Filtering Mechanics
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const categories = card.getAttribute('data-category').split(' ');
                if (filter === 'all' || categories.includes(filter)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});