import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormLoginComponent } from './form-login/form-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { QuizPickerComponent } from './quiz-picker/quiz-picker.component';
import { ProfileComponent } from './profile/profile.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AccessGuard } from './access.guard';

const routes: Routes = [
  { path: 'login', component: FormLoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [ AccessGuard ] },
  { path: 'quiz', component: QuizPickerComponent, canActivate: [ AccessGuard ] },
  { path: 'profile', component: ProfileComponent, canActivate: [ AccessGuard ] },
  { path: 'profile/:id', component: ProfileComponent, canActivate: [ AccessGuard ] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }, // Par défault, rendez-vous au dashboard.
  { path: '**', component: PageNotFoundComponent } // Si on ne reconnaît pas la route: 404!
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
