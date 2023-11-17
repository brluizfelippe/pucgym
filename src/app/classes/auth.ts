import { HttpErrorResponse } from '@angular/common/http';
export class Auth {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isClient: boolean;
  user: string;
  token: string;
  userId: number;
  imageUrl: string;
  email: string;
  idProgram: number;
  error!: HttpErrorResponse;

  constructor() {
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.isClient = false;
    this.user = '';
    this.token = '';
    this.userId = 0;
    this.imageUrl = '';
    this.email = '';
    this.idProgram = -1;
  }
  update(authData: Auth) {
    this.isLoggedIn = authData.isLoggedIn;
    this.isAdmin = authData.isAdmin;
    this.isClient = authData.isClient;
    this.user = authData.user;
    this.token = authData.token;
    this.userId = authData.userId;
    this.imageUrl = authData.imageUrl;
    this.email = authData.email;
    this.idProgram = authData.idProgram;
    //this.plant.update(authData.plant);
    //this.profile.update(authData.profile);
    this.error = authData.error;
  }
  setToken(token: string) {
    this.token = token;
    return this;
  }
  setImageUrl(imageUrl: string) {
    this.imageUrl = imageUrl;
    return this;
  }
  setUserInfo(decodedToken: {
    username: string;
    userId: number;
    plant: string;
    idPlant: number;
    idProfile: number;
    profile: string;
    imageUrl: string;
  }) {
    this.user = decodedToken.username;
    this.userId = decodedToken.userId;
    return this;
  }
  setProfileType(profile: string) {
    switch (profile.toUpperCase()) {
      case 'ADMINISTRADOR':
        this.isLoggedIn = true;
        this.isAdmin = true;
        this.isClient = true;
        break;

      case 'ATLETA':
        this.isLoggedIn = true;
        this.isAdmin = false;
        this.isClient = true;
        break;

      default:
        this.isLoggedIn = true;
        this.isAdmin = false;
        this.isClient = false;
        break;
    }
    return this;
  }
  setError(error: any) {
    this.error = error;
    return this;
  }
  setEmail(email: string) {
    this.email = email;
    return this;
  }

  setIdProgram(idProgram: number) {
    this.idProgram = idProgram;
    return this;
  }
}
