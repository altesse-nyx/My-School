 document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GESTION DU THÈME SOMBRE ---
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

    // --- 2. GESTION DE LA NAVIGATION ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const appContent = document.getElementById('app-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const target = btn.getAttribute('data-target');
            loadPage(target);
        });
    });

    // --- 3. CHARGEMENT DES PAGES ---
    function loadPage(page) {
        if (page === 'accueil') {
            appContent.innerHTML = `<h2>Bienvenue !</h2><p>Prêt à gérer ton école ?</p>`;
        } else if (page === 'profil') {
            renderProfil();
        } else if (page === 'notes') {
            appContent.innerHTML = `<h2>Mes Notes</h2><p>Ici s'afficheront tes moyennes.</p>`;
        } else if (page === 'admin') {
            appContent.innerHTML = `<h2>Page Admin</h2><p>Accès réservé.</p>`;
        }
    }

    // --- 4. PAGE PROFIL ET LOGIQUE DES NIVEAUX ---
    function renderProfil() {
        const savedProfil = JSON.parse(localStorage.getItem('profil')) || {};

        appContent.innerHTML = `
            <h2>Mon Profil</h2>
            <div id="msg-success" class="success-msg hidden">Profil sauvegardé !</div>
            
            <form id="profil-form">
                <div class="form-group">
                    <label>Nom complet</label>
                    <input type="text" id="nom" value="${savedProfil.nom || ''}" required>
                </div>

                <div class="form-group">
                    <label>Bloc d'études</label>
                    <select id="bloc" required>
                        <option value="">-- Choisir --</option>
                        <option value="college" ${savedProfil.bloc === 'college' ? 'selected' : ''}>Collège</option>
                        <option value="lycee" ${savedProfil.bloc === 'lycee' ? 'selected' : ''}>Lycée</option>
                        <option value="universite" ${savedProfil.bloc === 'universite' ? 'selected' : ''}>Universitaire</option>
                    </select>
                </div>

                <div class="form-group hidden" id="group-college">
                    <label>Classe (Collège)</label>
                    <select id="classe-college">
                        <option value="">-- Choisir --</option>
                        <option value="6e">6ème</option>
                        <option value="5e">5ème</option>
                        <option value="4e">4ème</option>
                        <option value="3e">3ème</option>
                    </select>
                </div>

                <div class="form-group hidden" id="group-lycee-classe">
                    <label>Classe (Lycée)</label>
                    <select id="classe-lycee">
                        <option value="">-- Choisir --</option>
                        <option value="2nde">2nde</option>
                        <option value="1ere">1ère</option>
                        <option value="tle">Terminale</option>
                    </select>
                </div>

                <div class="form-group hidden" id="group-lycee-serie">
                    <label>Série</label>
                    <select id="serie-lycee">
                        <!-- Rempli dynamiquement par JS -->
                    </select>
                </div>
                
                <!-- NOUVEAU : Champ pour la série "Autres" -->
                <div class="form-group hidden" id="group-lycee-autre">
                    <label>Précisez votre série</label>
                    <input type="text" id="serie-autre" placeholder="Ex: C, E, F..." value="${savedProfil.serieAutre || ''}">
                </div>

                <div class="form-group hidden" id="group-univ">
                    <label>Niveau (Université)</label>
                    <select id="classe-univ">
                        <option value="">-- Choisir --</option>
                        <option value="L1">Licence 1</option>
                        <option value="L2">Licence 2</option>
                        <option value="L3">Licence 3</option>
                        <option value="M1">Master 1</option>
                        <option value="M2">Master 2</option>
                        <option value="M3">Master 3</option>
                    </select>
                </div>

                <button type="submit" class="btn-primary">Sauvegarder</button>
            </form>
        `;

        const blocSelect = document.getElementById('bloc');
        const groupCollege = document.getElementById('group-college');
        const groupLyceeClasse = document.getElementById('group-lycee-classe');
        const groupLyceeSerie = document.getElementById('group-lycee-serie');
        const groupLyceeAutre = document.getElementById('group-lycee-autre');
        const groupUniv = document.getElementById('group-univ');
        
        const classeLyceeSelect = document.getElementById('classe-lycee');
        const serieSelect = document.getElementById('serie-lycee');

        function updateSeries() {
            const classe = classeLyceeSelect.value;
            serieSelect.innerHTML = '';
            groupLyceeAutre.classList.add('hidden'); // On cache "Autres" par défaut
            document.getElementById('serie-autre').value = ''; 
            
            let series = [];
            if (classe === '2nde') series = ['LE', 'S'];
            else if (classe === '1ere') series = ['A1', 'A2', 'B', 'S'];
            else if (classe === 'tle') series = ['A1', 'A2', 'B', 'C', 'D'];

            if (series.length > 0) {
                serieSelect.innerHTML = '<option value="">-- Choisir --</option>';
                series.forEach(s => {
                    serieSelect.innerHTML += `<option value="${s}">${s}</option>`;
                });
                // AJOUT DE L'OPTION AUTRES
                serieSelect.innerHTML += `<option value="autres">Autres</option>`;
                groupLyceeSerie.classList.remove('hidden');
            } else {
                groupLyceeSerie.classList.add('hidden');
            }
        }

        // Écouter le choix de la série
        serieSelect.addEventListener('change', (e) => {
            if (e.target.value === 'autres') {
                groupLyceeAutre.classList.remove('hidden');
            } else {
                groupLyceeAutre.classList.add('hidden');
            }
        });

        blocSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            groupCollege.classList.add('hidden');
            groupLyceeClasse.classList.add('hidden');
            groupLyceeSerie.classList.add('hidden');
            groupLyceeAutre.classList.add('hidden');
            groupUniv.classList.add('hidden');

            if (val === 'college') groupCollege.classList.remove('hidden');
            if (val === 'lycee') {
                groupLyceeClasse.classList.remove('hidden');
                updateSeries(); 
            }
            if (val === 'universite') groupUniv.classList.remove('hidden');
        });

        classeLyceeSelect.addEventListener('change', updateSeries);

        // Initialisation avec les données sauvegardées
        if (savedProfil.bloc) {
            blocSelect.dispatchEvent(new Event('change'));
            if (savedProfil.bloc === 'college') document.getElementById('classe-college').value = savedProfil.classe || '';
            if (savedProfil.bloc === 'lycee') {
                classeLyceeSelect.value = savedProfil.classe || '';
                updateSeries();
                serieSelect.value = savedProfil.serie || '';
                if (savedProfil.serie === 'autres') {
                    groupLyceeAutre.classList.remove('hidden');
                    document.getElementById('serie-autre').value = savedProfil.serieAutre || '';
                }
            }
            if (savedProfil.bloc === 'universite') document.getElementById('classe-univ').value = savedProfil.classe || '';
        }

        document.getElementById('profil-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                nom: document.getElementById('nom').value,
                bloc: blocSelect.value,
                classe: '',
                serie: '',
                serieAutre: ''
            };

            if (data.bloc === 'college') data.classe = document.getElementById('classe-college').value;
            if (data.bloc === 'lycee') {
                data.classe = classeLyceeSelect.value;
                data.serie = serieSelect.value;
                if (data.serie === 'autres') {
                    data.serieAutre = document.getElementById('serie-autre').value;
                }
            }
            if (data.bloc === 'universite') data.classe = document.getElementById('classe-univ').value;

            localStorage.setItem('profil', JSON.stringify(data));
            
            const msg = document.getElementById('msg-success');
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 3000);
        });
    }

    loadPage('accueil');
});
