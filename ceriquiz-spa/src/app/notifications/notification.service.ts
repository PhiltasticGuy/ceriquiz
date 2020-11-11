import { Injectable } from '@angular/core';
import Notification from './notification';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public notifications: Notification[] = [
    {
      id: uuidv4(),
      dismissible: true,
      type: 'info',
      message: 'Connectez-vous afin de jouer une partie!'
    },
    {
      id: uuidv4(),
      dismissible: true,
      type: 'success',
      message: 'Vous êtes connecté! Allez mesurer votre savoir avec quelques quiz.',
    },
    {
      id: uuidv4(),
      dismissible: true,
      type: 'danger',
      message: 'Une erreur est survenue lors de l\'authentification. Veuillez valider la bonne saisie de vos identifiants.'
    }
  ];

  constructor() {
  }

  add(notification: Notification): void {
    notification.id = uuidv4();
    this.notifications.push(notification);
  }

  remove(notification: Notification): void {
    this.notifications.splice(this.notifications.indexOf(notification), 1);
  }

  clear(): void {
    this.notifications = [];
  }
}
