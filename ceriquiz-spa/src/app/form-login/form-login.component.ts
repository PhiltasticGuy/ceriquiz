import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';

import LoginRequest from '../authentication/login-request';
import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-form-login',
  templateUrl: './form-login.component.html',
  styleUrls: ['./form-login.component.scss']
})
export class FormLoginComponent implements OnInit {
  public isAuthenticated = false;
  public loginRequest: LoginRequest = { username: '', password: '' };

  constructor(private authenticationService: AuthenticationService) {
  }

  ngOnInit(): void {
  }

  login(f: NgForm): void {
    console.log('Form.valid=' + f.valid);
    console.log('Form.value=' + f.value);

    if (f.valid) {
      // S'enregistrer aux updates de l'état de l'authentification.
      this.authenticationService.login(f.value as LoginRequest).subscribe(value => {
        // Après une connexion réussie, vider le formulaire pour permettre une
        // reconnexion suite à une déconnexion.
        if (value) {
          f.reset();
        }
      });
    }
  }

}
