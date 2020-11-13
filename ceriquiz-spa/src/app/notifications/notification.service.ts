import { Injectable } from '@angular/core';
import { Notification, NotificationType } from './notification';
import { v4 as uuidv4 } from 'uuid';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: BehaviorSubject<Notification[]>;

  constructor() {
    this.notifications = new BehaviorSubject<Notification[]>([]);
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  add(d: boolean, t: NotificationType, m: string): void {
    const notification: Notification = {
      id: uuidv4(),
      dismissible: d,
      type: t,
      message: m
    };

    this.notifications.value.push(notification);
    this.notifications.next(this.notifications.value);
  }

  remove(notification: Notification): void {
    this.notifications.value.splice(this.notifications.value.indexOf(notification), 1);
    this.notifications.next(this.notifications.value);
  }

  clear(): void {
    this.notifications.next([]);
  }
}
