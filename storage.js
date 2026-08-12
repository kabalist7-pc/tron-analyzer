/*
=====================================================
TRON ANALYZER
Version : 2.1
Fichier : storage.js
Compatible Seed Lab V3
=====================================================
*/

"use strict";

class StorageService {

    static KEY = "tron_analyzer_history_v2";


    /*
    =================================================
    RÉCUPÉRER L'HISTORIQUE
    =================================================
    */

    static getHistory() {

        try {

            const raw =
                localStorage.getItem(
                    this.KEY
                );

            if (!raw)
                return [];


            const history =
                JSON.parse(raw);


            if (!Array.isArray(history))
                return [];


            /*
            Compatibilité avec les anciennes analyses.

            Ancien format :
                hash

            Nouveau format :
                serverSeedHash
            */

            return history.map(item => ({

                ...item,

                serverSeed:
                    item.serverSeed || "",

                serverSeedHash:
                    item.serverSeedHash ||
                    item.hash ||
                    "",

                hash:
                    item.hash ||
                    item.serverSeedHash ||
                    "",

                clientSeed:
                    item.clientSeed || "",

                url:
                    item.url || ""

            }));

        }

        catch (e) {

            console.error(
                "Erreur lecture historique :",
                e
            );

            return [];

        }

    }


    /*
    =================================================
    SAUVEGARDER UNE ANALYSE
    =================================================
    */

    static saveAnalysis(data) {

        const history =
            this.getHistory();


        /*
        Évite les doublons
        */

        const exists =
            history.find(item =>

                item.game === data.game &&
                String(item.nonce) ===
                String(data.nonce)

            );


        if (exists)
            return;


        const serverSeedHash =
            data.serverSeedHash ||
            data.hash ||
            "";


        history.unshift({

            game:
                data.game || "-",

            nonce:
                data.nonce || "-",

            result:
                data.result ?? "-",

            serverSeed:
                data.serverSeed || "",

            serverSeedHash:
                serverSeedHash,

            clientSeed:
                data.clientSeed || "",

            /*
            On conserve également
            l'ancien champ hash
            pour compatibilité.
            */

            hash:
                serverSeedHash,

            url:
                data.url || "",

            createdAt:
                data.createdAt ||
                new Date().toISOString()

        });


        localStorage.setItem(

            this.KEY,

            JSON.stringify(history)

        );

    }


    /*
    =================================================
    IMPORT CSV
    =================================================
    */

    static importHistory(rows) {

        const history =
            this.getHistory();

        let imported = 0;


        rows.forEach(data => {

            const exists =
                history.find(item =>

                    item.game === data.game &&
                    String(item.nonce) ===
                    String(data.nonce)

                );


            if (exists)
                return;


            const serverSeedHash =
                data.serverSeedHash ||
                data.hash ||
                "";


            history.push({

                game:
                    data.game || "Dice",

                nonce:
                    data.nonce || "",

                result:
                    data.result ?? "",

                serverSeed:
                    data.serverSeed || "",

                serverSeedHash:
                    serverSeedHash,

                clientSeed:
                    data.clientSeed || "",

                hash:
                    serverSeedHash,

                url:
                    data.url || "",

                createdAt:
                    data.createdAt ||
                    new Date().toISOString()

            });


            imported++;

        });


        localStorage.setItem(

            this.KEY,

            JSON.stringify(history)

        );


        return imported;

    }


    /*
    =================================================
    VIDER L'HISTORIQUE
    =================================================
    */

    static clearHistory() {

        localStorage.removeItem(
            this.KEY
        );

    }


    /*
    =================================================
    TOTAL
    =================================================
    */

    static total() {

        return this
            .getHistory()
            .length;

    }

        }
