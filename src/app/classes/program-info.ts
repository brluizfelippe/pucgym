import { Program } from './program';

export class ProgramInfo {
  constructor() {
    this.programs = [];
    this.loading = true;
    this.showList = false;
  }
  programs: Array<Program>;
  programSelected = new Program();
  loading: boolean;
  showList: boolean;

  updatePrograms(programs: Array<Program>) {
    this.programs = programs;
  }
  updateProgramSelected(programSelected: Program) {
    this.programSelected.update(programSelected);
  }
  updateLoading(value: boolean) {
    this.loading = value;
  }
  update(programInfo: ProgramInfo) {
    this.updatePrograms(programInfo.programs);
    this.updateProgramSelected(programInfo.programSelected);
    this.updateLoading(programInfo.loading);
  }
  setList(showAsList: boolean) {
    this.showList = showAsList;
  }
  public programAmount() {
    return this.programs === undefined ? 0 : this.programs.length;
  }
}
