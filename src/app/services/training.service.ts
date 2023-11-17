import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { Exercise } from '../classes/exercise';
import { Link } from '../classes/link';
import { Training } from '../classes/training';
import { TrainingInfo } from '../classes/training-info';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  trainingInfoStore = new TrainingInfo();
  auxArrayTraining = [];
  link = new Link();
  private trainingInfoStream = new Subject<TrainingInfo>();

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
    this.trainingInfoStream.next(this.trainingInfoStore);
  }

  setPropertyListener() {
    return this.trainingInfoStream.asObservable();
  }

  getProperty() {
    return this.trainingInfoStore;
  }

  onGetProperty() {
    this.trainingInfoStream.next(this.trainingInfoStore);
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

  onTrainingsSelected() {
    this.getTrainings();
  }

  onTrainingSelected(training: Training) {
    this.trainingInfoStore.updateTrainingSelected(training);
    this.trainingInfoStream.next(this.trainingInfoStore);
  }

  onLoadingUpdate() {
    this.trainingInfoStore.updateLoading(true);
    this.trainingInfoStream.next(this.trainingInfoStore);
  }

  async getTrainings() {
    this.http
      .get(this.link.baseUrl(Capacitor.getPlatform()) + '/trainings', {
        headers: this.setRequestHeaders(),
      })
      .subscribe({
        next: (response) => {
          Array.isArray(response)
            ? (() => {
                this.trainingInfoStore.updateTrainings(
                  this.formatIntoTrainingType(response[0])
                );
              })()
            : (() => {
                this.trainingInfoStore.updateTrainings([]);
              })(),
            this.trainingInfoStore.updateLoading(false);
          this.trainingInfoStream.next(this.trainingInfoStore);
        },
        error: async (err) => {
          this.handleError(err, 'Busca de treinos falhou!');
        },
        complete: () => {
          console.log('getTrainings complete!');
        },
      });
  }

  async getTraining() {
    this.http
      .get(
        this.link.baseUrl(Capacitor.getPlatform()) +
          '/trainings' +
          '/' +
          this.trainingInfoStore.trainingSelected.id,
        {
          headers: this.setRequestHeaders(),
        }
      )
      .subscribe({
        next: (response) => {
          Array.isArray(response)
            ? (() => {
                this.trainingInfoStore.updateTrainings(
                  this.formatIntoTrainingType(response[0])
                );
              })()
            : (() => {
                this.trainingInfoStore.updateTrainings([]);
              })(),
            this.trainingInfoStore.updateLoading(false);
          this.trainingInfoStream.next(this.trainingInfoStore);
        },
        error: async (err) => {
          this.handleError(err, 'Busca de treino falhou!');
        },
        complete: () => {
          console.log('getTraining Complete!');
        },
      });
  }

  async onCreateTraining() {
    // ### routine to complete the array equipments to have always 10 elements.###
    // ### Otherwise there will be error on the backend
    let newLength = this.trainingInfoStore.trainingSelected.exercises.length;
    let auxEx = new Exercise();

    while (newLength < 10) {
      newLength = this.trainingInfoStore.trainingSelected.exercises.push(auxEx);
    }
    // ### end of routine
    this.http
      .post(
        this.link.baseUrl(Capacitor.getPlatform()) + '/trainings',
        {
          training: this.trainingInfoStore.trainingSelected,
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
              'Cadastro de treino falhou!',
              'Se o problema persistir, contacte o desenvolvedor',
              JSON.stringify(response[0])
            );
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              this.showAlert(
                'Cadastro de treino falhou!',
                'Se o problema persistir, contacte o desenvolvedor',
                JSON.stringify(response)
              );
            } else {
              this.showAlert('', '', 'Treino cadastrado com sucesso!');
              //Esta função irá disparar a atualização do observable
              this.getTrainings();
            }
          }
        },
        error: async (err) => {
          this.handleError(err, 'Cadastro de treino falhou!');
        },
        complete: () => {
          console.log('onCreateTrainning complete!');
        },
      });
  }

  async onUpdateTraining() {
    // ### routine to complete the array equipments to have always 10 elements.###
    // ### Otherwise there will be error on the backend
    let newLength = this.trainingInfoStore.trainingSelected.exercises.length;
    let auxEx = new Exercise();
    while (newLength < 10) {
      newLength = this.trainingInfoStore.trainingSelected.exercises.push(auxEx);
    }
    // ### end of routine
    this.http
      .put(
        this.link.baseUrl(Capacitor.getPlatform()) +
          '/trainings/' +
          this.trainingInfoStore.trainingSelected.id,
        {
          training: this.trainingInfoStore.trainingSelected,
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
              'Atualização de treino falhou!',
              'Se o problema persistir, contacte o desenvolvedor',
              JSON.stringify(response[0])
            );
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              this.showAlert(
                'Atualização de treino falhou!',
                'Se o problema persistir, contacte o desenvolvedor',
                JSON.stringify(response)
              );
            } else {
              this.showAlert('', '', 'Treino atualizado com sucesso!');
              //Esta função irá disparar a atualização do observable
              this.getTrainings();
            }
          }
        },
        error: async (err) => {
          this.handleError(err, 'Atualização de treino falhou!');
        },
        complete: () => {
          console.log('onUpdateTraining complete!');
        },
      });
  }

  async onDeleteTraining() {
    let options = new HttpParams();
    options = options
      .append('userId', this.authService.authInfo.userId)
      .append('id', this.trainingInfoStore.trainingSelected.id);

    this.http
      .delete(
        this.link.baseUrl(Capacitor.getPlatform()) +
          '/trainings/' +
          this.trainingInfoStore.trainingSelected.id,
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
              'Remoção de treino falhou!',
              'Se o problema persistir, contacte o desenvolvedor',
              JSON.stringify(response[0])
            );
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              this.showAlert(
                'Remoção de treino falhou!',
                'Se o problema persistir, contacte o desenvolvedor',
                JSON.stringify(response)
              );
            } else {
              this.showAlert('', '', 'Treino removido com sucesso!');
              //Esta função irá disparar a atualização do observable
              this.getTrainings();
            }
          }
        },
        error: async (err) => {
          this.handleError(err, 'Remoção de treinos falhou!');
        },
        complete: () => {
          console.log('onDeleteTrainning complete!');
        },
      });
  }

  //###################

  formatIntoTrainingType(info: any[]): Training[] {
    const auxInfo: Training[] = [];

    info.forEach((element) => {
      const auxElement = new Training();
      auxElement.id = element.id;
      auxElement.name = element.nome;

      for (let i = 1; i <= 10; i++) {
        if (element[`idExercicio${i}`] !== null) {
          const auxExercise = new Exercise();
          auxExercise.id = element[`idExercicio${i}`];
          auxExercise.name = element[`nomeExercicio${i}`];

          auxElement.exercises.push(auxExercise);
        }
      }

      auxInfo.push(auxElement);
    });

    return auxInfo;
  }
}
