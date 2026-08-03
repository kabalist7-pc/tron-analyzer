/*
=====================================================
TRON ANALYZER
Version : 1.0
Fichier : session_import.js
=====================================================
*/

"use strict";

class SessionImport {

    static import(text) {

        const lines = text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

        let imported = 0;

        for (const line of lines) {

            const data = parseProvablyFairLink(line);

            if (!data) {
                continue;
            }

            StorageService.saveAnalysis(data);

            imported++;

        }

        return {

            imported: imported,

            total: lines.length

        };

    }

}
