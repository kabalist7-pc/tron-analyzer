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

}
