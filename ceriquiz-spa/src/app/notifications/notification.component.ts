import { Component, OnInit } from '@angular/core';

import Notification from './notification';
import { NotificationService } from './notification.service';
import { isNgTemplate } from '@angular/compiler';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  notifications: Notification[];

  constructor(private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.getNotifications();
  }

  getNotifications(): void {
    this.notifications = this.notificationService.notifications;
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
