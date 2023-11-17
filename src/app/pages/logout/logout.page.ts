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

  ngOnInit() {
    GoogleAuth.initialize();
  }

  ionViewWillEnter() {
    GoogleAuth.signOut()
      .then(async (data) => {
        this.authService.onUserLogout();
        const alert = await this.alertCtrl.create({
          header: 'Logout',
          message: 'usuário desconectado com sucesso.',
          buttons: ['OK'],
        });
        alert.present();
        this.authService.redirectOnUnauthorized();
      })
      .catch(async (error) => {
        console.log('error on sigin method: ', error);
        const alert = await this.alertCtrl.create({
          header: 'Logout Falhou!',

          message: error.error,
          buttons: ['OK'],
        });
        alert.present();
      });
  }
}
