/*
=====================================================
TRON ANALYZER
Version : 2.0
Fichier : storage.js
=====================================================
*/

"use strict";

class StorageService {

    static KEY = "tron_analyzer_history_v2";

    static getHistory() {

        try {

            const raw = localStorage.getItem(this.KEY);

            if (!raw) return [];

            return JSON.parse(raw);

        }

        catch (e) {

            console.error(e);

            return [];

        }

    }

    static saveAnalysis(data) {

        const history = this.getHistory();

        // Évite les doublons (jeu + nonce)
        const exists = history.find(item =>

            item.game === data.game &&
            item.nonce === data.nonce

        );

        if (exists) return;

        history.unshift({

            game: data.game || "-",

            nonce: data.nonce || "-",

            result: data.result || "-",

            serverSeed: data.serverSeed || "",

            clientSeed: data.clientSeed || "",

            hash: data.hash || "",

            url: data.url || "",

            createdAt:

                data.createdAt ||

                new Date().toISOString()

        });

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
