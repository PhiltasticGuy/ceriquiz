import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-navbar-menu',
  templateUrl: './navbar-menu.component.html',
  styleUrls: ['./navbar-menu.component.scss']
})
export class NavbarMenuComponent implements OnInit {
  public isAuthenticated = false;

  constructor(private authenticationService: AuthenticationService) {
  }

  ngOnInit(): void {
    // S'enregistrer aux updates de l'état de l'authentification.
    this.authenticationService.getAuthenticated().subscribe(value => {
      this.isAuthenticated = value;
    });
  }

}
