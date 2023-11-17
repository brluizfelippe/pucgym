import { Exercise } from './exercise';

export class History {
  id: number;
  event: string;
  value: number;
  date: Date;
  idUser: number;
  exercise: Exercise;

  constructor(history?: Partial<History>) {
    this.id = history?.id ?? -1;
    this.event = history?.event ?? '';
    this.value = history?.value ?? 0;
    this.date = history?.date ?? new Date();
    this.idUser = history?.idUser ?? -1;
    this.exercise = history?.exercise ?? new Exercise();
  }

  update(history: History): void {
    this.id = history.id;
    this.event = history.event;
    this.value = history.value;
    this.date = history.date;
    this.idUser = history.idUser;
    this.exercise = history.exercise;
  }
}
