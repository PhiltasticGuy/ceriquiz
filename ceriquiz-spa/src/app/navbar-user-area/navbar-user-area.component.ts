import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-navbar-user-area',
  templateUrl: './navbar-user-area.component.html',
  styleUrls: ['./navbar-user-area.component.scss']
})
export class NavbarUserAreaComponent implements OnInit {
  public isAuthenticated = false;
  public displayName = '';
  public lastLoginDate = '';

  constructor(private authenticationService: AuthenticationService) {
  }

  ngOnInit(): void {
    // S'enregistrer aux updates de l'état de l'authentification.
    this.authenticationService.getAuthenticated().subscribe(value => {
      this.isAuthenticated = value;

      // Suite à une connexion réussie, charger l'information de l'utilisateur
      // du localStorage.
      if (this.isAuthenticated) {
        const data = JSON.parse(localStorage.getItem('session'));
        this.displayName = `${data.firstname} ${data.lastname}`;
        this.lastLoginDate = new Date(data.lastLoginDate).toLocaleString('fr', { timeZone: 'CET' });
      }
    });
  }

  logout(): void {
    this.authenticationService.logout();
  }

}
