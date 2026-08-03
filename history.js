/*
=====================================================
TRON ANALYZER
Version : 1.0
Fichier : history.js
=====================================================
*/

"use strict";

class HistoryService {

    static all() {

        return StorageService.getHistory();

    }

    static latest() {

        const history = this.all();

        if (history.length === 0) {

            return null;

        }

        return history[0];

    }

    static total() {

        return this.all().length;

    }

    static exists(nonce) {

        return this.all().some(

            item => item.nonce === nonce

        );

    }

}
