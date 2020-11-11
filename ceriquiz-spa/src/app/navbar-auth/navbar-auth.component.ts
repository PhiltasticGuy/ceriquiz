import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar-auth',
  templateUrl: './navbar-auth.component.html',
  styleUrls: ['./navbar-auth.component.scss']
})
export class NavbarAuthComponent implements OnInit {
  public isAuthenticated = true;

  constructor() { }

  ngOnInit(): void {
  }

}
