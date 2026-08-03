class StorageService {

    static KEY = "tron_analyzer_history";

    static getHistory() {
        const raw = localStorage.getItem(this.KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw);
        } catch (e) {
            return [];
        }
    }

    static saveAnalysis(item) {

        const history = this.getHistory();

        history.unshift({
            date: new Date().toISOString(),
            ...item
        });

        localStorage.setItem(
            this.KEY,
            JSON.stringify(history)
        );

    }

}
