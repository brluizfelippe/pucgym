export class Profile {
  id: number = -1;
  name: string = '';

  constructor(profile?: Partial<Profile>) {
    if (profile) {
      this.update(profile);
    }
  }

  /**
   * Updates the profile properties based on another Profile object.
   *
   * @param profile - An object containing the profile properties to be updated.
   */
  update(profile: Partial<Profile>): void {
    if (profile.id !== undefined) this.id = profile.id;
    if (profile.name) this.name = profile.name;
  }
}
