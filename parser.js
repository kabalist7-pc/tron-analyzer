function parseProvablyFairLink(link) {

    try {

        const url = new URL(link);

        return {

            game: url.searchParams.get("game") || "",

            nonce: url.searchParams.get("nonce") || "",

            serverSeed: url.searchParams.get("server_seed") || "",

            clientSeed: url.searchParams.get("client_seed") || "",

            hash: url.searchParams.get("hash") || ""

        };

    } catch (e) {

        return null;

    }

}
