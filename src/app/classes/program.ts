import { Auth } from './auth';
import { Training } from './training';

export class Program {
  constructor() {
    this.id = -1;
    this.name = '';
    this.trainings = [];
    this.showDetail = false;
    this.showVideo = false;
  }
  id: number;
  name: string;
  trainings: Training[];
  showDetail: boolean;
  showVideo: boolean;

  update(program: Program) {
    this.id = program.id;
    this.name = program.name;
    this.trainings = program.trainings;
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
