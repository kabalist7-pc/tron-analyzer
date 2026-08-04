/*
=========================================================
TRON ANALYZER
Version : 3.0
Fichier : crypto_engine.js
Livraison : Sprint 1 - Partie 1
=========================================================
*/

"use strict";

class CryptoEngine {

    /*
     * Encode une chaîne UTF-8
     */
    static encoder(text) {
        return new TextEncoder().encode(text);
    }

    /*
     * Convertit ArrayBuffer -> Uint8Array
     */
    static toUint8(buffer) {
        return new Uint8Array(buffer);
    }

    /*
     * Convertit Uint8Array -> Tableau JS
     */
    static toArray(bytes) {
        return Array.from(bytes);
    }

    /*
     * Convertit les octets en HEX
     */
    static toHex(bytes) {

        return bytes
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");

    }

    /*
     * Convertit les octets en Base64
     */
    static toBase64(bytes) {

        let binary = "";

        bytes.forEach(b => {

            binary += String.fromCharCode(b);

        });

        return btoa(binary);

    }

    /*
     * HMAC SHA-256
     */
    static async hmac(message, key) {

        const cryptoKey =
            await crypto.subtle.importKey(

                "raw",

                this.encoder(key),

                {

                    name: "HMAC",

                    hash: "SHA-256"

                },

                false,

                ["sign"]

            );

        const signature =
            await crypto.subtle.sign(

                "HMAC",

                cryptoKey,

                this.encoder(message)

            );

        const bytes =
            this.toArray(
                this.toUint8(signature)
            );

        return {

            bytes,

            hex: this.toHex(bytes),

            base64: this.toBase64(bytes)

        };

    }

}
