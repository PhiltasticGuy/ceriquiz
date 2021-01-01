import { Component, OnInit } from '@angular/core';

import { Notification } from '../models/notification';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  public notifications: Notification[];

  // On n'affiche que les 5 premières notifications (donc les plus anciennes).
  public readonly maxDisplayCount = 5;

  constructor(private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    // S'enregistrer aux updates de la liste de notifications.
    this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  trackById(index: number, item: Notification): string {
    return item.id;
  }

  close(item: Notification): void {
    // Le component ngb-alert ne fait que supprimer l'item du DOM. On doit
    // aussi le supprimer de la liste.
    this.notificationService.remove(item);
  }
}
