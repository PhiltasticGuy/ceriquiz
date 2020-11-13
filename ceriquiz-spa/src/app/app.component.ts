import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from './authentication/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public title = 'ceriquiz-spa';
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
