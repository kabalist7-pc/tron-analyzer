/*
=====================================================
TRON ANALYZER
Version : 1.0
Fichier : provably_fair.js
=====================================================
*/

"use strict";

class ProvablyFairService {

    static base64ToDec(str) {

        const raw = atob(str);

        const decs = [];

        for (let i = 0; i < raw.length; i++) {

            const hex =
                raw.charCodeAt(i).toString(16);

            const dec =
                parseInt(hex, 16);

            decs.push(dec);

        }

        return decs;

    }

    static calculate(serverSeed, clientSeed, nonce) {

        const hash =
            CryptoJS.HmacSHA256(
                clientSeed + ":" + nonce,
                serverSeed
            );

        const hashInBase64 =
            CryptoJS.enc.Base64.stringify(hash);

        const hashInDecs =
            this.base64ToDec(hashInBase64);

        const number =
            parseInt(
                (
                    hashInDecs[0] / 256 +
                    hashInDecs[1] / Math.pow(256, 2) +
                    hashInDecs[2] / Math.pow(256, 3) +
                    hashInDecs[3] / Math.pow(256, 4)
                ) * 10000
            );

        return (number / 100).toFixed(2);

    }
    static verify(
    serverSeed,
    clientSeed,
    nonce,
    expectedResult
) {

    const calculatedResult =
        this.calculate(
            serverSeed,
            clientSeed,
            nonce
        );

    const calculated =
        parseFloat(calculatedResult);

    const expected =
        parseFloat(expectedResult);

    const valid =
        !isNaN(calculated) &&
        !isNaN(expected) &&
        calculated === expected;

    return {

        valid: valid,

        calculatedResult:
            calculatedResult,

        expectedResult:
            expectedResult

    };

    }

}
