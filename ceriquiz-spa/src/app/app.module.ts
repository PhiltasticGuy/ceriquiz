import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavbarComponent } from './navbar/navbar.component';
import { NavbarMenuComponent } from './navbar-menu/navbar-menu.component';
import { NavbarUserAreaComponent } from './navbar-user-area/navbar-user-area.component';
import { NotificationComponent } from './notifications/notification.component';
import { FormLoginComponent } from './form-login/form-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ProfileComponent } from './profile/profile.component';
import { QuizPickerComponent } from './quiz-picker/quiz-picker.component';
import { TimerComponent } from './timer/timer.component';
import { DecimalPipe } from '@angular/common';
import { Top10Component } from './top10/top10.component';
import { OnlinePlayersComponent } from './online-players/online-players.component';
import { ChallengeAlertComponent } from './challenge-alert/challenge-alert.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    NavbarMenuComponent,
    NotificationComponent,
    FormLoginComponent,
    NavbarUserAreaComponent,
    DashboardComponent,
    PageNotFoundComponent,
    ProfileComponent,
    QuizPickerComponent,
    TimerComponent,
    Top10Component,
    OnlinePlayersComponent,
    ChallengeAlertComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    NgbModule
  ],
  providers: [DecimalPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
