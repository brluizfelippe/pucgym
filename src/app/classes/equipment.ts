import { Video } from './video';

export class Equipment {
  constructor() {
    this.id = -1;
    this.name = '';
  }
  id: number;
  name: string;
  image = new Video();

  update(equipment: Equipment) {
    this.id = equipment.id;
    this.name = equipment.name;
    this.image.update(equipment.image);
  }
}
