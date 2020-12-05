import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public isMenuCollapsed = true;
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
