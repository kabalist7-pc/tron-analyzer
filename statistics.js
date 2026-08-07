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
static distribution() {

    const ranges = {

        "0-10": 0,
        "10-20": 0,
        "20-30": 0,
        "30-40": 0,
        "40-50": 0,
        "50-60": 0,
        "60-70": 0,
        "70-80": 0,
        "80-90": 0,
        "90-100": 0

    };

    this.values().forEach(value => {

        if(value < 10)
            ranges["0-10"]++;

        else if(value < 20)
            ranges["10-20"]++;

        else if(value < 30)
            ranges["20-30"]++;

        else if(value < 40)
            ranges["30-40"]++;

        else if(value < 50)
            ranges["40-50"]++;

        else if(value < 60)
            ranges["50-60"]++;

        else if(value < 70)
            ranges["60-70"]++;

        else if(value < 80)
            ranges["70-80"]++;

        else if(value < 90)
            ranges["80-90"]++;

        else
            ranges["90-100"]++;

    });

    return ranges;

}
    }
static refresh() {

    const total = this.total();

    document.getElementById("statsTotal").textContent = total;

    if(total === 0){

        document.getElementById("statsMin").textContent = "-";
        document.getElementById("statsMax").textContent = "-";
        document.getElementById("statsAvg").textContent = "-";
        document.getElementById("statsFirst").textContent = "-";
        document.getElementById("statsLast").textContent = "-";

        return;

    }

    document.getElementById("statsMin").textContent =
        this.minimum().toFixed(2);

    document.getElementById("statsMax").textContent =
        this.maximum().toFixed(2);

    document.getElementById("statsAvg").textContent =
        this.average().toFixed(2);

    document.getElementById("statsFirst").textContent =
        this.first().result;

    document.getElementById("statsLast").textContent =
        this.last().result;

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
