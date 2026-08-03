/*
=====================================================
TRON ANALYZER
Version : 1.0
Fichier : parser.js
=====================================================
*/

"use strict";

function parseProvablyFairLink(link) {

    try {

        const url = new URL(link);

        return {

            url: link,

            game: url.searchParams.get("game") || "",

            nonce: url.searchParams.get("nonce") || "",

            serverSeed: url.searchParams.get("server_seed") || "",

            clientSeed: url.searchParams.get("client_seed") || "",

            hash: url.searchParams.get("hash") || "",

            createdAt: new Date().toISOString()

        };

    } catch (e) {

        console.error("Erreur du parseur :", e);

        return null;

    }

}
