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

    if (!container) return;

    const history = StorageService.getHistory();

    if (history.length === 0) {

        container.innerHTML =
            "Aucune analyse enregistrée.";

        return;

    }

    let html = "";

    history.forEach((item,index)=>{

        html += `
        <div class="history-item"
             onclick="loadHistory(${index})"
             style="
                cursor:pointer;
                border:1px solid #444;
                padding:10px;
                margin-bottom:8px;
                border-radius:8px;
             ">

            <b>🎲 ${item.game}</b><br>

            Nonce : ${item.nonce}<br>

            Résultat : ${item.result}<br>

            <small>${new Date(item.createdAt).toLocaleString()}</small>

        </div>
        `;

    });

    container.innerHTML = html;

}

function loadHistory(index){

    const history =
        StorageService.getHistory();

    const item =
        history[index];

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

window.onload = refreshHistory;
