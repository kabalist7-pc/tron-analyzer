/*
=====================================================
TRON ANALYZER
Seed Lab V3
Analyse approfondie des Server Seeds
=====================================================
*/

"use strict";

const SeedLabService = {

    /*
    =================================================
    OUTILS DE BASE
    =================================================
    */

    normalizeSeed(seed) {

        return String(seed || "")
            .trim()
            .toLowerCase();

    },


    isValidHexSeed(seed) {

        const value =
            this.normalizeSeed(seed);

        return (
            value.length === 64 &&
            /^[0-9a-f]{64}$/.test(value)
        );

    },


    sha256(value) {

        if (
            typeof CryptoJS === "undefined" ||
            !CryptoJS.SHA256
        ) {
            throw new Error(
                "CryptoJS n'est pas disponible."
            );
        }

        return CryptoJS
            .SHA256(value)
            .toString(CryptoJS.enc.Hex);

    },


    /*
    =================================================
    VALIDATION DU HASH
    =================================================
    */

    validateHash(seed, expectedHash) {

        if (!this.isValidHexSeed(seed))
            return false;

        const calculated =
            this.sha256(seed);

        return (
            calculated ===
            this.normalizeSeed(expectedHash)
        );

    },


    /*
    =================================================
    DISTANCE DE HAMMING
    =================================================
    */

    hammingDistanceHex(seedA, seedB) {

        const a =
            this.normalizeSeed(seedA);

        const b =
            this.normalizeSeed(seedB);

        if (
            !this.isValidHexSeed(a) ||
            !this.isValidHexSeed(b)
        ) {
            return null;
        }

        let distance = 0;

        for (let i = 0; i < 64; i++) {

            const x =
                parseInt(a[i], 16);

            const y =
                parseInt(b[i], 16);

            let xor =
                x ^ y;

            while (xor) {

                distance +=
                    xor & 1;

                xor >>= 1;

            }

        }

        return distance;

    },


    /*
    =================================================
    CARACTERES HEX DIFFERENTS
    =================================================
    */

    hexDifference(seedA, seedB) {

        const a =
            this.normalizeSeed(seedA);

        const b =
            this.normalizeSeed(seedB);

        if (
            !this.isValidHexSeed(a) ||
            !this.isValidHexSeed(b)
        ) {
            return null;
        }

        let different = 0;

        for (let i = 0; i < 64; i++) {

            if (a[i] !== b[i])
                different++;

        }

        return different;

    },


    /*
    =================================================
    RELATION SHA-256
    =================================================
    */

    testSHA256Relation(
        previous,
        next
    ) {

        return (
            this.sha256(previous) ===
            this.normalizeSeed(next)
        );

    },


    /*
    =================================================
    DOUBLE SHA-256
    =================================================
    */

    testDoubleSHA256Relation(
        previous,
        next
    ) {

        const first =
            this.sha256(previous);

        const second =
            this.sha256(first);

        return (
            second ===
            this.normalizeSeed(next)
        );

    },


    /*
    =================================================
    HMAC-SHA256
    =================================================
    */

    testHMACRelation(
        previous,
        nonce,
        next
    ) {

        if (
            typeof CryptoJS === "undefined" ||
            !CryptoJS.HmacSHA256
        ) {
            return false;
        }

        const calculated =
            CryptoJS
                .HmacSHA256(
                    String(nonce),
                    previous
                )
                .toString(
                    CryptoJS.enc.Hex
                );

        return (
            calculated ===
            this.normalizeSeed(next)
        );

    },


    /*
    =================================================
    TESTS SUPPLEMENTAIRES
    =================================================
    */

    testNonceRelations(
        record,
        next
    ) {

        const seed =
            this.normalizeSeed(
                record.serverSeed
            );

        const nextSeed =
            this.normalizeSeed(
                next.serverSeed
            );

        const nonce =
            String(record.nonce);

        const nextNonce =
            String(next.nonce);

        const client =
            String(
                record.clientSeed || ""
            );


        let shaNonceClient = false;
        let shaClientNonce = false;
        let shaSeedNonce = false;


        /*
        SHA256(nonce + client)
        */

        shaNonceClient =
            this.sha256(
                nonce + client
            ) === nextSeed;


        /*
        SHA256(client + nonce)
        */

        shaClientNonce =
            this.sha256(
                client + nonce
            ) === nextSeed;


        /*
        SHA256(seed + nonce)
        */

        shaSeedNonce =
            this.sha256(
                seed + nextNonce
            ) === nextSeed;


        return {

            shaNonceClient,

            shaClientNonce,

            shaSeedNonce

        };

    },


    /*
    =================================================
    SCORE D'AVALANCHE
    =================================================

    Deux seeds indépendants de 256 bits devraient
    présenter environ 128 bits différents en moyenne.

    Écart-type théorique ≈ 8.

    */

    avalancheScore(hamming) {

        if (!Number.isFinite(hamming))
            return null;

        return (
            (hamming - 128) / 8
        );

    },


    avalancheDiagnosis(hamming) {

        if (!Number.isFinite(hamming))
            return "Indéterminable";

        const z =
            Math.abs(
                this.avalancheScore(hamming)
            );

        if (z <= 1)
            return "Très proche du comportement attendu";

        if (z <= 2)
            return "Dans une variation normale";

        if (z <= 3)
            return "Variation inhabituelle";

        return "Écart important";

    },


    /*
    =================================================
    ANALYSE D'UNE TRANSITION
    =================================================
    */

    analyzeTransition(
        previous,
        next
    ) {

        const previousSeed =
            this.normalizeSeed(
                previous.serverSeed
            );

        const nextSeed =
            this.normalizeSeed(
                next.serverSeed
            );


        const hamming =
            this.hammingDistanceHex(
                previousSeed,
                nextSeed
            );


        const hexDifference =
            this.hexDifference(
                previousSeed,
                nextSeed
            );


        const nonceRelations =
            this.testNonceRelations(
                previous,
                next
            );


        return {

            fromNonce:
                previous.nonce,

            toNonce:
                next.nonce,

            hamming,

            hexDifference,

            avalancheScore:
                this.avalancheScore(
                    hamming
                ),

            avalancheDiagnosis:
                this.avalancheDiagnosis(
                    hamming
                ),

            sha256:
                this.testSHA256Relation(
                    previousSeed,
                    nextSeed
                ),

            doubleSHA256:
                this.testDoubleSHA256Relation(
                    previousSeed,
                    nextSeed
                ),

            hmac:
                this.testHMACRelation(
                    previousSeed,
                    next.nonce,
                    nextSeed
                ),

            shaNonceClient:
                nonceRelations.shaNonceClient,

            shaClientNonce:
                nonceRelations.shaClientNonce,

            shaSeedNonce:
                nonceRelations.shaSeedNonce

        };

    },


    /*
    =================================================
    ANALYSE DE LA SERIE
    =================================================
    */

    analyzeSeries(records) {

        if (
            !Array.isArray(records) ||
            records.length === 0
        ) {

            return {

                total: 0,

                validHashes: 0,

                invalidHashes: 0,

                invalidSeeds: 0,

                averageHamming: 0,

                minHamming: null,

                maxHamming: null,

                averageHexDifference: 0,

                transitions: []

            };

        }


        const normalized =
            records
                .map(record => ({

                    ...record,

                    nonce:
                        Number(record.nonce),

                    serverSeed:
                        this.normalizeSeed(
                            record.serverSeed
                        ),

                    serverSeedHash:
                        this.normalizeSeed(
                            record.serverSeedHash
                        )

                }))
                .sort(
                    (a, b) =>
                        a.nonce - b.nonce
                );


        /*
        ---------------------------------------------
        VALIDATION DES SEEDS ET HASHES
        ---------------------------------------------
        */

        let validHashes = 0;

        let invalidHashes = 0;

        let invalidSeeds = 0;


        normalized.forEach(record => {

            if (
                !this.isValidHexSeed(
                    record.serverSeed
                )
            ) {

                invalidSeeds++;

            }


            if (
                this.validateHash(
                    record.serverSeed,
                    record.serverSeedHash
                )
            ) {

                validHashes++;

            }
            else {

                invalidHashes++;

            }

        });


        /*
        ---------------------------------------------
        TRANSITIONS
        ---------------------------------------------
        */

        const transitions = [];

        let hammingSum = 0;

        let hammingCount = 0;

        let hexDifferenceSum = 0;

        let hexDifferenceCount = 0;


        for (
            let i = 0;
            i < normalized.length - 1;
            i++
        ) {

            const transition =
                this.analyzeTransition(
                    normalized[i],
                    normalized[i + 1]
                );


            transitions.push(
                transition
            );


            if (
                Number.isFinite(
                    transition.hamming
                )
            ) {

                hammingSum +=
                    transition.hamming;

                hammingCount++;

            }


            if (
                Number.isFinite(
                    transition.hexDifference
                )
            ) {

                hexDifferenceSum +=
                    transition.hexDifference;

                hexDifferenceCount++;

            }

        }


        const averageHamming =
            hammingCount
                ? hammingSum /
                  hammingCount
                : 0;


        const averageHexDifference =
            hexDifferenceCount
                ? hexDifferenceSum /
                  hexDifferenceCount
                : 0;


        const hammingValues =
            transitions
                .map(t => t.hamming)
                .filter(
                    Number.isFinite
                );


        const minHamming =
            hammingValues.length
                ? Math.min(
                    ...hammingValues
                )
                : null;


        const maxHamming =
            hammingValues.length
                ? Math.max(
                    ...hammingValues
                )
                : null;


        return {

            total:
                normalized.length,

            validHashes,

            invalidHashes,

            invalidSeeds,

            averageHamming,

            minHamming,

            maxHamming,

            averageHexDifference,

            transitions

        };

    },


    /*
    =================================================
    RAPPORT TEXTE
    =================================================
    */

    createReport(analysis) {

        if (!analysis)
            return "Aucune analyse.";

        let report =

            "SEED LAB V3\n\n" +

            "Seeds analysés : " +
            analysis.total +

            "\nHashes valides : " +
            analysis.validHashes +

            "\nHashes invalides : " +
            analysis.invalidHashes +

            "\nSeeds invalides : " +
            analysis.invalidSeeds +

            "\n\nDistance Hamming moyenne : " +
            analysis.averageHamming.toFixed(2) +
            " / 256";


        if (
            Number.isFinite(
                analysis.minHamming
            )
        ) {

            report +=

                "\nDistance Hamming min : " +
                analysis.minHamming +

                "\nDistance Hamming max : " +
                analysis.maxHamming +

                "\nCaractères hex différents moyen : " +
                analysis.averageHexDifference.toFixed(2) +
                " / 64";

        }


        report +=
            "\n\nRELATIONS TESTÉES";


        analysis.transitions.forEach(
            (item, index) => {

                report +=

                    "\n\nTransition " +
                    (index + 1) +
                    " : " +
                    item.fromNonce +
                    " → " +
                    item.toNonce +

                    "\nHamming : " +
                    item.hamming +
                    "/256" +

                    "\nCaractères hex différents : " +
                    item.hexDifference +
                    "/64" +

                    "\nAvalanche : " +
                    (
                        Number.isFinite(
                            item.avalancheScore
                        )
                            ? item.avalancheScore.toFixed(2) +
                              "σ"
                            : "-"
                    ) +

                    "\nDiagnostic : " +
                    item.avalancheDiagnosis +

                    "\nSHA-256(seed précédent) = seed suivant : " +
                    (
                        item.sha256
                            ? "OUI"
                            : "NON"
                    ) +

                    "\nDouble SHA-256 : " +
                    (
                        item.doubleSHA256
                            ? "OUI"
                            : "NON"
                    ) +

                    "\nHMAC-SHA256 : " +
                    (
                        item.hmac
                            ? "OUI"
                            : "NON"
                    ) +

                    "\nSHA256(nonce + client) : " +
                    (
                        item.shaNonceClient
                            ? "OUI"
                            : "NON"
                    ) +

                    "\nSHA256(client + nonce) : " +
                    (
                        item.shaClientNonce
                            ? "OUI"
                            : "NON"
                    ) +

                    "\nSHA256(seed + nonce) : " +
                    (
                        item.shaSeedNonce
                            ? "OUI"
                            : "NON"
                    );

            }
        );


        return report;

    },


    /*
    =================================================
    AFFICHAGE HTML
    =================================================
    */

    render(analysis) {

        const total =
            document.getElementById(
                "seedLabTotal"
            );

        const valid =
            document.getElementById(
                "seedLabValid"
            );

        const invalid =
            document.getElementById(
                "seedLabInvalid"
            );

        const average =
            document.getElementById(
                "seedLabHamming"
            );

        const container =
            document.getElementById(
                "seedLabTransitions"
            );


        if (!container)
            return;


        if (total)
            total.textContent =
                analysis.total;


        if (valid)
            valid.textContent =
                analysis.validHashes;


        if (invalid)
            invalid.textContent =
                analysis.invalidHashes;


        if (average)
            average.textContent =
                analysis.averageHamming
                    .toFixed(2) +
                " / 256";


        if (
            !analysis.transitions.length
        ) {

            container.innerHTML =
                "Pas assez de seeds.";

            return;

        }


        let html = "";


        analysis.transitions.forEach(
            (item, index) => {

                const avalanche =
                    Number.isFinite(
                        item.avalancheScore
                    )
                        ? item.avalancheScore.toFixed(2) +
                          " σ"
                        : "-";


                html += `

                <div class="seed-transition">

                    <h4>
                        Transition ${index + 1}
                        :
                        ${item.fromNonce}
                        →
                        ${item.toNonce}
                    </h4>

                    <div class="row">
                        <span>Hamming</span>
                        <span>
                            ${item.hamming}/256
                        </span>
                    </div>

                    <div class="row">
                        <span>
                            Caractères hex différents
                        </span>
                        <span>
                            ${item.hexDifference}/64
                        </span>
                    </div>

                    <div class="row">
                        <span>
                            Avalanche
                        </span>
                        <span>
                            ${avalanche}
                        </span>
                    </div>

                    <div class="row">
                        <span>
                            Diagnostic
                        </span>
                        <span>
                            ${item.avalancheDiagnosis}
                        </span>
                    </div>

                    <div class="row">
                        <span>SHA-256</span>
                        <span>
                            ${
                                item.sha256
                                    ? "✅ OUI"
                                    : "❌ NON"
                            }
                        </span>
                    </div>

                    <div class="row">
                        <span>Double SHA-256</span>
                        <
