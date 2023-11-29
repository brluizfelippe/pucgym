import { History } from './history';
import { HistoryMonth } from './history-month';
export class HistoryInfo {
  histories: History[] = [];
  historySelected: History = new History();

  historyMonthsQty: HistoryMonth[] = [];
  historyMonthsDif: HistoryMonth[] = [];
  loading: boolean = true;

  constructor(historyInfo?: HistoryInfo) {
    if (historyInfo) {
      this.update(historyInfo);
    }
  }

  updateHistories(histories: History[]): void {
    this.histories = histories;
  }

  updateHistorySelected(historySelected: History): void {
    this.historySelected.update(historySelected);
  }

  updateLoading(isLoading: boolean): void {
    this.loading = isLoading;
  }

  updateHistoryMonthQty(historyMonthsQty: HistoryMonth[]) {
    this.historyMonthsQty = historyMonthsQty;
  }
  updateHistoryMonthDif(historyMonthsDif: HistoryMonth[]) {
    this.historyMonthsDif = historyMonthsDif;
  }
  update(historyInfo: HistoryInfo): void {
    Object.assign(this, historyInfo);
  }

  historyAmount(): number {
    return this.histories.length;
  }
  loadPerMonth(): Record<string, number> {
    const monthlySums: Record<string, number> = {};

    this.histories.forEach((item) => {
      // Extract the year and month from the Date object
      const year = item.date.getFullYear();
      const month = item.date.getMonth() + 1; // getMonth() returns 0-11
      const yearMonth = `${year}-${month.toString().padStart(2, '0')}`; // YYYY-MM format

      // Initialize the month sum if not already done
      if (!monthlySums[yearMonth]) {
        monthlySums[yearMonth] = 0;
      }

      // Add the value to the month sum
      monthlySums[yearMonth] += item.value;
    });

    return monthlySums;
  }
}
