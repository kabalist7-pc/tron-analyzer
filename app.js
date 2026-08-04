/*
=====================================================
TRON ANALYZER
Version : 4.0
Fichier : app.js
=====================================================
*/

"use strict";

function refreshHistory() {

    const container =
        document.getElementById("history");

    if (!container) return;

    if (typeof StorageService === "undefined") {

        container.innerHTML =
            "Storage indisponible.";

        return;

    }

    const history =
        StorageService.getHistory();

    if (history.length === 0) {

        container.innerHTML =
            "Aucune analyse enregistrée.";

        return;

    }

    let html = "";

    history.forEach(item => {

        html +=
        "<div class='row'>" +
        "<span>" +
        item.nonce +
        "</span>" +
        "<span>" +
        item.result +
        "</span>" +
        "</div>";

    });

    container.innerHTML = html;

}

async function analyse() {

    const verification =
        document.getElementById("verification");

    verification.innerHTML =
        "Analyse en cours...";

    try {

        const input =
            document
            .getElementById("pfLink")
            .value
            .trim();

        if (!input) {

            verification.innerHTML =
                "❌ Veuillez coller un lien Provably Fair.";

            return;

        }

        const data =
            parseProvablyFairLink(input);

        if (!data.valid) {

            verification.innerHTML =
                "❌ Lien invalide.";

            return;

        }

        document.getElementById("game").textContent =
            data.game || "-";

        document.getElementById("nonce").textContent =
            data.nonce || "-";

        document.getElementById("server").textContent =
            data.serverSeed || "-";

        document.getElementById("client").textContent =
            data.clientSeed || "-";

        document.getElementById("hash").textContent =
            data.hash || "-";

        const result =
            await DiceEngine.calculate(

                data.serverSeed,

                data.clientSeed,

                data.nonce

            );

        verification.innerHTML =

            "<b>Résultat :</b> " +

            result.dice +

            "<br><br>✅ Calcul effectué avec succès.";

        StorageService.saveAnalysis({

            ...data,

            result: result.dice

        });

        refreshHistory();

    }

    catch (error) {

        console.error(error);

        verification.innerHTML =
            "❌ " + error.message;

    }

}

window.addEventListener(

    "load",

    refreshHistory

);
