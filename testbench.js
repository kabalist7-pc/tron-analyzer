/*
=========================================================
TRON ANALYZER
TESTBENCH V2
Calculateur Dice
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

    const b = result.bytes;

    console.log("");
    console.log("===== CALCUL DICE =====");

    console.log("Byte 0 :", b[0]);
    console.log("Byte 1 :", b[1]);
    console.log("Byte 2 :", b[2]);
    console.log("Byte 3 :", b[3]);

    const value =
        (b[0] / 256) +
        (b[1] / (256 * 256)) +
        (b[2] / (256 * 256 * 256)) +
        (b[3] / (256 * 256 * 256 * 256));

    console.log("Valeur :", value);

    const raw = value * 10000;

    console.log("Valeur x10000 :", raw);

    const integer = parseInt(raw);

    console.log("parseInt :", integer);

    const dice = (integer / 100).toFixed(2);

    console.log("");
    console.log("===== RESULTAT =====");
    console.log("Dice :", dice);
    console.log("Attendu :", "56.08");

    if (dice === "56.08") {

        console.log("✅ MATCH");

    } else {

        console.log("❌ MISMATCH");

    }

}
