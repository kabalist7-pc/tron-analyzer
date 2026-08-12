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

    try {

        const seedRecords = [

            {
                nonce: 636631,

                serverSeed:
                    "a635c05870f0cb287709980294656370fe65efa5bf7b7da3e77c79fd7a253b6d",

                serverSeedHash:
                    "5c04b43b5fbb905f5d58c18f709b17ec6a2610a655bec3a9995f16a4e0e29af2",

                clientSeed:
                    "Angegardienpc@",

                result: 10.98
            },

            {
                nonce: 636632,

                serverSeed:
                    "dc44c7204a378fcb806e2e83dbf788840b26bcf0604d5cd78bdfc16b5980d2e8",

                serverSeedHash:
                    "5ceefa2c5f41f021ee9e628770eb16009ca38354a189f4b652873e36da65012c",

                clientSeed:
                    "Angegardienpc@",

                result: 12.00
            },

            {
                nonce: 636633,

                serverSeed:
                    "f60f4327a10e139130ca7c1eb7fd0a1a9d497999d212095856db5d99946cc4ff",

                serverSeedHash:
                    "d88536f37f97d64d3f30fc04ec0f032d0a5c741a5729fd69afaf8e690416cba1",

                clientSeed:
                    "Angegardienpc@",

                result: 54.29
            },

            {
                nonce: 636634,

                serverSeed:
                    "6de450a4b16f45fb923f76769cb31c3626473103f60b1e178a270bf73f5a378b",

                serverSeedHash:
                    "f94282a7f444ecd229c4235ef2fe67e1d86d82f6d6279f23d27ba40a52aaf228",

                clientSeed:
                    "Angegardienpc@",

                result: 71.23
            }

        ];

        const seedAnalysis =
            SeedLabService.analyzeSeries(
                seedRecords
            );

        alert(
            SeedLabService.createReport(
                seedAnalysis
            )
        );

    }
    catch (error) {

        alert(
            "ERREUR SEED LAB\n\n" +
            error.name +
            "\n\n" +
            error.message
        );

    }

};




