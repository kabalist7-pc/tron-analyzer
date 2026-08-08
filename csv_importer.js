/*
=====================================================
TRON ANALYZER
Version : 1.0
Fichier : csv_importer.js
=====================================================
*/

"use strict";

class CSVImporterService {

    static parse(text) {

        if (!text || typeof text !== "string")
            return [];

        const lines =
            text
                .trim()
                .split(/\r?\n/)
                .filter(line => line.trim() !== "");

        if (lines.length < 2)
            return [];

        const headers =
            lines[0]
                .split(",")
                .map(header => header.trim());

        const rows = [];

        for (let i = 1; i < lines.length; i++) {

            const columns =
                lines[i]
                    .split(",")
                    .map(value => value.trim());

            const row = {};

            headers.forEach((header, index) => {

                row[header] =
                    columns[index] !== undefined
                        ? columns[index]
                        : "";

            });

            rows.push(row);

        }

        return rows;

    }
static normalize(rows) {

    return rows
        .map(row => {

            const result =
                parseFloat(
                    row.result ??
                    row.Result ??
                    row.RESULT ??
                    row.value ??
                    row.Value
                );

            if (isNaN(result))
                return null;

            return {

                nonce:
                    row.nonce ??
                    row.Nonce ??
                    row.NONCE ??
                    "",

                result: result,

                game:
                    row.game ??
                    row.Game ??
                    row.GAME ??
                    "Dice",

                createdAt:
                    row.createdAt ??
                    row.created_at ??
                    row.date ??
                    row.Date ??
                    new Date().toISOString()

            };

        })
        .filter(item => item !== null);

}
    static validate(rows) {

    const valid = [];

    rows.forEach(row => {

        if (!row)
            return;

        const result = parseFloat(row.result);

        if (isNaN(result))
            return;

        if (result < 0 || result >= 100)
            return;

        valid.push(row);

    });

    return valid;

    }
}
