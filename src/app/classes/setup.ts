import { Auth } from './auth';
import { Exercise } from './exercise';
import { User } from './user';

export class Setup {
  id: number;
  user = new User();
  exercise = new Exercise();
  repetition: string;
  load: number;
  set: string;
  showDetail: boolean;
  showVideo: boolean;

  constructor() {
    this.id = -1;

    this.repetition = '';
    this.load = 0;
    this.set = '';
    this.showDetail = false;
    this.showVideo = false;
  }

  updateExercise(exercise: Exercise) {
    this.exercise = exercise;
  }

  updateUser(user: User) {
    this.user = user;
  }
  update(setup: Setup) {
    this.id = setup.id;
    this.user = setup.user;
    this.exercise = setup.exercise;
    this.repetition = setup.repetition;
    this.load = setup.load;
    this.set = setup.set;
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
