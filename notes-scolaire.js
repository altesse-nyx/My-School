// Logique pour le Collège et le Lycée
window.afficherNotesScolaire = function(container) {
    const matieres = JSON.parse(localStorage.getItem('matieres_scolaire')) || [];

    let html = `<h2>Mes Notes (Scolaire)</h2>`;
    html += `<button id="btn-add-matiere" class="btn-primary" style="margin-bottom: 15px;">+ Ajouter une Matière</button>`;
    
    html += `
        <div id="form-add-matiere" class="add-course-form hidden">
            <form id="matiere-form">
                <div class="form-group"><label>Nom de la matière</label><input type="text" id="m-nom" required></div>
                <div class="form-group"><label>Enseignant</label><input type="text" id="m-prof"></div>
                <button type="submit" class="btn-primary">Créer la matière</button>
            </form>
        </div>
    `;

    if (matieres.length === 0) html += `<div class="empty-state">Aucune matière ajoutée.</div>`;

    let sommeMoyennesTrimestres = { T1: 0, T2: 0, T3: 0 };
    let nbNotesParTrimestre = { T1: 0, T2: 0, T3: 0 };

    matieres.forEach((m, i) => {
        const moyennesMatiere = {};
        ['T1', 'T2', 'T3'].forEach(trim => {
            const notesTrim = m.notes[trim] || [];
            if (notesTrim.length > 0) {
                const somme = notesTrim.reduce((a, b) => a + b, 0);
                moyennesMatiere[trim] = (somme / notesTrim.length).toFixed(2);
                sommeMoyennesTrimestres[trim] += parseFloat(moyennesMatiere[trim]);
                nbNotesParTrimestre[trim]++;
            }
        });

        const moyGenerale = Object.values(moyennesMatiere).length > 0 
            ? (Object.values(moyennesMatiere).reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / Object.values(moyennesMatiere).length).toFixed(2) 
            : '-';

        html += `
            <div class="matiere-card">
                <div class="matiere-header">
                    <div><strong>${m.nom}</strong><br><small style="opacity:0.7;">${m.prof || 'Prof non défini'}</small></div>
                    <div class="moyenne-badge">Moy: ${moyGenerale}</div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:10px;">
                    <span>T1: ${moyennesMatiere['T1'] || '-'}</span>
                    <span>T2: ${moyennesMatiere['T2'] || '-'}</span>
                    <span>T3: ${moyennesMatiere['T3'] || '-'}</span>
                </div>
        `;

        ['T1', 'T2', 'T3'].forEach(trim => {
            const notes = m.notes[trim] || [];
            html += `<div style="margin-bottom: 10px;"><div style="font-weight:bold; font-size:0.9rem;">Notes ${trim} :</div>`;
            notes.forEach((n, indexNote) => {
                html += `<div class="note-item"><span>Note: ${n}/20</span><button class="btn-del-note" data-mat="${i}" data-trim="${trim}" data-note="${indexNote}" style="color:red; background:none; border:none; cursor:pointer;">X</button></div>`;
            });
            html += `<div class="add-note-form"><input type="number" step="0.25" min="0" max="20" id="note-${i}-${trim}" placeholder="Note /20"><button class="btn-add-note" data-mat="${i}" data-trim="${trim}">+</button></div></div>`;
        });

        html += `<button class="btn-del-mat" data-mat="${i}" style="width:100%; margin-top:10px; background:#fee2e2; color:#dc2626; border:none; padding:8px; border-radius:4px; cursor:pointer;">Supprimer cette matière</button></div>`;
    });

    let moyT1 = nbNotesParTrimestre.T1 > 0 ? (sommeMoyennesTrimestres.T1 / nbNotesParTrimestre.T1).toFixed(2) : '-';
    let moyT2 = nbNotesParTrimestre.T2 > 0 ? (sommeMoyennesTrimestres.T2 / nbNotesParTrimestre.T2).toFixed(2) : '-';
    let moyT3 = nbNotesParTrimestre.T3 > 0 ? (sommeMoyennesTrimestres.T3 / nbNotesParTrimestre.T3).toFixed(2) : '-';

    let moyAnnuelle = '-';
    if (moyT1 !== '-' && moyT2 !== '-' && moyT3 !== '-') {
        moyAnnuelle = ((parseFloat(moyT1)*1 + parseFloat(moyT2)*2 + parseFloat(moyT3)*3) / 6).toFixed(2);
    }

    html += `
        <div class="matiere-card" style="border: 2px solid var(--primary-color); margin-top:20px;">
            <h3 style="text-align:center; margin-bottom:10px;">Bilan Annuel</h3>
            <div style="display:flex; justify-content:space-around; text-align:center;">
                <div><strong>T1</strong><br>${moyT1}</div><div><strong>T2</strong><br>${moyT2}</div><div><strong>T3</strong><br>${moyT3}</div>
            </div>
            <div style="text-align:center; margin-top:15px; font-size:1.2rem;"><strong>Moyenne Annuelle : </strong> <span style="color:var(--primary-color); font-weight:bold;">${moyAnnuelle}</span></div>
        </div>
    `;

    container.innerHTML = html;

    document.getElementById('btn-add-matiere').addEventListener('click', () => document.getElementById('form-add-matiere').classList.toggle('hidden'));

    document.getElementById('matiere-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        let toutesLesMats = JSON.parse(localStorage.getItem('matieres_scolaire')) || [];
        toutesLesMats.push({ nom: document.getElementById('m-nom').value, prof: document.getElementById('m-prof').value, notes: { T1: [], T2: [], T3: [] } });
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
};