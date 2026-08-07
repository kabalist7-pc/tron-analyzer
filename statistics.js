/*
=====================================================
TRON ANALYZER
Version : 1.0
Fichier : statistics.js
=====================================================
*/

"use strict";

class StatisticsService {

    static history() {

        return StorageService.getHistory();

    }

    static total() {

        return this.history().length;

    }

    static values() {

        return this.history().map(item =>

            parseFloat(item.result)

        ).filter(value =>

            !isNaN(value)

        );

    }

    static minimum() {

        const values = this.values();

        if(values.length === 0) return null;

        return Math.min(...values);

    }

    static maximum() {

        const values = this.values();

        if(values.length === 0) return null;

        return Math.max(...values);

    }

    static average() {

        const values = this.values();

        if(values.length === 0) return null;

        const total = values.reduce(

            (sum,value)=>sum+value,

            0

        );

        return total / values.length;

    }

    static first() {

        const history = this.history();

        if(history.length===0) return null;

        return history[history.length-1];

    }

    static last() {

        const history = this.history();

        if(history.length===0) return null;

        return history[0];

    }

}
