import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Platform, IonRouterOutlet, AlertController } from '@ionic/angular';

import { Subscription } from 'rxjs';
import { Auth } from 'src/app/classes/auth';
import { Exercise } from 'src/app/classes/exercise';
import { ProfileInfo } from 'src/app/classes/profile-info';
import { Program } from 'src/app/classes/program';
import { ProgramInfo } from 'src/app/classes/program-info';
import { SetupInfo } from 'src/app/classes/setup-info';
import { Training } from 'src/app/classes/training';
import { TrainingInfo } from 'src/app/classes/training-info';
import { User } from 'src/app/classes/user';
import { UserInfo } from 'src/app/classes/user-info';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ProgramService } from 'src/app/services/program.service';
import { SetupService } from 'src/app/services/setup.service';
import { TrainingService } from 'src/app/services/training.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {
  authInfoStore = new Auth();
  userInfoStore = new UserInfo();
  profileInfoStore = new ProfileInfo();
  programInfoStore = new ProgramInfo();
  trainingInfoStore = new TrainingInfo();
  setupInfoStore = new SetupInfo();

  private authSub = new Subscription();
  private userSub = new Subscription();
  private profileSub = new Subscription();
  private programSub = new Subscription();
  private trainingSub = new Subscription();
  private setupSub = new Subscription();

  editUserItem!: boolean;
  editSetupItem!: boolean;
  newItem!: boolean;
  userSelectedIndex!: number;
  programSelectedIndex!: number;
  trainingSelectedIndex!: number;
  exerciseSelectedIndex!: number;
  showProgramDetail!: boolean;
  showTrainingDetail!: boolean;
  showExerciseDetail!: boolean;
  constructor(
    public authService: AuthService,
    public userService: UserService,
    public profileService: ProfileService,
    public programService: ProgramService,
    public trainingService: TrainingService,
    public setupService: SetupService,
    public router: Router,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet,
    public alertController: AlertController
  ) {
    this.platform.backButton.subscribeWithPriority(-1, () => {
      if (!this.routerOutlet.canGoBack()) {
        App.exitApp();
      }
    });
  }

  ngOnInit() {
    this.editUserItem = false;
    this.editSetupItem = false;
    this.newItem = false;
    this.showProgramDetail = false;
    this.showTrainingDetail = false;
    this.showExerciseDetail = false;

    this.authSub = this.authService.authInfoListener().subscribe((data) => {
      this.authInfoStore.update(data);
    });
    this.authInfoStore.update(this.authService.authInfo);

    this.userSub = this.userService
      .setPropertyListener()
      .subscribe((userData) => {
        this.userInfoStore.update(userData);
      });

    this.profileSub = this.profileService
      .setPropertyListener()
      .subscribe((profileData) => {
        this.profileInfoStore.update(profileData);
      });

    this.programSub = this.programService
      .setPropertyListener()
      .subscribe((programData) => {
        this.programInfoStore.update(programData);
      });

    this.trainingSub = this.trainingService
      .setPropertyListener()
      .subscribe((trainingData) => {
        this.trainingInfoStore.update(trainingData);
      });

    this.setupSub = this.setupService
      .setPropertyListener()
      .subscribe((setupData) => {
        this.setupInfoStore.update(setupData);
      });
  }

  ionViewWillEnter() {
    !this.authInfoStore.isLoggedIn
      ? this.authService.redirectOnUnauthorized()
      : (() => {
          this.profileService.getProfiles();
          this.programService.getPrograms();
          this.trainingService.getTrainings();
          this.userService.getUsers();
          this.setupService.getSetups();
        })();
  }

  onEditUser(index: number, user: User) {
    this.userService.onUserSelected(user);
    this.userSelectedIndex = index;
    this.editUserItem = true;
    this.showProgramDetail = false;
    this.showTrainingDetail = false;
    this.showExerciseDetail = false;
  }
  onEditSetup(
    exercise: Exercise,
    exerciseIndex: number,
    setValue: any,
    loadValue: any,
    repetitionValue: any,
    setup: any[]
  ) {
    if (setup.length) {
      this.setupInfoStore.setupSelected.id = setup[0].id;
    } else {
      this.setupInfoStore.setupSelected.id = -1;
    }

    this.setupInfoStore.setupSelected.exercise = exercise;
    this.setupInfoStore.setupSelected.set = setValue;
    this.setupInfoStore.setupSelected.load = loadValue;
    this.setupInfoStore.setupSelected.repetition = repetitionValue;
    this.editSetupItem = false;
  }

  onUpdate(form: NgForm, user: User) {
    this.setupService.onSetupSelected(this.setupInfoStore.setupSelected);
    this.setupInfoStore.setupSelected.id !== -1
      ? (() => {
          this.setupService.onUpdateSetup(this.userInfoStore.userSelected.id);
        })()
      : (() => {
          this.setupService.onCreateSetup(this.userInfoStore.userSelected.id);
        })();

    this.userInfoStore.userSelected.id = user.id;
    this.userInfoStore.userSelected.updateProfile(form.value.perfil);
    form.value.programa !== undefined
      ? this.userInfoStore.userSelected.updateProgram(form.value.programa)
      : (() => {
          let auxProgram = new Program();

          this.userInfoStore.userSelected.updateProgram(auxProgram);
        })();

    this.userService.onUserSelected(this.userInfoStore.userSelected);
    this.userService.onUpdateUser();
    this.editUserItem = false;
    this.userSelectedIndex = -1;
  }

  onReturn() {
    this.editUserItem = false;
    this.newItem = false;
    this.userSelectedIndex = -1;
  }
  onNew() {
    this.newItem = true;
  }
  onResetDetail() {
    this.showProgramDetail = false;
    this.showTrainingDetail = false;
    this.showExerciseDetail = false;
  }
  onProgramDetail(program: Program) {
    this.showProgramDetail = true;
    this.showTrainingDetail = false;
    this.programInfoStore.updateLoading(true);
    this.programService.onProgramSelected(program);
    this.programService.getProgram();
  }
  onCloseProgramDetail(program: Program) {
    this.showProgramDetail = false;
    this.showTrainingDetail = false;
  }
  onTrainingDetail(training: Training, index: number) {
    this.showTrainingDetail = true;
    this.trainingSelectedIndex = index;
    this.showExerciseDetail = false;
    this.trainingInfoStore.updateLoading(true);
    this.trainingService.onTrainingSelected(training);
    this.trainingService.getTraining();
  }
  onCloseTrainingDetail(training: Training, index: number) {
    this.showTrainingDetail = false;
    this.trainingSelectedIndex = index;
    this.showExerciseDetail = false;
  }
  onExerciseDetail(exercise: Exercise, index: number) {
    this.setupInfoStore.setups = [];
    this.showExerciseDetail = true;
    this.exerciseSelectedIndex = index;
    this.setupService.getSetup(this.userInfoStore.userSelected.id, exercise.id);
  }
  onCloseExerciseDetail(exercise: Exercise, index: number) {
    this.showExerciseDetail = false;
    this.exerciseSelectedIndex = index;
  }
  setEditSetup(value: boolean) {
    this.editSetupItem = value;
  }
  ngOnDestroy() {
    this.authSub.unsubscribe();
    this.userSub.unsubscribe();
    this.programSub.unsubscribe();
    this.trainingSub.unsubscribe();
    this.profileSub.unsubscribe();
    this.setupSub.unsubscribe();
  }
}
