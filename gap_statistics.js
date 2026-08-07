/*
=====================================================
TRON ANALYZER
Version : 1.0
Fichier : gap_statistics.js
=====================================================
*/

"use strict";

class GapStatisticsService {

    static values() {

        return StorageService
            .getHistory()
            .map(item => parseFloat(item.result))
            .filter(value => !isNaN(value));

    } 
  
    static gaps(limit, above = true) {

        const values = this.values();

        const gaps = [];

        let lastIndex = null;

        values.forEach((value, index) => {

            const match = above
                ? value > limit
                : value < limit;

            if (match) {

                if (lastIndex !== null) {

                    gaps.push(index - lastIndex);

                }

                lastIndex = index;

            }

        });

        return gaps;

    }

    static minimumGap(limit, above = true) {

        const gaps = this.gaps(limit, above);

        return gaps.length
            ? Math.min(...gaps)
            : 0;

    }

    static maximumGap(limit, above = true) {

        const gaps = this.gaps(limit, above);

        return gaps.length
            ? Math.max(...gaps)
            : 0;

    }

    static averageGap(limit, above = true) {

        const gaps = this.gaps(limit, above);

        if (gaps.length === 0)
            return 0;

        const sum = gaps.reduce(
            (a, b) => a + b,
            0
        );

        return sum / gaps.length;

    }   
  
    static refresh() {

        document.getElementById("gapMinAbove90").textContent =
            this.minimumGap(90, true);

        document.getElementById("gapAvgAbove90").textContent =
            this.averageGap(90, true).toFixed(2);

        document.getElementById("gapMaxAbove90").textContent =
            this.maximumGap(90, true);

        document.getElementById("gapMinBelow10").textContent =
            this.minimumGap(10, false);

        document.getElementById("gapAvgBelow10").textContent =
            this.averageGap(10, false).toFixed(2);

        document.getElementById("gapMaxBelow10").textContent =
            this.maximumGap(10, false);

    }

}
