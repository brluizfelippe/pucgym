import { Muscle } from './muscle';

export class MuscleInfo {
  muscles: Muscle[] = [];
  muscleSelected: Muscle = new Muscle();
  loading: boolean = true;

  constructor(muscleInfo?: Partial<MuscleInfo>) {
    if (muscleInfo) {
      this.update(muscleInfo);
    }
  }

  /** Update muscles array */
  updateMuscles(muscles: Muscle[]): void {
    this.muscles = muscles;
  }

  /** Update selected muscle */
  updateMuscleSelected(muscleSelected: Muscle): void {
    this.muscleSelected.update(muscleSelected);
  }

  /** Update loading state */
  updateLoading(loading: boolean): void {
    this.loading = loading;
  }

  /** Update muscle info properties from another muscle info object */
  update(muscleInfo: Partial<MuscleInfo>): void {
    if (muscleInfo.muscles) this.updateMuscles(muscleInfo.muscles);
    if (muscleInfo.muscleSelected)
      this.updateMuscleSelected(muscleInfo.muscleSelected);
    if (muscleInfo.loading !== undefined)
      this.updateLoading(muscleInfo.loading);
  }

  /** Get the total number of muscles */
  public muscleAmount(): number {
    return this.muscles.length;
  }
}
