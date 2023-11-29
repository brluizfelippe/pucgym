import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonRouterOutlet, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { SubSink } from 'subsink';
import { App } from '@capacitor/app';
import { Auth } from 'src/app/classes/auth';
import { ExerciseInfo } from 'src/app/classes/exercise-info';
import { TrainingInfo } from 'src/app/classes/training-info';
import { AuthService } from 'src/app/services/auth.service';
import { ExerciseService } from 'src/app/services/exercise.service';
import { TrainingService } from 'src/app/services/training.service';
import { NgForm } from '@angular/forms';
import { Training } from 'src/app/classes/training';

@Component({
  selector: 'app-training',
  templateUrl: './training.page.html',
  styleUrls: ['./training.page.scss'],
})
export class TrainingPage implements OnInit {
  authInfoStore = new Auth();
  trainingInfoStore = new TrainingInfo();
  exerciseInfoStore = new ExerciseInfo();
  private subs = new SubSink();

  editItem: boolean = false;
  newItem: boolean = false;
  trainingSelectedIndex!: number;
  exerciseSelectedIndex!: number;
  showAddExercise!: boolean;
  showAddExerciseForNewTraining!: boolean;
  constructor(
    public authService: AuthService,
    public trainingService: TrainingService,
    public exerciseService: ExerciseService,
    public router: Router,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet,
    public alertCtrl: AlertController
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

  private initializeSubscriptions(): void {
    this.subs.add(
      this.authService.authInfoListener().subscribe((data) => {
        this.authInfoStore.update(data);
      }),

      this.trainingService.setPropertyListener().subscribe((trainingData) => {
        this.trainingInfoStore.update(trainingData);
      }),

      this.exerciseService.setPropertyListener().subscribe((exerciseData) => {
        this.exerciseInfoStore.update(exerciseData);
      })
    );
    this.authInfoStore.update(this.authService.authInfo);
  }

  ionViewWillEnter() {
    if (!this.authService.authInfo.isLoggedIn) {
      this.authService.redirectOnUnauthorized();
    } else {
      this.loadData();
    }
  }

  private loadData(): void {
    this.trainingService.getTrainings();
    this.exerciseService.getExercises();
  }
  onEdit(index: number) {
    this.trainingSelectedIndex = index;
    this.editItem = true;
  }

  onUpdate(form: NgForm, training: Training) {
    this.trainingInfoStore.trainingSelected.update(training);
    this.trainingInfoStore.trainingSelected.name = form.value.trainingName;

    this.trainingService.onTrainingSelected(
      this.trainingInfoStore.trainingSelected
    );
    this.trainingService.onUpdateTraining();
    this.editItem = false;
    this.trainingSelectedIndex = -1;
  }

  async onDelete(training: Training) {
    this.trainingService.onTrainingSelected(training);
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'ATENÇÃO !',
      message:
        'Você tem certeza que deseja excluir o treino ' +
        this.trainingInfoStore.trainingSelected.name +
        '?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
          handler: (blah) => {
            this.trainingService.getTrainings();
          },
        },
        {
          text: 'Confirmar',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.trainingService.onDeleteTraining();
          },
        },
      ],
    });
    await alert.present();
    this.editItem = false;
    this.trainingSelectedIndex = -1;
  }

  onReturn() {
    this.editItem = false;
    this.newItem = false;
    this.trainingSelectedIndex = -1;
  }
  onNew() {
    this.trainingInfoStore.updateTrainingSelected(new Training());
    this.newItem = true;
  }
  onCreate(form: NgForm) {
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

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
