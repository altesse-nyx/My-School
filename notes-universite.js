// Logique pour l'Université (UE et Modules)
window.afficherNotesUniversite = function(container) {
    const ues = JSON.parse(localStorage.getItem('ues_universite')) || [];

    let html = `<h2>Mes Notes (Université)</h2>`;
    html += `<button id="btn-add-ue" class="btn-primary" style="margin-bottom: 15px;">+ Ajouter une UE</button>`;
    
    html += `
        <div id="form-add-ue" class="add-course-form hidden">
            <form id="ue-form">
                <div class="form-group"><label>Nom de l'UE</label><input type="text" id="ue-nom" required></div>
                <div class="form-group"><label>Crédits ECTS</label><input type="number" id="ue-credits" required value="6"></div>
                <button type="submit" class="btn-primary">Créer l'UE</button>
            </form>
        </div>
    `;

    if (ues.length === 0) html += `<div class="empty-state">Aucune UE ajoutée.</div>`;

    ues.forEach((ue, ueIndex) => {
        let totalNotesPonderees = 0, totalCoefficients = 0;
        ue.modules.forEach(m => {
            if (m.notes.length > 0) {
                totalNotesPonderees += ((m.notes.reduce((a, b) => a + b, 0) / m.notes.length) * (m.coefficient || 1));
                totalCoefficients += (m.coefficient || 1);
            }
        });
        const moyUE = totalCoefficients > 0 ? (totalNotesPonderees / totalCoefficients).toFixed(2) : '-';

        html += `
            <div class="matiere-card" style="border-left: 5px solid #8b5cf6;">
                <div class="matiere-header">
                    <div><strong>${ue.nom}</strong><br><small style="opacity:0.7;">${ue.credits} Crédits ECTS</small></div>
                    <div class="moyenne-badge" style="background-color:#8b5cf6;">Moy UE: ${moyUE}</div>
                </div>
                <button class="btn-add-module btn-primary" data-ue="${ueIndex}" style="font-size:0.8rem; padding:5px; margin-bottom:10px;">+ Ajouter un Module</button>
                <div id="form-module-${ueIndex}" class="hidden" style="margin-bottom:15px; background:var(--bg-color); padding:10px; border-radius:8px;">
                    <form class="module-form" data-ue="${ueIndex}">
                        <div class="form-group"><input type="text" class="mod-nom" required placeholder="Nom du module"></div>
                        <div class="form-group"><input type="text" class="mod-prof" placeholder="Enseignant"></div>
                        <div class="form-group"><input type="number" class="mod-coef" required placeholder="Coefficient" value="1"></div>
                        <button type="submit" class="btn-primary">Ajouter</button>
                    </form>
                </div>
        `;

        ue.modules.forEach((m, modIndex) => {
            const moyMod = m.notes.length > 0 ? (m.notes.reduce((a, b) => a + b, 0) / m.notes.length).toFixed(2) : '-';
            html += `
                <div style="border: 1px solid #ccc; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="display:flex; justify-content:space-between; font-weight:bold;">
                        <span>${m.nom} (Coef: ${m.coefficient})</span><span>Moy: ${moyMod}</span>
                    </div>
                    <small style="opacity:0.7; display:block; margin-bottom:8px;">${m.prof || '-'}</small>
            `;
            m.notes.forEach((n, indexNote) => {
                html += `<div class="note-item"><span>Note: ${n}/20</span><button class="btn-del-note-ue" data-ue="${ueIndex}" data-mod="${modIndex}" data-note="${indexNote}" style="color:red; background:none; border:none; cursor:pointer;">X</button></div>`;
            });
            html += `<div class="add-note-form" style="margin-bottom:0;"><input type="number" step="0.25" min="0" max="20" id="note-ue-${ueIndex}-${modIndex}" placeholder="Note /20"><button class="btn-add-note-ue" data-ue="${ueIndex}" data-mod="${modIndex}">+</button></div></div>`;
        });

        html += `<button class="btn-del-ue" data-ue="${ueIndex}" style="width:100%; margin-top:10px; background:#fee2e2; color:#dc2626; border:none; padding:8px; border-radius:4px; cursor:pointer;">Supprimer cette UE</button></div>`;
    });

    container.innerHTML = html;

    document.getElementById('btn-add-ue').addEventListener('click', () => document.getElementById('form-add-ue').classList.toggle('hidden'));

    document.getElementById('ue-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        let toutesLesUEs = JSON.parse(localStorage.getItem('ues_universite')) || [];
        toutesLesUEs.push({ nom: document.getElementById('ue-nom').value, credits: parseInt(document.getElementById('ue-credits').value), modules: [] });
        localStorage.setItem('ues_universite', JSON.stringify(toutesLesUEs));
        afficherNotesUniversite(container);
    });

    document.querySelectorAll('.btn-add-module').forEach(btn => {
        btn.addEventListener('click', (e) => document.getElementById(`form-module-${e.target.getAttribute('data-ue')}`).classList.toggle('hidden'));
    });

    document.querySelectorAll('.module-form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const ueIndex = form.getAttribute('data-ue');
            let toutesLesUEs = JSON.parse(localStorage.getItem('ues_universite')) || [];
            toutesLesUEs[ueIndex].modules.push({
                nom: form.querySelector('.mod-nom').value,
                prof: form.querySelector('.mod-prof').value,
                coefficient: parseInt(form.querySelector('.mod-coef').value),
                notes: []
            });
            localStorage.setItem('ues_universite', JSON.stringify(toutesLesUEs));
            afficherNotesUniversite(container);
        });
    });

    document.querySelectorAll('.btn-add-note-ue').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ueIndex = e.target.getAttribute('data-ue');
            const modIndex = e.target.getAttribute('data-mod');
            const val = parseFloat(document.getElementById(`note-ue-${ueIndex}-${modIndex}`).value);
            if (!isNaN(val) && val >= 0 && val <= 20) {
                let toutesLesUEs = JSON.parse(localStorage.getItem('ues_universite')) || [];
                toutesLesUEs[ueIndex].modules[modIndex].notes.push(val);
                localStorage.setItem('ues_universite', JSON.stringify(toutesLesUEs));
                afficherNotesUniversite(container);
            } else alert("Note invalide (0-20).");
        });
    });

    document.querySelectorAll('.btn-del-note-ue').forEach(btn => {
        btn.addEventListener('click', (e) => {
            let toutesLesUEs = JSON.parse(localStorage.getItem('ues_universite')) || [];
            toutesLesUEs[e.target.getAttribute('data-ue')].modules[e.target.getAttribute('data-mod')].notes.splice(e.target.getAttribute('data-note'), 1);
            localStorage.setItem('ues_universite', JSON.stringify(toutesLesUEs));
            afficherNotesUniversite(container);
        });
    });

    document.querySelectorAll('.btn-del-ue').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(confirm("Supprimer cette UE ?")) {
                let toutesLesUEs = JSON.parse(localStorage.getItem('ues_universite')) || [];
                toutesLesUEs.splice(e.target.getAttribute('data-ue'), 1);
                localStorage.setItem('ues_universite', JSON.stringify(toutesLesUEs));
                afficherNotesUniversite(container);
            }
        });
    });
};