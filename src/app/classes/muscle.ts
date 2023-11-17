export class Muscle {
  id: number;
  name: string;

  constructor(muscle?: Partial<Muscle>) {
    this.id = muscle?.id ?? -1;
    this.name = muscle?.name ?? '';
  }

  update(muscle: Muscle): void {
    this.id = muscle.id;
    this.name = muscle.name;
  }
}
