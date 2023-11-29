import { Component, OnInit } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Platform, IonRouterOutlet, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Auth } from 'src/app/classes/auth';
import { Exercise } from 'src/app/classes/exercise';
import { ExerciseInfo } from 'src/app/classes/exercise-info';
import { VideoInfo } from 'src/app/classes/video-info';
import { AuthService } from 'src/app/services/auth.service';
import { ExerciseService } from 'src/app/services/exercise.service';
import { VideoService } from 'src/app/services/video.service';
import { EquipmentInfo } from 'src/app/classes/equipment-info';
import { EquipmentService } from 'src/app/services/equipment.service';
import { MuscleInfo } from 'src/app/classes/muscle-info';
import { MuscleService } from 'src/app/services/muscle.service';
import { flush } from '@angular/core/testing';

@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.page.html',
  styleUrls: ['./exercise.page.scss'],
})
export class ExercisePage implements OnInit {
  authInfoStore = new Auth();
  exerciseInfoStore = new ExerciseInfo();
  videoInfoStore = new VideoInfo();
  equipmentInfoStore = new EquipmentInfo();
  muscleInfoStore = new MuscleInfo();

  editItem!: boolean;
  newItem!: boolean;
  exerciseIndex!: number;
  exerciseSelectedIndex!: number;
  showExerciseDetail!: boolean;
  showAddEquipment!: boolean;
  showAddEquipmentForNewExercise!: boolean;
  private subscriptions = new Subscription();
  constructor(
    public authService: AuthService,
    public exerciseService: ExerciseService,
    public videoService: VideoService,
    public equipmentService: EquipmentService,
    public muscleService: MuscleService,
    public router: Router,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet,
    public alertCtrl: AlertController
  ) {
    this.platform.backButton.subscribeWithPriority(-1, () => {
      if (!this.routerOutlet.canGoBack()) {
        App.exitApp();
      }
    });
  }

  ngOnInit() {
    this.editItem = false;
    this.newItem = false;
    this.showExerciseDetail = false;
    this.showAddEquipment = false;
    this.showAddEquipmentForNewExercise = false;
    this.initializeSubscriptions();
  }

  private initializeSubscriptions(): void {
    this.subscriptions.add(
      this.platform.backButton.subscribeWithPriority(-1, () => {
        if (!this.routerOutlet.canGoBack()) {
          App.exitApp();
        }
      })
    );

    this.subscriptions.add(
      this.authService.authInfoListener().subscribe((data) => {
        this.authInfoStore.update(data);
      })
    );
    this.authInfoStore.update(this.authService.authInfo);

    this.subscriptions.add(
      this.exerciseService.setPropertyListener().subscribe((exerciseData) => {
        this.exerciseInfoStore.update(exerciseData);
      })
    );

    this.subscriptions.add(
      this.videoService.setPropertyListener().subscribe((videoData) => {
        this.videoInfoStore.update(videoData);
      })
    );

    this.subscriptions.add(
      this.equipmentService.setPropertyListener().subscribe((equipmentData) => {
        this.equipmentInfoStore.update(equipmentData);
      })
    );
    this.subscriptions.add(
      this.muscleService.setPropertyListener().subscribe((muscleData) => {
        this.muscleInfoStore.update(muscleData);
      })
    );
  }

  ionViewWillEnter() {
    !this.authInfoStore.isLoggedIn
      ? this.authService.redirectOnUnauthorized()
      : (() => {
          this.exerciseService.getExercises();
          this.videoService.getVideos();
          this.equipmentService.getEquipments();
          this.muscleService.getMuscles();
        })();
  }

  onEdit(index: number) {
    this.exerciseSelectedIndex = index;
    this.editItem = true;
  }

  onUpdate(form: NgForm, exercise: Exercise) {
    this.exerciseInfoStore.exerciseSelected.update(exercise);
    this.exerciseInfoStore.exerciseSelected.name = form.value.exerciseName;

    this.exerciseInfoStore.exerciseSelected.muscle.update(
      form.value.grupoMuscular
    );
    this.exerciseInfoStore.exerciseSelected.video.update(form.value.video);
    this.exerciseService.onExerciseSelected(
      this.exerciseInfoStore.exerciseSelected
    );
    this.exerciseService.onUpdateExercise();
    this.editItem = false;
    this.exerciseSelectedIndex = -1;
  }

  async onDelete(exercise: Exercise) {
    this.exerciseService.onLoadingUpdate();
    this.exerciseService.onExerciseSelected(exercise);
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'ATENÇÃO !',
      message:
        'Você tem certeza que deseja excluir o exercício ' +
        this.exerciseInfoStore.exerciseSelected.name +
        '?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
          handler: (blah) => {
            this.exerciseService.getExercises();
          },
        },
        {
          text: 'Confirmar',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.exerciseService.onDeleteExercise();
          },
        },
      ],
    });
    await alert.present();

    this.editItem = false;
    this.exerciseSelectedIndex = -1;
  }

  onReturn() {
    this.editItem = false;
    this.newItem = false;
    this.exerciseSelectedIndex = -1;
  }
  onNew() {
    this.exerciseInfoStore.updateExerciseSelected(new Exercise());
    this.newItem = true;
  }
  onCreate(form: NgForm) {
    this.exerciseInfoStore.exerciseSelected.name = form.value.exerciseName;
    this.exerciseInfoStore.exerciseSelected.muscle.update(
      form.value.grupoMuscular
    );
    this.exerciseInfoStore.exerciseSelected.video.update(form.value.video);
    this.exerciseService.onExerciseSelected(
      this.exerciseInfoStore.exerciseSelected
    );
    this.exerciseService.onCreateExercise();
    this.newItem = false;
  }
  // #### Início de métodos de adição de aparelho a novo exercício
  onShowAddEquipmentForNewExercise() {
    this.showAddEquipmentForNewExercise = true;
  }
  onCloseAddEquipmentForNewExercise() {
    this.showAddEquipmentForNewExercise = false;
  }
  onAddEquipmentForNewExercise(form: NgForm) {
    this.exerciseInfoStore.exerciseSelected.equipments.push(
      form.value.eqAddedForNewExercise
    );
    this.showAddEquipmentForNewExercise = false;
  }
  onRemoveEquipmentForNewExercise(equipmentIndex: number) {
    this.exerciseInfoStore.exerciseSelected.equipments.splice(
      equipmentIndex,
      1
    );
  }
  // #### Fim de métodos de adição de aparelho a novo exercício

  //##### Início de métodos de adição de aparelho ao exercício existente
  onShowAddEquipment() {
    this.showAddEquipment = true;
  }
  onCloseAddEquipment() {
    this.showAddEquipment = false;
  }
  onAddEquipment(form: NgForm, exerciseIndex: number) {
    this.exerciseInfoStore.exercises[exerciseIndex].equipments.push(
      form.value.eqAdded
    );
    this.showAddEquipment = false;
  }
  onRemoveEquipment(exerciseIndex: number, equipmentIndex: number) {
    this.exerciseInfoStore.exercises[exerciseIndex].equipments.splice(
      equipmentIndex,
      1
    );
  }
  //#### Fim de métodos para adição de aparelho ao exercício ao exercício existente
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
