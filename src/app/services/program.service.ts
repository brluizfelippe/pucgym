import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { Link } from '../classes/link';
import { Program } from '../classes/program';
import { ProgramInfo } from '../classes/program-info';
import { Training } from '../classes/training';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProgramService {
  programInfoStore = new ProgramInfo();
  auxArrayprogram = [];
  link = new Link();
  private programInfoStream = new Subject<ProgramInfo>();

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
    this.programInfoStream.next(this.programInfoStore);
  }

  setPropertyListener() {
    return this.programInfoStream.asObservable();
  }

  getProperty() {
    return this.programInfoStore;
  }

  onGetProperty() {
    this.programInfoStream.next(this.programInfoStore);
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

  onProgramsSelected() {
    this.getPrograms();
  }

  onProgramSelected(program: Program) {
    this.programInfoStore.updateProgramSelected(program);
    this.programInfoStream.next(this.programInfoStore);
  }

  onLoadingUpdate() {
    this.programInfoStore.updateLoading(true);
    this.programInfoStream.next(this.programInfoStore);
  }

  async getPrograms() {
    this.http
      .get(this.link.baseUrl(Capacitor.getPlatform()) + '/programs', {
        headers: this.setRequestHeaders(),
      })
      .subscribe({
        next: (response) => {
          Array.isArray(response)
            ? (() => {
                this.programInfoStore.updatePrograms(
                  this.formatIntoProgramType(response[0])
                );
              })()
            : (() => {
                this.programInfoStore.updatePrograms([]);
              })(),
            this.programInfoStore.updateLoading(false);
          this.programInfoStream.next(this.programInfoStore);
        },
        error: async (err) => {
          this.handleError(err, 'Busca de programas de treino falhou!');
        },
        complete: () => {
          console.log('getPrograms complete!');
        },
      });
  }

  async getProgram() {
    this.http
      .get(
        this.link.baseUrl(Capacitor.getPlatform()) +
          '/programs' +
          '/' +
          this.programInfoStore.programSelected.id,
        {
          headers: this.setRequestHeaders(),
        }
      )
      .subscribe({
        next: (response) => {
          Array.isArray(response)
            ? (() => {
                this.programInfoStore.updatePrograms(
                  this.formatIntoProgramType(response[0])
                );
              })()
            : (() => {
                this.programInfoStore.updatePrograms([]);
              })(),
            this.programInfoStore.updateLoading(false);
          this.programInfoStream.next(this.programInfoStore);
        },
        error: async (err) => {
          this.handleError(err, 'Busca de programa de treino falhou!');
        },
        complete: () => {
          console.log('getProgram complete!');
        },
      });
  }

  async onCreateProgram() {
    // ### routine to complete the array equipments to have always 10 elements.###
    // ### Otherwise there will be error on the backend
    let newLength = this.programInfoStore.programSelected.trainings.length;
    let auxTraining = new Training();
    while (newLength < 10) {
      newLength =
        this.programInfoStore.programSelected.trainings.push(auxTraining);
    }
    // ### end of routine
    this.http
      .post(
        this.link.baseUrl(Capacitor.getPlatform()) + '/programs',
        {
          program: this.programInfoStore.programSelected,
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
        sql: "call cadastraVideo('file','WhatsApp Video 2022-02-09 at 07.37.42.mp4','7bit','video/mp4',2339196,'altaenergia','2db5c802a5ca8fe3fc5cd20d013d955e-WhatsApp Video 2022-02-09 at 07.37.42.mp4','public-read','video/mp4','STANDARD','\\\"aece84cd2786568077165f6fdf3014ab\\\"',-1,?)" },
      }
      */
          //[array(),{}] -> An array with an array inside.
          // Erro no MySQL
          if (Array.isArray(response)) {
            this.showAlert(
              'Cadastro de programa de treino falhou!',
              'Se o problema persistir, contacte o desenvolvedor',
              JSON.stringify(response[0])
            );
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              this.showAlert(
                'Cadastro de programa de treino falhou!',
                'Se o problema persistir, contacte o desenvolvedor',
                JSON.stringify(response)
              );
            } else {
              this.showAlert(
                '',
                '',
                'Programa de treino cadastrado com sucesso!'
              );

              //Esta função irá disparar a atualização do observable
              this.getPrograms();
            }
          }
        },
        error: async (err) => {
          this.handleError(err, 'Cadastro de programa de treino falhou!');
        },
        complete: () => {
          console.log('onCreateProgram complete!');
        },
      });
  }

  async onUpdateProgram() {
    // ### routine to complete the array equipments to have always 10 elements.###
    // ### Otherwise there will be error on the backend
    let newLength = this.programInfoStore.programSelected.trainings.length;
    let auxTraining = new Training();
    while (newLength < 10) {
      newLength =
        this.programInfoStore.programSelected.trainings.push(auxTraining);
    }
    // ### end of routine
    this.http
      .put(
        this.link.baseUrl(Capacitor.getPlatform()) +
          '/programs/' +
          this.programInfoStore.programSelected.id,
        {
          program: this.programInfoStore.programSelected,
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
        sql: "call cadastraVideo('file','WhatsApp Video 2022-02-09 at 07.37.42.mp4','7bit','video/mp4',2339196,'altaenergia','2db5c802a5ca8fe3fc5cd20d013d955e-WhatsApp Video 2022-02-09 at 07.37.42.mp4','public-read','video/mp4','STANDARD','\\\"aece84cd2786568077165f6fdf3014ab\\\"',-1,?)" },
      }
      */
          //[array(),{}] -> An array with an array inside.
          // Erro no MySQL
          if (Array.isArray(response)) {
            this.showAlert(
              'Atualização de programa de treino falhou!',
              'Se o problema persistir, contacte o desenvolvedor',
              JSON.stringify(response[0])
            );
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              this.showAlert(
                'Atualização de programa de treino falhou!',
                'Se o problema persistir, contacte o desenvolvedor',
                JSON.stringify(response)
              );
            } else {
              this.showAlert('', '', 'Programa atualizado com sucesso!');
              //Esta função irá disparar a atualização do observable
              this.getPrograms();
            }
          }
        },
        error: async (err) => {
          this.handleError(err, 'Atualização de programa de treino falhou!');
        },
        complete: () => {
          console.log('onUpdateProgram complete!');
        },
      });
  }

  async onDeleteProgram() {
    let options = new HttpParams();
    options = options
      .append('userId', this.authService.authInfo.userId)
      .append('id', this.programInfoStore.programSelected.id);

    this.http
      .delete(
        this.link.baseUrl(Capacitor.getPlatform()) +
          '/programs/' +
          this.programInfoStore.programSelected.id,
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
              'Remoção de programa de treino falhou!',
              'Se o problema persistir, contacte o desenvolvedor',
              JSON.stringify(response[0])
            );
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              this.showAlert(
                'Remoção de programa de treino falhou!',
                'Se o problema persistir, contacte o desenvolvedor',
                JSON.stringify(response)
              );
            } else {
              this.showAlert(
                '',
                '',
                'Porgrama de treino removido com sucesso!'
              );

              //Esta função irá disparar a atualização do observable
              this.getPrograms();
            }
          }
        },
        error: async (err) => {
          this.handleError(err, 'Remoção de Programa de treino falhou!');
        },
        complete: () => {
          console.log('onDeleteProgram complete!');
        },
      });
  }

  //###################
  formatIntoProgramType(info: any[]): Program[] {
    const auxInfo: Program[] = [];

    info.forEach((element) => {
      const auxElement = new Program();
      auxElement.id = element.id;
      auxElement.name = element.nome;

      for (let i = 1; i <= 10; i++) {
        const auxTraining = new Training();
        auxTraining.id = element[`idTreino${i}`];
        auxTraining.name = element[`nomeTreino${i}`];

        if (auxTraining.id !== null) {
          auxElement.trainings.push(auxTraining);
        }
      }

      auxInfo.push(auxElement);
    });

    return auxInfo;
  }
}
