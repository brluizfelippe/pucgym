export class HistoryMonth {
  qty: number;
  year: string;
  month: string;

  constructor(historyMonth?: Partial<HistoryMonth>) {
    this.qty = historyMonth?.qty ?? 0;
    this.year = historyMonth?.year ?? '';
    this.month = historyMonth?.month ?? '';
  }

  update(historyMonth: HistoryMonth): void {
    Object.assign(this, historyMonth);
  }
}
