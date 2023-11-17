import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Device, DeviceInfo } from '@capacitor/device';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Auth } from 'src/app/classes/auth';
import { UserInfo } from 'src/app/classes/user-info';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  authInfoStore = new Auth();
  userInfoStore = new UserInfo();
  userSub = new Subscription();
  authSub = new Subscription();
  logoUrl = '/assets/img/Logo.png';
  constructor(
    private userService: UserService,
    private authService: AuthService,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public router: Router
  ) {}

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
    this.authSub = this.authService.authInfoListener().subscribe((authData) => {
      this.authInfoStore.update(authData);
    });
    this.authInfoStore.update(this.authService.authInfo);
  }

  async googleSignup() {
    var googleUser;
    await GoogleAuth.signIn()
      .then((data) => {
        googleUser = data;
        this.userInfoStore.userSelected.email = googleUser.email;
        this.userInfoStore.userSelected.firstName = googleUser.givenName;
        this.userInfoStore.userSelected.googleId = googleUser.id;
        this.userInfoStore.userSelected.googleName = googleUser.name;
        this.userInfoStore.userSelected.imageUrl = googleUser.imageUrl;
        this.userInfoStore.userSelected.lastName = googleUser.familyName;
        this.userInfoStore.userSelected.password = 'no-pass';
        this.onSubmit();

        console.log(googleUser, this.userInfoStore);
      })
      .catch(async (error) => {
        console.log('error on sigin method: ', error);
        const alert = await this.alertCtrl.create({
          header: 'Registro Falhou!',

          message: error.error,
          buttons: ['OK'],
        });
        alert.present();
      });
  }

  onSubmit() {
    this.userInfoStore.userSelected.profile.name = 'cliente';
    this.userService.onUserSelected(this.userInfoStore.userSelected);
    this.userService.onCreateUser();
    this.authService.redirectOnUnauthorized();
  }

  onCancelar() {
    this.authService.redirectOnUnauthorized();
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.authSub.unsubscribe();
  }
}
