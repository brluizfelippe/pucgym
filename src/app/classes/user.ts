import { Profile } from './profile';
import { Program } from './program';

export class User {
  id?: number;
  googleId?: string;
  imageUrl?: string;
  googleName?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  email?: string;
  profile = new Profile();
  program = new Program();

  constructor() {
    this.id = -1;
    this.googleId = undefined;
    this.imageUrl = undefined;
    this.googleName = undefined;
    this.firstName = undefined;
    this.lastName = undefined;
    this.password = undefined;
    this.email = undefined;
  }

  updateProfile(profile: Profile) {
    this.profile.update(profile);
  }
  updateProgram(program: Program) {
    this.program.update(program);
  }

  update(user: User) {
    this.id = user.id;
    this.googleId = user.googleId;
    this.imageUrl = user.imageUrl;
    this.googleName = user.googleName;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.password = user.password;
    this.email = user.email;
    this.profile.update(user.profile);
    this.program.update(user.program);
  }
}
