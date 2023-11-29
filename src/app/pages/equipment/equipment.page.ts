import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { AlertController, IonRouterOutlet, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Auth } from 'src/app/classes/auth';
import { Equipment } from 'src/app/classes/equipment';
import { EquipmentInfo } from 'src/app/classes/equipment-info';
import { VideoInfo } from 'src/app/classes/video-info';
import { AuthService } from 'src/app/services/auth.service';
import { EquipmentService } from 'src/app/services/equipment.service';
import { VideoService } from 'src/app/services/video.service';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.page.html',
  styleUrls: ['./equipment.page.scss'],
})
export class EquipmentPage implements OnInit, OnDestroy {
  authInfoStore = new Auth();
  equipmentInfoStore = new EquipmentInfo();
  videoInfoStore = new VideoInfo();
  isEnable = false;
  onCreateSelected = false;
  onUpdateSelected = false;
  file: File = new File([], '');
  editItem = false;
  newItem = false;
  selectedIndex = -1;
  private subscriptions = new Subscription();

  constructor(
    public authService: AuthService,
    public equipmentService: EquipmentService,
    public videoService: VideoService,
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
      this.videoService.setPropertyListener().subscribe((videoData) => {
        this.videoInfoStore.update(videoData);
        this.handleVideoUpdate();
      })
    );

    this.subscriptions.add(
      this.equipmentService.setPropertyListener().subscribe((equipmentData) => {
        this.equipmentInfoStore.update(equipmentData);
      })
    );
  }

  private handleVideoUpdate(): void {
    if (this.onCreateSelected) {
      this.createEquipment();
    } else if (this.onUpdateSelected) {
      this.updateEquipment();
    }
    this.resetSelection();
  }

  private createEquipment(): void {
    this.equipmentInfoStore.equipmentSelected.image.id =
      this.videoInfoStore.videoSelected.id;
    this.equipmentService.onEquipmentSelected(
      this.equipmentInfoStore.equipmentSelected
    );
    this.equipmentService.onCreateEquipment();
  }

  private updateEquipment(): void {
    this.equipmentInfoStore.equipmentSelected.image.id =
      this.videoInfoStore.videoSelected.id;
    this.equipmentService.onEquipmentSelected(
      this.equipmentInfoStore.equipmentSelected
    );
    this.equipmentService.onUpdateEquipment();
  }

  private resetSelection(): void {
    this.onCreateSelected = false;
    this.onUpdateSelected = false;
    this.file = new File([], '');
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

    this.file.size === 0
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
    this.equipmentInfoStore.loading = true;
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
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
          handler: (blah) => {},
        },
        {
          text: 'Confirmar',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.equipmentService.onDeleteEquipment();
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
    this.equipmentInfoStore.updateEquipmentSelected(new Equipment());
    this.newItem = true;
  }
  onCreate(form: NgForm) {
    this.onCreateSelected = true;
    this.equipmentInfoStore.loading = true;
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
    this.subscriptions.unsubscribe();
  }
}
