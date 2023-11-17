import { User } from './user';

export class UserInfo {
  users: Array<User>;
  userSelected = new User();
  loading: boolean;
  constructor() {
    this.users = [];
    this.loading = true;
  }
  updateUsers(users: Array<User>) {
    this.users = users;
  }
  updateUserSelected(userSelected: User) {
    this.userSelected.update(userSelected);
  }
  updateLoading(value: boolean) {
    this.loading = value;
  }
  update(userInfo: UserInfo) {
    this.updateUsers(userInfo.users);
    this.updateUserSelected(userInfo.userSelected);
    this.updateLoading(userInfo.loading);
  }

  public userAmount() {
    return this.users === undefined ? 0 : this.users.length;
  }
}
