import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { Link } from '../classes/link';
import { Profile } from '../classes/profile';
import { Program } from '../classes/program';
import { User } from '../classes/user';
import { UserInfo } from '../classes/user-info';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  userInfoStore = new UserInfo();
  auxArrayUsers: User[] = [];
  link = new Link();
  private userInfoStream = new Subject<UserInfo>();

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
    this.userInfoStream.next(this.userInfoStore);
  }

  setPropertyListener() {
    return this.userInfoStream.asObservable();
  }

  getProperty() {
    return this.userInfoStore;
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

  private formatIntoUserType(info: any[]) {
    const auxInfoArray: any[] = [];
    info.forEach((element) => {
      const auxProfile = new Profile();

      auxProfile.id = element.idTipo;
      auxProfile.name = element.tipo;

      const auxProgram = new Program();

      auxProgram.id = element.idPrograma;
      auxProgram.name = element.programa;

      auxInfoArray.push({
        id: element.id,
        firstName: element.primeiroNome,
        lastName: element.ultimoNome,
        email: element.email,
        profile: auxProfile,
        program: auxProgram,
      });
    });

    return auxInfoArray;
  }

  filterUsers(searchTerm: string) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    this.auxArrayUsers = this.getProperty().users.filter((item) => {
      return (
        item.firstName!.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.lastName!.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.email!.toLowerCase().includes(lowerCaseSearchTerm)
      );
    });

    this.userInfoStore.updateUsers(this.auxArrayUsers);
    this.userInfoStream.next(this.userInfoStore);
  }

  onUsersSelected() {
    this.getUsers();
  }

  onUserSelected(user: User) {
    this.userInfoStore.updateUserSelected(user);
    this.userInfoStream.next(this.userInfoStore);
  }
  onLoadingUpdate() {
    this.userInfoStore.updateLoading(true);
    this.userInfoStream.next(this.userInfoStore);
  }
  async getUsers() {
    this.userInfoStore.updateLoading(true);
    this.http
      .get(this.link.baseUrl(Capacitor.getPlatform()) + '/users', {
        headers: this.setRequestHeaders(),
      })
      .subscribe({
        next: (response) => {
          //in case of error from MySQL the response is something like:
          //[array(),{}] -> An array with an array inside.
          Array.isArray(response)
            ? this.userInfoStore.updateUsers(
                this.formatIntoUserType(response[0])
              )
            : (() => {
                // atualiza apenas o array de users com um array vazio. Nao atualiza toda a store
                this.userInfoStore.updateUsers([]);
              })();
          this.userInfoStore.updateLoading(false);
          this.userInfoStream.next(this.userInfoStore);
        },
        error: async (err) => {
          this.handleError(err, 'Busca de usuários falhou!');
        },
        complete: () => {
          console.info('getUsers complete!');
        },
      });
  }

  onUpdateUserInfo(user: User) {
    this.userInfoStore.updateUserSelected(user);
  }

  async onCreateUser() {
    this.http
      .post(
        this.link.baseUrl(Capacitor.getPlatform()) + '/users/',
        {
          userSelected: this.userInfoStore.userSelected,
          userId: this.authService.authInfo.userId,
        },
        { headers: this.setRequestHeaders() }
      )
      .subscribe({
        next: async (response) => {
          console.log(response);

          if (Array.isArray(response)) {
            this.showAlert(
              'Criação de usuário falhou!',
              'Se o problema persistir, contacte o desenvolvedor',
              response[0][0].MYSQL_ERROR === 1062
                ? 'Este email já está cadastrado!'
                : response[0][0].MYSQL_ERROR_MSG
            );

            this.userInfoStore.updateLoading(false);
            this.userInfoStream.next(this.userInfoStore);
          } else {
            this.showAlert('', '', 'Usuario criado com sucesso!');
          }
        },
        error: async (err) => {
          this.handleError(err, 'Criação de usuário falhou!');
        },
        complete: () => {
          console.log('createUser complete!');
        },
      });
  }

  async onUpdateUser() {
    this.http
      .put(
        this.link.baseUrl(Capacitor.getPlatform()) +
          '/users/' +
          this.userInfoStore.userSelected.id,
        {
          userSelected: this.userInfoStore.userSelected,
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
              'Atualização de usuário falhou!',
              'Se o problema persistir, contacte o desenvolvedor',
              JSON.stringify(response[0])
            );
          } else {
            // Erro no AWS S3 =>
            if (response.hasOwnProperty('code')) {
              this.showAlert(
                'Atualização de usuário falhou!',
                'Se o problema persistir, contacte o desenvolvedor',
                JSON.stringify(response)
              );
            } else {
              this.showAlert('', '', 'Usuário atualzado com sucesso!');

              //Esta função irá disparar a atualização do observable
              this.getUsers();
            }
          }
        },
        error: async (err) => {
          this.handleError(err, 'Atualização de usuário falhou!');
        },
        complete: () => {
          console.log('onUpdateUser complete!');
        },
      });
  }
}
