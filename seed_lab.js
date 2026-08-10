/*
=====================================================
TRON ANALYZER
Version : 5.0
Fichier : seed_lab.js
=====================================================
*/

"use strict";

class SeedLabService {

    /*
    -------------------------------------------------
    Normalisation
    -------------------------------------------------
    */

    static normalizeSeed(seed) {

        if (seed === undefined || seed === null)
            return "";

        return String(seed)
            .trim()
            .toLowerCase();

    }


    /*
    -------------------------------------------------
    Vérification du format
    -------------------------------------------------
    */

    static isValidSeed(seed) {

        const normalized =
            this.normalizeSeed(seed);

        return /^[0-9a-f]{64}$/.test(
            normalized
        );

    }


    /*
    -------------------------------------------------
    SHA-256 du server seed
    -------------------------------------------------
    */

    static sha256(seed) {

        const normalized =
            this.normalizeSeed(seed);

        return CryptoJS.SHA256(
            normalized
        ).toString(
            CryptoJS.enc.Hex
        );

    }


    /*
    -------------------------------------------------
    Vérification seed / hash
    -------------------------------------------------
    */

    static verifyHash(
        serverSeed,
        expectedHash
    ) {

        const calculated =
            this.sha256(serverSeed);

        const expected =
            this.normalizeSeed(
                expectedHash
            );

        return {

            valid:
                calculated === expected,

            calculatedHash:
                calculated,

            expectedHash:
                expected

        };

    }


    /*
    -------------------------------------------------
    Distance de Hamming
    -------------------------------------------------

    Nombre de positions différentes
    entre deux seeds hexadécimaux.
    -------------------------------------------------
    */

    static hammingDistance(
        seedA,
        seedB
    ) {

        const a =
            this.normalizeSeed(seedA);

        const b =
            this.normalizeSeed(seedB);

        if (
            !this.isValidSeed(a) ||
            !this.isValidSeed(b)
        ) {
            return null;
        }

        let distance = 0;

        for (
            let i = 0;
            i < a.length;
            i++
        ) {

            const byteA =
                parseInt(
                    a[i],
                    16
                );

            const byteB =
                parseInt(
                    b[i],
                    16
                );

            let xor =
                byteA ^ byteB;

            while (xor !== 0) {

                distance +=
                    xor & 1;

                xor >>=
                    1;

            }

        }

        return distance;

    }


    /*
    -------------------------------------------------
    Distance hexadécimale
    -------------------------------------------------
    */

    static hexDifference(
        seedA,
        seedB
    ) {

        const a =
            this.normalizeSeed(seedA);

        const b =
            this.normalizeSeed(seedB);

        if (
            !this.isValidSeed(a) ||
            !this.isValidSeed(b)
        ) {
            return null;
        }

        let differentCharacters = 0;

        for (
            let i = 0;
            i < a.length;
            i++
        ) {

            if (a[i] !== b[i])
                differentCharacters++;

        }

        return differentCharacters;

    }


    /*
    -------------------------------------------------
    Test relation SHA-256
    -------------------------------------------------
    */

    static testShaChain(
        seedA,
        seedB
    ) {

        const calculated =
            this.sha256(seedA);

        return {

            matches:
                calculated ===
                this.normalizeSeed(seedB),

            calculated:
                calculated,

            target:
                this.normalizeSeed(seedB)

        };

    }


    /*
    -------------------------------------------------
    Test relation SHA256(SHA256(seed))
    -------------------------------------------------
    */

    static testDoubleSha(
        seedA,
        seedB
    ) {

        const first =
            this.sha256(seedA);

        const second =
            this.sha256(first);

        return {

            matches:
                second ===
                this.normalizeSeed(seedB),

            calculated:
                second,

            target:
                this.normalizeSeed(seedB)

        };

    }


    /*
    -------------------------------------------------
    Test relation HMAC
    -------------------------------------------------
    */

    static testHmac(
        seedA,
        seedB,
        message
    ) {

        const a =
            this.normalizeSeed(seedA);

        const b =
            this.normalizeSeed(seedB);

        const msg =
            String(message);

        const calculated =
            CryptoJS.HmacSHA256(
                msg,
                a
            ).toString(
                CryptoJS.enc.Hex
            );

        return {

            matches:
                calculated === b,

            calculated:
                calculated,

            target:
                b

        };

    }


    /*
    -------------------------------------------------
    Analyse de deux seeds consécutifs
    -------------------------------------------------
    */

    static compareSeeds(
        previous,
        current
    ) {

        const previousSeed =
            this.normalizeSeed(
                previous.serverSeed
            );

        const currentSeed =
            this.normalizeSeed(
                current.serverSeed
            );

        const hashCheck =
            this.verifyHash(
                currentSeed,
                current.serverSeedHash
            );

        const hamming =
            this.hammingDistance(
                previousSeed,
                currentSeed
            );

        const hexDiff =
            this.hexDifference(
                previousSeed,
                currentSeed
            );

        const shaChain =
            this.testShaChain(
                previousSeed,
                currentSeed
            );

        const doubleSha =
            this.testDoubleSha(
                previousSeed,
                currentSeed
            );

        const nonceMessage =
            String(
                previous.nonce
            );

        const hmac =
            this.testHmac(
                previousSeed,
                currentSeed,
                nonceMessage
            );

        return {

            previousNonce:
                previous.nonce,

            currentNonce:
                current.nonce,

            previousSeed:
                previousSeed,

            currentSeed:
                currentSeed,

            hashValid:
                hashCheck.valid,

            calculatedHash:
                hashCheck.calculatedHash,

            expectedHash:
                hashCheck.expectedHash,

            hammingDistance:
                hamming,

            hexDifference:
                hexDiff,

            shaChain:
                shaChain,

            doubleSha:
                doubleSha,

            hmacNonce:
                hmac

        };

    }


    /*
    -------------------------------------------------
    Analyse d'une série complète
    -------------------------------------------------
    */

    static analyzeSeries(records) {

        if (
            !Array.isArray(records) ||
            records.length < 2
        ) {

            return {

                success: false,

                error:
                    "Au moins deux seeds sont nécessaires."

            };

        }

        const comparisons = [];

        let validHashes = 0;

        let invalidHashes = 0;

        let totalHamming = 0;

        let hammingCount = 0;

        records.forEach(
            record => {

                const hashCheck =
                    this.verifyHash(
                        record.serverSeed,
                        record.serverSeedHash
                    );

                if (hashCheck.valid)
                    validHashes++;
                else
                    invalidHashes++;

            }
        );


        for (
            let i = 1;
            i < records.length;
            i++
        ) {

            const comparison =
                this.compareSeeds(
                    records[i - 1],
                    records[i]
                );

            comparisons.push(
                comparison
            );

            if (
                comparison.hammingDistance !== null
            ) {

                totalHamming +=
                    comparison.hammingDistance;

                hammingCount++;

            }

        }


        const averageHamming =
            hammingCount > 0
                ? totalHamming /
                  hammingCount
                : null;


        return {

            success: true,

            records:
                records.length,

            validHashes:
                validHashes,

            invalidHashes:
                invalidHashes,

            averageHamming:
                averageHamming,

            comparisons:
                comparisons

        };

    }


    /*
    -------------------------------------------------
    Rapport lisible
    -------------------------------------------------
    */

    static createReport(
        analysis
    ) {

        if (
            !analysis ||
            !analysis.success
        ) {

            return "Analyse impossible.";

        }

        let report =
            "SEED LAB\n\n";

        report +=
            "Seeds analysés : " +
            analysis.records +
            "\n";

        report +=
            "Hashes valides : " +
            analysis.validHashes +
            "\n";

        report +=
            "Hashes invalides : " +
            analysis.invalidHashes +
            "\n";

        if (
            analysis.averageHamming !== null
        ) {

            report +=
                "Distance Hamming moyenne : " +
                analysis.averageHamming
                    .toFixed(2) +
                " / 256\n";

        }

        report +=
            "\nRELATIONS TESTÉES\n";

        analysis.comparisons.forEach(
            (item, index) => {

                report +=
                    "\nTransition " +
                    (index + 1) +
                    " : " +
                    item.previousNonce +
                    " → " +
                    item.currentNonce +
                    "\n";

                report +=
                    "Hamming : " +
                    item.hammingDistance +
                    "/256\n";

                report +=
                    "Caractères hex différents : " +
                    item.hexDifference +
                    "/64\n";

                report +=
                    "SHA256(seed précédent) = seed suivant : " +
                    (
                        item.shaChain.matches
                            ? "OUI"
                            : "NON"
                    ) +
                    "\n";

                report +=
                    "SHA256²(seed précédent) = seed suivant : " +
                    (
                        item.doubleSha.matches
                            ? "OUI"
                            : "NON"
                    ) +
                    "\n";

                report +=
                    "HMAC-SHA256(seed précédent, nonce) = seed suivant : " +
                    (
                        item.hmacNonce.matches
                            ? "OUI"
                            : "NON"
                    ) +
                    "\n";

            }
        );

        return report;

    }

  }
