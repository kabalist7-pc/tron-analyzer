/*
=====================================================
TRON ANALYZER
Version : 2.0
Fichier : parser.js
=====================================================
*/

"use strict";

function parseProvablyFairLink(link) {

    try {

        const url = new URL(link);

        // Vérifie que le lien provient bien de Tronpick
        if (!url.hostname.includes("tronpick.io")) {
            throw new Error("Lien Tronpick invalide");
        }

        const game = url.searchParams.get("game") || "";

        const nonce =
            url.searchParams.get("nonce") ||
            url.searchParams.get("round") ||
            "";

        const serverSeed =
            url.searchParams.get("server_seed") || "";

        const clientSeed =
            url.searchParams.get("client_seed") || "";

        const hash =
            url.searchParams.get("hash") || "";

        return {

            url: link,

            game,

            nonce,

            serverSeed,

            clientSeed,

            hash,

            createdAt: new Date().toISOString(),

            valid:
                game !== "" &&
                serverSeed !== ""

        };

    }

    catch (error) {

        console.error(error);

        return {

            valid: false,

            error: error.message

        };

    }

}
