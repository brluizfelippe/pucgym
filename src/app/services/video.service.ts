import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { Link } from '../classes/link';
import { Video } from '../classes/video';
import { VideoInfo } from '../classes/video-info';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  videoInfoStore = new VideoInfo();
  auxArrayVideo = new Array<Video>();
  link = new Link();
  private videoInfoStream = new Subject<VideoInfo>();

  constructor(
    public http: HttpClient,
    public authService: AuthService,
    public alertCtrl: AlertController,
    public router: Router
  ) {}
  private async showAlert(header: string, subHeader: string, message: string) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header,
      subHeader,
      message,
      buttons: [
        {
          text: 'Ok',
          role: 'ok',
          cssClass: 'alert-button-confirm',
          handler: (blah) => {},
        },
      ],
    });
    alert.present();
  }

  private handleError(err: any, customMessage: string) {
    const message = err.status === 401 ? 'Login expirado!' : err.status;
    this.showAlert(
      customMessage,
      'Se o problema persistir, contacte o desenvolvedor.',
      message
    );
    if (err.status === 401) this.redirectOnUnhautorized();
  }

  private formatIntoVideoType(info: any[]) {
    console.log(info);
    let auxInfo: Video[] = [];
    info.length
      ? info.forEach((element) => {
          let auxElement = new Video();

          auxElement.id = element.id;
          auxElement.fieldname = element.fieldname;
          auxElement.originalname = element.originalname;
          auxElement.encoding = element.encoding;
          auxElement.mimetype = element.mimetype;
          auxElement.size = element.size;
          auxElement.bucket = element.bucket;
          auxElement.key = element.videokey;
          auxElement.acl = element.acl;
          auxElement.contentType = element.contentType;
          auxElement.storageClass = element.storageClass;
          auxElement.location = element.location;
          auxElement.etag = element.etag;
          auxElement.date = element.dataCriado;
          auxInfo.push(auxElement);
        })
      : '';
    return auxInfo;
  }
  resetProperties() {
    this.videoInfoStore.update(new VideoInfo());
  }

  setPropertyListener() {
    return this.videoInfoStream.asObservable();
  }

  get videoInfo(): VideoInfo {
    return this.videoInfoStore;
  }

  getProperty() {
    return this.videoInfoStore;
  }

  async redirectOnUnhautorized() {
    this.authService.resetProperties();
    await this.router.navigateByUrl('/landing/login');
  }

  setRequestHeaders(): HttpHeaders {
    return new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.authService.authInfo.token,
    });
  }

  setRequestHeadersMultipart(): HttpHeaders {
    return new HttpHeaders({
      Accept: 'multipart/form-data',
      Authorization: 'Bearer ' + this.authService.authInfo.token,
    });
  }

  onVideosSelected() {
    this.getVideos();
  }

  onVideoSelected(video: Video) {
    this.videoInfoStore.updateLoading(true);
    this.videoInfoStore.updateVideoSelected(video);
    this.videoInfoStream.next(this.videoInfoStore);
  }

  async getVideos() {
    this.http
      .get(this.link.baseUrl(Capacitor.getPlatform()) + '/videos', {
        headers: this.setRequestHeaders(),
      })
      .subscribe({
        next: (response) => {
          Array.isArray(response)
            ? (() => {
                this.videoInfoStore.updateVideos(
                  this.formatIntoVideoType(response[0])
                );
              })()
            : (() => {
                this.videoInfoStore.updateVideos([]);
              })(),
            this.videoInfoStore.updateLoading(false);
          this.videoInfoStream.next(this.videoInfoStore);
        },
        error: (err) => {
          this.handleError(err, 'Busca de arquivos falhou!');
        },

        complete: () => {
          console.info('getVideos complete!');
        },
      });
  }

  async onCreateVideo(file: File) {
    let formData = new FormData();
    formData.append('file', file, file.name);
    console.log(file);

    this.http
      .post(this.link.baseUrl(Capacitor.getPlatform()) + '/videos', formData, {
        headers: this.setRequestHeadersMultipart(),
      })
      .subscribe({
        next: async (response) => {
          console.log(response);
          Array.isArray(response)
            ? (async () => {
                let auxVideoSelected = new Video();
                auxVideoSelected.id = response[0][0].lastInsertId;
                this.videoInfoStore.updateVideoSelected(auxVideoSelected);
                this.videoInfoStream.next(this.videoInfoStore);
                //in case of error from MySQL the response is something like:
                /*Object {
            code: "ER_PARSE_ERROR",
            errno: 1064,
            sqlMessage: "You have an error in your SQL syntax;...",
            sqlState: "42000",
            index: 0,
            sql: "call cadastraVideo('file','WhatsApp Video 2022-02-09 at 07.37.42.mp4','7bit','video/mp4',2339196,'altaenergia','2db5c802a5ca8fe3fc5cd20d013d955e-WhatsApp Video 2022-02-09 at 07.37.42.mp4','public-read','video/mp4','STANDARD','\\\"aece84cd2786568077165f6fdf3014ab\\\"',NULL,?)" },
          }
          */
                //[array(),{}] -> An array with an array inside.
                // Erro no MySQL
                if (
                  Array.isArray(response) &&
                  !response[0][0].hasOwnProperty('lastInsertId')
                ) {
                  this.showAlert(
                    'Cadastro de video falhou!',
                    '',
                    JSON.stringify(response[0])
                  );
                } else {
                  // Erro no AWS S3 =>
                  if (response.hasOwnProperty('code')) {
                    this.showAlert(
                      'Cadastro de arquivo falhou!',
                      '',
                      JSON.stringify(response)
                    );
                  } else {
                    this.showAlert('', '', 'Arquivo cadastrado com sucesso!');
                  }
                }
              })()
            : (() => {
                console.info('response is not an array!');
              })();
        },
        error: async (err) => {
          this.handleError(err, 'Cadastro de arquivo falhou!');
        },
        complete: () => {
          console.info('video complete');
          //Esta função irá disparar a atualização do observable
          this.getVideos();
        },
      });
  }

  async onDeleteVideo() {
    let options = new HttpParams();
    options = options
      .append('userId', this.authService.authInfo.userId)
      .append('bucket', this.videoInfoStore.videoSelected.bucket)
      .append('videoKey', this.videoInfoStore.videoSelected.key);
    console.log(options);
    this.http
      .delete(
        this.link.baseUrl(Capacitor.getPlatform()) +
          '/videos/' +
          this.videoInfoStore.videoSelected.id,
        {
          params: options,
          headers: this.setRequestHeaders(),
        }
      )
      .subscribe({
        next: async (response) => {
          // Erro no MySQL
          if (Array.isArray(response)) {
            this.showAlert(
              'Remoção de arquivo falhou!',
              'Se o problema persistir, contacte o desenvolvedor',
              JSON.stringify(response[0])
            );
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              this.showAlert(
                'Remoção de arquivo falhou!',
                'Se o problema persistir, contacte o desenvolvedor',
                JSON.stringify(response)
              );
            } else {
              this.showAlert('', '', 'Arquivo removido com sucesso!');
            }
          }
        },
        error: async (err) => {
          this.handleError(err, 'Remoção de arquivo falhou!');
        },
        complete: () => {
          console.log('onDeleteVideo complete!');
          //Esta função irá disparar a atualização do observable
          this.getVideos();
        },
      });
  }
}
