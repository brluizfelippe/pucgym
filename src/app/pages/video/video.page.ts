import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { AlertController, IonRouterOutlet, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Auth } from 'src/app/classes/auth';
import { Video } from 'src/app/classes/video';
import { VideoInfo } from 'src/app/classes/video-info';
import { AuthService } from 'src/app/services/auth.service';
import { VideoService } from 'src/app/services/video.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.page.html',
  styleUrls: ['./video.page.scss'],
})
export class VideoPage implements OnInit, OnDestroy {
  authInfoStore = new Auth();
  videoInfoStore = new VideoInfo();
  editItem = false;
  newItem = false;
  selectedIndex = -1;
  isEnable = false;
  file: File = new File([], '');
  private subscriptions = new Subscription();

  constructor(
    public authService: AuthService,
    public videoService: VideoService,
    public router: Router,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet,
    public alertCtrl: AlertController
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
      })
    );
  }

  ionViewWillEnter() {
    this.authInfoStore.isLoggedIn
      ? this.videoService.getVideos()
      : this.authService.redirectOnUnauthorized();
  }

  onSelecionaArquivo() {
    document.getElementById('arquivo')!.click();
  }

  onEdit(index: number) {
    this.selectedIndex = index;
    this.editItem = true;
  }

  onSave(video: Video) {
    console.log(video);
    this.editItem = false;
    this.selectedIndex = -1;
  }

  async onDelete(video: Video) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Confirmação e exclusão',
      subHeader: '',
      message:
        'Confirma a exclusão do vídeo ' +
        this.videoInfoStore.videoSelected.originalname +
        '?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
          handler: () => {},
        },
        {
          text: 'Confirmar',
          role: 'ok',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.videoInfoStore.updateLoading(true);
            this.videoService.onVideoSelected(video);
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
    this.isEnable = false;
  }
  onNew() {
    this.newItem = true;
  }

  onFileChange(fileChangeEvent: any) {
    this.isEnable = true;
    //this.videoInfoStore.updateVideoSelected(fileChangeEvent.target.files[0]);
    this.file = fileChangeEvent.target.files[0];
    document.getElementById('arquivoSelecionado')!.innerHTML = this.file.name;
    console.log(this.videoInfoStore);
  }

  onCreateFile() {
    this.videoInfoStore.updateLoading(true);
    this.videoService.onCreateVideo(this.file);
    this.isEnable = false;
    this.newItem = false;
  }
  private async showAlert(
    header: string,
    subHeader: string,
    message: string,
    callback: any
  ): Promise<void> {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header,
      subHeader,
      message,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
          handler: () => {},
        },
        {
          text: 'Ok',
          role: 'ok',
          cssClass: 'alert-button-confirm',
          handler: () => {
            callback;
          },
        },
      ],
    });
    await alert.present();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
