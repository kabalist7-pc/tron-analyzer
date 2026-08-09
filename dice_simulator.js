/*
=====================================================
TRON ANALYZER
Version : 1.0
Fichier : dice_simulator.js
=====================================================
*/

"use strict";

class DiceSimulatorService {

    static generateSeed(length = 64) {

        const characters =
            "0123456789abcdef";

        let seed = "";

        for (let i = 0; i < length; i++) {

            seed +=
                characters.charAt(
                    Math.floor(
                        Math.random() *
                        characters.length
                    )
                );

        }

        return seed;

    }

    static generateClientSeed(length = 16) {

        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
            "abcdefghijklmnopqrstuvwxyz" +
            "0123456789";

        let seed = "";

        for (let i = 0; i < length; i++) {

            seed +=
                characters.charAt(
                    Math.floor(
                        Math.random() *
                        characters.length
                    )
                );

        }

        return seed;

    }

    static generate(count = 1000) {

        const serverSeed =
            this.generateSeed();

        const clientSeed =
            this.generateClientSeed();

        const results = [];

        for (let nonce = 0; nonce < count; nonce++) {

            const result =
                ProvablyFairService.calculate(
                    serverSeed,
                    clientSeed,
                    nonce
                );

            results.push({

                source: "SIMULATION",

                game: "Dice",

                serverSeed:
                    serverSeed,

                clientSeed:
                    clientSeed,

                nonce:
                    nonce,

                result:
                    parseFloat(result),

                createdAt:
                    new Date().toISOString()

            });

        }

        return {

            source: "SIMULATION",

            game: "Dice",

            serverSeed:
                serverSeed,

            clientSeed:
                clientSeed,

            count:
                results.length,

            results:
                results

        };

    }

}
