 document.addEventListener('DOMContentLoaded', () => {
    // --- 1. THÈME SOMBRE ---
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

    // --- 2. NAVIGATION ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const appContent = document.getElementById('app-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadPage(btn.getAttribute('data-target'));
        });
    });

    function loadPage(page) {
        if (page === 'accueil') renderAccueil();
        else if (page === 'emploi') renderEmploi();
        else if (page === 'profil') renderProfil();
        else if (page === 'notes') {
            const profil = JSON.parse(localStorage.getItem('profil'));
            if (!profil || !profil.bloc) {
                appContent.innerHTML = `<h2>Mes Notes</h2><p>Veuillez d'abord remplir votre <strong>Profil</strong> pour savoir quel type de notes afficher.</p>`;
            } else if (profil.bloc === 'universite') {
                window.afficherNotesUniversite(appContent);
            } else {
                window.afficherNotesScolaire(appContent);
            }
        }
        else if (page === 'admin') appContent.innerHTML = `<h2>Page Admin</h2><p>Accès réservé.</p>`;
    }

    // --- LOGIQUE EMPLOI DU TEMPS ---
    function getCours() { return JSON.parse(localStorage.getItem('cours')) || []; }
    function getJoursSemaine() { return ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']; }

    function renderAccueil() {
        const cours = getCours();
        const today = new Date().getDay();
        const nomJour = getJoursSemaine()[today];
        const coursDuJour = cours.filter(c => parseInt(c.jour) === today).sort((a, b) => a.heure.localeCompare(b.heure));

        let html = `<h2>Bonjour !</h2><p>Voici tes cours pour ce ${nomJour} :</p>`;
        if (coursDuJour.length === 0) html += `<div class="empty-state">Aucun cours prévu aujourd'hui. 🎉</div>`;
        else coursDuJour.forEach(c => {
            html += `<div class="course-card"><div class="course-time">${c.heure}</div><div class="course-title">${c.matiere} <small>(${c.enseignant})</small></div><div class="course-details">Salle : ${c.salle || 'Non définie'}</div></div>`;
        });
        appContent.innerHTML = html;
    }

    function renderEmploi() {
        const cours = getCours();
        let html = `<h2>Emploi du temps</h2>
            <button id="btn-show-add" class="btn-primary" style="margin-bottom: 15px;">+ Ajouter un cours</button>
            <div id="form-add-cours" class="add-course-form hidden">
                <form id="cours-form">
                    <div class="form-group"><label>Matière / Module</label><input type="text" id="c-matiere" required></div>
                    <div class="form-group"><label>Enseignant</label><input type="text" id="c-enseignant" required></div>
                    <div class="row">
                        <div class="form-group"><label>Jour</label><select id="c-jour" required>
                            <option value="1">Lundi</option><option value="2">Mardi</option><option value="3">Mercredi</option>
                            <option value="4">Jeudi</option><option value="5">Vendredi</option><option value="6">Samedi</option>
                        </select></div>
                        <div class="form-group"><label>Heure</label><input type="time" id="c-heure" required></div>
                    </div>
                    <div class="form-group"><label>Salle (optionnel)</label><input type="text" id="c-salle"></div>
                    <button type="submit" class="btn-primary">Ajouter le cours</button>
                </form>
            </div>
            <h3>Tous mes cours</h3><div id="liste-cours">`;

        if (cours.length === 0) html += `<div class="empty-state">Ton emploi du temps est vide.</div>`;
        else {
            cours.sort((a, b) => a.jour !== b.jour ? a.jour - b.jour : a.heure.localeCompare(b.heure));
            cours.forEach((c, index) => {
                html += `<div class="course-card">
                    <div class="course-time">${getJoursSemaine()[c.jour]} à ${c.heure}</div>
                    <div class="course-title">${c.matiere} <small>(${c.enseignant})</small></div>
                    <div class="course-details" style="display:flex; justify-content:space-between;">
                        <span>Salle : ${c.salle || '-'}</span>
                        <button class="btn-delete" data-index="${index}" style="color:red; background:none; border:none; cursor:pointer;">🗑️</button>
                    </div>
                </div>`;
            });
        }
        html += `</div>`;
        appContent.innerHTML = html;

        document.getElementById('btn-show-add').addEventListener('click', () => document.getElementById('form-add-cours').classList.toggle('hidden'));
        document.getElementById('cours-form').addEventListener('submit', (e) => {
            e.preventDefault();
            let tousLesCours = getCours();
            tousLesCours.push({
                matiere: document.getElementById('c-matiere').value, enseignant: document.getElementById('c-enseignant').value,
                jour: document.getElementById('c-jour').value, heure: document.getElementById('c-heure').value, salle: document.getElementById('c-salle').value
            });
            localStorage.setItem('cours', JSON.stringify(tousLesCours));
            renderEmploi();
        });
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(confirm("Supprimer ce cours ?")) {
                    let tousLesCours = getCours();
                    tousLesCours.splice(e.target.getAttribute('data-index'), 1);
                    localStorage.setItem('cours', JSON.stringify(tousLesCours));
                    renderEmploi();
                }
            });
        });
    }

    function renderProfil() {
        const savedProfil = JSON.parse(localStorage.getItem('profil')) || {};
        appContent.innerHTML = `
            <h2>Mon Profil</h2>
            <div id="msg-success" class="success-msg hidden">Profil sauvegardé !</div>
            <form id="profil-form">
                <div class="form-group"><label>Nom complet</label><input type="text" id="nom" value="${savedProfil.nom || ''}" required></div>
                <div class="form-group"><label>Bloc d'études</label>
                    <select id="bloc" required>
                        <option value="">-- Choisir --</option>
                        <option value="college" ${savedProfil.bloc === 'college' ? 'selected' : ''}>Collège</option>
                        <option value="lycee" ${savedProfil.bloc === 'lycee' ? 'selected' : ''}>Lycée</option>
                        <option value="universite" ${savedProfil.bloc === 'universite' ? 'selected' : ''}>Universitaire</option>
                    </select>
                </div>
                <div class="form-group hidden" id="group-college">
                    <label>Classe (Collège)</label><select id="classe-college"><option value="">-- Choisir --</option><option value="6e">6ème</option><option value="5e">5ème</option><option value="4e">4ème</option><option value="3e">3ème</option></select>
                </div>
                <div class="form-group hidden" id="group-lycee-classe">
                    <label>Classe (Lycée)</label><select id="classe-lycee"><option value="">-- Choisir --</option><option value="2nde">2nde</option><option value="1ere">1ère</option><option value="tle">Terminale</option></select>
                </div>
                <div class="form-group hidden" id="group-lycee-serie"><label>Série</label><select id="serie-lycee"></select></div>
                <div class="form-group hidden" id="group-lycee-autre"><label>Précisez la série</label><input type="text" id="serie-autre" value="${savedProfil.serieAutre || ''}"></div>
                <div class="form-group hidden" id="group-univ">
                    <label>Niveau (Université)</label><select id="classe-univ"><option value="">-- Choisir --</option><option value="L1">Licence 1</option><option value="L2">Licence 2</option><option value="L3">Licence 3</option><option value="M1">Master 1</option><option value="M2">Master 2</option><option value="M3">Master 3</option></select>
                </div>
                <button type="submit" class="btn-primary">Sauvegarder</button>
            </form>
        `;

        const blocSelect = document.getElementById('bloc');
        const groupCollege = document.getElementById('group-college'), groupLyceeClasse = document.getElementById('group-lycee-classe'), groupLyceeSerie = document.getElementById('group-lycee-serie'), groupLyceeAutre = document.getElementById('group-lycee-autre'), groupUniv = document.getElementById('group-univ');
        const classeLyceeSelect = document.getElementById('classe-lycee'), serieSelect = document.getElementById('serie-lycee');

        function updateSeries() {
            const classe = classeLyceeSelect.value;
            serieSelect.innerHTML = ''; groupLyceeAutre.classList.add('hidden'); document.getElementById('serie-autre').value = ''; 
            let series = [];
            if (classe === '2nde') series = ['LE', 'S'];
            else if (classe === '1ere') series = ['A1', 'A2', 'B', 'S'];
            else if (classe === 'tle') series = ['A1', 'A2', 'B', 'C', 'D'];
            if (series.length > 0) {
                serieSelect.innerHTML = '<option value="">-- Choisir --</option>';
                series.forEach(s => serieSelect.innerHTML += `<option value="${s}">${s}</option>`);
                serieSelect.innerHTML += `<option value="autres">Autres</option>`;
                groupLyceeSerie.classList.remove('hidden');
            } else groupLyceeSerie.classList.add('hidden');
        }

        serieSelect.addEventListener('change', (e) => {
            if (e.target.value === 'autres') groupLyceeAutre.classList.remove('hidden');
            else groupLyceeAutre.classList.add('hidden');
        });

        blocSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            groupCollege.classList.add('hidden'); groupLyceeClasse.classList.add('hidden'); groupLyceeSerie.classList.add('hidden'); groupLyceeAutre.classList.add('hidden'); groupUniv.classList.add('hidden');
            if (val === 'college') groupCollege.classList.remove('hidden');
            if (val === 'lycee') { groupLyceeClasse.classList.remove('hidden'); updateSeries(); }
            if (val === 'universite') groupUniv.classList.remove('hidden');
        });

        classeLyceeSelect.addEventListener('change', updateSeries);

        if (savedProfil.bloc) {
            blocSelect.dispatchEvent(new Event('change'));
            if (savedProfil.bloc === 'college') document.getElementById('classe-college').value = savedProfil.classe || '';
            if (savedProfil.bloc === 'lycee') {
                classeLyceeSelect.value = savedProfil.classe || '';
                updateSeries(); serieSelect.value = savedProfil.serie || '';
                if (savedProfil.serie === 'autres') { groupLyceeAutre.classList.remove('hidden'); document.getElementById('serie-autre').value = savedProfil.serieAutre || ''; }
            }
            if (savedProfil.bloc === 'universite') document.getElementById('classe-univ').value = savedProfil.classe || '';
        }

        document.getElementById('profil-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const data = { nom: document.getElementById('nom').value, bloc: blocSelect.value, classe: '', serie: '', serieAutre: '' };
            if (data.bloc === 'college') data.classe = document.getElementById('classe-college').value;
            if (data.bloc === 'lycee') {
                data.classe = classeLyceeSelect.value; data.serie = serieSelect.value;
                if (data.serie === 'autres') data.serieAutre = document.getElementById('serie-autre').value;
            }
            if (data.bloc === 'universite') data.classe = document.getElementById('classe-univ').value;
            localStorage.setItem('profil', JSON.stringify(data));
            const msg = document.getElementById('msg-success');
            msg.classList.remove('hidden'); setTimeout(() => msg.classList.add('hidden'), 3000);
        });
    }

    renderAccueil();
});
