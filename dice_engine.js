/*
=========================================================
TRON ANALYZER
Version : 3.0
Fichier : dice_engine.js
=========================================================
*/

"use strict";

class DiceEngine {

    /**
     * Calcule le résultat Dice
     * Retourne un objet complet pour faciliter le débogage
     */
    static async calculate(serverSeed, clientSeed, nonce) {

        const message = clientSeed + ":" + nonce;

        const cryptoResult =
            await CryptoEngine.hmac(
                message,
                serverSeed
            );

        const b = cryptoResult.bytes;

        const value =
            (b[0] / 256) +
            (b[1] / (256 * 256)) +
            (b[2] / (256 * 256 * 256)) +
            (b[3] / (256 * 256 * 256 * 256));

        const raw = value * 10000;

        const integer = parseInt(raw);

        const dice =
            (integer / 100).toFixed(2);

        return {

            message,

            bytes: b,

            hex: cryptoResult.hex,

            base64: cryptoResult.base64,

            value,

            raw,

            integer,

            dice

        };

    }

}
