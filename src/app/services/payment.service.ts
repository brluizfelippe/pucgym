import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { Link } from '../classes/link';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  link = new Link();
  private paymentInfoStream = new Subject();

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
  setPropertyListener() {
    return this.paymentInfoStream.asObservable();
  }
  async onCheckout(serviceSelected: any) {
    let bodyParams = {
      items: [{ id: serviceSelected }],
      userId: this.authService.authInfo.userId,
      userEmail: this.authService.authInfo.email,
    };
    /* let bodyParams = {
      items: [
        { id: 1, quantity: 3 },
        { id: 2, quantity: 1 },
      ],
      userId: this.authService.getProperty().userId,
      userEmail: this.authService.getProperty().email,
    }; */
    this.http
      .post(
        this.link.baseUrl(Capacitor.getPlatform()) + '/checkout',
        {
          bodyParams,
        },
        {
          headers: this.setRequestHeaders(),
        }
      )
      .subscribe({
        next: (response) => {
          this.paymentInfoStream.next(response);
          this.router.navigateByUrl('/landing/home');
        },
        error: (error) => {
          this.paymentInfoStream.next(error);
        },
        complete: () => {
          'onCheckout complete!';
        },
      });
  }
}
