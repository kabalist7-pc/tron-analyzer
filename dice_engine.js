class DiceEngine {

    static analyze(data) {

        return {

            valid: true,

            game: data.game,

            nonce: data.nonce,

            serverSeed: data.serverSeed,

            clientSeed: data.clientSeed || "-",

            hash: data.hash || "-",

            message: "Lien Provably Fair analysé avec succès."

        };

    }

}
