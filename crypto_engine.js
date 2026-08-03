/*
=========================================================
TRON ANALYZER
Version : 2.2
Fichier : crypto_engine.js
Auteur : OpenAI
=========================================================
*/

"use strict";

class CryptoEngine {

    /**
     * Convertit une chaîne UTF-8 en Uint8Array
     */
    static encoder(text) {
        return new TextEncoder().encode(text);
    }

    /**
     * Convertit ArrayBuffer -> tableau d'octets
     */
    static toBytes(buffer) {
        return Array.from(new Uint8Array(buffer));
    }

    /**
     * Calcule HMAC SHA-256
     */
    static async hmacSHA256(message, key) {

        const cryptoKey = await crypto.subtle.importKey(
            "raw",
            this.encoder(key),
            {
                name: "HMAC",
                hash: "SHA-256"
            },
            false,
            ["sign"]
        );

        const signature = await crypto.subtle.sign(
            "HMAC",
            cryptoKey,
            this.encoder(message)
        );

        return this.toBytes(signature);

    }

}
