/*
=========================================================
TRON ANALYZER
Version : 1.0
Fichier : analysis_service.js
Sprint 4
=========================================================
*/

"use strict";

class AnalysisService {

    /**
     * Analyse un lien Provably Fair
     */
    static async analyzeLink(link) {

        const data = parseProvablyFairLink(link);

        if (!data.valid) {

            return {

                success: false,

                error: data.error || "Lien invalide"

            };

        }

        if (data.game !== "Dice") {

            return {

                success: false,

                error:
                    "Jeu non supporté : " + data.game

            };

        }

        const dice =
            await DiceEngine.calculate(

                data.serverSeed,

                data.clientSeed,

                data.nonce

            );

        const analysis = {

    success: true,

    game: data.game,

    nonce: data.nonce,

    result: dice.dice,

    serverSeed: data.serverSeed,

    serverSeedHash:
        data.serverSeedHash ||
        data.hash ||
        "",

    clientSeed: data.clientSeed,

    hash:
        data.serverSeedHash ||
        data.hash ||
        "",

    url: data.url,

    createdAt:
        data.createdAt,

    details: dice

};

        return analysis;

    }

}
