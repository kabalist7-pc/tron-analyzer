/*
=====================================================
TRON ANALYZER
Version : 1.0
Fichier : kolmogorov_smirnov.js
=====================================================
*/

"use strict";

class KolmogorovSmirnovService {

    static values() {

        return StorageService
            .getHistory()
            .map(item => parseFloat(item.result))
            .filter(value => !isNaN(value))
            .sort((a, b) => a - b);

    }
  static statistic() {

    const values = this.values();

    const n = values.length;

    if (n === 0)
        return 0;

    let maxDifference = 0;

    values.forEach((value, index) => {

        const observed = (index + 1) / n;

        const expected = value / 100;

        const difference =
            Math.abs(observed - expected);

        if (difference > maxDifference)
            maxDifference = difference;

    });

    return maxDifference;

  }
  
  static diagnosis() {

    const n = this.values().length;

    if (n < 100)
        return "Échantillon insuffisant";

    const d = this.statistic();

    const critical = 1.36 / Math.sqrt(n);

    if (d <= critical)
        return "Distribution compatible";

    return "Écart statistique détecté";

  }

  static refresh() {

    document.getElementById("ksStatistic").textContent =
        this.statistic().toFixed(4);

    document.getElementById("ksDiagnosis").textContent =
        this.diagnosis();

  }
  }

