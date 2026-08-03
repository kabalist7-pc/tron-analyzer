/*
=====================================================
TRON ANALYZER
Version : 1.0
Fichier : statistics.js
=====================================================
*/

"use strict";

class StatisticsService {

    static refresh() {

        const history = StorageService.getHistory();

        const stats = {

            analyses: history.length,

            dice: 0,

            latestNonce: "-",

            latestGame: "-",

            latestDate: "-"

        };

        if (history.length > 0) {

            stats.latestNonce = history[0].nonce || "-";

            stats.latestGame = history[0].game || "-";

            stats.latestDate = history[0].createdAt || "-";

            stats.dice = history.filter(

                item => item.game === "Dice"

            ).length;

        }

        return stats;

    }

}
