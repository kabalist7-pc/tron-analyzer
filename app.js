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

StatisticsService.refresh();

StatisticsService.refreshDistribution();

AdvancedStatisticsService.refresh();

ChiSquareService.refresh();

KolmogorovSmirnovService.refresh();
}
function clearHistory(){

    if(!confirm(
        "Voulez-vous vraiment supprimer tout l'historique ?"
    )){
        return;
    }

    StorageService.clearHistory();

    refreshHistory();

    StatisticsService.refresh();

    StatisticsService.refreshDistribution();

    AdvancedStatisticsService.refresh();

    ChiSquareService.refresh();

    KolmogorovSmirnovService.refresh();
    /*
=================================================
SEED LAB
Actualisation après chaque nouvelle analyse
=================================================
*/

try {

    const history =
        StorageService.getHistory();

    const seedRecords =
        history
            .filter(item =>
                item.serverSeed &&
                (
                    item.serverSeedHash ||
                    item.hash
                )
            )
            .map(item => ({

                nonce:
                    Number(item.nonce),

                serverSeed:
                    item.serverSeed,

                serverSeedHash:
                    item.serverSeedHash ||
                    item.hash,

                clientSeed:
                    item.clientSeed || "",

                result:
                    Number(item.result)

            }))
            .sort(
                (a, b) =>
                    a.nonce - b.nonce
            );

    if (seedRecords.length >= 2) {

        const seedAnalysis =
            SeedLabService.analyzeSeries(
                seedRecords
            );

        SeedLabService.render(
            seedAnalysis
        );

    }

}
catch (error) {

    console.error(
        "Erreur Seed Lab :",
        error
    );

}

function logGamma(z) {

    const coefficients = [
        676.5203681218851,
        -1259.1392167224028,
        771.32342877765313,
        -176.61502916214059,
        12.507343278686905,
        -0.13857109526572012,
        9.984369578019572e-6,
        1.5056327351493116e-7
    ];

    if (z < 0.5) {

        return Math.log(Math.PI) -
            Math.log(Math.sin(Math.PI * z)) -
            logGamma(1 - z);

    }

    z -= 1;

    let x = 0.99999999999980993;

    for (let i = 0; i < coefficients.length; i++) {

        x +=
            coefficients[i] /
            (z + i + 1);

    }

    const t =
        z + coefficients.length - 0.5;

    return (
        0.5 * Math.log(2 * Math.PI) +
        (z + 0.5) * Math.log(t) -
        t +
        Math.log(x)
    );

}


function gammaQ(a, x) {

    if (x < 0 || a <= 0)
        return NaN;

    if (x === 0)
        return 1;

    const EPS = 1e-14;
    const FPMIN = 1e-300;
    const MAX_ITER = 1000;

    if (x < a + 1) {

        let sum = 1 / a;
        let term = sum;
        let n = 1;

        while (n <= MAX_ITER) {

            term *=
                x / (a + n);

            sum += term;

            if (
                Math.abs(term) <
                Math.abs(sum) * EPS
            )
                break;

            n++;

        }

        const logTerm =
            -x +
            a * Math.log(x) -
            logGamma(a);

        const p =
            sum * Math.exp(logTerm);

        return 1 - p;

    }

    let b =
        x + 1 - a;

    let c =
        1 / FPMIN;

    let d =
        1 / b;

    let h =
        d;

    for (
        let i = 1;
        i <= MAX_ITER;
        i++
    ) {

        const an =
            -i * (i - a);

        b += 2;

        d =
            an * d + b;

        if (Math.abs(d) < FPMIN)
            d = FPMIN;

        c =
            b + an / c;

        if (Math.abs(c) < FPMIN)
            c = FPMIN;

        d =
            1 / d;

        const delta =
            d * c;

        h *= delta;

        if (
            Math.abs(delta - 1) <
            EPS
        )
            break;

    }

    const logTerm =
        -x +
        a * Math.log(x) -
        logGamma(a);

    return Math.exp(logTerm) * h;

}


function chiSquareCDF(
    chiSquare,
    degreesOfFreedom
) {

    if (
        chiSquare < 0 ||
        degreesOfFreedom <= 0
    )
        return NaN;

    return 1 -
        gammaQ(
            degreesOfFreedom / 2,
            chiSquare / 2
        );

}

window.onload = function(){

    refreshHistory();

    StatisticsService.refresh();

    StatisticsService.refreshDistribution();

    AdvancedStatisticsService.refresh();

    ChiSquareService.refresh();

    KolmogorovSmirnovService.refresh();

    try {

    const simulation =
        DiceSimulatorService.generate(1000);

    const results =
        simulation.results.map(item =>
            item.result
        );

    const total =
        results.length;

    const sum =
        results.reduce(
            (acc, value) => acc + value,
            0
        );

    const average =
        sum / total;

    const minimum =
        Math.min(...results);

    const maximum =
        Math.max(...results);

    const bins = [
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0
    ];

    results.forEach(value => {

        let index =
            Math.floor(value / 10);

        if (index >= 10)
            index = 9;

        bins[index]++;

    });

        const expected =
        total / 10;

    let chiSquare = 0;

    bins.forEach(observed => {

        chiSquare +=
            Math.pow(
                observed - expected,
                2
            ) / expected;

    });

    const degreesOfFreedom = 9;

    const pValue =
        1 -
        chiSquareCDF(
            chiSquare,
            degreesOfFreedom
        );

    alert(
    "DEBUG CHI CARRÉ\n\n" +
    "χ² = " + chiSquare + "\n" +
    "ddl = " + degreesOfFreedom + "\n" +
    "p-value = " + pValue
);

    const diagnosis =
        pValue >= 0.05
            ? "✅ Distribution compatible avec l'uniformité"
            : "⚠️ Écart statistique détecté";

    let message =
        "ANALYSE SIMULATION\n\n" +

        "Source : " +
        simulation.source +

        "\nJeu : " +
        simulation.game +

        "\nNombre : " +
        total +

        "\n\nMoyenne : " +
        average.toFixed(2) +

        "\nMinimum : " +
        minimum.toFixed(2) +

        "\nMaximum : " +
        maximum.toFixed(2) +

        "\n\nDistribution :\n";

    bins.forEach(
        (count, index) => {

            const start =
                index * 10;

            const end =
                index === 9
                    ? 100
                    : start + 10;

            message +=
                start +
                "–" +
                end +
                " : " +
                count +
                "\n";

        }
    );

        message +=
        "\nTEST DU CHI CARRÉ\n" +

        "Effectif théorique : " +
        expected.toFixed(2) +

        "\nχ² : " +
        chiSquare.toFixed(4) +

        "\nddl : " +
        degreesOfFreedom +

        "\np-value : " +
        pValue.toFixed(6) +

        "\n\n" +
        diagnosis;

    alert(message);

}
catch (error) {

    alert(
        "ERREUR ANALYSE\n\n" +
        error.name +
        "\n\n" +
        error.message
    );

}
    /*
    =================================================
    SEED LAB
    Analyse automatique des seeds présents
    dans l'historique de Tron Analyzer
    =================================================
    */

    try {

        const history =
            StorageService.getHistory();


        if (
            Array.isArray(history) &&
            history.length >= 2
        ) {

            const seedRecords =
                history
                    .filter(item =>
                        item.serverSeed &&
                        item.serverSeedHash
                    )
                    .map(item => ({

                        nonce:
                            Number(item.nonce),

                        serverSeed:
                            item.serverSeed,

                        serverSeedHash:
                            item.serverSeedHash,

                        clientSeed:
                            item.clientSeed || "",

                        result:
                            Number(item.result)

                    }))
                    .sort(
                        (a, b) =>
                            a.nonce - b.nonce
                    );


            if (seedRecords.length >= 2) {

                const seedAnalysis =
                    SeedLabService.analyzeSeries(
                        seedRecords
                    );


                SeedLabService.render(
                    seedAnalysis
                );

            }

        }

    }
    catch (error) {

        console.error(
            "Erreur Seed Lab :",
            error
        );

    }
    
};
    
