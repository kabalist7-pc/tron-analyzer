/*
=========================================================
TRON ANALYZER
Version : 2.3
Fichier : dice_engine.js
=========================================================
*/

"use strict";

class DiceEngine {

    /**
     * Reproduit le calcul Dice de Tronpick
     */
    static async calculate(serverSeed, clientSeed, nonce) {

        const message = clientSeed + ":" + nonce;

        const bytes = await CryptoEngine.hmacSHA256(
            message,
            serverSeed
        );

        const value =
            (bytes[0] / 256) +
            (bytes[1] / (256 * 256)) +
            (bytes[2] / (256 * 256 * 256)) +
            (bytes[3] / (256 * 256 * 256 * 256));

        const number = parseInt(value * 10000);

        return (number / 100).toFixed(2);

    }

}
