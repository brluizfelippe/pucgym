import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { Link } from '../classes/link';
import { Muscle } from '../classes/muscle';
import { MuscleInfo } from '../classes/muscle-info';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class MuscleService {
  muscleInfoStore = new MuscleInfo();
  auxArrayMuscle: Muscle[] = [];
  link = new Link();
  private muscleInfoStream = new Subject<MuscleInfo>();

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
    this.muscleInfoStream.next(this.muscleInfoStore);
  }

  setPropertyListener() {
    return this.muscleInfoStream.asObservable();
  }

  getProperty() {
    return this.muscleInfoStore;
  }

  onGetProperty() {
    this.muscleInfoStream.next(this.muscleInfoStore);
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

  onMusclesSelected() {
    this.getMuscles();
  }

  onMuscleSelected(muscle: Muscle) {
    this.muscleInfoStore.updateMuscleSelected(muscle);
    this.muscleInfoStream.next(this.muscleInfoStore);
  }

  onLoadingUpdate() {
    this.muscleInfoStore.updateLoading(true);
    this.muscleInfoStream.next(this.muscleInfoStore);
  }

  //###################
  async getMuscles() {
    this.http
      .get(this.link.baseUrl(Capacitor.getPlatform()) + '/muscles', {
        headers: this.setRequestHeaders(),
      })
      .subscribe({
        next: (response) => {
          Array.isArray(response)
            ? (() => {
                this.muscleInfoStore.updateMuscles(
                  this.formatIntoMuscleType(response[0])
                );
              })()
            : (() => {
                this.muscleInfoStore.updateMuscles([]);
              })(),
            this.muscleInfoStore.updateLoading(false);
          this.muscleInfoStream.next(this.muscleInfoStore);
        },
        error: async (err) => {
          this.handleError(err, 'Busca de grupos musculares falhou!');
        },
        complete: () => {
          console.log('getMuscles complete!');
        },
      });
  }

  async onCreateMuscle() {
    this.http
      .post(
        this.link.baseUrl(Capacitor.getPlatform()) + '/muscles',
        {
          name: this.muscleInfoStore.muscleSelected.name,
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
              'Cadastro de grupo muscular falhou!',
              'Se o problema persistir, contacte o desenvolvedor',
              JSON.stringify(response[0])
            );
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              this.showAlert('', '', 'Cadastro de video falhou!');
            } else {
              this.showAlert('', '', 'Grupo muscular cadastrado com sucesso!');
              //Esta função irá disparar a atualização do observable
              this.getMuscles();
            }
          }
        },
        error: async (err) => {
          this.handleError(err, 'Cadastro de grupo muscular falhou!');
        },
        complete: () => {
          console.log('onCreateMuscle complete!');
        },
      });
  }

  async onUpdateMuscle() {
    this.http
      .put(
        this.link.baseUrl(Capacitor.getPlatform()) +
          '/muscles/' +
          this.muscleInfoStore.muscleSelected.id,
        {
          name: this.muscleInfoStore.muscleSelected.name,
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
              'Atualização de grupo muscular falhou!',
              'Se o problema persistir, contacte o desenvolvedor',
              JSON.stringify(response[0])
            );
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              this.showAlert(
                'Atualização de grupo muscular falhou!',
                'Se o problema persistir, contacte o desenvolvedor',
                JSON.stringify(response)
              );
            } else {
              this.showAlert('', '', 'Grupo muscular atualzado com sucesso!');
              //Esta função irá disparar a atualização do observable
              this.getMuscles();
            }
          }
        },
        error: async (err) => {
          this.handleError(err, 'Atualização de grupo muscular falhou!');
        },
        complete: () => {
          console.log('onUpdateMuscle complete!');
        },
      });
  }

  async onDeleteMuscle() {
    let options = new HttpParams();
    options = options
      .append('userId', this.authService.authInfo.userId)
      .append('id', this.muscleInfoStore.muscleSelected.id);

    this.http
      .delete(
        this.link.baseUrl(Capacitor.getPlatform()) +
          '/muscles/' +
          this.muscleInfoStore.muscleSelected.id,
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
              'Remoção de grupo muscular falhou!',
              'Se o problema persistir, contacte o desenvolvedor',
              JSON.stringify(response[0])
            );
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              this.showAlert(
                'Remoção de grupo falhou!',
                'Se o problema persistir, contacte o desenvolvedor',
                JSON.stringify(response)
              );
            } else {
              this.showAlert('', '', 'Grupo muscular removido com sucesso!');
              //Esta função irá disparar a atualização do observable
              this.getMuscles();
            }
          }
        },
        error: async (err) => {
          this.handleError(err, 'Remoção de grupo muscular falhou!');
        },
        complete: () => {
          console.log('onDeleteMuscle complete!');
        },
      });
  }

  //###################

  formatIntoMuscleType(info: any[]) {
    console.log(info);
    const auxInfo: Muscle[] = [];
    info.forEach((element) => {
      const auxElement = new Muscle();

      auxElement.id = element.id;
      auxElement.name = element.nome;

      auxInfo.push(auxElement);
    });
    return auxInfo;
  }

  filterMuscles(searchTerm: string) {
    searchTerm = searchTerm.toLowerCase();
    this.auxArrayMuscle = this.getProperty().muscles.filter((item) =>
      item.name.toLowerCase().includes(searchTerm)
    );
    this.muscleInfoStore.updateMuscles(this.auxArrayMuscle);
    this.muscleInfoStream.next(this.muscleInfoStore);
  }
}
