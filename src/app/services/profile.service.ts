import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { Link } from '../classes/link';
import { Profile } from '../classes/profile';
import { ProfileInfo } from '../classes/profile-info';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  profileInfoStore = new ProfileInfo();
  auxArrayProfile = [];
  link = new Link();
  private profileInfoStream = new Subject<ProfileInfo>();

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
    this.profileInfoStore.update(new ProfileInfo());
    this.profileInfoStream.next(this.profileInfoStore);
  }

  setPropertyListener() {
    return this.profileInfoStream.asObservable();
  }

  getProperty() {
    return this.profileInfoStore;
  }

  onGetProperty() {
    this.profileInfoStream.next(this.profileInfoStore);
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

  onProfilesSelected() {
    this.getProfiles();
  }

  onProfileSelected(profile: Profile) {
    this.profileInfoStore.updateProfileSelected(profile);
    this.profileInfoStream.next(this.profileInfoStore);
  }

  onLoadingUpdate() {
    this.profileInfoStore.updateLoading(true);
    this.profileInfoStream.next(this.profileInfoStore);
  }

  //###################
  async getProfiles() {
    this.http
      .get(this.link.baseUrl(Capacitor.getPlatform()) + '/profiles', {
        headers: this.setRequestHeaders(),
      })
      .subscribe({
        next: (response) => {
          Array.isArray(response)
            ? (() => {
                this.profileInfoStore.updateProfiles(
                  this.formatIntoProfileType(response[0])
                );
              })()
            : (() => {
                this.profileInfoStore.updateProfiles([]);
              })(),
            this.profileInfoStore.updateLoading(false);
          this.profileInfoStream.next(this.profileInfoStore);
        },
        error: async (err) => {
          this.handleError(err, 'Busca de perfis falhou!');
        },
        complete: () => {
          console.log('getProfiles complete!');
        },
      });
  }

  //###################

  formatIntoProfileType(info: any[]) {
    const auxInfo: Profile[] = [];
    info.forEach((element) => {
      const auxElement = new Profile();

      auxElement.id = element.id;
      auxElement.name = element.nome;

      auxInfo.push(auxElement);
    });
    return auxInfo;
  }
}
