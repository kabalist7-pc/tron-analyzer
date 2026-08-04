/*
=====================================================
TRON ANALYZER
Version : 3.0
Fichier : app.js
=====================================================
*/

"use strict";

async function analyse() {

    const verification =
        document.getElementById("verification");

    verification.innerHTML = "Analyse en cours...";

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

        if (
            !data.serverSeed ||
            !data.clientSeed ||
            !data.nonce
        ) {

            verification.innerHTML =
                "❌ Paramètres insuffisants pour calculer le résultat.";

            return;

        }

        const result =
            await DiceEngine.calculate(

                data.serverSeed,

                data.clientSeed,

                data.nonce

            );

        verification.innerHTML =

            "<b>Résultat :</b> " +

            result.dice +

            "<br><br>" +

            "✅ Calcul effectué avec succès.";

        if (
            typeof StorageService !== "undefined"
        ) {

            StorageService.saveAnalysis({

                ...data,

                result: result.dice

            });

        }

    }

    catch (error) {

        console.error(error);

        verification.innerHTML =

            "❌ Erreur : " +

            error.message;

    }

}
