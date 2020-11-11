import { Component, OnInit } from '@angular/core';
import INotification from './notification';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  public notifications: INotification[] = [
    {
      id: 0,
      type: 'info',
      message: 'Connectez-vous afin de jouer une partie!'
    },
    {
      id: 1,
      type: 'success',
      message: 'Vous êtes connecté! Allez mesurer votre savoir avec quelques quiz.',
    },
    {
      id: 2,
      type: 'danger',
      message: 'Une erreur est survenue lors de l\'authentification. Veuillez valider la bonne saisie de vos identifiants.'
    }
  ];

  constructor() {
    this.notifications.push(
      {
        type: 'success',
        message: 'Successfully added a new message in the constructor!'
      }
    );
  }

  ngOnInit(): void {
  }

}
