import { Exercise } from './exercise';

export class ExerciseInfo {
  exercises: Exercise[] = [];
  exerciseSelected: Exercise = new Exercise();
  loading: boolean = true;
  showList: boolean = false;

  constructor(exerciseInfo?: ExerciseInfo) {
    if (exerciseInfo) {
      this.update(exerciseInfo);
    }
  }

  updateExercises(exercises: Exercise[]): void {
    this.exercises = exercises;
  }

  updateExerciseSelected(exerciseSelected: Exercise): void {
    this.exerciseSelected.update(exerciseSelected);
  }

  updateLoading(isLoading: boolean): void {
    this.loading = isLoading;
  }

  update(exerciseInfo: ExerciseInfo): void {
    Object.assign(this, exerciseInfo);
  }

  setList(showAsList: boolean): void {
    this.showList = showAsList;
  }

  exerciseAmount(): number {
    return this.exercises.length;
  }
}
