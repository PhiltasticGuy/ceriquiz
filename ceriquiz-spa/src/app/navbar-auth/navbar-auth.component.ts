import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';

import { AuthenticationService } from '../authentication/authentication.service';
import LoginRequest from '../authentication/login-request';
import { NotificationService } from '../notifications/notification.service';

@Component({
  selector: 'app-navbar-auth',
  templateUrl: './navbar-auth.component.html',
  styleUrls: ['./navbar-auth.component.scss']
})
export class NavbarAuthComponent implements OnInit {
  public isAuthenticated = false;
  public loginRequest: LoginRequest = { username: '', password: '' };

  constructor(private authenticationService: AuthenticationService, private notificationService: NotificationService) { }

  ngOnInit(): void {
  }

  login(f: NgForm): void {
    console.log('Form.valid=' + f.valid);
    console.log('Form.value=' + f.value);
    if (f.valid) {
      const response = this.authenticationService.login(f.value as LoginRequest)
        .subscribe(res => {
          if (res.authenticated) {
            localStorage.setItem(
              'session',
              JSON.stringify({
                username: res.username,
                firstname: res.firstname,
                lastname: res.lastname,
                lastLogin: new Date()
              })
            );

            this.notificationService.add({
              dismissible: true,
              type: 'success',
              message: 'Vous êtes connecté! Allez mesurer votre savoir avec quelques quiz.'
            });
          }
          else {
            this.notificationService.add({
              dismissible: true,
              type: 'danger',
              message: 'Une erreur est survenue lors de l\'authentification. Veuillez vous assurer de l\'exactitude des identifiants saisis.'
            });
          }
        });
    }
  }

  logout(): void {
  }

}
