class HistoryService {

    static list() {

        return StorageService.getHistory();

    }

    static count() {

        return this.list().length;

    }

}
