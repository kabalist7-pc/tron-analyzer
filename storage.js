/*
=====================================================
TRON ANALYZER
Version : 1.0
Fichier : storage.js
=====================================================
*/

"use strict";

class StorageService {

    static KEY = "tron_analyzer_history_v1";

    static getHistory() {

        try {

            const raw = localStorage.getItem(this.KEY);

            if (!raw) return [];

            return JSON.parse(raw);

        } catch (e) {

            console.error(e);

            return [];

        }

    }

    static saveAnalysis(data) {

        const history = this.getHistory();

        // Évite les doublons sur le nonce
        const exists = history.find(item => item.nonce === data.nonce);

        if (exists) return;

        history.unshift(data);

        localStorage.setItem(

            this.KEY,

            JSON.stringify(history)

        );

    }

    static clearHistory() {

        localStorage.removeItem(this.KEY);

    }

    static total() {

        return this.getHistory().length;

    }

}
