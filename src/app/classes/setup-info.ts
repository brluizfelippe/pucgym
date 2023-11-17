import { Setup } from './setup';

export class SetupInfo {
  constructor() {
    this.setups = [];
    this.loading = true;
    this.showList = false;
  }

  setups: Array<Setup>;
  setupSelected = new Setup();
  loading: boolean;
  showList: boolean;

  updateSetups(setups: Array<Setup>) {
    this.setups = setups;
  }
  updateSetupSelected(setupSelected: Setup) {
    this.setupSelected.update(setupSelected);
  }
  updateLoading(value: boolean) {
    this.loading = value;
  }
  update(setupInfo: SetupInfo) {
    this.updateSetups(setupInfo.setups);
    this.updateSetupSelected(setupInfo.setupSelected);
    this.updateLoading(setupInfo.loading);
  }
  setList(showAsList: boolean) {
    this.showList = showAsList;
  }

  public setupAmount() {
    return this.setups === undefined ? 0 : this.setups.length;
  }
}
