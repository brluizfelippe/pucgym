import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { Equipment } from '../classes/equipment';
import { Exercise } from '../classes/exercise';
import { ExerciseInfo } from '../classes/exercise-info';
import { Link } from '../classes/link';
import { Muscle } from '../classes/muscle';
import { Video } from '../classes/video';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ExerciseService {
  exerciseInfoStore = new ExerciseInfo();
  auxArrayExercise: Exercise[] = [];
  link = new Link();
  private exerciseInfoStream = new Subject<ExerciseInfo>();

  constructor(
    public http: HttpClient,
    public authService: AuthService,
    public alertCtrl: AlertController,
    public router: Router
  ) {}
  private async showAlert(header: string, subHeader: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      subHeader,
      message,
      buttons: ['OK'],
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

  resetProperties() {
    this.exerciseInfoStream.next(this.exerciseInfoStore);
  }

  setPropertyListener() {
    return this.exerciseInfoStream.asObservable();
  }

  getProperty() {
    return this.exerciseInfoStore;
  }

  onGetProperty() {
    this.exerciseInfoStream.next(this.exerciseInfoStore);
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

  onExercisesSelected() {
    this.getExercises();
  }

  onExerciseSelected(exercise: Exercise) {
    this.exerciseInfoStore.updateExerciseSelected(exercise);
    this.exerciseInfoStream.next(this.exerciseInfoStore);
  }

  onLoadingUpdate() {
    this.exerciseInfoStore.updateLoading(true);
    this.exerciseInfoStream.next(this.exerciseInfoStore);
  }

  async getExercises() {
    this.http
      .get(this.link.baseUrl(Capacitor.getPlatform()) + '/exercises', {
        headers: this.setRequestHeaders(),
      })
      .subscribe({
        next: (response) => {
          Array.isArray(response)
            ? (() => {
                this.exerciseInfoStore.updateExercises(
                  this.formatIntoExerciseType(response[0])
                );
              })()
            : (() => {
                this.exerciseInfoStore.updateExercises([]);
              })(),
            this.exerciseInfoStore.updateLoading(false);
          this.exerciseInfoStream.next(this.exerciseInfoStore);
        },
        error: async (err) => {
          this.handleError(err, 'Busca de exercicios falhou!');
        },
        complete: () => {
          console.log('getExercises complete!');
        },
      });
  }

  async getExercise() {
    this.http
      .get(
        this.link.baseUrl(Capacitor.getPlatform()) +
          '/exercises' +
          '/' +
          this.exerciseInfoStore.exerciseSelected.id,
        {
          headers: this.setRequestHeaders(),
        }
      )
      .subscribe({
        next: (response) => {
          Array.isArray(response)
            ? (() => {
                this.exerciseInfoStore.updateExercises(
                  this.formatIntoExerciseType(response[0])
                );
              })()
            : (() => {
                this.exerciseInfoStore.updateExercises([]);
              })(),
            this.exerciseInfoStore.updateLoading(false);
          this.exerciseInfoStream.next(this.exerciseInfoStore);
        },
        error: async (err) => {
          this.handleError(err, 'Busca de exercício falhou!');
        },
        complete: () => {
          console.log('getExercise Complete!');
        },
      });
  }

  async onCreateExercise() {
    // ### routine to complete the array equipments to have always 3 elements.###
    // ### Otherwise there will be error on the backend
    let newLength = this.exerciseInfoStore.exerciseSelected.equipments.length;
    let auxEq = new Equipment();

    while (newLength < 3) {
      newLength =
        this.exerciseInfoStore.exerciseSelected.equipments.push(auxEq);
    }
    // ### end of routine
    this.http
      .post(
        this.link.baseUrl(Capacitor.getPlatform()) + '/exercises',
        {
          exercise: this.exerciseInfoStore.exerciseSelected,
          userId: this.authService.authInfo.userId,
        },
        {
          headers: this.setRequestHeaders(),
        }
      )
      .subscribe({
        next: async (response) => {
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
          if (Array.isArray(response)) {
            this.showAlert(
              'Cadastro de exercício falhou!',
              'Se o problema persistir, contacte o desenvolvedor',
              JSON.stringify(response[0])
            );
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              this.showAlert(
                'Cadastro de exercício falhou!',
                'Se o problema persistir, contacte o desenvolvedor',
                JSON.stringify(response)
              );
            } else {
              this.showAlert('', '', 'Exercício cadastrado com sucesso!');
              //Esta função irá disparar a atualização do observable
              this.getExercises();
            }
          }
        },
        error: async (err) => {
          this.handleError(err, 'Cadastro de exercício falhou!');
        },
        complete: () => {
          console.log('onCreateExercise complete!');
        },
      });
  }

  async onUpdateExercise() {
    // ### routine to complete the array equipments to have always 3 elements.###
    // ### Otherwise there will be error on the backend
    let newLength = this.exerciseInfoStore.exerciseSelected.equipments.length;
    let auxEq = new Equipment();

    while (newLength < 3) {
      newLength =
        this.exerciseInfoStore.exerciseSelected.equipments.push(auxEq);
    }
    // ### end of routine

    this.http
      .put(
        this.link.baseUrl(Capacitor.getPlatform()) +
          '/exercises/' +
          this.exerciseInfoStore.exerciseSelected.id,
        {
          exercise: this.exerciseInfoStore.exerciseSelected,
          userId: this.authService.authInfo.userId,
        },
        {
          headers: this.setRequestHeaders(),
        }
      )
      .subscribe({
        next: async (response) => {
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
          if (Array.isArray(response)) {
            this.showAlert(
              'Atualização de exercício falhou!',
              'Se o problema persistir, contacte o desenvolvedor',
              JSON.stringify(response[0])
            );
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              this.showAlert(
                'Atualização de exercício falhou!',
                'Se o problema persistir, contacte o desenvolvedor',
                JSON.stringify(response)
              );
            } else {
              this.showAlert('', '', 'Exercício atualzado com sucesso!');
              //Esta função irá disparar a atualização do observable
              this.getExercises();
            }
          }
        },
        error: async (err) => {
          this.handleError(err, 'Atualização de exercício falhou!');
        },
        complete: () => {
          console.log('onUpdateExercise complete!');
        },
      });
  }

  async onDeleteExercise() {
    let options = new HttpParams();
    options = options
      .append('userId', this.authService.authInfo.userId)
      .append('id', this.exerciseInfoStore.exerciseSelected.id);

    this.http
      .delete(
        this.link.baseUrl(Capacitor.getPlatform()) +
          '/exercises/' +
          this.exerciseInfoStore.exerciseSelected.id,
        {
          params: options,
          headers: this.setRequestHeaders(),
        }
      )
      .subscribe({
        next: async (response) => {
          // Erro no MySQL
          if (Array.isArray(response)) {
            const alert = await this.alertCtrl.create({
              header: 'Remoção de exercício falhou!',
              subHeader: 'Se o problema persistir, contacte o desenvolvedor',
              message: JSON.stringify(response[0]),
              buttons: ['OK'],
            });

            alert.present();
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              const alert = await this.alertCtrl.create({
                header: 'Remoção de exercício falhou!',
                subHeader: 'Se o problema persistir, contacte o desenvolvedor',
                message: JSON.stringify(response),
                buttons: ['OK'],
              });

              alert.present();
            } else {
              const alert = await this.alertCtrl.create({
                message: 'Exercício removido com sucesso!',
                buttons: ['OK'],
              });

              alert.present();
              //Esta função irá disparar a atualização do observable
              this.getExercises();
            }
          }
        },
        error: async (err) => {
          const alert = await this.alertCtrl.create({
            header: 'Remoção de exercícios falhou!',
            subHeader: 'Se o problema persistir, contacte o desenvolvedor.',
            message: err.status === 401 ? 'Login expirado!' : err.status,
            buttons: ['OK'],
          });
          //Se não for erro de autenticação, será exibido no alerta, porém
          //sem desviar para página de login.
          err.status === 401 ? this.redirectOnUnhautorized() : (() => {})();

          alert.present();
        },
        complete: () => {
          console.log('onDeleteExercise complete!');
        },
      });
  }

  //###################

  formatIntoExerciseType(info: any[]): Exercise[] {
    console.log(info);
    const auxInfo: Exercise[] = [];

    info.forEach((element) => {
      const auxElement = new Exercise();
      auxElement.id = element.id;
      auxElement.name = element.nome;

      // Handling Muscle
      const auxMuscle = new Muscle();
      auxMuscle.id = element.idGrupoMuscular;
      auxMuscle.name = element.nomeGrupoMuscular;
      auxElement.muscle.update(auxMuscle);

      // Handling Video
      const auxVideo = new Video();
      auxVideo.id = element.idVideo;
      auxVideo.originalname = element.nomeVideo;
      auxVideo.mimetype = element.mimetypeVideo;
      auxVideo.location = element.locationVideo;
      auxElement.video.update(auxVideo);

      // Handling Equipment
      for (let i = 1; i <= 3; i++) {
        if (element[`idEquipamento${i}`] !== null) {
          const auxEq = new Equipment();
          auxEq.id = element[`idEquipamento${i}`];
          auxEq.name = element[`nomeEquipamento${i}`];
          auxEq.image = element[`locationImageEquipamento${i}`];
          auxElement.equipments.push(auxEq);
        }
      }

      auxInfo.push(auxElement);
    });

    return auxInfo;
  }
}
