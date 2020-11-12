import { Injectable } from '@angular/core';
import LoginRequest from './login-request';
import LoginResponse from './login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor() { }

  login(request: LoginRequest): LoginResponse {
    return {
      authenticated: false,
      username: request.username,
      firstname: 'Philippe',
      lastname: 'Turcotte'
    };
  }

  logout(): void {
  }

}
