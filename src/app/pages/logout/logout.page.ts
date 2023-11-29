import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.page.html',
  styleUrls: ['./logout.page.scss'],
})
export class LogoutPage implements OnInit {
  constructor(
    public alertCtrl: AlertController,
    public router: Router,
    public authService: AuthService
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
  ngOnInit() {
    GoogleAuth.initialize();
  }

  ionViewWillEnter() {
    if (this.authService.authInfo.imageUrl !== '') {
      GoogleAuth.signOut()
        .then(async (data) => {
          this.authService.onUserLogout();
          this.showAlert('Logout', '', 'Usuário desconectado com sucesso');

          this.authService.redirectOnUnauthorized();
        })
        .catch(async (error) => {
          console.log('error on sigin method: ', error);
          this.showAlert('Falha no logout', '', error.error);
        });
    } else {
      this.authService.onUserLogout();
      this.showAlert('Logout', '', 'Usuário desconectado com sucesso');

      this.authService.redirectOnUnauthorized();
    }
  }
}
