/*
=====================================================
TRON ANALYZER
Version : 2.2
Fichier : storage.js
Compatible Seed Lab V3
=====================================================
*/

"use strict";

class StorageService {

    static KEY = "tron_analyzer_history_v2";


    /*
    =================================================
    CALCULER SHA-256 DU SERVER SEED
    =================================================
    */

    static async calculateServerSeedHash(serverSeed) {

        if (!serverSeed)
            return "";

        const encoder =
            new TextEncoder();

        const data =
            encoder.encode(serverSeed);

        const hashBuffer =
            await crypto.subtle.digest(
                "SHA-256",
                data
            );

        const hashArray =
            Array.from(
                new Uint8Array(hashBuffer)
            );

        return hashArray
            .map(byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
            )
            .join("");

    }


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

            return history.map(item => ({

                ...item,

                serverSeedHash:
                    item.serverSeedHash ||
                    item.hash ||
                    ""

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

    static async saveAnalysis(data) {

        const history =
            this.getHistory();


        /*
        =============================================
        ÉVITER LES DOUBLONS
        =============================================
        */

        const exists =
            history.find(item =>

                item.game === data.game &&
                String(item.nonce) ===
                String(data.nonce)

            );


        if (exists)
            return;


        /*
        =============================================
        HASH FOURNI OU CALCULÉ
        =============================================
        */

        let serverSeedHash =
            data.serverSeedHash ||
            data.hash ||
            "";


        /*
        Si aucun hash n'est présent,
        calcul du SHA-256 du Server Seed.
        */

        if (
            !serverSeedHash &&
            data.serverSeed
        ) {

            try {

                serverSeedHash =
                    await this
                        .calculateServerSeedHash(
                            data.serverSeed
                        );

            }

            catch (error) {

                console.error(
                    "Erreur calcul SHA-256 :",
                    error
                );

            }

        }


        /*
        =============================================
        ENREGISTREMENT
        =============================================
        */

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
            Compatibilité ancienne version
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

    static async importHistory(rows) {

        const history =
            this.getHistory();

        let imported = 0;


        for (
            const data of rows
        ) {

            const exists =
                history.find(item =>

                    item.game === data.game &&
                    String(item.nonce) ===
                    String(data.nonce)

                );


            if (exists)
                continue;


            let serverSeedHash =
                data.serverSeedHash ||
                data.hash ||
                "";


            /*
            Calcul automatique si nécessaire
            */

            if (
                !serverSeedHash &&
                data.serverSeed
            ) {

                try {

                    serverSeedHash =
                        await this
                            .calculateServerSeedHash(
                                data.serverSeed
                            );

                }

                catch (error) {

                    console.error(
                        "Erreur hash CSV :",
                        error
                    );

                }

            }


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

        }


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
