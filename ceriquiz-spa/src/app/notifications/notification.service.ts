import { Injectable } from '@angular/core';
import { Notification, NotificationType } from '../models/notification';
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

  /**
   * Obtenir la liste des notifications.
   *
   * Permet de s'enregistrer aux updates de la liste des notifications.
   *
   * @return: Observable pour la liste des notifications.
   */
  getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  /**
   * Ajouter une notification dans la liste des notifications.
   *
   * @param d: Flag booléean pour déterminer si la notification peut être fermée.
   * @param t: Type de la notification.
   * @param m: Message apparaissant dans la notification.
   */
  add(d: boolean, t: NotificationType, m: string): void {
    // Créer la nouvelle notification avec un UUID généré.
    const notification: Notification = {
      id: uuidv4(),
      dismissible: d,
      type: t,
      message: m
    };

    // Ajouter la nouvelle notification dans la liste.
    this.notifications.value.push(notification);

    // Avertir les subscribers qu'une nouvelle valeur est disponible.
    this.notifications.next(this.notifications.value);
  }

  remove(notification: Notification): void {
    // Éliminer la notification spécifiée.
    this.notifications.value.splice(
      this.notifications.value.indexOf(notification),
      1
    );

    // Avertir les subscribers qu'une nouvelle valeur est disponible.
    this.notifications.next(this.notifications.value);
  }

  clear(): void {
    // Avertir les subscribers que les notifications sont effacées.
    this.notifications.next([]);
  }
}
