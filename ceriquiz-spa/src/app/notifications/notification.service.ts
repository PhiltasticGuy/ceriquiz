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
      dismissible: false,
      type: 'info',
      message: 'Connectez-vous afin de jouer une partie!'
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
