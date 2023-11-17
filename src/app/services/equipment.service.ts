import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { Equipment } from '../classes/equipment';
import { EquipmentInfo } from '../classes/equipment-info';
import { Link } from '../classes/link';
import { Video } from '../classes/video';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class EquipmentService {
  equipmentInfoStore = new EquipmentInfo();
  auxArrayEquipment: Equipment[] = [];
  link = new Link();
  private equipmentInfoStream = new Subject<EquipmentInfo>();

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
    this.equipmentInfoStore = new EquipmentInfo();
    this.equipmentInfoStream.next(this.equipmentInfoStore);
  }

  setPropertyListener() {
    return this.equipmentInfoStream.asObservable();
  }

  getProperty() {
    return this.equipmentInfoStore;
  }

  onGetProperty() {
    this.equipmentInfoStream.next(this.equipmentInfoStore);
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
    this.getEquipments();
  }

  onEquipmentSelected(equipment: Equipment) {
    this.equipmentInfoStore.updateEquipmentSelected(equipment);
    this.equipmentInfoStream.next(this.equipmentInfoStore);
  }

  onLoadingUpdate() {
    this.equipmentInfoStore.updateLoading(true);
    this.equipmentInfoStream.next(this.equipmentInfoStore);
  }

  //###################
  async getEquipments() {
    this.http
      .get(this.link.baseUrl(Capacitor.getPlatform()) + '/equipments', {
        headers: this.setRequestHeaders(),
      })
      .subscribe({
        next: (response) => {
          Array.isArray(response)
            ? (() => {
                this.equipmentInfoStore.updateEquipments(
                  this.formatIntoEquipmentType(response[0])
                );
              })()
            : (() => {
                this.equipmentInfoStore.updateEquipments([]);
              })(),
            this.equipmentInfoStore.updateLoading(false);
          this.equipmentInfoStream.next(this.equipmentInfoStore);
        },
        error: async (err) => {
          const alert = await this.alertCtrl.create({
            header: 'Busca de equipmamentos falhou!',
            subHeader: 'se o problema persistir, contacte o desenvolvedor',
            message: err.status === 401 ? 'Login expirado!' : err.status,
            buttons: ['OK'],
          });
          //Se não for erro de autenticação, será exibido no alerta, porém
          //sem desviar para página de login.
          err.status === 401 ? this.redirectOnUnhautorized() : (() => {})();

          alert.present();
        },
        complete: () => {
          console.log('getEquipments complete!');
        },
      });
  }

  async onCreateEquipment() {
    this.http
      .post(
        this.link.baseUrl(Capacitor.getPlatform()) + '/equipments',
        {
          equipment: this.equipmentInfoStore.equipmentSelected,
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
            const alert = await this.alertCtrl.create({
              header: 'Cadastro de equipamento falhou!',
              subHeader: 'Se o problema persistir, contacte o desenvolvedor',
              message: JSON.stringify(response[0]),
              buttons: ['OK'],
            });

            alert.present();
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              const alert = await this.alertCtrl.create({
                header: 'Cadastro de video falhou!',
                subHeader: 'Se o problema persistir, contacte o desenvolvedor',
                message: JSON.stringify(response),
                buttons: ['OK'],
              });

              alert.present();
            } else {
              const alert = await this.alertCtrl.create({
                message: 'Equipamento cadastrado com sucesso!',
                buttons: ['OK'],
              });

              alert.present();
              //Esta função irá disparar a atualização do observable
              this.getEquipments();
            }
          }
        },
        error: async (err) => {
          const alert = await this.alertCtrl.create({
            header: 'Cadastro de equipamento falhou!',
            subHeader: 'Se o problema persistir, contacte o desenvolvedor.',
            message: err.status === 401 ? 'Login expirado!' : err.status,
            buttons: ['OK'],
          });

          alert.present();
          this.redirectOnUnhautorized();
        },
        complete: () => {
          console.log('onCreateEquipment complete!');
        },
      });
  }

  async onUpdateEquipment() {
    this.http
      .put(
        this.link.baseUrl(Capacitor.getPlatform()) +
          '/equipments/' +
          this.equipmentInfoStore.equipmentSelected.id,
        {
          equipment: this.equipmentInfoStore.equipmentSelected,
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
            const alert = await this.alertCtrl.create({
              header: 'Atualização de equipamento falhou!',
              subHeader: 'Se o problema persistir, contacte o desenvolvedor',
              message: JSON.stringify(response[0]),
              buttons: ['OK'],
            });

            alert.present();
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              const alert = await this.alertCtrl.create({
                header: 'Atualização de equipamento falhou!',
                subHeader: 'Se o problema persistir, contacte o desenvolvedor',
                message: JSON.stringify(response),
                buttons: ['OK'],
              });

              alert.present();
            } else {
              const alert = await this.alertCtrl.create({
                message: 'Equipamento atualzado com sucesso!',
                buttons: ['OK'],
              });

              alert.present();
              //Esta função irá disparar a atualização do observable
              this.getEquipments();
            }
          }
        },
        error: async (err) => {
          const alert = await this.alertCtrl.create({
            header: 'Atualização de equipamento falhou!',
            subHeader: 'Se o problema persistir, contacte o desenvolvedor.',
            message: err.status === 401 ? 'Login expirado!' : err.status,
            buttons: ['OK'],
          });

          alert.present();
          this.redirectOnUnhautorized();
        },
        complete: () => {
          console.log('onUpdateEquipment complete!');
        },
      });
  }

  async onDeleteEquipment() {
    let options = new HttpParams();
    options = options
      .append('userId', this.authService.authInfo.userId)
      .append('id', this.equipmentInfoStore.equipmentSelected.id);

    this.http
      .delete(
        this.link.baseUrl(Capacitor.getPlatform()) +
          '/equipments/' +
          this.equipmentInfoStore.equipmentSelected.id,
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
              header: 'Remoção de equipamento falhou!',
              subHeader: 'Se o problema persistir, contacte o desenvolvedor',
              message: JSON.stringify(response[0]),
              buttons: ['OK'],
            });

            alert.present();
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              const alert = await this.alertCtrl.create({
                header: 'Remoção de equipamento falhou!',
                subHeader: 'Se o problema persistir, contacte o desenvolvedor',
                message: JSON.stringify(response),
                buttons: ['OK'],
              });

              alert.present();
            } else {
              const alert = await this.alertCtrl.create({
                message: 'Equipamento removido com sucesso!',
                buttons: ['OK'],
              });

              alert.present();
              //Esta função irá disparar a atualização do observable
              this.getEquipments();
            }
          }
        },
        error: async (err) => {
          const alert = await this.alertCtrl.create({
            header: 'Remoção de equipamento falhou!',
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
          console.log('onDeleteEquipment complete!');
        },
      });
  }

  //###################

  formatIntoEquipmentType(info: any[]) {
    console.log(info);
    const auxInfo: Equipment[] = [];
    info.forEach((element) => {
      const auxElement = new Equipment();

      auxElement.id = element.id;
      auxElement.name = element.nome;

      const auxImage = new Video();
      auxImage.id = element.idImagem;
      auxImage.fieldname = element.fieldname;
      auxImage.originalname = element.originalname;
      auxImage.encoding = element.encoding;
      auxImage.mimetype = element.message;
      auxImage.size = element.size;
      auxImage.bucket = element.bucket;
      auxImage.key = element.videokey;
      auxImage.acl = element.acl;
      auxImage.contentType = element.contentType;
      auxImage.storageClass = element.storageClass;
      auxImage.location = element.location;
      auxImage.etag = element.etag;

      auxElement.image.update(auxImage);

      auxInfo.push(auxElement);
    });
    return auxInfo;
  }

  filterEquipments(searchTerm: string) {
    searchTerm = searchTerm.toLowerCase();

    this.auxArrayEquipment = this.getProperty().equipments.filter((item) =>
      item.name.toLowerCase().includes(searchTerm)
    );

    this.equipmentInfoStore.updateEquipments(this.auxArrayEquipment);
    this.equipmentInfoStream.next(this.equipmentInfoStore);
  }
}
