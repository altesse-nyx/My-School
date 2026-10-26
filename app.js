document.addEventListener('DOMContentLoaded', () => {
    // Gestion du Mode Sombre
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggle.textContent = '☀️';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggle.textContent = '🌙';
        }
    });

    // Gestion des onglets
    const navButtons = document.querySelectorAll('.nav-btn');
    const appContent = document.getElementById('app-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const target = btn.getAttribute('data-target');
            if (target === 'accueil') {
                appContent.innerHTML = '<h2>Bienvenue !</h2><p>Prêt à gérer ton école ?</p>';
            } else if (target === 'profil') {
                appContent.innerHTML = '<h2>Mon Profil</h2><p>Ici, tu pourras choisir ton niveau et ta classe.</p>';
            } else if (target === 'notes') {
                appContent.innerHTML = '<h2>Mes Notes</h2><p>Ici s\'afficheront tes moyennes.</p>';
            } else if (target === 'admin') {
                appContent.innerHTML = '<h2>Page Admin</h2><p>Accès réservé à l\'administrateur.</p>';
            }
        });
    });
});