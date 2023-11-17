import { Component, OnDestroy, OnInit } from '@angular/core';
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
  private authSub = new Subscription();
  private videoSub = new Subscription();
  editItem!: boolean;
  newItem!: boolean;
  selectedIndex!: number;
  isEnable!: boolean;
  file!: File;
  constructor(
    public authService: AuthService,
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
    this.isEnable = false;
    this.authSub = this.authService.authInfoListener().subscribe((data) => {
      this.authInfoStore.update(data);
    });
    this.authInfoStore.update(this.authService.authInfo);

    this.videoSub = this.videoService
      .setPropertyListener()
      .subscribe((videoData) => {
        console.log(videoData);
        this.videoInfoStore.update(videoData);
        console.log(this.videoInfoStore);
      });
  }

  ionViewWillEnter() {
    !this.authInfoStore.isLoggedIn
      ? this.authService.redirectOnUnauthorized()
      : this.videoService.getVideos();
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
    this.videoService.onVideoSelected(video);

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'ATENÇÃO !',
      message:
        'Você tem certeza que deseja excluir o vídeo ' +
        this.videoInfoStore.videoSelected.originalname +
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
    this.videoService.onCreateVideo(this.file);
    this.isEnable = false;
    this.newItem = false;
  }
  ngOnDestroy() {
    this.authSub.unsubscribe();
    this.videoSub.unsubscribe();
  }
}
