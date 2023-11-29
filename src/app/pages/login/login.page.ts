import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Device, DeviceInfo } from '@capacitor/device';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

import { AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Auth } from 'src/app/classes/auth';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  userFetched: any;
  token: any;
  decodedToken: any;
  logoUrl = 'assets/img/Logo.png';

  authInfoStore = new Auth();

  private authSub = new Subscription();
  jwtHelper = new JwtHelperService();
  constructor(
    private authService: AuthService,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
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
  ngOnDestroy() {
    this.authSub.unsubscribe();
  }

  async ionViewWillEnter() {
    try {
      const deviceInfo = await Device.getInfo();
      if ((deviceInfo as unknown as DeviceInfo).platform === 'web') {
        console.log('running on web!');
        //not necessary for android and ios
        GoogleAuth.initialize();
      }
    } catch (error) {
      console.log(error);
    }
  }

  ngOnInit() {
    this.authSub = this.authService.authInfoListener().subscribe(
      async (authData) => {
        console.log(authData);
        this.authInfoStore.update(authData);
        if (this.authInfoStore.error) {
          this.showAlert(
            'Falha no login',
            '',
            this.authInfoStore.error.error.error
          );

          this.loadingCtrl.dismiss();
        } else {
          setTimeout(() => {
            this.loadingCtrl.dismiss();
            this.router.navigateByUrl('/landing/home');
          }, 1000);
        }
      },
      async (err) => {
        this.showAlert(
          'Falha no login',
          'Certifique-se de que informou o email e senha corretos',
          err.statusText
        );
      }
    );
  }

  async onSubmit(form: NgForm) {
    console.log(form);
    let loading = await this.loadingCtrl.create({
      message: 'Verificando credenciais...aguarde um pouco, por favor!',
    });
    await loading.present();
    // ### Change made on 10th, november 2021 - END

    const userData = {
      email: form.value.userEmail,
      password: form.value.userPassword,
    };

    this.authService
      .onUserLogin(userData)
      .then((value) => {
        console.log(JSON.stringify(value));
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async googleSignIn() {
    var googleUser;
    await GoogleAuth.signIn()
      .then(async (data) => {
        googleUser = data;
        console.log('login successfull :', data);
        let loading = await this.loadingCtrl.create({
          message:
            'Verificando credenciais do google...aguarde um pouco, por favor!',
        });
        await loading.present();
        // ### Change made on 10th, november 2021 - END

        const userData = {
          email: googleUser.email,
          googleId: googleUser.id,
        };

        this.authService.onUserLoginWithGoogle(userData);
      })
      .catch(async (error) => {
        console.log('error on sigin method: ', error);
        this.showAlert('Falha no login', '', error.error);
      });
  }
}
