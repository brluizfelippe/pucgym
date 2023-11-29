import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonRouterOutlet, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Auth } from 'src/app/classes/auth';
import { AuthService } from 'src/app/services/auth.service';
import { App } from '@capacitor/app';
import { NgForm } from '@angular/forms';
import { TrainingService } from 'src/app/services/training.service';
import { ExerciseService } from 'src/app/services/exercise.service';
import { TrainingInfo } from 'src/app/classes/training-info';
import { ExerciseInfo } from 'src/app/classes/exercise-info';
import { SubSink } from 'subsink';
import { Training } from 'src/app/classes/training';
import { ProgramInfo } from 'src/app/classes/program-info';
import { ProgramService } from 'src/app/services/program.service';
import { Program } from 'src/app/classes/program';
import { Exercise } from 'src/app/classes/exercise';
import { SetupInfo } from 'src/app/classes/setup-info';
import { SetupService } from 'src/app/services/setup.service';
import { HistoryService } from 'src/app/services/history.service';
import { HistoryInfo } from 'src/app/classes/history-info';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  authInfoStore = new Auth();
  programInfoStore = new ProgramInfo();
  auxProgram = new Program();
  trainingInfoStore = new TrainingInfo();
  exerciseInfoStore = new ExerciseInfo();
  setupInfoStore = new SetupInfo();
  historyInfoStore = new HistoryInfo();

  private subs = new SubSink();

  editItem: boolean = false;
  newItem: boolean = false;
  showTraining: boolean = false;
  showExercise: boolean = false;
  trainingComplete: boolean = false;
  trainingSelectedIndex!: number;
  exerciseSelectedIndex!: number;
  showAddExercise!: boolean;
  showAddExerciseForNewTraining!: boolean;
  idExercise!: number;
  reportType1!: string;
  reportType2!: string;
  isToastOpen: boolean = false;
  showStats: boolean = false;

  constructor(
    public authService: AuthService,
    public programService: ProgramService,
    public trainingService: TrainingService,
    public exerciseService: ExerciseService,
    public setupService: SetupService,
    public historyService: HistoryService,
    public router: Router,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet,
    public alertController: AlertController
  ) {
    this.setupBackButtonHandler();
  }

  ngOnInit() {
    this.initializeSubscriptions();
  }

  private setupBackButtonHandler(): void {
    this.subs.add(
      this.platform.backButton.subscribeWithPriority(-1, () => {
        if (!this.routerOutlet.canGoBack()) {
          App.exitApp();
        }
      })
    );
  }

  resetStates() {
    this.editItem = false;
    this.newItem = false;
    this.showTraining = false;
    this.showExercise = false;
    this.trainingComplete = false;
    this.isToastOpen = false;
    this.showStats = false;
  }

  private initializeSubscriptions(): void {
    this.subs.add(
      this.authService.authInfoListener().subscribe((data) => {
        this.authInfoStore.update(data);
      }),

      this.programService.setPropertyListener().subscribe((programData) => {
        this.programInfoStore.update(programData);
      }),

      this.trainingService.setPropertyListener().subscribe((trainingData) => {
        this.trainingInfoStore.update(trainingData);
      }),

      this.exerciseService.setPropertyListener().subscribe((exerciseData) => {
        this.exerciseInfoStore.update(exerciseData);
      }),

      this.setupService.setPropertyListener().subscribe((setupData) => {
        this.setupInfoStore.update(setupData);
      })
    );
  }

  ionViewWillEnter() {
    if (!this.authService.authInfo.isLoggedIn) {
      this.authService.redirectOnUnauthorized();
    } else {
      this.loadData();
    }
  }

  private loadData(): void {
    this.authInfoStore.update(this.authService.authInfo);
    this.auxProgram.id = this.authInfoStore.idProgram;
    this.programService.onProgramSelected(this.auxProgram);
    this.programService.getProgram();
    this.trainingInfoStore.updateLoading(false);
    this.exerciseInfoStore.updateLoading(false);
    this.setupInfoStore.updateLoading(false);
    this.historyInfoStore.updateLoading(false);
  }

  onTrainingSelected(event: any) {
    this.trainingInfoStore.updateLoading(true);
    this.trainingSelectedIndex = -1;
    this.trainingService.onTrainingSelected(event.detail.value);
    this.trainingService.getTraining();
    this.showTraining = true;
    this.showExercise = false;
  }

  async onExerciseSelected(event: any) {
    this.resetExerciseSelection();
    await this.selectExercise(event.detail.value);
    await this.configureSetup(event.detail.value);
    this.displayExerciseAfterDelay();
    this.updateHistoryComponent(event.detail.value.id);
  }

  private updateHistoryComponent(idExercise: number) {
    this.idExercise = idExercise;
  }

  private resetExerciseSelection() {
    this.showExercise = false;
    this.exerciseSelectedIndex = -1;
  }

  private async selectExercise(exerciseValue: any) {
    this.exerciseInfoStore.updateLoading(true);
    this.exerciseService.onExerciseSelected(exerciseValue);
    await this.exerciseService.getExercise();
  }

  private configureSetup(exerciseValue: any) {
    this.setupInfoStore.updateLoading(true);
    this.setupInfoStore.setupSelected.user.id = this.authInfoStore.userId;
    this.setupInfoStore.setupSelected.exercise = exerciseValue;
    this.setupService.getSetup(this.authInfoStore.userId, exerciseValue.id);
  }

  private displayExerciseAfterDelay() {
    setTimeout(() => {
      this.showExercise = true;
    }, 20);
  }

  onEdit(index: number) {
    this.trainingSelectedIndex = index;
    this.editItem = true;
  }

  onUpdate(form: NgForm, training: Training) {
    this.trainingInfoStore.updateLoading(true);
    this.trainingInfoStore.trainingSelected.update(training);
    this.trainingInfoStore.trainingSelected.name = form.value.trainingName;

    this.trainingService.onTrainingSelected(
      this.trainingInfoStore.trainingSelected
    );
    this.trainingService.onUpdateTraining();
    this.editItem = false;
    this.trainingSelectedIndex = -1;
  }

  onReturn() {
    this.editItem = false;
    this.newItem = false;
    this.trainingSelectedIndex = -1;
  }
  onNew() {
    this.newItem = true;
  }
  onCreate(form: NgForm) {
    this.trainingInfoStore.updateLoading(true);
    this.trainingInfoStore.trainingSelected.name = form.value.trainingName;

    this.trainingService.onTrainingSelected(
      this.trainingInfoStore.trainingSelected
    );
    this.trainingService.onCreateTraining();
    this.newItem = false;
  }

  // #### Begining of Methods for managing exercises on new training #######
  onShowAddExerciseForNewTraining() {
    this.showAddExerciseForNewTraining = true;
  }
  onCloseAddExerciseForNewTraining() {
    this.showAddExerciseForNewTraining = false;
  }
  onAddExerciseForNewTraining(form: NgForm) {
    this.trainingInfoStore.trainingSelected.exercises.push(
      form.value.exAddedForNewTraining
    );
    this.showAddExerciseForNewTraining = false;
  }
  onRemoveExerciseForNewTraining(exerciseIndex: number) {
    this.trainingInfoStore.trainingSelected.exercises.splice(exerciseIndex, 1);
  }
  // #### End of Methods for managing exercises on new training
  // ##### Methods for managing exercises on existing training ######
  onShowAddExercise() {
    this.showAddExercise = true;
  }
  onCloseAddExercise() {
    this.showAddExercise = false;
  }
  onAddExercise(trainingIndex: number, form: NgForm) {
    this.trainingInfoStore.trainings[trainingIndex].exercises.push(
      form.value.newEx
    );
    this.showAddExercise = false;
  }
  onRemoveExercise(trainingIndex: number, exerciseIndex: number) {
    this.trainingInfoStore.trainings[trainingIndex].exercises.splice(
      exerciseIndex,
      1
    );
  }
  // ##### Methods for managing exercises on existing training ######

  async onConfirmFinishExercise() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirmação de encerramento',
      message:
        'Concluir exercício ' +
        this.exerciseInfoStore.exerciseSelected.name +
        '?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
          handler: (blah) => {},
        },
        {
          text: 'Confirmar',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.onFinishExercise();
            this.setOpen(this.trainingComplete);
          },
        },
      ],
    });

    await alert.present();
  }
  onFinishExercise() {
    this.setupInfoStore.updateLoading(true);
    const filteredArray = this.trainingInfoStore.trainings[0]?.exercises.filter(
      (item) => item.id !== this.exerciseInfoStore.exerciseSelected.id
    );
    this.trainingInfoStore.trainings[0]?.updateExercises(filteredArray);
    this.showExercise = false;
    this.checkTrainingComplete();
    this.setupService.onSetupSelected(this.setupInfoStore.setupSelected);
    this.setupService.onUpdateSetup(this.authService.authInfo.userId);
    this.registerHistory(
      'finishExercise',
      this.setupInfoStore.setupSelected.load,
      this.exerciseInfoStore.exerciseSelected.id
    );
  }
  private registerHistory(event: string, value: number, idExercise: number) {
    this.historyInfoStore.updateLoading(true);
    this.historyInfoStore.historySelected.event = event;
    this.historyInfoStore.historySelected.value = value;
    this.historyInfoStore.historySelected.exercise.id = idExercise;
    this.historyService.onCreateHistory(this.historyInfoStore.historySelected);
  }
  private checkTrainingComplete() {
    this.trainingComplete = this.trainingInfoStore.trainings[0]?.exercises
      .length
      ? false
      : true;
  }
  //########### Toast #################
  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }
  public toastButtons = [
    {
      text: 'FECHAR',
      role: 'cancel',
      handler: () => {
        this.resetStates();
      },
    },
  ];

  async setRoleMessage(ev: any) {
    const { role } = ev.detail;
    if (role === 'timeout') {
      this.resetStates();
    }
  }
  //########### Toast #################

  showStatsCard(value: boolean) {
    this.showStats = value;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
