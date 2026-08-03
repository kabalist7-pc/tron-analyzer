/*
=====================================================
TRON ANALYZER
Version : 1.0
Fichier : app.js
=====================================================
*/

"use strict";

const App = {

    currentAnalysis: null,

    init() {

        console.log("Tron Analyzer V1 démarré.");

        const input = document.getElementById("pfLink");

        if (input) {

            input.addEventListener("keypress", (e) => {

                if (e.key === "Enter") {

                    this.analyse();

                }

            });

        }

    },

    analyse() {

        const input = document.getElementById("pfLink");

        const link = input.value.trim();

        if (link.length === 0) {

            alert("Veuillez coller un lien Provably Fair.");

            return;

        }

        const parsed = parseProvablyFairLink(link);

        if (!parsed) {

            alert("Lien invalide.");

            return;

        }

        this.currentAnalysis = parsed;

        this.display(parsed);

        this.save(parsed);

        this.refreshStatistics();

    },

    display(data) {

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

        document.getElementById("verification").innerHTML =
            "✅ Analyse enregistrée.";

    },

    save(data) {

        if (typeof StorageService !== "undefined") {

            StorageService.saveAnalysis(data);

        }

    },

    refreshStatistics() {

        if (typeof StatisticsService === "undefined") {

            return;

        }

        const stats = StatisticsService.refresh();

        document.getElementById("verification").innerHTML +=

            "<br><br>Total analyses : <b>" +

            stats.analyses +

            "</b>";

    }

};

function analyse() {

    App.analyse();

}

window.onload = function () {

    App.init();

};
