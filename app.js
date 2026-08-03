function analyse() {

    const link = document.getElementById("pfLink").value.trim();

    const data = parseProvablyFairLink(link);

    if (!data) {
        alert("Lien Provably Fair invalide.");
        return;
    }

    document.getElementById("game").textContent = data.game || "-";
    document.getElementById("nonce").textContent = data.nonce || "-";
    document.getElementById("server").textContent = data.serverSeed || "-";
}
