import { Component, OnInit } from '@angular/core';
import { Event, Router, RouterEvent } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { Auth } from 'src/app/classes/auth';
import { AuthService } from 'src/app/services/auth.service';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {
  private authSub = new Subscription();
  authInfo = new Auth();
  pages = new Array();

  selectedPath = '';

  constructor(private router: Router, private authService: AuthService) {
    this.router.events
      .pipe(filter((e: any): e is RouterEvent => e instanceof RouterEvent))
      .subscribe((e: RouterEvent) => {
        this.selectedPath = e.url;
      });
  }
  async ngOnInit() {
    //Push notifications

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
      }
    });

    PushNotifications.addListener('registration', (token: Token) => {
      alert('Push registration success, token: ' + token.value);
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      alert('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        alert('Push received: ' + JSON.stringify(notification));
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        alert('Push action performed: ' + JSON.stringify(notification));
      }
    );

    //push notifictions

    this.authSub = this.authService.authInfoListener().subscribe(
      (authData) => {
        this.authInfo = authData;
        this.pages = [
          {
            title: 'Meu Programa',
            url: '/landing/home',
            icon: 'home-outline',
            condition: this.authInfo.isLoggedIn,
          },
          {
            title: 'Administração',
            url: '/landing/admin',
            icon: 'cog-outline',
            condition: this.authInfo.isAdmin,
          },
          {
            title: 'Pagamento',
            url: '/landing/payment',
            icon: 'wallet-outline',
            condition: this.authInfo.isClient,
          },
          {
            title: 'Login',
            url: '/landing/login',
            icon: 'log-in',
            condition: !this.authInfo.isLoggedIn,
          },
          {
            title: 'Registre-se',
            url: '/landing/register',
            icon: 'person-add',
            condition: !this.authInfo.isLoggedIn,
          },
          {
            title: 'Logout',
            url: '/landing/logout',
            icon: 'walk',
            condition: this.authInfo.isLoggedIn,
          },
        ];
      },
      (err) => {}
    );
    this.authService.updateAuthInfo();
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }
}
