import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public isAuthenticated = false;

  constructor(private authenticatedService: AuthenticationService) {}

  ngOnInit(): void {
    this.authenticatedService.getAuthenticated().subscribe(
      value => this.isAuthenticated = value
    );
  }

}
