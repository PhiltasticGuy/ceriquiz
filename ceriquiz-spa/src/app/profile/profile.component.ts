import { Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';
import { NgForm } from '@angular/forms';
import { NotificationService } from '../notifications/notification.service';
import { DifficultyTypes } from '../models/quiz';
import Profile from '../models/profile';
import LoginResponse from '../models/login-response';
import Score from '../models/score';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public isEditing = false;
  public tempAvatarUrl = '';
  public profile: Profile;
  public scoreLogs: Score[];
  private userId: number;
  public isCurrentUser: boolean;

  constructor(private profileService: ProfileService, private notificationService: NotificationService, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      const currentUserId = (JSON.parse(localStorage.getItem('session')) as LoginResponse).id;
      if (params['id']) {
        this.userId = parseInt(params['id']);
        this.isCurrentUser = this.userId === currentUserId;
      }
      else {
        this.userId = currentUserId;
        this.isCurrentUser = true;
      }
    });
  }

  ngOnInit(): void {
    const data: LoginResponse = JSON.parse(localStorage.getItem('session'));
    this.profileService.getProfile(this.userId).subscribe(value => {
      this.profile = value;
      this.tempAvatarUrl = this.profile.avatarUrl;
    });
    this.profileService.getScoreLog(this.userId).subscribe(value => {
      this.scoreLogs = value;
    });
  }

  /**
   * Basculer l'écran en mode édition de profil.
   */
  public startEditing(): void {
    this.isEditing = true;
  }

  /**
   * Sauvegarder les mises à jour au profil de l'utilisateur.
   *
   * @param f: Formulaire avec les données entrées par l'utilisateur.
   */
  public saveProfile(f: NgForm): void {
    if (f.valid) {
      // Remettre la valeur dans le profil de l'utilisateur.
      this.profile.avatarUrl = this.tempAvatarUrl;

      // Sauvegarder le profil avec l'API.
      this.profileService.saveProfile(this.profile).subscribe(() => {
        // Basculer en mode affichage seulement.
        this.isEditing = false;

        // Afficher un message de succès.
        this.notificationService.add(
          true,
          'success',
          'Votre profil a été modifié avec succès!'
        );
      });
    }
  }

  /**
   * Rebasculer l'écran en mode affichage de profil seulement.
   */
  public cancel(): void {
    this.isEditing = false;

    // Rafraîchir la page avec l'information de la base de données.
    this.profileService.getProfile(this.userId).subscribe(value => {
      this.profile = value;
      this.tempAvatarUrl = this.profile.avatarUrl;
    });
  }

  /**
   * Transformation du niveau de difficulté pour l'affichage.
   *
   * @param difficulty: Niveau de difficulté.
   * @returns: Niveau de difficulté formatté.
   */
  public displayDifficulty(difficulty: DifficultyTypes): string {
    if (difficulty === 1) {
      return 'Facile';
    }
    else if (difficulty === 2) {
      return 'Intermédiaire';
    }
    else if (difficulty === 3) {
      return 'Difficile';
    }
    else {
      return '';
    }
  }

  /**
   * Transformation d'une date pour l'affichage.
   *
   * @param value: Date.
   * @returns: Date formattée.
   */
  public formatDate(value: Date): string {
    return value.toLocaleString('fr', { year: 'numeric', month: 'numeric', day: 'numeric' });
  }

  /**
   * Assigner la date du formulaire au modèle avec le bon format.
   *
   * @param value: Date.
   */
  public setBirthday(value: any): void {
    this.profile.dateBirth = new Date(value);
  }

}
