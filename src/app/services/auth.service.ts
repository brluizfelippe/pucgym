import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Auth } from '../classes/auth';
import { Link } from '../classes/link';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private link: Link = new Link();
  private authInfoStore: Auth = new Auth();
  private jwtHelper: JwtHelperService = new JwtHelperService();
  private authInfoStream: Subject<Auth> = new Subject<Auth>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  private async showAlert(
    header: string,
    subHeader: string,
    message: string
  ): Promise<void> {
    const alert = await this.alertCtrl.create({
      header,
      subHeader,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  private handleError(err: any, customMessage: string): void {
    const message = err.status === 401 ? 'Login expirado!' : `${err.status}`;
    this.showAlert(
      customMessage,
      'Se o problema persistir, contacte o desenvolvedor.',
      message
    );
    if (err.status === 401) this.redirectOnUnauthorized();
  }

  resetProperties(): void {
    this.authInfoStore = new Auth();
    this.authInfoStream.next(this.authInfoStore);
  }

  public async redirectOnUnauthorized(): Promise<boolean> {
    return this.router.navigateByUrl('/landing/login');
  }

  private handleUserInfo(userInfo: any): void {
    if (userInfo.success) {
      const decodedToken = this.jwtHelper.decodeToken(userInfo.token);
      console.log(decodedToken);

      const auxAuth = new Auth()
        .setEmail(userInfo.email)
        .setProfileType(userInfo.type)
        .setToken(userInfo.token)
        .setUserInfo(decodedToken)
        .setImageUrl(decodedToken.imageUrl)
        .setIdProgram(userInfo.idProgram);

      console.log(userInfo, auxAuth);
      this.authInfoStore.update(auxAuth);
    } else {
      this.resetProperties();
    }
  }

  private setRequestHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/json');
    headers = headers.set('Content-Type', 'application/json');
    return headers;
  }

  private performLogin(endpoint: string, credentials: object): Observable<any> {
    return this.http.post(
      this.link.baseUrl(Capacitor.getPlatform()) + endpoint,
      credentials,
      {
        headers: this.setRequestHeaders(),
      }
    );
  }

  authInfoListener(): Observable<Auth> {
    return this.authInfoStream.asObservable();
  }

  get authInfo(): Auth {
    return this.authInfoStore;
  }

  updateAuthInfo(): void {
    this.authInfoStream.next(this.authInfoStore);
  }

  async onUserLogin(user: { email: string; password: string }): Promise<void> {
    console.log(user);
    this.performLogin('/users/login', {
      userEmail: user.email,
      userPassword: user.password,
    }).subscribe({
      next: async (response) => {
        console.log(response);
        this.handleUserInfo(response);
        this.updateAuthInfo();
      },
      error: (err) => {
        this.authInfoStore.setError(err);
        this.updateAuthInfo();
      },
      complete: () => console.log('onUserLogin complete!'),
    });
  }

  async onUserLoginWithGoogle(user: {
    email: string;
    googleId: string;
  }): Promise<void> {
    console.log(user);
    this.performLogin('/users/googlelogin', {
      userEmail: user.email,
      googleId: user.googleId,
    }).subscribe({
      next: async (response) => {
        console.log(response);
        this.handleUserInfo(response);
        this.updateAuthInfo();
      },
      error: (err) => {
        this.authInfoStore.setError(err);
        this.updateAuthInfo();
      },
      complete: () => console.log('onUserLoginWithGoogle complete!'),
    });
  }

  onUserLogout(): void {
    this.resetProperties();
  }
}
