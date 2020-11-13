export type NotificationType = 'info' | 'warning' | 'success' | 'danger';

export interface Notification {
  id?: string;
  dismissible?: boolean;
  type: NotificationType;
  message: string;
}
