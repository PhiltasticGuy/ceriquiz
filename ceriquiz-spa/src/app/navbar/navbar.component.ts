import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public isAuthenticated = false;

  constructor(private authenticationService: AuthenticationService) {

  }

  ngOnInit(): void {
    this.authenticationService.getAuthenticated().subscribe((value) => {
      this.isAuthenticated = value;
    });
  }

  logout(): void {
    this.authenticationService.logout();
  }

}
