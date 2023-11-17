import { History } from './history';
import { HistoryMonth } from './history-month';
export class HistoryInfo {
  histories: History[] = [];
  historySelected: History = new History();
  historyMonths: HistoryMonth[] = [];
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

  updateHistoryMonth(historyMonths: HistoryMonth[]) {
    this.historyMonths = historyMonths;
  }

  update(historyInfo: HistoryInfo): void {
    Object.assign(this, historyInfo);
  }

  historyAmount(): number {
    return this.histories.length;
  }
}
