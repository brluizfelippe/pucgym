import { Training } from './training';

export class TrainingInfo {
  trainings: Array<Training>;
  trainingSelected = new Training();
  loading: boolean;
  showList: boolean;
  constructor() {
    this.trainings = [];
    this.loading = true;
    this.showList = false;
  }
  updateTrainings(trainings: Array<Training>) {
    this.trainings = trainings;
  }
  updateTrainingSelected(trainingSelected: Training) {
    this.trainingSelected.update(trainingSelected);
  }
  updateLoading(value: boolean) {
    this.loading = value;
  }
  update(trainingInfo: TrainingInfo) {
    this.updateTrainings(trainingInfo.trainings);
    this.updateTrainingSelected(trainingInfo.trainingSelected);
    this.updateLoading(trainingInfo.loading);
  }
  setList(showAsList: boolean) {
    this.showList = showAsList;
  }
  public trainingAmount() {
    return this.trainings === undefined ? 0 : this.trainings.length;
  }
}
