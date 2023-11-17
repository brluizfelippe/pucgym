import { HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptorService {
  constructor(public authService: AuthService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const modifiedRequest = req.clone({
      headers: req.headers.append(
        'Authorization',
        this.authService.authInfo.token
          ? 'Bearer ' + this.authService.authInfo.token
          : ''
      ),
    });
    return next.handle(modifiedRequest);
  }
}
