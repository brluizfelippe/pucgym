import { Profile } from './profile';

export class ProfileInfo {
  profiles: Array<Profile> = [];
  profileSelected: Profile = new Profile();
  loading: boolean = true;
  showList: boolean = false;

  constructor(profileInfo?: Partial<ProfileInfo>) {
    if (profileInfo) {
      this.update(profileInfo);
    }
  }

  /**
   * Updates the profiles array.
   *
   * @param profiles - An array of Profile objects.
   */
  updateProfiles(profiles: Array<Profile>): void {
    this.profiles = profiles;
  }

  /**
   * Updates the selected profile.
   *
   * @param profileSelected - A Profile object.
   */
  updateProfileSelected(profileSelected: Profile): void {
    this.profileSelected.update(profileSelected);
  }

  /**
   * Updates the loading state.
   *
   * @param value - A boolean representing the loading state.
   */
  updateLoading(value: boolean): void {
    this.loading = value;
  }

  /**
   * Updates the ProfileInfo properties based on another ProfileInfo object.
   *
   * @param profileInfo - A ProfileInfo object.
   */
  update(profileInfo: Partial<ProfileInfo>): void {
    if (profileInfo.profiles) this.updateProfiles(profileInfo.profiles);
    if (profileInfo.profileSelected)
      this.updateProfileSelected(profileInfo.profileSelected);
    if (profileInfo.loading !== undefined)
      this.updateLoading(profileInfo.loading);
    if (profileInfo.showList !== undefined)
      this.showList = profileInfo.showList;
  }

  /**
   * Sets the visibility of the profile list.
   *
   * @param showAsList - A boolean to show or hide the profile list.
   */
  setList(showAsList: boolean): void {
    this.showList = showAsList;
  }

  /**
   * Gets the total number of profiles.
   *
   * @returns The number of profiles.
   */
  public ProfileAmount(): number {
    return this.profiles.length;
  }
}
