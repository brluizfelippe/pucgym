import { Auth } from './auth';
import { Equipment } from './equipment';
import { Muscle } from './muscle';
import { Video } from './video';

export class Exercise {
  id: number;
  name: string;
  equipments: Equipment[] = [];
  muscle: Muscle = new Muscle();
  video: Video = new Video();
  showDetail: boolean = false;
  showVideo: boolean = false;

  constructor(id: number = -1, name: string = '') {
    this.id = id;
    this.name = name;
  }

  update(exercise: Exercise): void {
    Object.assign(this, exercise);
  }

  updateVideo(video: Video): void {
    this.video = video;
  }

  setShowDetail(isVisible: boolean): void {
    this.showDetail = isVisible;
  }

  setShowVideo(isVisible: boolean): void {
    this.showVideo = isVisible;
  }

  exerciseColor(): string {
    return this.muscle.name.toUpperCase() === 'COSTAS' ? 'warning' : 'warning';
  }

  canEdit(authInfo: Auth): boolean {
    return authInfo.isAdmin;
  }
}
