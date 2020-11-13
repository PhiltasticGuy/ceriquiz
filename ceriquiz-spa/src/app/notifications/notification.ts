export interface Notification {
  id?: string;
  dismissible?: boolean;
  type: NotificationType;
  message: string;
}

export type NotificationType = 'info' | 'warning' | 'success' | 'danger';
