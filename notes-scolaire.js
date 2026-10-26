// Logique pour le Collège et le Lycée
window.afficherNotesScolaire = function(container) {
    const matieres = JSON.parse(localStorage.getItem('matieres_scolaire')) || [];
    let trimestreActif = localStorage.getItem('trimestre_actif') || 'T1';

    let html = `<h2>Mes Notes (Scolaire)</h2>`;
    
    // Choix du trimestre
    html += `
        <div class="form-group">
            <label>Trimestre à remplir :</label>
            <select id="select-trimestre">
                <option value="T1" ${trimestreActif === 'T1' ? 'selected' : ''}>1er Trimestre</option>
                <option value="T2" ${trimestreActif === 'T2' ? 'selected' : ''}>2ème Trimestre</option>
                <option value="T3" ${trimestreActif === 'T3' ? 'selected' : ''}>3ème Trimestre</option>
            </select>
        </div>
    `;

    html += `<button id="btn-add-matiere" class="btn-primary" style="margin-bottom: 15px;">+ Ajouter une Matière</button>`;
    
    // Formulaire d'ajout de matière (avec le coefficient !)
    html += `
        <div id="form-add-matiere" class="add-course-form hidden">
            <form id="matiere-form">
                <div class="form-group"><label>Nom de la matière</label><input type="text" id="m-nom" required placeholder="Ex: Mathématiques"></div>
                <div class="form-group"><label>Enseignant</label><input type="text" id="m-prof" placeholder="Ex: M. Dupont"></div>
                <div class="form-group"><label>Coefficient</label><input type="number" id="m-coef" required value="1" min="1" max="10"></div>
                <button type="submit" class="btn-primary">Créer la matière</button>
            </form>
        </div>
    `;

    if (matieres.length === 0) html += `<div class="empty-state">Aucune matière ajoutée.</div>`;

    // Variables pour le calcul général du trimestre
    let totalNotesPonderees = 0;
    let totalCoefficients = 0;
    let toutesMatieresOntNotes = true;

    matieres.forEach((m, i) => {
        const notesTrim = m.notes[trimestreActif] || [];
        const coef = m.coefficient || 1;
        
        let moyMatiere = '-';
        let notePonderee = 0;

        if (notesTrim.length > 0) {
            const somme = notesTrim.reduce((a, b) => a + b, 0);
            moyMatiere = (somme / notesTrim.length).toFixed(2);
            
            // Calcul pour la moyenne générale du trimestre
            notePonderee = parseFloat(moyMatiere) * coef;
            totalNotesPonderees += notePonderee;
            totalCoefficients += coef;
        } else {
            toutesMatieresOntNotes = false; // Il manque des notes à cette matière
        }

        html += `
            <div class="matiere-card">
                <div class="matiere-header">
                    <div>
                        <strong>${m.nom}</strong> <span style="font-size:0.8rem; background:#e2e8f0; color:#0f172a; padding:2px 5px; border-radius:4px;">Coef: ${coef}</span><br>
                        <small style="opacity:0.7;">${m.prof || 'Prof non défini'}</small>
                    </div>
                    <div class="moyenne-badge">Moy: ${moyMatiere}</div>
                </div>
                <div style="margin-bottom: 10px;"><div style="font-weight:bold; font-size:0.9rem;">Notes pour le ${trimestreActif} :</div>
        `;

        notesTrim.forEach((n, indexNote) => {
            html += `<div class="note-item"><span>Note ${indexNote + 1}: ${n}/20</span><button class="btn-del-note" data-mat="${i}" data-trim="${trimestreActif}" data-note="${indexNote}" style="color:red; background:none; border:none; cursor:pointer;">X</button></div>`;
        });

        if (notesTrim.length < 4) {
            html += `<div class="add-note-form"><input type="number" step="0.25" min="0" max="20" id="note-${i}-${trimestreActif}" placeholder="Note /20"><button class="btn-add-note" data-mat="${i}" data-trim="${trimestreActif}">+</button></div>`;
        } else {
            html += `<div style="font-size:0.8rem; color:#dc2626; margin-top:5px;">Maximum de 4 notes atteint.</div>`;
        }

        html += `</div>
            <button class="btn-del-mat" data-mat="${i}" style="width:100%; margin-top:10px; background:#fee2e2; color:#dc2626; border:none; padding:8px; border-radius:4px; cursor:pointer;">Supprimer cette matière</button>
            </div>
        `;
    });

    // Affichage du bouton de calcul général
    let moyGeneraleTrimestre = '-';
    if (totalCoefficients > 0 && toutesMatieresOntNotes) {
        moyGeneraleTrimestre = (totalNotesPonderees / totalCoefficients).toFixed(2);
    }

    html += `
        <div class="matiere-card" style="border: 2px solid var(--primary-color); margin-top:20px; text-align:center;">
            <h3 style="margin-bottom:10px;">Bilan du ${trimestreActif}</h3>
    `;

    if (toutesMatieresOntNotes && matieres.length > 0) {
        html += `<div style="font-size:1.2rem; margin-bottom:15px;">
                    <strong>Moyenne Générale : </strong> 
                    <span style="color:var(--primary-color); font-weight:bold;">${moyGeneraleTrimestre}</span>
                 </div>
                 <button id="btn-valider-trimestre" class="btn-primary" data-moy="${moyGeneraleTrimestre}">Enregistrer la note du ${trimestreActif}</button>`;
    } else {
        html += `<p style="color:#dc2626; font-size:0.9rem;">Remplissez au moins une note dans toutes vos matières pour calculer la moyenne du trimestre.</p>`;
    }
    html += `</div>`;

    // Bilan annuel
    const t1Valide = localStorage.getItem('valide_T1') === 'true';
    const t2Valide = localStorage.getItem('valide_T2') === 'true';
    const t3Valide = localStorage.getItem('valide_T3') === 'true';

    if (t1Valide && t2Valide && t3Valide) {
        let moyT1 = parseFloat(localStorage.getItem('moyenne_T1') || 0);
        let moyT2 = parseFloat(localStorage.getItem('moyenne_T2') || 0);
        let moyT3 = parseFloat(localStorage.getItem('moyenne_T3') || 0);
        let moyAnnuelle = ((moyT1 * 1 + moyT2 * 2 + moyT3 * 3) / 6).toFixed(2);

        html += `
            <div class="matiere-card" style="border: 2px solid #16a34a; margin-top:20px; text-align:center; background:#f0fdf4; color:#166534;">
                <h3 style="margin-bottom:10px;">Bilan Annuel</h3>
                <div>T1 : ${moyT1}</div><div>T2 : ${moyT2}</div><div>T3 : ${moyT3}</div>
                <div style="font-size:1.2rem; margin-top:10px;"><strong>Moyenne Annuelle : </strong> <span style="font-weight:bold;">${moyAnnuelle}</span></div>
            </div>
        `;
    }

    container.innerHTML = html;

    // --- ÉVÉNEMENTS ---
    document.getElementById('select-trimestre').addEventListener('change', (e) => {
        localStorage.setItem('trimestre_actif', e.target.value);
        afficherNotesScolaire(container);
    });

    document.getElementById('btn-add-matiere').addEventListener('click', () => {
        document.getElementById('form-add-matiere').classList.toggle('hidden');
    });

    document.getElementById('matiere-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        let toutesLesMats = JSON.parse(localStorage.getItem('matieres_scolaire')) || [];
        toutesLesMats.push({ 
            nom: document.getElementById('m-nom').value, 
            prof: document.getElementById('m-prof').value, 
            coefficient: parseInt(document.getElementById('m-coef').value),
            notes: { T1: [], T2: [], T3: [] } 
        });
        localStorage.setItem('matieres_scolaire', JSON.stringify(toutesLesMats));
        afficherNotesScolaire(container);
    });

    document.querySelectorAll('.btn-add-note').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const matIndex = e.target.getAttribute('data-mat');
            const trim = e.target.getAttribute('data-trim');
            const val = parseFloat(document.getElementById(`note-${matIndex}-${trim}`).value);
            if (!isNaN(val) && val >= 0 && val <= 20) {
                let toutesLesMats = JSON.parse(localStorage.getItem('matieres_scolaire')) || [];
                toutesLesMats[matIndex].notes[trim].push(val);
                localStorage.setItem('matieres_scolaire', JSON.stringify(toutesLesMats));
                afficherNotesScolaire(container);
            } else alert("Note invalide (0-20).");
        });
    });

    document.querySelectorAll('.btn-del-note').forEach(btn => {
        btn.addEventListener('click', (e) => {
            let toutesLesMats = JSON.parse(localStorage.getItem('matieres_scolaire')) || [];
            toutesLesMats[e.target.getAttribute('data-mat')].notes[e.target.getAttribute('data-trim')].splice(e.target.getAttribute('data-note'), 1);
            localStorage.setItem('matieres_scolaire', JSON.stringify(toutesLesMats));
            afficherNotesScolaire(container);
        });
    });

    document.querySelectorAll('.btn-del-mat').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(confirm("Supprimer cette matière ?")) {
                let toutesLesMats = JSON.parse(localStorage.getItem('matieres_scolaire')) || [];
                toutesLesMats.splice(e.target.getAttribute('data-mat'), 1);
                localStorage.setItem('matieres_scolaire', JSON.stringify(toutesLesMats));
                afficherNotesScolaire(container);
            }
        });
    });

    // Valider et enregistrer la moyenne du trimestre
    document.getElementById('btn-valider-trimestre')?.addEventListener('click', (e) => {
        const moy = e.target.getAttribute('data-moy');
        if (confirm(`Enregistrer la moyenne de ${moy}/20 pour le ${trimestreActif} ?`)) {
            localStorage.setItem(`valide_${trimestreActif}`, 'true');
            localStorage.setItem(`moyenne_${trimestreActif}`, moy);
            afficherNotesScolaire(container);
        }
    });
};
