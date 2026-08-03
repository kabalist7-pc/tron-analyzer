function analyse() {

    const link = document.getElementById("pfLink").value.trim();

    if (!link) {
        alert("Veuillez coller un lien Provably Fair.");
        return;
    }

    const data = parseProvablyFairLink(link);

    if (!data) {
        alert("Lien Provably Fair invalide.");
        return;
    }

    // Affichage
    document.getElementById("game").textContent = data.game || "-";
    document.getElementById("nonce").textContent = data.nonce || "-";
    document.getElementById("server").textContent = data.serverSeed || "-";
    document.getElementById("client").textContent = data.clientSeed || "-";
    document.getElementById("hash").textContent = data.hash || "-";

    // Analyse
    const result = DiceEngine.analyze(data);

    // Sauvegarde locale
    StorageService.saveAnalysis({
        game: data.game,
        nonce: data.nonce,
        serverSeed: data.serverSeed,
        clientSeed: data.clientSeed,
        hash: data.hash
    });

    // Statistiques
    const stats = StatisticsService.refresh();

    // Vérification
    document.getElementById("verification").innerHTML =
        result.message +
        "<br><br><b>Analyses enregistrées :</b> " +
        stats.analyses;

}
