import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Platform, IonRouterOutlet, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Auth } from 'src/app/classes/auth';
import { Muscle } from 'src/app/classes/muscle';
import { MuscleInfo } from 'src/app/classes/muscle-info';
import { AuthService } from 'src/app/services/auth.service';
import { MuscleService } from 'src/app/services/muscle.service';

@Component({
  selector: 'app-muscle',
  templateUrl: './muscle.page.html',
  styleUrls: ['./muscle.page.scss'],
})
export class MusclePage implements OnInit, OnDestroy {
  authInfoStore = new Auth();
  muscleInfoStore = new MuscleInfo();
  private subscriptions = new Subscription();
  editItem = false;
  newItem = false;
  selectedIndex = -1;

  constructor(
    public authService: AuthService,
    public muscleService: MuscleService,
    public router: Router,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet,
    public alertController: AlertController
  ) {}

  ngOnInit() {
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
      this.muscleService.setPropertyListener().subscribe((muscleData) => {
        this.muscleInfoStore.update(muscleData);
      })
    );
  }

  ionViewWillEnter() {
    this.authInfoStore.isLoggedIn
      ? this.muscleService.getMuscles()
      : this.authService.redirectOnUnauthorized();
  }
  onEdit(index: number) {
    this.selectedIndex = index;
    this.editItem = true;
  }

  onUpdate(muscleName: string, muscle: Muscle) {
    this.muscleInfoStore.muscleSelected.update(muscle);
    this.muscleInfoStore.muscleSelected.name = muscleName;
    this.muscleService.onMuscleSelected(this.muscleInfoStore.muscleSelected);
    this.muscleService.onUpdateMuscle();
    this.editItem = false;
    this.selectedIndex = -1;
  }

  async onDelete(muscle: Muscle) {
    this.muscleService.onMuscleSelected(muscle);

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirmação de exclusão',
      message:
        'Você tem certeza que deseja excluir o grupo ' +
        this.muscleInfoStore.muscleSelected.name +
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
            this.muscleService.onDeleteMuscle();
          },
        },
      ],
    });

    await alert.present();
    this.editItem = false;
    this.selectedIndex = -1;
  }

  onReturn() {
    this.editItem = false;
    this.newItem = false;
    this.selectedIndex = -1;
  }
  onNew() {
    this.muscleInfoStore.updateMuscleSelected(new Muscle());
    this.newItem = true;
  }
  onCreate(form: NgForm) {
    console.log(form);
    this.muscleInfoStore.muscleSelected.name = form.value.newGroup;
    this.muscleService.onMuscleSelected(this.muscleInfoStore.muscleSelected);
    this.muscleService.onCreateMuscle();
    this.newItem = false;
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
