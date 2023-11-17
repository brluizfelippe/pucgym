import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { AlertController, IonRouterOutlet, Platform } from '@ionic/angular';

import { Subscription } from 'rxjs';
import { Auth } from 'src/app/classes/auth';
import { Equipment } from 'src/app/classes/equipment';
import { EquipmentInfo } from 'src/app/classes/equipment-info';
import { Video } from 'src/app/classes/video';
import { VideoInfo } from 'src/app/classes/video-info';
import { AuthService } from 'src/app/services/auth.service';
import { EquipmentService } from 'src/app/services/equipment.service';
import { VideoService } from 'src/app/services/video.service';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.page.html',
  styleUrls: ['./equipment.page.scss'],
})
export class EquipmentPage implements OnInit {
  authInfoStore = new Auth();
  equipmentInfoStore = new EquipmentInfo();
  videoInfoStore = new VideoInfo();
  isEnable!: boolean;
  onCreateSelected!: boolean;
  onUpdateSelected!: boolean;
  file: File = new File([], 'null');
  private authSub = new Subscription();
  private equipmentSub = new Subscription();
  private videoSub = new Subscription();
  editItem!: boolean;
  newItem!: boolean;
  selectedIndex!: number;
  constructor(
    public authService: AuthService,
    public equipmentService: EquipmentService,
    public videoService: VideoService,
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
    this.editItem = false;
    this.newItem = false;
    this.file = new File([], 'null');

    this.authSub = this.authService.authInfoListener().subscribe((data) => {
      this.authInfoStore.update(data);
    });
    this.authInfoStore.update(this.authService.authInfo);

    this.videoSub = this.videoService
      .setPropertyListener()
      .subscribe((videoData) => {
        this.videoInfoStore.update(videoData);
        // A criação de novo equipamento será feita após a atualização do videoStore, devido ao retorno
        // do id da imagem.
        this.onCreateSelected
          ? (() => {
              this.equipmentInfoStore.equipmentSelected.image.id =
                this.videoInfoStore.videoSelected.id;
              this.equipmentService.onEquipmentSelected(
                this.equipmentInfoStore.equipmentSelected
              );
              this.equipmentService.onCreateEquipment();
            })()
          : '';
        this.onUpdateSelected
          ? (() => {
              this.equipmentInfoStore.equipmentSelected.image.id =
                this.videoInfoStore.videoSelected.id;
              this.equipmentService.onEquipmentSelected(
                this.equipmentInfoStore.equipmentSelected
              );
              this.equipmentService.onUpdateEquipment();
            })()
          : '';
        this.onUpdateSelected = false;
        this.onCreateSelected = false;
        this.file = new File([], 'null');
      });

    this.equipmentSub = this.equipmentService
      .setPropertyListener()
      .subscribe((muscleData) => {
        this.equipmentInfoStore.update(muscleData);
      });
  }

  ionViewWillEnter() {
    this.onCreateSelected = false;
    !this.authInfoStore.isLoggedIn
      ? this.authService.redirectOnUnauthorized()
      : this.equipmentService.getEquipments();
  }

  onEdit(index: number) {
    this.selectedIndex = index;
    this.editItem = true;
  }

  onUpdate(form: NgForm, equipment: Equipment) {
    this.onUpdateSelected = true;
    this.equipmentInfoStore.loading = true;
    this.equipmentInfoStore.equipmentSelected.update(equipment);
    this.equipmentInfoStore.equipmentSelected.name = form.value.equipmentName;

    this.file === null
      ? (() => {
          this.equipmentService.onEquipmentSelected(
            this.equipmentInfoStore.equipmentSelected
          );
          this.equipmentService.onUpdateEquipment();
        })()
      : (() => {
          //Insere a imagem no repositório
          this.videoService.onCreateVideo(this.file);
        })();

    this.editItem = false;
    this.selectedIndex = -1;
  }

  async onDelete(equipment: Equipment) {
    this.equipmentService.onEquipmentSelected(equipment);
    this.videoService.onVideoSelected(equipment.image);
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'ATENÇÃO !',
      message:
        'Você tem certeza que deseja excluir o equipamento ' +
        this.equipmentInfoStore.equipmentSelected.name +
        ' ?',
      buttons: [
        {
          text: 'CANCELAR',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {},
        },
        {
          text: 'CONFIRMAR',
          handler: () => {
            this.equipmentService.onDeleteEquipment();
            this.videoService.onDeleteVideo();
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
    this.newItem = true;
  }
  onCreate(form: NgForm) {
    this.onCreateSelected = true;

    this.equipmentInfoStore.equipmentSelected.name = form.value.newEquipment;

    this.videoService.onCreateVideo(this.file);

    this.isEnable = false;
    this.newItem = false;
  }

  onFileChange(fileChangeEvent: any) {
    this.isEnable = true;
    //this.videoInfoStore.updateVideoSelected(fileChangeEvent.target.files[0]);
    this.file = fileChangeEvent.target.files[0];
    document.getElementById('arquivoSelecionado')!.innerHTML = this.file.name;
    console.log(this.videoInfoStore);
  }

  onSelecionaArquivo() {
    document.getElementById('arquivo')!.click();
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
    this.equipmentSub.unsubscribe();
  }
}
