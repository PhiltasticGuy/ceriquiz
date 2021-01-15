import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../profile/profile.service';
import { Challenge } from '../models/challenge';
import LoginResponse from '../models/login-response';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-challenge-alert',
  templateUrl: './challenge-alert.component.html',
  styleUrls: ['./challenge-alert.component.scss']
})
export class ChallengeAlertComponent implements OnInit {

  public isAuthenticated = false;
  public challenges: Challenge[];

  constructor(private authenticationService: AuthenticationService, private profileService:ProfileService, private router: Router) { }

  ngOnInit(): void {
    this.authenticationService.getAuthenticated().subscribe(value => {
      this.isAuthenticated = value;

      const data: LoginResponse = JSON.parse(localStorage.getItem('session'));

      if (data) {
        this.profileService.getChallenges(data.id).subscribe(challenges => {
          this.challenges = challenges;
        });
      }
    });
  }

  /**
   * Transformation du niveau de difficulté pour l'affichage.
   *
   * @returns: Niveau de difficulté formatté.
   */
  public displayDifficulty(): string {
    if (this.getTopChallenge().quiz.difficulty === '1') {
      return 'Facile';
    }
    else if (this.getTopChallenge().quiz.difficulty === '2') {
      return 'Intermédiaire';
    }
    else if (this.getTopChallenge().quiz.difficulty === '3') {
      return 'Difficile';
    }
    else {
      return 'Aucune sélection...';
    }
  }

  public hasChallenges(): boolean {
    return (Array.isArray(this.challenges) && this.challenges.length > 0);
  }

  public getTopChallenge(): Challenge {
    return this.challenges[0];
  }

  public onAccept(id: string): void {
    const challenge = this.getTopChallenge();

    this.profileService.acceptChallenge(challenge.id);
    localStorage.setItem('challenge', JSON.stringify(challenge));
    this.router.navigate(['quiz']);
  }

  public onRefuse(id: string): void {
    const challenge = this.getTopChallenge();
    this.profileService.refuseChallenge(challenge.id).subscribe();
  }

}
