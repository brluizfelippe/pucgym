import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { Link } from '../classes/link';
import { History } from '../classes/history';
import { AuthService } from './auth.service';
import { HistoryInfo } from '../classes/history-info';
import { Exercise } from '../classes/exercise';
import { HistoryMonth } from '../classes/history-month';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  historyInfoStore = new HistoryInfo();
  auxArrayHistory = [];
  link = new Link();
  private historyInfoStream = new Subject<HistoryInfo>();

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

  resetProperties() {
    this.historyInfoStore.update(new HistoryInfo());
    this.historyInfoStream.next(this.historyInfoStore);
  }

  setPropertyListener() {
    return this.historyInfoStream.asObservable();
  }

  getProperty() {
    return this.historyInfoStore;
  }

  onGetProperty() {
    this.historyInfoStream.next(this.historyInfoStore);
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

  onLoadingUpdate() {
    this.historyInfoStore.updateLoading(true);
    this.historyInfoStream.next(this.historyInfoStore);
  }

  //###################
  async getHistories(exerciseId: number) {
    let options = new HttpParams();
    options = options
      .append('userId', this.authService.authInfo.userId)
      .append('exerciseId', exerciseId);

    this.http
      .get(this.link.baseUrl(Capacitor.getPlatform()) + '/histories', {
        params: options,
        headers: this.setRequestHeaders(),
      })
      .subscribe({
        next: (response) => {
          Array.isArray(response)
            ? (() => {
                this.historyInfoStore.updateHistories(
                  this.formatIntoHistoryType(response[0])
                );
              })()
            : (() => {
                this.historyInfoStore.updateHistories([]);
              })(),
            this.historyInfoStore.updateLoading(false);
          this.historyInfoStream.next(this.historyInfoStore);
        },
        error: async (err) => {
          this.handleError(err, 'Busca de histórico falhou!');
        },
        complete: () => {
          console.log('getHistories complete!');
        },
      });
  }

  //###################
  //###################
  async getHistoriesMonth(exerciseId: number, reportType: string) {
    let options = new HttpParams();
    options = options
      .append('userId', this.authService.authInfo.userId)
      .append('exerciseId', exerciseId)
      .append('reportType', reportType);

    this.http
      .get(this.link.baseUrl(Capacitor.getPlatform()) + '/historiesbymonth', {
        params: options,
        headers: this.setRequestHeaders(),
      })
      .subscribe({
        next: (response) => {
          Array.isArray(response)
            ? (() => {
                this.historyInfoStore.updateHistoryMonthQty(
                  this.formatIntoHistoryMonthType(response[0])
                );
              })()
            : (() => {
                this.historyInfoStore.updateHistoryMonthQty([]);
              })(),
            this.historyInfoStore.updateLoading(false);
          this.historyInfoStream.next(this.historyInfoStore);
        },
        error: async (err) => {
          this.handleError(err, 'Busca de resumo mensal falhou!');
        },
        complete: () => {
          console.log('getHistoriesByMonth complete!');
        },
      });
  }

  //###################

  //###################
  async onCreateHistory(history: History) {
    this.http
      .post(
        this.link.baseUrl(Capacitor.getPlatform()) + '/histories',
        {
          event: history.event,
          value: history.value,
          idExercise: history.exercise.id,
          userId: this.authService.authInfo.userId,
        },
        {
          headers: this.setRequestHeaders(),
        }
      )
      .subscribe({
        next: async (response) => {
          //[array(),{}] -> An array with an array inside.
          // Erro no MySQL
          if (Array.isArray(response)) {
            this.showAlert(
              'Cadastro de historico falhou!',
              'Se o problema persistir, contacte o desenvolvedor',
              JSON.stringify(response[0])
            );
          }
        },
        error: async (err) => {
          this.handleError(err, 'Cadastro de histórico falhou!');
        },
        complete: () => {
          console.log('onCreateHistory complete!');
        },
      });
  }
  //###################

  formatIntoHistoryType(info: any[]) {
    const auxInfo: History[] = [];
    info.forEach((element) => {
      const auxElement = new History();

      auxElement.id = element.id;
      auxElement.event = element.evento;
      auxElement.value = element.valor;
      auxElement.date = new Date(element.dataCadastro);

      const auxExercise = new Exercise();
      auxExercise.name = element.exercicio;
      auxExercise.id = element.idExercicio;

      auxElement.exercise.update(auxExercise);

      auxInfo.push(auxElement);
    });
    return auxInfo;
  }

  formatIntoHistoryMonthType(info: any[]) {
    const auxInfo: HistoryMonth[] = [];
    info.forEach((element) => {
      const auxElement = new HistoryMonth();

      auxElement.month = element.mes;
      auxElement.year = element.ano;
      auxElement.qty = element.qtde;

      auxInfo.push(auxElement);
    });
    return auxInfo;
  }
}
