/*
=====================================================
TRON ANALYZER
Version : 2.0
Fichier : app.js
=====================================================
*/

"use strict";

async function analyse() {

    const input = document
        .getElementById("pfLink")
        .value
        .trim();

    if (!input) {

        alert("Veuillez coller un lien Provably Fair.");

        return;

    }

    const data = parseProvablyFairLink(input);

    if (!data || !data.valid) {

        alert("Lien invalide.");

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

    if (
        data.serverSeed !== "" &&
        data.clientSeed !== "" &&
        data.nonce !== ""
    ) {

        try {

            const result =
                await DiceEngine.calculate(
                    data.serverSeed,
                    data.clientSeed,
                    data.nonce
                );

            document.getElementById(
                "verification"
            ).innerHTML =
                "<b>Résultat calculé :</b> " + result;

        }

        catch (err) {

            console.error(err);

            document.getElementById(
                "verification"
            ).textContent =
                "Erreur pendant le calcul.";

        }

    }

}
