/*
=====================================================
TRON ANALYZER
Version : 1.0
Fichier : streak_statistics.js
=====================================================
*/

"use strict";

class StreakStatisticsService {
    static values() {

        return StorageService
            .getHistory()
            .map(item => parseFloat(item.result))
            .filter(value => !isNaN(value));

    }

    static longestBelow(limit) {

        let current = 0;
        let longest = 0;

        this.values().forEach(value => {

            if (value < limit) {

                current++;

                if (current > longest)
                    longest = current;

            } else {

                current = 0;

            }

        });

        return longest;

    }

    static longestAbove(limit) {

        let current = 0;
        let longest = 0;

        this.values().forEach(value => {

            if (value > limit) {

                current++;

                if (current > longest)
                    longest = current;

            } else {

                current = 0;

            }

        });

        return longest;
    }

    static currentBelow(limit) {

        const values = [...this.values()].reverse();

        let current = 0;

        for (const value of values) {

            if (value < limit) {

                current++;

            } else {

                break;

            }

        }

        return current;

    }

    static currentAbove(limit) {

        const values = [...this.values()].reverse();

        let current = 0;

        for (const value of values) {

            if (value > limit) {

                current++;

            } else {

                break;

            }

        }

        return current;

    }    
  
  static refresh() {

        document.getElementById("longBelow10").textContent =
            this.longestBelow(10);

        document.getElementById("longBelow50").textContent =
            this.longestBelow(50);

        document.getElementById("longAbove50").textContent =
            this.longestAbove(50);

        document.getElementById("longAbove90").textContent =
            this.longestAbove(90);

        document.getElementById("currentBelow50").textContent =
            this.currentBelow(50);

        document.getElementById("currentAbove50").textContent =
            this.currentAbove(50);

    }
}
