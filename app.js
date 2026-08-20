   /*
=====================================================
TRON ANALYZER
Version : 5.2
Fichier : app.js
Architecture Core V2
=====================================================
*/

"use strict";


/*
=====================================================
HISTORIQUE
=====================================================
*/

function refreshHistory() {

    const container =
        document.getElementById("history");

    const counter =
        document.getElementById("historyCounter");

    if (!container)
        return;


    const history =
        StorageService.getHistory();


    /*
    Compteur
    */

    if (counter) {

        const total =
            history.length;

        counter.textContent =
            total <= 1
                ? `${total} analyse`
                : `${total} analyses`;

    }


    /*
    Recherche
    */

    const searchInput =
        document.getElementById(
            "searchNonce"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const filteredHistory =
        history.filter(item =>

            String(item.nonce)
                .toLowerCase()
                .includes(search)

        );


    /*
    Aucun résultat
    */

    if (
        filteredHistory.length === 0
    ) {

        container.innerHTML =
            search === ""
                ? "Aucune analyse enregistrée."
                : "Aucun nonce trouvé.";

        return;

    }


    /*
    Construction de l'historique
    */

    let html = "";


    filteredHistory.forEach(item => {

        html += `

        <div
            class="history-item"
            onclick="loadHistory('${item.nonce}')"
        >

            <div class="history-title">

                🎲 ${item.game}

            </div>

            Nonce :
            ${item.nonce}

            <br>

            Résultat :
            ${item.result}

            <br>

            <div class="history-date">

                ${new Date(
                    item.createdAt
                ).toLocaleString()}

            </div>

        </div>

        `;

    });


    container.innerHTML =
        html;

}


/*
=====================================================
CHARGER UNE ANALYSE DE L'HISTORIQUE
=====================================================
*/

function loadHistory(nonce) {

    const history =
        StorageService.getHistory();


    const item =
        history.find(h =>

            String(h.nonce) ===
            String(nonce)

        );


    if (!item)
        return;


    const input =
        document.getElementById(
            "pfLink"
        );


    if (!input)
        return;


    input.value =
        item.url;


    analyse();

}


/*
=====================================================
ANALYSE PRINCIPALE
=====================================================
*/

async function analyse() {

    const verification =
        document.getElementById(
            "verification"
        );


    if (verification) {

        verification.innerHTML =
            "⏳ Analyse en cours...";

    }


    const input =
        document.getElementById(
            "pfLink"
        );


    if (!input) {

        console.error(
            "Champ pfLink introuvable."
        );

        return;

    }


    const link =
        input.value.trim();


    /*
    Aucun lien
    */

    if (!link) {

        if (verification) {

            verification.innerHTML =
                "❌ Veuillez coller un lien.";

        }

        return;

    }


    try {

        /*
        =============================================
        ANALYSE DU LIEN
        =============================================
        */

        const analysis =
            await AnalysisService
                .analyzeLink(link);


        /*
        =============================================
        VÉRIFICATION DU RÉSULTAT
        =============================================
        */

        if (
            !analysis ||
            !analysis.success
        ) {

            if (verification) {

                verification.innerHTML =
                    "❌ " +
                    (
                        analysis &&
                        analysis.error
                            ? analysis.error
                            : "Erreur inconnue."
                    );

            }

            return;

        }


        /*
        =============================================
        AFFICHAGE DES INFORMATIONS
        =============================================
        */

        const game =
            document.getElementById(
                "game"
            );

        const nonce =
            document.getElementById(
                "nonce"
            );

        const server =
            document.getElementById(
                "server"
            );

        const client =
            document.getElementById(
                "client"
            );

        const hash =
            document.getElementById(
                "hash"
            );


        if (game)
            game.textContent =
                analysis.game;


        if (nonce)
            nonce.textContent =
                analysis.nonce;


        if (server)
            server.textContent =
                analysis.serverSeed;


        if (client)
            client.textContent =
                analysis.clientSeed;


        if (hash)
            hash.textContent =
                analysis.hash || "-";


        /*
        =============================================
        AFFICHAGE DU RÉSULTAT
        =============================================
        */

        if (verification) {

            verification.innerHTML =

                `<b>Résultat :</b>

                ${analysis.result}

                <br><br>

                ✅ Vérification réussie`;

        }


        /*
        =============================================
        SAUVEGARDE
        =============================================
        */

        await StorageService
            .saveAnalysis(
                analysis
            );


        /*
        =============================================
        ACTUALISATION HISTORIQUE
        =============================================
        */

        refreshHistory();


        /*
        =============================================
        STATISTIQUES
        =============================================
        */

        refreshAllStatistics();


        /*
        =============================================
        SEED LAB
        =============================================
        */

        refreshSeedLab();

    }

    catch (error) {

        console.error(
            "Erreur pendant l'analyse :",
            error
        );


        if (verification) {

            verification.innerHTML =

                "❌ Erreur pendant l'analyse : " +
                error.message;

        }

    }

}


/*
=====================================================
ACTUALISATION DES STATISTIQUES
=====================================================
*/

function refreshAllStatistics() {

    try {

        if (
            typeof StatisticsService !==
            "undefined"
        ) {

            StatisticsService.refresh();

            StatisticsService
                .refreshDistribution();

        }


        if (
            typeof AdvancedStatisticsService !==
            "undefined"
        ) {

            AdvancedStatisticsService
                .refresh();

        }


        if (
            typeof ChiSquareService !==
            "undefined"
        ) {

            ChiSquareService.refresh();

        }


        if (
            typeof KolmogorovSmirnovService !==
            "undefined"
        ) {

            KolmogorovSmirnovService
                .refresh();

        }

    }

    catch (error) {

        console.error(
            "Erreur statistiques :",
            error
        );

    }

}


/*
=====================================================
SEED LAB
=====================================================
*/

function refreshSeedLab() {

    try {

        /*
        =============================================
        VÉRIFIER QUE LE SERVICE EXISTE
        =============================================
        */

        if (
            typeof SeedLabService ===
            "undefined"
        ) {

            console.warn(
                "SeedLabService indisponible."
            );

            return;

        }


        /*
        =============================================
        RÉCUPÉRER L'HISTORIQUE
        =============================================
        */

        const history =
            StorageService.getHistory();


        /*
        =============================================
        EXTRAIRE LES SEEDS
        =============================================
        */

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

                .filter(item =>

                    item.serverSeed &&
                    Number.isFinite(
                        item.nonce
                    )

                )

                .sort(
                    (a, b) =>
                        a.nonce - b.nonce
                );


        /*
        =============================================
        METTRE À JOUR LE COMPTEUR
        =============================================
        */

        const total =
            document.getElementById(
                "seedLabTotal"
            );


        if (total) {

            total.textContent =
                seedRecords.length;

        }


        /*
        =============================================
        PAS ASSEZ DE SEEDS
        =============================================
        */

        if (
            seedRecords.length < 2
        ) {

            const container =
                document.getElementById(
                    "seedLabTransitions"
                );


            if (container) {

                container.innerHTML =
                    "Pas assez de seeds.";

            }


            return;

        }


        /*
        =============================================
        ANALYSE
        =============================================
        */

        const seedAnalysis =
            SeedLabService
                .analyzeSeries(
                    seedRecords
                );


        /*
        =============================================
        AFFICHAGE
        =============================================
        */

        SeedLabService.render(
            seedAnalysis
        );

    }

    catch (error) {

        console.error(
            "Erreur Seed Lab :",
            error
        );

    }

}


/*
=====================================================
VIDER L'HISTORIQUE
=====================================================
*/

function clearHistory() {

    const confirmation =
        confirm(
            "Voulez-vous vraiment supprimer tout l'historique ?"
        );


    if (!confirmation)
        return;


    /*
    Suppression
    */

    StorageService.clearHistory();


    /*
    Actualisation
    */

    refreshHistory();

    refreshAllStatistics();

    refreshSeedLab();

}


/*
=====================================================
GAMMA
=====================================================
*/

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

        return (

            Math.log(Math.PI)

            -

            Math.log(
                Math.sin(
                    Math.PI * z
                )
            )

            -

            logGamma(
                1 - z
            )

        );

    }


    z -= 1;


    let x =
        0.99999999999980993;


    for (
        let i = 0;
        i < coefficients.length;
        i++
    ) {

        x +=
            coefficients[i] /
            (z + i + 1);

    }


    const t =
        z +
        coefficients.length -
        0.5;


    return (

        0.5 *
        Math.log(
            2 * Math.PI
        )

        +

        (z + 0.5) *
        Math.log(t)

        -

        t

        +

        Math.log(x)

    );

}


/*
=====================================================
GAMMA Q
=====================================================
*/

function gammaQ(a, x) {

    if (
        x < 0 ||
        a <= 0
    )
        return NaN;


    if (x === 0)
        return 1;


    const EPS =
        1e-14;


    const FPMIN =
        1e-300;


    const MAX_ITER =
        1000;


    /*
    =============================================
    Série
    =============================================
    */

    if (x < a + 1) {

        let sum =
            1 / a;


        let term =
            sum;


        let n =
            1;


        while (
            n <= MAX_ITER
        ) {

            term *=
                x /
                (a + n);


            sum +=
                term;


            if (
                Math.abs(term) <
                Math.abs(sum) *
                EPS
            )
                break;


            n++;

        }


        const logTerm =

            -x

            +

            a *
            Math.log(x)

            -

            logGamma(a);


        const p =
            sum *
            Math.exp(
                logTerm
            );


        return 1 - p;

    }


    /*
    =============================================
    Fraction continue
    =============================================
    */

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
            -i *
            (i - a);


        b += 2;


        d =
            an * d + b;


        if (
            Math.abs(d) <
            FPMIN
        )
            d = FPMIN;


        c =
            b +
            an / c;


        if (
            Math.abs(c) <
            FPMIN
        )
            c = FPMIN;


        d =
            1 / d;


        const delta =
            d * c;


        h *=
            delta;


        if (
            Math.abs(
                delta - 1
            ) < EPS
        )
            break;

    }


    const logTerm =

        -x

        +

        a *
        Math.log(x)

        -

        logGamma(a);


    return (

        Math.exp(
            logTerm
        ) *
        h

    );

}


/*
=====================================================
CHI SQUARE CDF
=====================================================
*/

function chiSquareCDF(
    chiSquare,
    degreesOfFreedom
) {

    if (
        chiSquare < 0 ||
        degreesOfFreedom <= 0
    )
        return NaN;


    return (

        1 -

        gammaQ(
            degreesOfFreedom / 2,
            chiSquare / 2
        )

    );

}


/*
=====================================================
CHARGEMENT INITIAL
=====================================================
*/

window.onload = function () {

    try {

        /*
        =============================================
        HISTORIQUE
        =============================================
        */

        refreshHistory();


        /*
        =============================================
        STATISTIQUES
        =============================================
        */

        refreshAllStatistics();


        /*
        =============================================
        SEED LAB
        =============================================
        */

        refreshSeedLab();


        /*
        =============================================
        SIMULATION DE TEST
        =============================================
        */

        if (
            typeof DiceSimulatorService !==
            "undefined"
        ) {

            try {

                const simulation =
                    DiceSimulatorService
                        .generate(1000);


                const results =
                    simulation.results
                        .map(item =>
                            Number(item.result)
                        );


                const total =
                    results.length;


                if (total > 0) {

                    const sum =
                        results.reduce(
                            (acc, value) =>
                                acc + value,
                            0
                        );


                    const average =
                        sum / total;


                    const minimum =
                        Math.min(
                            ...results
                        );


                    const maximum =
                        Math.max(
                            ...results
                        );


                    const bins = [

                        0, 0, 0, 0, 0,

                        0, 0, 0, 0, 0

                    ];


                    results.forEach(
                        value => {

                            let index =
                                Math.floor(
                                    value / 10
                                );


                            if (
                                index >= 10
                            ) {

                                index = 9;

                            }


                            bins[index]++;

                        }
                    );


                    const expected =
                        total / 10;


                    let chiSquare =
                        0;


                    bins.forEach(
                        observed => {

                            chiSquare +=

                                Math.pow(
                                    observed -
                                    expected,
                                    2
                                ) /
                                expected;

                        }
                    );


                    const degreesOfFreedom =
                        9;


                    const pValue =
                        1 -
                        chiSquareCDF(
                            chiSquare,
                            degreesOfFreedom
                        );


                    /*
                    Ne pas afficher de popup.
                    Seulement journaliser.
                    */

                    console.log(
                        "Simulation Tron Analyzer",
                        {
                            source:
                                simulation.source,

                            game:
                                simulation.game,

                            total,

                            average,

                            minimum,

                            maximum,

                            chiSquare,

                            degreesOfFreedom,

                            pValue

                        }
                    );

                }

            }

            catch (simulationError) {

                console.error(
                    "Erreur simulation :",
                    simulationError
                );

            }

        }

    }

    catch (error) {

        console.error(
            "Erreur chargement Tron Analyzer :",
            error
        );

    }

};
