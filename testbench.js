/*
=========================================================
TRON ANALYZER
TESTBENCH V1
Sprint 1 - Livraison 1 - Partie 2
=========================================================
*/

"use strict";

async function runCryptoTest() {

    const serverSeed =
        "48789882eae0323fb5c2576eb5b46abe24d827fe304f26c7c1aea027c004d2c6";

    const clientSeed =
        "Angegardienpc@";

    const nonce =
        "617843";

    const message =
        clientSeed + ":" + nonce;

    const result =
        await CryptoEngine.hmac(
            message,
            serverSeed
        );

    console.log("===== TEST CRYPTO =====");

    console.log("Message :", message);

    console.log("HEX :", result.hex);

    console.log("BASE64 :", result.base64);

    console.log("BYTES :", result.bytes);

}
