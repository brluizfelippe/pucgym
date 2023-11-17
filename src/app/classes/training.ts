import { Auth } from './auth';
import { Exercise } from './exercise';

export class Training {
  id: number;
  name: string;
  exercises: Exercise[];
  showDetail: boolean;
  showVideo: boolean;
  constructor() {
    this.id = -1;
    this.name = '';
    this.exercises = [];
    this.showDetail = false;
    this.showVideo = false;
  }
  update(training: Training) {
    this.id = training.id;
    this.name = training.name;
    this.updateExercises(training.exercises);
  }
  updateExercises(exercises: Exercise[]) {
    this.exercises = exercises;
  }
  setShowDetail(showDetail: boolean) {
    this.showDetail = showDetail;
  }
  setShowVideo(showVideo: boolean) {
    this.showVideo = showVideo;
  }

  canEdit(authInfo: Auth) {
    let canEdit;

    authInfo.isAdmin ? (canEdit = true) : (canEdit = false);

    return canEdit;
  }
}
