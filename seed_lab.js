/*
=====================================================
TRON ANALYZER
Seed Lab V2
Analyse des relations entre Server Seeds
=====================================================
*/

"use strict";

const SeedLabService = {

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


    normalizeSeed(seed) {

        return String(seed || "")
            .trim()
            .toLowerCase();

    },


    validateHash(seed, expectedHash) {

        const calculated =
            this.sha256(seed);

        return (
            calculated ===
            this.normalizeSeed(expectedHash)
        );

    },


    hammingDistanceHex(seedA, seedB) {

        const a =
            this.normalizeSeed(seedA);

        const b =
            this.normalizeSeed(seedB);

        if (
            a.length !== 64 ||
            b.length !== 64
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


    hexDifference(seedA, seedB) {

        const a =
            this.normalizeSeed(seedA);

        const b =
            this.normalizeSeed(seedB);

        if (
            a.length !== 64 ||
            b.length !== 64
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


    testSHA256Relation(
        previous,
        next
    ) {

        return (
            this.sha256(previous) ===
            this.normalizeSeed(next)
        );

    },


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


    analyzeTransition(
        previous,
        next
    ) {

        const hamming =
            this.hammingDistanceHex(
                previous.serverSeed,
                next.serverSeed
            );

        const hexDifference =
            this.hexDifference(
                previous.serverSeed,
                next.serverSeed
            );

        return {

            fromNonce:
                previous.nonce,

            toNonce:
                next.nonce,

            hamming,

            hexDifference,

            sha256:
                this.testSHA256Relation(
                    previous.serverSeed,
                    next.serverSeed
                ),

            doubleSHA256:
                this.testDoubleSHA256Relation(
                    previous.serverSeed,
                    next.serverSeed
                ),

            hmac:
                this.testHMACRelation(
                    previous.serverSeed,
                    next.nonce,
                    next.serverSeed
                )

        };

    },


    analyzeSeries(records) {

        if (
            !Array.isArray(records) ||
            records.length === 0
        ) {

            return {

                total: 0,
                validHashes: 0,
                invalidHashes: 0,
                averageHamming: 0,
                transitions: []

            };

        }

        const normalized =
            records.map(record => ({

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

            }));


        let validHashes = 0;

        let invalidHashes = 0;

        normalized.forEach(record => {

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


        const transitions = [];

        let hammingSum = 0;

        let hammingCount = 0;

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

        }


        return {

            total:
                normalized.length,

            validHashes,

            invalidHashes,

            averageHamming:
                hammingCount
                    ? hammingSum /
                      hammingCount
                    : 0,

            transitions

        };

    },


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
                            <span>SHA-256</span>
                            <span>
                                ${item.sha256
                                    ? "✅ OUI"
                                    : "❌ NON"}
                            </span>
                        </div>

                        <div class="row">
                            <span>Double SHA-256</span>
                            <span>
                                ${item.doubleSHA256
                                    ? "✅ OUI"
                                    : "❌ NON"}
                            </span>
                        </div>

                        <div class="row">
                            <span>HMAC-SHA256</span>
                            <span>
                                ${item.hmac
                                    ? "✅ OUI"
                                    : "❌ NON"}
                            </span>
                        </div>

                    </div>

                    <hr>

                `;

            }
        );


        container.innerHTML =
            html;

    }

};
