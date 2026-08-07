/*
=====================================================
TRON ANALYZER
Version : 5.0
Fichier : app.js
Architecture Core V2
=====================================================
*/

"use strict";

function refreshHistory() {

    const container = document.getElementById("history");
    const counter = document.getElementById("historyCounter");

    if (!container) return;

    const history = StorageService.getHistory();

    // Compteur
    if (counter) {

        const total = history.length;

        counter.textContent =
            total <= 1
                ? `${total} analyse`
                : `${total} analyses`;

    }

    // Recherche
    const searchInput =
        document.getElementById("searchNonce");

    const search =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

    const filteredHistory = history.filter(item =>
        item.nonce
            .toString()
            .toLowerCase()
            .includes(search)
    );

    if (filteredHistory.length === 0) {

        container.innerHTML =
            search === ""
                ? "Aucune analyse enregistrée."
                : "Aucun nonce trouvé.";

        return;

    }

    let html = "";

    filteredHistory.forEach(item => {

        html += `
        <div class="history-item"
             onclick="loadHistory('${item.nonce}')">

            <div class="history-title">
                🎲 ${item.game}
            </div>

            Nonce : ${item.nonce}<br>

            Résultat : ${item.result}<br>

            <div class="history-date">
                ${new Date(item.createdAt).toLocaleString()}
            </div>

        </div>
        `;

    });

    container.innerHTML = html;

}

function loadHistory(nonce){

    const history =
        StorageService.getHistory();

    const item =
        history.find(h =>
            String(h.nonce) === String(nonce)
        );

    if(!item) return;

    document.getElementById("pfLink").value =
        item.url;

    analyse();

}

async function analyse(){

    const verification =
        document.getElementById("verification");

    verification.innerHTML =
        "Analyse en cours...";

    const link =
        document
        .getElementById("pfLink")
        .value
        .trim();

    if(!link){

        verification.innerHTML =
            "❌ Veuillez coller un lien.";

        return;

    }

    const analysis =
        await AnalysisService.analyzeLink(link);

    if(!analysis.success){

        verification.innerHTML =
            "❌ " + analysis.error;

        return;

    }

    document.getElementById("game").textContent =
        analysis.game;

    document.getElementById("nonce").textContent =
        analysis.nonce;

    document.getElementById("server").textContent =
        analysis.serverSeed;

    document.getElementById("client").textContent =
        analysis.clientSeed;

    document.getElementById("hash").textContent =
        analysis.hash || "-";

    verification.innerHTML =

        `<b>Résultat :</b>

        ${analysis.result}

        <br><br>

        ✅ Vérification réussie`;

    StorageService.saveAnalysis(analysis);

    refreshHistory();

}
function clearHistory(){

    if(!confirm(
        "Voulez-vous vraiment supprimer tout l'historique ?"
    )){
        return;
    }

    StorageService.clearHistory();

    refreshHistory();

}

window.onload = function(){

    refreshHistory();

    StatisticsService.refresh();

};
