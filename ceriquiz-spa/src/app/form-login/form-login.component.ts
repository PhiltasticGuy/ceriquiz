import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';

import { AuthenticationService } from '../authentication/authentication.service';
import LoginRequest from '../authentication/login-request';
import { NotificationService } from '../notifications/notification.service';

@Component({
  selector: 'app-form-login',
  templateUrl: './form-login.component.html',
  styleUrls: ['./form-login.component.scss']
})
export class FormLoginComponent implements OnInit {
  public isAuthenticated = false;
  public displayName = '';
  public lastLoginDate = '';
  public loginRequest: LoginRequest = { username: '', password: '' };

  constructor(private authenticationService: AuthenticationService, private notificationService: NotificationService) {

  }

  ngOnInit(): void {
    this.authenticationService.getAuthenticated().subscribe((value) => {
      this.isAuthenticated = value;

      if (this.isAuthenticated) {
        const data = JSON.parse(localStorage.getItem('session'));
        this.displayName = `${data.firstname} ${data.lastname}`;
        this.lastLoginDate = (data.lastLoginDate as Date).toLocaleString();
      }
    });
  }

  login(f: NgForm): void {
    console.log('Form.valid=' + f.valid);
    console.log('Form.value=' + f.value);
    if (f.valid) {
      this.authenticationService.login(f.value as LoginRequest);
    }
  }

  logout(): void {
    this.loginRequest = { username: '', password: '' };
    this.authenticationService.logout();
  }

}
