import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Platform, IonRouterOutlet, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Auth } from 'src/app/classes/auth';
import { Program } from 'src/app/classes/program';
import { ProgramInfo } from 'src/app/classes/program-info';
import { TrainingInfo } from 'src/app/classes/training-info';
import { AuthService } from 'src/app/services/auth.service';
import { ProgramService } from 'src/app/services/program.service';
import { TrainingService } from 'src/app/services/training.service';

@Component({
  selector: 'app-program',
  templateUrl: './program.page.html',
  styleUrls: ['./program.page.scss'],
})
export class ProgramPage implements OnInit {
  authInfoStore = new Auth();
  programInfoStore = new ProgramInfo();
  trainingInfoStore = new TrainingInfo();

  private authSub = new Subscription();
  private programSub = new Subscription();
  private trainingSub = new Subscription();

  editItem!: boolean;
  newItem!: boolean;
  programSelectedIndex!: number;
  trainingSelectedIndex!: number;
  showAddTraining!: boolean;
  showAddTrainingForNewProgram!: boolean;
  constructor(
    public authService: AuthService,
    public programService: ProgramService,
    public trainingService: TrainingService,
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

    this.authSub = this.authService.authInfoListener().subscribe((data) => {
      this.authInfoStore.update(data);
    });
    this.authInfoStore.update(this.authService.authInfo);

    this.programSub = this.programService
      .setPropertyListener()
      .subscribe((trainingData) => {
        this.programInfoStore.update(trainingData);
      });

    this.trainingSub = this.trainingService
      .setPropertyListener()
      .subscribe((exerciseData) => {
        this.trainingInfoStore.update(exerciseData);
      });
  }

  ionViewWillEnter() {
    !this.authInfoStore.isLoggedIn
      ? this.authService.redirectOnUnauthorized()
      : (() => {
          this.programService.getPrograms();
          this.trainingService.getTrainings();
        })();
  }

  onEdit(index: number) {
    this.programSelectedIndex = index;
    this.editItem = true;
  }

  onUpdate(form: NgForm, program: Program) {
    this.programInfoStore.programSelected.update(program);
    this.programInfoStore.programSelected.name = form.value.programName;

    this.programService.onProgramSelected(
      this.programInfoStore.programSelected
    );
    this.programService.onUpdateProgram();
    this.editItem = false;
    this.programSelectedIndex = -1;
  }

  async onDelete(program: Program) {
    this.programService.onProgramSelected(program);

    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'ATENÇÃO !',
      message:
        'Você tem certeza que deseja excluir o programa ' +
        this.programInfoStore.programSelected.name +
        '?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
          handler: (blah) => {
            this.programService.getPrograms();
          },
        },
        {
          text: 'Confirmar',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.programService.onDeleteProgram();
          },
        },
      ],
    });
    await alert.present();
    this.editItem = false;
    this.programSelectedIndex = -1;
  }

  onReturn() {
    this.editItem = false;
    this.newItem = false;
    this.programSelectedIndex = -1;
  }
  onNew() {
    this.programInfoStore.updateProgramSelected(new Program());
    this.newItem = true;
  }
  onCreate(form: NgForm) {
    this.programInfoStore.programSelected.name = form.value.programName;

    this.programService.onProgramSelected(
      this.programInfoStore.programSelected
    );
    this.programService.onCreateProgram();
    this.newItem = false;
  }

  // #### Begining of Methods for managing trainings on new program #######
  onShowAddTrainingForNewProgram() {
    this.showAddTrainingForNewProgram = true;
  }
  onCloseAddTrainingForNewProgram() {
    this.showAddTrainingForNewProgram = false;
  }
  onAddTrainingForNewProgram(form: NgForm) {
    this.programInfoStore.programSelected.trainings.push(
      form.value.trainingAddedForNewProgram
    );
    this.showAddTrainingForNewProgram = false;
  }
  onRemoveTrainingForNewProgram(trainingIndex: number) {
    this.programInfoStore.programSelected.trainings.splice(trainingIndex, 1);
  }
  // #### End of Methods for managing trainings on new program
  // ##### Methods for managing trainings on existing program ######
  onShowAddTraining() {
    this.showAddTraining = true;
  }
  onCloseAddTraining() {
    this.showAddTraining = false;
  }
  onAddTraining(programIndex: number, form: NgForm) {
    this.programInfoStore.programs[programIndex].trainings.push(
      form.value.newTraining
    );
    this.showAddTraining = false;
  }
  onRemoveTraining(programIndex: number, trainingIndex: number) {
    this.programInfoStore.programs[programIndex].trainings.splice(
      trainingIndex,
      1
    );
  }
  // ##### Methods for managing trainings on existing program ######

  ngOnDestroy() {
    this.authSub.unsubscribe();
    this.programSub.unsubscribe();
    this.trainingSub.unsubscribe();
  }
}
