import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../profile/profile.service';
import { Challenge } from '../models/challenge';
import LoginResponse from '../models/login-response';
import { Router } from '@angular/router';

@Component({
  selector: 'app-challenge-alert',
  templateUrl: './challenge-alert.component.html',
  styleUrls: ['./challenge-alert.component.scss']
})
export class ChallengeAlertComponent implements OnInit {

  public challenges: Challenge[];

  constructor(private profileService:ProfileService, private router: Router) { }

  ngOnInit(): void {
    const userId = (JSON.parse(localStorage.getItem('session')) as LoginResponse).id;
    this.profileService.getChallenges(userId).subscribe(challenges => {
      this.challenges = challenges;
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
