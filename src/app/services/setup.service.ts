import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { Exercise } from '../classes/exercise';
import { Link } from '../classes/link';
import { Setup } from '../classes/setup';
import { SetupInfo } from '../classes/setup-info';
import { User } from '../classes/user';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class SetupService {
  setupInfoStore = new SetupInfo();
  auxArraySetup = [];
  link = new Link();
  private setupInfoStream = new Subject<SetupInfo>();

  constructor(
    public http: HttpClient,
    public authService: AuthService,
    public loadingCtrl: LoadingController,
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

  resetProperties() {
    this.setupInfoStream.next(this.setupInfoStore);
  }

  setPropertyListener() {
    return this.setupInfoStream.asObservable();
  }

  getProperty() {
    return this.setupInfoStore;
  }

  onGetProperty() {
    this.setupInfoStream.next(this.setupInfoStore);
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

  onSetupsSelected() {
    this.getSetups();
  }

  onSetupSelected(setup: Setup) {
    this.setupInfoStore.updateSetupSelected(setup);
    this.setupInfoStream.next(this.setupInfoStore);
  }

  onLoadingUpdate() {
    this.setupInfoStore.updateLoading(true);
    this.setupInfoStream.next(this.setupInfoStore);
  }

  async getSetups() {
    this.http
      .get(this.link.baseUrl(Capacitor.getPlatform()) + '/setups', {
        headers: this.setRequestHeaders(),
      })
      .subscribe({
        next: (response) => {
          Array.isArray(response)
            ? (() => {
                this.setupInfoStore.updateSetups(
                  this.formatIntoSetupType(response[0])
                );
              })()
            : (() => {
                this.setupInfoStore.updateSetups([]);
              })();
        },
        error: async (err) => {
          this.handleError(err, 'Busca de configurações falhou!');
          this.setupInfoStore.updateLoading(false);
          this.setupInfoStream.next(this.setupInfoStore);
        },
        complete: () => {
          console.log('getSetups complete!');
          this.setupInfoStore.updateLoading(false);
          this.setupInfoStream.next(this.setupInfoStore);
        },
      });
  }

  async getSetup(idUser: any, idExercise: any) {
    let options = new HttpParams();
    options = options.append('idUser', idUser);
    options = options.append('idExercise', idExercise);
    this.http
      .get(this.link.baseUrl(Capacitor.getPlatform()) + '/setup', {
        params: options,
        headers: this.setRequestHeaders(),
      })
      .subscribe({
        next: (response) => {
          Array.isArray(response)
            ? (() => {
                this.setupInfoStore.updateSetups(
                  this.formatIntoSetupType(response[0])
                );
                // Expects only one element from this array, because there must be only one
                // setup for each user and exercise.
                this.setupInfoStore.updateSetupSelected(
                  this.setupInfoStore.setups[0]
                );
              })()
            : (() => {
                this.setupInfoStore.updateSetups([]);
              })(),
            this.setupInfoStore.updateLoading(false);
          this.setupInfoStream.next(this.setupInfoStore);
        },
        error: async (err) => {
          this.handleError(err, 'Busca de configuração falhou!');
        },
        complete: () => {
          console.log('getSetup complete!');
        },
      });
  }

  async onCreateSetup(userId: any) {
    this.http
      .post(
        this.link.baseUrl(Capacitor.getPlatform()) + '/setups',
        {
          setup: this.setupInfoStore.setupSelected,
          userId: userId,
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
              'Cadastro de configuração falhou!',
              'Se o problema persistir, contacte o desenvolvedor',
              JSON.stringify(response[0])
            );
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              this.showAlert(
                'Cadastro de configuração falhou!',
                'Se o problema persistir, contacte o desenvolvedor',
                JSON.stringify(response)
              );
            } else {
              this.getSetups();
            }
          }
        },
        error: async (err) => {
          this.handleError(err, 'Cadastro de configuração falhou!');
        },
        complete: () => {
          console.log('createSetup complete!');
        },
      });
  }

  async onUpdateSetup(userId: any) {
    this.http
      .put(
        this.link.baseUrl(Capacitor.getPlatform()) +
          '/setups/' +
          this.setupInfoStore.setupSelected.id,
        {
          setup: this.setupInfoStore.setupSelected,
          userId: userId,
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
              'Atualização de configuração falhou!',
              'Se o problema persistir, contacte o desenvolvedor',
              JSON.stringify(response[0])
            );
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              this.showAlert(
                'Atualização de configuração falhou!',
                'Se o problema persistir, contacte o desenvolvedor',
                JSON.stringify(response)
              );
            } else {
              //Esta função irá disparar a atualização do observable
              this.getSetups();
            }
          }
        },
        error: async (err) => {
          this.handleError(err, 'Atualização de configuração falhou!');
        },
        complete: () => {
          console.log('onUpdateSetup complete!');
        },
      });
  }

  async onDeleteSetup() {
    let options = new HttpParams();
    options = options
      .append('userId', this.authService.authInfo.userId)
      .append('id', this.setupInfoStore.setupSelected.id);

    this.http
      .delete(
        this.link.baseUrl(Capacitor.getPlatform()) +
          '/setups/' +
          this.setupInfoStore.setupSelected.id,
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
              'Remoção de configuração falhou!',
              'Se o problema persistir, contacte o desenvolvedor',
              JSON.stringify(response[0])
            );
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              this.showAlert(
                'Remoção de configuração falhou!',
                'Se o problema persistir, contacte o desenvolvedor',
                JSON.stringify(response)
              );
            } else {
              //Esta função irá disparar a atualização do observable
              this.getSetups();
            }
          }
        },
        error: async (err) => {
          this.handleError(err, 'Remoção de configurações falhou!');
        },
        complete: () => {
          console.log('onDeleteSetup complete!');
        },
      });
  }

  //###################

  private formatIntoSetupType(info: any[]): Setup[] {
    // Check if the array is empty or undefined
    if (!info || info.length === 0) {
      // Return an array with a single empty Setup instance
      return [new Setup()];
    }

    // Process the non-empty array
    return info
      .filter((element) => element.id != -1)
      .map((element) => {
        const auxUser = new User();
        auxUser.id = element.idUsuario;

        const auxExercise = new Exercise();
        auxExercise.id = element.idExercicio;

        const auxSetup = new Setup();
        auxSetup.id = element.id;
        auxSetup.load = element.carga;
        auxSetup.repetition = element.repeticao;
        auxSetup.set = element.ajuste;
        auxSetup.user = auxUser;
        auxSetup.exercise = auxExercise;

        return auxSetup;
      });
  }
}
