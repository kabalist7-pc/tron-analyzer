/*
=====================================================
TRON ANALYZER
Version : 1.0
Fichier : chi_square.js
=====================================================
*/

"use strict";

class ChiSquareService {

    static values() {

        return StorageService
            .getHistory()
            .map(item => parseFloat(item.result))
            .filter(value => !isNaN(value));

    }
  static observed() {

    const buckets = Array(10).fill(0);

    this.values().forEach(value => {

        let index = Math.floor(value / 10);

        if (index > 9)
            index = 9;

        buckets[index]++;

    });

    return buckets;

}

static expected() {

    const total = this.values().length;

    return Array(10).fill(total / 10);

}
  
static chiSquare() {

    const observed = this.observed();
    const expected = this.expected();

    let chi = 0;

    for (let i = 0; i < observed.length; i++) {

        chi += Math.pow(
            observed[i] - expected[i],
            2
        ) / expected[i];

    }

    return chi;

}
  static refresh() {

    const chi = this.chiSquare();

    document.getElementById("chiSquareValue").textContent =
        chi.toFixed(2);

    let status = "En attente";

    if (this.values().length < 100) {

        status = "Échantillon insuffisant";

    } else if (chi < 8) {

        status = "🟢 Distribution proche de l'uniforme";

    } else if (chi < 16.92) {

        status = "🟡 Écart modéré";

    } else {

        status = "🔴 Écart important";

    }

    document.getElementById("chiSquareStatus").textContent =
        status;

  }
}
