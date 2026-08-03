class StatisticsService {

    static refresh() {

        const total = HistoryService.count();

        console.log("Analyses :", total);

        return {

            analyses: total

        };

    }

}
