/*
=====================================================
TRON ANALYZER
Version : 1.0
Fichier : advanced_statistics.js
=====================================================
*/

"use strict";

class AdvancedStatisticsService {

    static values() {

        return StorageService
            .getHistory()
            .map(item => parseFloat(item.result))
            .filter(value => !isNaN(value));

    }

    static countBelow(limit) {

        return this.values()
            .filter(value => value < limit)
            .length;

    }

    static countAbove(limit) {

        return this.values()
            .filter(value => value > limit)
            .length;

    }

    static refresh() {

        document.getElementById("below5").textContent =
            this.countBelow(5);

        document.getElementById("below10").textContent =
            this.countBelow(10);

        document.getElementById("above90").textContent =
            this.countAbove(90);

        document.getElementById("above95").textContent =
            this.countAbove(95);

        document.getElementById("above99").textContent =
            this.countAbove(99);

    }

}
